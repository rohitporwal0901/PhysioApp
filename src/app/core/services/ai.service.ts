import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {

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

    const key = environment.geminiApiKey;
    if (!key) {
      throw new Error('Gemini API Key missing in environment.ts');
    }

    const prompt = `
      You are a highly experienced Senior Physiotherapist.
      Analyze the following patient data and session notes to create a professional rehabilitation progress report.

      PATIENT DETAILS:
      - Name: ${data.patientName}
      - Clinical Condition: ${data.condition}
      - Treatment Notes: ${data.notes}

      STRICT OUTPUT FORMAT RULES:
      1. DO NOT use secondary formatting like markdown bold (**) or bullet points.
      2. Use the exact labels provided below.
      3. For Roadmap Phases, use the format: Goal | Exercise | Focus

      REPORT STRUCTURE:
      [SUMMARY]: (4 lines of clinical assessment)
      [SCORE]: (Progress percentage as a number only, e.g., 75)
      [PHASE_1]: (Goal | Exercise | Focus)
      [PHASE_2]: (Goal | Exercise | Focus)
      [PHASE_3]: (Goal | Exercise | Focus)
      [ADVICE]: (One final professional clinical recommendation)
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
      return match ? match[1].trim().replace(/\*/g, '') : null;
    };

    const summary = extract('SUMMARY') || 'Patient progress is being monitored according to clinical standards.';
    const scoreText = extract('SCORE') || '50';
    const score = parseInt(scoreText.replace(/[^0-9]/g, '')) || 50;
    const recommendation = extract('ADVICE') || 'Follow the prescribed home exercise program and maintain hydration.';

    const roadmap: string[][] = [];
    ['PHASE_1', 'PHASE_2', 'PHASE_3'].forEach((phase, idx) => {
      const content = extract(phase);
      if (content) {
        const parts = content.split('|').map((p: string) => p.trim());
        roadmap.push([
          `Phase ${idx + 1}`,
          parts[0] || 'Recovery Goal',
          parts[1] || 'Standard Exercise',
          parts[2] || 'Clinical Focus'
        ]);
      }
    });

    if (roadmap.length === 0) {
      roadmap.push(['Phase 1', 'Acute Recovery', 'Basic ROM', 'Inflammation Control']);
      roadmap.push(['Phase 2', 'Mobility', 'Resistance Training', 'Strength']);
      roadmap.push(['Phase 3', 'Functional', 'Sport-Specific Drills', 'Autonomy']);
    }

    return { summary, score, roadmap, recommendation };
  }
}