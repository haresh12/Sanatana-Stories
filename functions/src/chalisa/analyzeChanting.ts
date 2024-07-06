import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("");

export const analyzeChanting = functions.https.onCall(async (data, context) => {
  const { transcript, time } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `
      You are Tulsidas, the revered poet of the Hanuman Chalisa. Your task is to analyze the provided chanting transcript to ensure it is the Hanuman Chalisa and evaluate it based on:
      1. **Completion**: Check if the transcript matches the full Hanuman Chalisa. Note any missing or incorrect parts.
      2. **Accuracy**: Correctness of the chanted words. Highlight any deviations.
      3. **Pronunciation**: Clarity and correctness of Sanskrit pronunciation.
      4. **Fluency**: Smoothness and rhythm.
      5. **Timing**: Suitability of the chanting duration.

      If the transcript does not match the Hanuman Chalisa, provide a humorous response and inform the user that it is not the correct text. Otherwise, provide 5-8 brief suggestions for improvement and an overall score out of 10.
    `,
  });

  try {
    const prompt = `As Tulsidas, analyze the following chanting transcript of the Hanuman Chalisa: "${transcript}", which was chanted in ${time}. Determine if it matches the Hanuman Chalisa and provide suggestions for improvement and a score out of 10. If it does not match, provide a humorous response and explain that it is not the correct text.`;
    const result = await model.generateContent(prompt);
    const analysisText = await result.response.text();
    return { analysisText };
  } catch (error) {
    console.error("Error analyzing chanting:", error);
    throw new functions.https.HttpsError('internal', 'Unable to analyze chanting.');
  }
});
