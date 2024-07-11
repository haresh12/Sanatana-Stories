import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("");

export const getMeaning = functions.https.onCall(async (data, context) => {
  const { text } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `You are an expert in Sanskrit texts. Provide an explanation for the following text in simple terms and those are make sure hanuman chalisa text: ${text}`,
  });

  try {
    const prompt = `Explain the meaning of the following Sanskrit text the texts are from hanuman chalisa: "${text}".`;
    const result = await model.generateContent(prompt);
    const meaning = await result.response.text();

    return { meaning };
  } catch (error) {
    console.error("Error fetching meaning:", error);
    throw new functions.https.HttpsError('internal', 'Unable to fetch meaning.');
  }
});
