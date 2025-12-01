/**
 * Google Gemini API Service
 * 
 * Provides functionality to interact with Google Gemini AI
 * for generating SKUs and other product-related content
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import DOMPurify from 'dompurify';

// In-memory storage
let geminiApiKey = null;
let cachedModels = null;
let cachedModelName = null;
let preferredModel = null;

export const setGeminiApiKey = (key) => {
  geminiApiKey = key;
};

/**
 * Strip HTML tags from text and return plain text
 * @param {string} html - Text that may contain HTML
 * @returns {string} Plain text without HTML tags
 */
const stripHtml = (html) => {
  if (!html) return '';

  let cleaned = html;

  // First, try using DOMPurify if available (browser environment)
  if (typeof window !== 'undefined' && window.DOMPurify) {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
      cleaned = tempDiv.textContent || tempDiv.innerText || '';
    } catch (e) {
      // Fallback to regex if DOMPurify fails
    }
  }

  // Aggressive cleaning: Remove all HTML tags and entities
  cleaned = cleaned
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove any other HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return cleaned;
};

/**
 * Get Gemini API key from environment or memory
 * @returns {string} API key or empty string
 */
export const getGeminiAPIKey = () => {
  return geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
};

/**
 * Get Gemini AI instance
 * @returns {GoogleGenerativeAI|null} Gemini AI instance or null if API key not configured
 */
const getGeminiAI = () => {
  const apiKey = getGeminiAPIKey();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate a random SKU using Gemini AI
 * @param {string} productName - Optional product name to generate relevant SKU
 * @returns {Promise<string>} Generated SKU
 */

/**
 * Get a working model name, using cache if available
 * Handles quota errors by clearing cache and trying a different model
 * Uses default model immediately for speed, only fetches available models in background
 */
export const getWorkingModelName = async (clearCache = false) => {
  if (clearCache) {
    cachedModelName = null;
    cachedModels = null;
    preferredModel = null;
  }

  if (cachedModelName) {
    return cachedModelName;
  }

  // Default free tier model (fastest option - no API call needed)
  const defaultModel = 'gemini-2.5-flash';

  // If we have a cached model name preference, use it immediately
  if (preferredModel && !clearCache) {
    cachedModelName = preferredModel;
    // Update in background (non-blocking)
    getFirstAvailableModel().then(model => {
      if (model && model !== preferredModel) {
        cachedModelName = model;
        preferredModel = model;
      }
    }).catch(() => {
      // Ignore errors in background update
    });
    return cachedModelName;
  }

  // Use default model immediately (no waiting for API)
  cachedModelName = defaultModel;
  preferredModel = defaultModel;

  // Update model list in background (non-blocking) for next time
  getFirstAvailableModel().then(model => {
    if (model && model !== defaultModel) {
      cachedModelName = model;
      preferredModel = model;
    }
  }).catch(() => {
    // Ignore errors - we already have default model
  });

  return cachedModelName;
};

export const generateSKU = async (productName = '') => {
  const genAI = getGeminiAI();

  if (!genAI) {
    // Fallback to simple SKU generation if API key not configured
    return generateFallbackSKU(productName);
  }

  try {
    // Get working model (uses cache for speed)
    const modelName = await getWorkingModelName();
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `צור קוד SKU (Stock Keeping Unit) אקראי לחלוטין. הקוד חייב להיות מורכב רק ממספרים ואותיות אקראיים (0-9, A-Z). אורך: 8-12 תווים. כל התווים חייבים להיות אקראיים - אין להשתמש בשם המוצר או במילים. דוגמה לפורמט נכון: A7B9K2M4P1 או 3X8Y5Z9W2. החזר רק את הקוד האקראי, שום דבר אחר. חשוב מאוד: החזר רק את הקוד האקראי המורכב ממספרים ואותיות, ללא הסברים, ללא טקסט נוסף, ללא מקפים או תווים מיוחדים.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text().trim();

    // Clean up the SKU - remove any extra text, keep only alphanumeric uppercase
    const sku = generatedText
      .replace(/[^A-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 12);

    if (sku.length < 6) {
      // Fallback: generate a simple SKU if Gemini's response is too short
      return generateFallbackSKU(productName);
    }

    return sku;
  } catch (error) {
    // If quota error, clear cache to try different model next time
    if (error.message && error.message.includes('quota')) {
      cachedModelName = null;
    }
    // Fallback to simple SKU generation if API fails
    return generateFallbackSKU(productName);
  }
};

/**
 * Generate a fallback SKU if Gemini API fails
 * Uses random numbers and letters only
 * @param {string} productName - Optional product name (not used, kept for compatibility)
 * @returns {string} Generated SKU
 */
const generateFallbackSKU = (productName = '') => {
  // Generate random alphanumeric SKU (8-12 characters)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8 + Math.floor(Math.random() * 5); // Random length between 8-12
  let sku = '';

  for (let i = 0; i < length; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return sku;
};

/**
 * Improve text using Gemini AI
 * Takes existing text and returns an improved version
 * @param {string} text - The text to improve
 * @param {string} type - Type of text: 'short_description' or 'description'
 * @param {string} productName - Optional product name for context
 * @returns {Promise<string>} Improved text
 */
export const improveText = async (text = '', type = 'description', productName = '') => {
  const genAI = getGeminiAI();

  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  if (!text.trim()) {
    throw new Error('Please enter some text to improve');
  }

  try {
    // Get working model (uses cache for speed)
    const modelName = await getWorkingModelName();
    const model = genAI.getGenerativeModel({ model: modelName });

    const context = productName ? `שם המוצר: ${productName}. ` : '';
    const lengthHint = type === 'short_description'
      ? 'שמור על קיצור (2-3 משפטים מקסימום).'
      : 'עשה זאת מפורט ומעניין.';

    const prompt = `${context}שפר את ה${type === 'short_description' ? 'תיאור הקצר' : 'תיאור'} הבא של המוצר לחנות מסחר אלקטרוני. ${lengthHint} הפוך אותו למעניין יותר, מקצועי וידידותי ל-SEO תוך שמירה על המשמעות המקורית. החזר רק טקסט רגיל ללא תגי HTML, markdown או עיצוב. החזר רק את הטקסט המשופר, שום דבר אחר.

חשוב מאוד: אתה חייב להגיב רק בעברית. כל הטקסט חייב להיות בעברית. אל תשתמש באנגלית או בשפה אחרת.

טקסט מקורי:
${text}

טקסט משופר:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let improvedText = response.text().trim();

    // Clean HTML tags from the response - multiple passes to ensure complete removal
    improvedText = stripHtml(improvedText);
    // Additional cleaning pass for any remaining HTML entities or tags
    improvedText = improvedText
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return improvedText;
  } catch (error) {
    // If quota error, clear cache to try different model next time
    if (error.message && (error.message.includes('quota') || error.message.includes('Quota'))) {
      cachedModelName = null;
      throw new Error('Quota exceeded. Please wait a moment and try again, or check your API plan.');
    }
    throw new Error(`Failed to improve text: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get list of available models from the API
 * Uses cache to avoid repeated API calls
 * @returns {Promise<string[]>} Array of available model names
 */
export const getAvailableModels = async (useCache = true) => {
  const apiKey = getGeminiAPIKey();

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Check cache first
  if (useCache && cachedModels) {
    return cachedModels;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.models || [];

    // Filter models that support generateContent
    const supportedModels = models
      .filter(model =>
        model.supportedGenerationMethods &&
        model.supportedGenerationMethods.includes('generateContent')
      )
      .map(model => model.name.replace('models/', ''));

    // Cache the result
    cachedModels = supportedModels;

    return supportedModels;
  } catch (error) {
    // If API fails, try to use cached models even if expired
    if (cachedModels) {
      return cachedModels;
    }
    throw new Error(`Failed to get available models: ${error.message}`);
  }
};

/**
 * Get the first available model that supports generateContent
 * Only uses free tier models to avoid quota issues
 * @returns {Promise<string>} Model name
 */
export const getFirstAvailableModel = async () => {
  try {
    const availableModels = await getAvailableModels();

    if (availableModels.length === 0) {
      throw new Error('No models available that support generateContent');
    }

    // Free tier models only - avoid paid/preview models
    // These models are available in the free tier
    const freeTierModels = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro',
      'gemini-pro-latest'
    ];

    // Filter to only free tier models
    const availableFreeTierModels = availableModels.filter(model =>
      freeTierModels.some(freeModel => model.includes(freeModel))
    );

    // Prefer these models in order (most reliable free tier models)
    // Gemini 2.5 Flash is the fastest and newest model
    const preferredModels = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro',
      'gemini-pro-latest'
    ];

    // Try preferred models first
    for (const preferred of preferredModels) {
      const matchingModel = availableFreeTierModels.find(model =>
        model.includes(preferred)
      );
      if (matchingModel) {
        return matchingModel;
      }
    }

    // If no preferred model found, use first available free tier model
    if (availableFreeTierModels.length > 0) {
      return availableFreeTierModels[0];
    }

    // Fallback to first available model (but warn it might not be free tier)
    return availableModels[0];
  } catch (error) {
    // Fallback to default free tier model if we can't fetch the list
    return 'gemini-2.5-flash';
  }
};

/**
 * Test Gemini API connection
 * @returns {Promise<boolean>} True if connection successful
 */
export const testGeminiConnection = async () => {
  const apiKey = getGeminiAPIKey();

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the first available model
    const modelName = await getFirstAvailableModel();
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent('Say "אוקיי" if you can read this. IMPORTANT: Respond only in Hebrew (עברית).');
    const response = await result.response;
    const text = response.text();

    return text && text.trim().length > 0;
  } catch (error) {
    // Provide more detailed error information
    if (error.message) {
      throw new Error(error.message);
    }
    throw new Error('Failed to connect to Gemini API. Please check your API key and ensure the Generative Language API is enabled in Google Cloud Console.');
  }
};

