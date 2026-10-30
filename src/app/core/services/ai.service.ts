import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private firestore = inject(Firestore);
  private cachedApiKey: string | null = null;

  // Free tier models - best quota se worst tak
  private readonly FREE_MODELS = [
    'gemini-2.5-flash-lite',  // 15 RPM, 1000/day — sabse zyada quota
    'gemini-2.5-flash',       // 10 RPM, 250/day  — fallback
  ];

  /**
   * Generates a structured clinical report using Google Gemini
   * Auto-fallback karta hai agar ek model ka quota khatam ho
   */
  async generateClinicalReport(data: {
    condition: string;
    notes: string;
    patientName: string;
    doctorName: string;
  }): Promise<string> {

    if (!this.cachedApiKey) {
      const docRef = doc(this.firestore, 'app_secrets', 'gemini');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.cachedApiKey = docSnap.data()['apiKey'];
      }
    }

    const key = this.cachedApiKey;
    if (!key) {
      throw new Error('Gemini API Key missing in Firestore collection "app_secrets/gemini"');
    }

    const prompt = `
      You are a Senior Clinical Physiotherapist and Rehabilitation Specialist.
      Perform a deep biomechanical and clinical analysis based on the patient data provided.

      PATIENT CLINICAL DATA:
      - Subject: ${data.patientName}
      - Primary Diagnosis/Condition: ${data.condition}
      - Clinical Session Notes: ${data.notes}

      STRICT REPORTING GUIDELINES:
      - Use formal medical terminology.
      - DO NOT use markdown symbols like asterisks (**).
      - Use the pipe symbol (|) strictly to separate exactly 4 fields in PHASES.
      - DO NOT include labels like 'Goal:' or 'Exercises:' inside the data.

      REQUIRED STRUCTURE:
      [SUMMARY]: 4-line expert clinical evaluation.
      [SCORE]: Progress percentage (Integer 0-100).
      [PHASE_1]: Goal | Exercises | Focus | YouTube Search Query (e.g., knee strengthening physiotherapy)
      [PHASE_2]: Goal | Exercises | Focus | YouTube Search Query
      [PHASE_3]: Goal | Exercises | Focus | YouTube Search Query
      [ADVICE]: Concluding professional recommendation.
    `;

    const genAI = new GoogleGenerativeAI(key);
    let lastError: any;

    // Har model try karo — agar 429 aaye to next model pe jao
    for (const modelName of this.FREE_MODELS) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`Success with model: ${modelName}`);
        return response.text();
      } catch (error: any) {
        const is429 = error?.status === 429
          || error?.message?.includes('429')
          || error?.message?.includes('quota');

        if (is429) {
          console.warn(`Model ${modelName} quota exceeded, trying next...`);
          lastError = error;
          continue; // next model try karo
        }

        // 429 nahi hai to seedha throw karo
        throw error;
      }
    }

    // Sab models fail ho gaye
    throw lastError || new Error('All Gemini models quota exceeded. Kal try karo ya naya project banao.');
  }

  /**
   * Cleans and parses the AI response into a structured object for the PDF generator
   */
  parseAIResponse(text: string) {
    const extract = (label: string) => {
      const regex = new RegExp(`\\[${label}\\]:?\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    };

    const summary = extract('SUMMARY')?.replace(/\*{1,2}/g, '').substring(0, 500) || 'Clinical progress analyzed.';
    const scoreText = extract('SCORE') || '70';
    const score = parseInt(scoreText.replace(/[^0-9]/g, '')) || 70;
    const recommendation = extract('ADVICE')?.replace(/\*{1,2}/g, '') || 'Maintain consistency.';

    const roadmap: any[] = [];
    ['PHASE_1', 'PHASE_2', 'PHASE_3'].forEach((phase, idx) => {
      const content = extract(phase);
      if (content) {
        // Remove markdown and clean labels
        const cleanContent = content.replace(/\*\*/g, '');
        const parts = cleanContent.split('|').map((p: string) => p.trim());
        
        // Fallback: If AI didn't use pipes correctly, try to find a YouTube query in the text
        let query = parts[3] || '';
        if (!query) {
          const ytMatch = cleanContent.match(/(?:YouTube Search Query|YouTube|Search):\s*([^\n|]+)/i);
          if (ytMatch) query = ytMatch[1].trim();
          else if (parts.length > 0) query = parts[parts.length - 1]; // Take last part if no pipes but long text
        }

        roadmap.push({
          phase: `Phase ${idx + 1}`,
          goal: parts[0]?.replace(/^Goal:\s*/i, '') || 'Progressive Recovery',
          exercises: parts[1]?.replace(/^Exercises:\s*/i, '') || 'Therapeutic Drills',
          focus: parts[2]?.replace(/^Focus:\s*/i, '') || 'Clinical Stability',
          videoUrl: query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` : null
        });
      }
    });

    if (roadmap.length === 0) {
      roadmap.push({ phase: 'Phase 1', goal: 'Pain Management', exercises: 'Isometric Drills', focus: 'Inflammation', videoUrl: 'https://www.youtube.com/results?search_query=physiotherapy+pain+management' });
      roadmap.push({ phase: 'Phase 2', goal: 'Strength Gain', exercises: 'Resistance Bands', focus: 'Muscle Fiber', videoUrl: 'https://www.youtube.com/results?search_query=physiotherapy+strength+gain' });
      roadmap.push({ phase: 'Phase 3', goal: 'Functional Return', exercises: 'Agility Drills', focus: 'Autonomy', videoUrl: 'https://www.youtube.com/results?search_query=physiotherapy+functional+return' });
    }

    return { summary, score, roadmap, recommendation };
  }
}