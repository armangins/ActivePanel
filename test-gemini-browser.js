// Test file for @google/genai in browser/Vite environment
// Run this in browser console or import in a React component

import { GoogleGenAI } from "@google/genai";

// Get API key from environment or localStorage
const getApiKey = () => {
  if (typeof window !== 'undefined') {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
  }
  return process.env.GEMINI_API_KEY || '';
};

const apiKey = getApiKey();

if (!apiKey) {
  console.error('GEMINI_API_KEY not found. Please set VITE_GEMINI_API_KEY in .env or localStorage.');
} else {
  console.log('API Key found:', apiKey.substring(0, 10) + '...');
}

const ai = new GoogleGenAI({ apiKey });

async function testGemini() {
  try {
    console.log('Testing Gemini API with @google/genai...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });
    
    console.log('✅ Success! Response:', response.text);
    return response.text;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Export for use in React components
export { testGemini, ai };

// Auto-run if in browser console
if (typeof window !== 'undefined' && apiKey) {
  testGemini().catch(console.error);
}






