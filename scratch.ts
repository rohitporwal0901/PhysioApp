import { GoogleGenerativeAI } from "@google/generative-ai";
async function test() {
    const ai = new GoogleGenerativeAI("DUMMY");
    const session = ai.getGenerativeModel({model: "gemini-2.5-flash"}).startChat({ history: [] });
    const hist = await session.getHistory();
    console.log(hist);
}
