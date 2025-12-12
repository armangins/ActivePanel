import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';

if (!apiKey) {
  console.error('GEMINI_API_KEY not found. Please set VITE_GEMINI_API_KEY in .env or localStorage.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });
    console.log('Response:', response.text);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();









