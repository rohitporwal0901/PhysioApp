import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  
  /**
   * Generates a structured clinical report using Google Gemini
   */
  async generateClinicalReport(data: {
    condition: string;
    notes: string;
    patientName: string;
    doctorName: string;
  }): Promise<string> {
    
    const key = environment.geminiApiKey;
    if (!key) {
      throw new Error('Gemini API Key is missing in environment files.');
    }

    try {
      const genAI = new GoogleGenerativeAI(key);
      // Using gemini-1.5-flash for speed and efficiency
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  /**
   * Cleans and parses the AI response into a structured object for the PDF generator
   */
  parseAIResponse(text: string) {
    // Regex helper to extract content between labels
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
        const parts = content.split('|').map(p => p.trim());
        roadmap.push([
          `Phase ${idx + 1}`,
          parts[0] || 'Recovery Goal',
          parts[1] || 'Standard Exercise',
          parts[2] || 'Clinical Focus'
        ]);
      }
    });

    // Fallback roadmap if parsing fails
    if (roadmap.length === 0) {
      roadmap.push(['Phase 1', 'Acute Recovery', 'Basic ROM', 'Inflammation Control']);
      roadmap.push(['Phase 2', 'Mobility', 'Resistance Training', 'Strength']);
      roadmap.push(['Phase 3', 'Functional', 'Sport-Specific Drills', 'Autonomy']);
    }

    return { summary, score, roadmap, recommendation };
  }
}