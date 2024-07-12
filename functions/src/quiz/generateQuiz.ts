import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("");

export const generateQuiz = functions.https.onCall(async (data, context) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: "You are an expert in Hindu mythology. Generate a diverse set of quiz questions covering various aspects of Hindu mythology, including the Mahabharata, Ramayana, all 18 Hindu Puranas, and Hindu culture. Ensure each quiz is unique.",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
  Generate a JSON with up to 10 unique questions about Hindu mythology. Each question should cover topics such as the Mahabharata, Ramayana, 18 Hindu Puranas, and Hindu culture. Each question should have 2 to 4 options where users can select an answer, and provide the correct answer for each question. Use the following schema:
  {
    "type": "object",
    "properties": {
      "questions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "question": { "type": "string" },
            "options": {
              "type": "array",
              "items": { "type": "string" },
              "minItems": 2,
              "maxItems": 4
            },
            "correctAnswer": { "type": "string" }
          },
          "required": ["question", "options", "correctAnswer"]
        },
        "minItems": 1,
        "maxItems": 10
      }
    },
    "required": ["questions"]
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const questions = JSON.parse(await result.response.text());
    return { questions };
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new functions.https.HttpsError('internal', 'Unable to generate quiz questions.');
  }
});
