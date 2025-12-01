/**
 * Test file for @google/genai package
 * This tests the new GoogleGenAI API structure
 * Based on: https://ai.google.dev/gemini-api/docs
 */

import { GoogleGenAI } from "@google/genai";
import { getGeminiAPIKey } from '../services/gemini';

// Get API key from service
const getApiKey = () => {
  return getGeminiAPIKey();
};

/**
 * Test Gemini API with the new @google/genai package
 * This matches the exact test code structure provided by the user
 */
export async function testGeminiNewAPI() {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found. Please set VITE_GEMINI_API_KEY in .env or localStorage.');
  }

  try {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    // In browser environment, we need to pass it explicitly
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });

    // response.text is a getter property that extracts text from candidates
    console.log('✅ Gemini API Test Success!');
    console.log('Response:', response.text);

    return {
      success: true,
      text: response.text,
      response: response
    };
  } catch (error) {
    console.error('❌ Gemini API Test Failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

// Export the function for use in React components
export default testGeminiNewAPI;

