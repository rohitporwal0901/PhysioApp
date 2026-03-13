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
      You are a Senior Clinical Physiotherapist and Rehabilitation Specialist.
      Perform a deep biomechanical and clinical analysis based on the patient data provided.

      PATIENT CLINICAL DATA:
      - Subject: ${data.patientName}
      - Primary Diagnosis/Condition: ${data.condition}
      - Clinical Session Notes: ${data.notes}

      STRICT REPORTING GUIDELINES:
      - Use formal medical terminology (e.g., glenohumeral, proprioception, kinematic chain).
      - Quantify the recovery trajectory where possible.
      - DO NOT use markdown symbols like asterisks (**).
      - Maintain a professional, data-driven, yet encouraging tone.

      REQUIRED STRUCTURE:
      [SUMMARY]: Provide a 4-line expert clinical evaluation of the session. Address musculoskeletal integrity and neural mobility improvements.
      [SCORE]: Progress percentage (Integer 0-100).
      [PHASE_1]: Recovery Phase Goal | Evidence-Based Exercises | Primary Clinical Focus
      [PHASE_2]: Progressive Phase Goal | Resistance/Weight-Bearing Drills | Core/Joint Stability Focus
      [PHASE_3]: Functional Integration Goal | Sport/Activity Specific Drills | Full Autonomy & Prevention
      [ADVICE]: Concluding professional recommendation for long-term health.
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
    // 1. Check if the AI returned a JSON string (sometimes Gemini follows JSON instructions better)
    try {
      if (text.trim().startsWith('{')) {
        const json = JSON.parse(text.trim());
        return {
          summary: json.summary || 'Clinical evaluation completed.',
          score: parseInt(json.score) || 75,
          roadmap: Array.isArray(json.roadmap) ? json.roadmap : [],
          recommendation: json.advice || json.recommendation || 'Maintain consistency.'
        };
      }
    } catch (e) {}

    // 2. Standard Regex Parsing
    const extract = (label: string) => {
      const regex = new RegExp(`\\[${label}\\]:?\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim().replace(/\*{1,2}/g, '').replace(/[\r\n]+/g, ' ').substring(0, 500) : null;
    };

    const summary = extract('SUMMARY') || 'Patient progress analyzed. Biomechanical integrity is within expected clinical parameters.';
    const scoreText = extract('SCORE') || '70';
    const score = parseInt(scoreText.replace(/[^0-9]/g, '')) || 70;
    const recommendation = extract('ADVICE') || 'Continue with prescribed therapeutic exercises and avoid over-exertion.';

    const roadmap: any[] = [];
    ['PHASE_1', 'PHASE_2', 'PHASE_3'].forEach((phase, idx) => {
      const content = extract(phase);
      if (content) {
        const parts = content.split('|').map((p: string) => p.trim());
        roadmap.push({
          phase: `Phase ${idx + 1}`,
          goal: parts[0] || 'Progressive Recovery',
          exercises: parts[1] || 'Specific Therapy Drills',
          focus: parts[2] || 'Clinical Stability'
        });
      }
    });

    if (roadmap.length === 0) {
      roadmap.push({ phase: 'Phase 1', goal: 'Pain Management', exercises: 'Isometric Drills', focus: 'Inflammation' });
      roadmap.push({ phase: 'Phase 2', goal: 'Strength Gain', exercises: 'Resistance Bands', focus: 'Muscle Fiber' });
      roadmap.push({ phase: 'Phase 3', goal: 'Functional Return', exercises: 'Agility Drills', focus: 'Autonomy' });
    }

    return { summary, score, roadmap, recommendation };
  }
}