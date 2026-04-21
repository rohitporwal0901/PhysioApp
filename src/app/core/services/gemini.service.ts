import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private firestore = inject(Firestore);
  private cachedApiKey: string | null = null;
  private chatSession: ChatSession | null = null;

  private readonly FREE_MODELS = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
  ];

  async getApiKey(): Promise<string> {
    if (!this.cachedApiKey) {
      const docRef = doc(this.firestore, 'app_secrets', 'gemini');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.cachedApiKey = docSnap.data()['apiKey'];
      }
    }
    return this.cachedApiKey || '';
  }

  async sendMessage(message: string): Promise<string> {
    const key = await this.getApiKey();
    if (!key) {
      return "Sorry, I am not configured yet. Missing API key.";
    }

    const genAI = new GoogleGenerativeAI(key);

    for (const modelName of this.FREE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        if (!this.chatSession) {
             this.chatSession = model.startChat({
                 history: [
                    {
                      role: "user",
                      parts: [{ text: "Act as the customer support agent for Health Hub (a healthcare platform connecting patients with doctors and labs). Keep answers brief and polite. Rule 1: Do not provide medical diagnoses. Rule 2 (CRITICAL): You MUST ALWAYS reply in the exact same language/dialect as the user! If the user writes in 'Hinglish' (Hindi in English letters, e.g., 'mujhe pain hai'), you MUST reply entirely in fluent Hinglish, INCLUDING all medical disclaimers! NEVER default back to English when refusing medical advice." }],
                    },
                    {
                      role: "model",
                      parts: [{ text: "Hello! I am the Health Hub support assistant. Namaste! Main Health Hub ka assistant hu. How can I help today?" }],
                    },
                 ],
             });
        }

        const result = await this.chatSession.sendMessage(message);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        const is429 = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
        if (is429) {
          continue; 
        }
        throw error;
      }
    }

    return "I'm currently receiving too many requests. Please try again later.";
  }
}
