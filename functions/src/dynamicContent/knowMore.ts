import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("");

export const getDetailedInfo = functions.https.onCall(async (data, context) => {
  const { content, type } = data;

  const systemInstruction = type === 'myth' 
    ? `You are a famous Rishi in India, an expert in Hindu mythology. Your task is to provide a comprehensive and detailed explanation of the following myth. Explain its significance, origin, and any related stories or symbolism in detail, as if you are sharing this wisdom with your devoted followers: "${content}".`
    : `You are a famous Rishi in India, an expert in Hindu culture and scriptures. Your task is to provide a comprehensive and detailed explanation of the following fun fact. Explain its significance, origin, and any related stories or symbolism in detail, as if you are sharing this wisdom with your devoted followers: "${content}".`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.9,
      topK: 50,
      topP: 0.9,
    },
    systemInstruction: systemInstruction
  });

  try {
    const prompt = type === 'myth' 
      ? `As a renowned Rishi in India, provide a comprehensive and detailed explanation of the following Hindu myth: "${content}". Explain its significance, origin, and any related stories or symbolism in detail response must be in english.`
      : `As a renowned Rishi in India, provide a comprehensive and detailed explanation of the following fun fact about Hindu culture: "${content}". Explain its significance, origin, and any related stories or symbolism in detail response must be in english..`;

    const result = await model.generateContent(prompt);
    const detailedInfo = await result.response.text();

    return { detailedInfo };
  } catch (error) {
    console.error("Error fetching detailed information:", error);
    throw new functions.https.HttpsError('internal', 'Unable to fetch detailed information.');
  }
});
