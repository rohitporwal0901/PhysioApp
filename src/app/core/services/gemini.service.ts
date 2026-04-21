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
                      parts: [{ text: "You are a helpful customer support agent for Health Hub, a comprehensive healthcare platform connecting patients with multiple specialized doctors and diagnostic labs. Keep your answers brief, polite, and directly address the user's questions about the platform, app features, or general health inquiries. Do not provide medical diagnoses." }],
                    },
                    {
                      role: "model",
                      parts: [{ text: "Hello! I am the Health Hub support assistant. How can I help you today?" }],
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
