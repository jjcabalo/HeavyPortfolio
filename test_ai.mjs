import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
    const response = await ai.models.list();
    for await (const model of response) {
        console.log(model.name);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
