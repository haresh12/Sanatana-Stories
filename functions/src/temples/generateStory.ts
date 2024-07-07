import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI("");

export const generateStory = functions.https.onCall(async (data, context) => {
  const { templeName } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are an expert storyteller. Generate an interesting and unique story about the ${templeName} that is not easily found on the internet.`,
  });

  try {
    const prompt = `Tell me a unique and interesting story about the ${templeName}.`;
    const result = await model.generateContent(prompt);
    const story = await result.response.text();
    return { story };
  } catch (error) {
    console.error("Error generating story:", error);
    throw new functions.https.HttpsError('internal', 'Unable to generate story.');
  }
});
