import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);

export const getDetailedInfo = functions.https.onCall(async (data, context) => {
  const { content, type } = data;

  const systemInstruction = type === 'myth' 
    ? `You are a famous Rishi in India, an expert in Hindu mythology. Provide a brief yet comprehensive explanation of the following myth in English. Explain its significance, origin, and related stories in 5 to 8 sentences: "${content}".`
    : `You are a famous Rishi in India, an expert in Hindu culture and scriptures. Provide a brief yet comprehensive explanation of the following fun fact in English. Explain its significance, origin, and related stories in 5 to 8 sentences: "${content}".`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.5,  
      topK: 20, 
      topP: 0.8, 
      maxOutputTokens: 160,  
    },
    systemInstruction: systemInstruction
  });

  try {
    const prompt = type === 'myth' 
      ? `Provide a brief yet comprehensive explanation of the following Hindu myth in English: "${content}". Explain its significance, origin, and related stories in 5 to 8 sentences.`
      : `Provide a brief yet comprehensive explanation of the following fun fact about Hindu culture in English: "${content}". Explain its significance, origin, and related stories in 5 to 8 sentences.`;

    const result = await model.generateContent(prompt);
    const detailedInfo = await result.response.text();

    return { detailedInfo };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Unable to fetch detailed information.');
  }
});
