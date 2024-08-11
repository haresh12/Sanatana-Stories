import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);

/**
 * Cloud Function to get the meaning of a Sanskrit text from the Hanuman Chalisa.
 *
 * This function receives a Sanskrit text and uses Google Generative AI to provide
 * a simple and clear explanation of the text.
 *
 * @param {Object} data - The input data for the function.
 * @param {string} data.text - The Sanskrit text to be explained.
 * @param {Object} context - The context of the function call.
 * @returns {Object} An object containing the meaning of the text.
 * @throws {functions.https.HttpsError} Throws an internal error if the meaning cannot be fetched.
 */
export const getMeaning = functions.https.onCall(async (data, context) => {
  const { text } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.9,
      topK: 50,
      topP: 0.9,
      maxOutputTokens : 4000
    },
    systemInstruction: `
      You are an expert in Sanskrit texts, particularly the Hanuman Chalisa. Your task is to provide a simple explanation of the following text, ensuring it is clear and understandable: "${text}".
    `
  });

  try {
    const prompt = `
      Explain the meaning of the following Sanskrit text from the Hanuman Chalisa: "${text}". Provide the explanation in simple terms.
    `;
    const result = await model.generateContent(prompt);
    const meaning = await result.response.text();

    return { meaning };
  } catch (error) {
    console.error("Error fetching meaning:", error);
    throw new functions.https.HttpsError('internal', 'Unable to fetch meaning.');
  }
});
