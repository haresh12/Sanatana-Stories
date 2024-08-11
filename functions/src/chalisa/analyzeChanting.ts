import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);

/**
 * Cloud Function to analyze chanting of the Hanuman Chalisa.
 *
 * This function receives a transcript of chanting and the duration, then uses Google Generative AI
 * to evaluate the transcript based on completion, accuracy, pronunciation, fluency, and timing.
 * It provides an overall score out of 10 and suggestions for improvement.
 *
 * @param {Object} data - The input data for the function.
 * @param {string} data.transcript - The transcript of the chanting.
 * @param {string} data.time - The time duration of the chanting.
 * @param {Object} context - The context of the function call.
 * @returns {Object} An object containing the analysis text and score.
 */

/**
 * Cloud Function to analyze chanting of the Hanuman Chalisa.
 *
 * This function receives a transcript of chanting and the duration, then uses Google Generative AI
 * to evaluate the transcript based on completion, accuracy, pronunciation, fluency, and timing.
 * It provides an overall score out of 10 and suggestions for improvement.
 *
 * @param {Object} data - The input data for the function.
 * @param {string} data.transcript - The transcript of the chanting.
 * @param {string} data.time - The time duration of the chanting.
 * @param {Object} context - The context of the function call.
 * @returns {Object} An object containing the analysis text and score.
 */
export const analyzeChanting = functions.https.onCall(async (data, context) => {
  const { transcript, time } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 1,
      responseMimeType: "application/json"
    },
    systemInstruction: `
      You are Tulsidas, the revered poet of the Hanuman Chalisa. Your task is to analyze the provided chanting transcript to ensure it is the Hanuman Chalisa and evaluate it based on:
      1. **Completion**: Check if the transcript matches the full Hanuman Chalisa. Note any missing or incorrect parts.
      2. **Accuracy**: Correctness of the chanted words. Highlight any deviations.
      3. **Pronunciation**: Clarity and correctness of Sanskrit pronunciation.
      4. **Fluency**: Smoothness and rhythm.
      5. **Timing**: Suitability of the chanting duration.

      Provide an overall score out of 10, with at least 1 point awarded for partially correct chanting. 
      - If the chanting includes a few correct words, give at least 1 or 2 points.
      - If no words from the Hanuman Chalisa are present, give a score of 0.
      - If the score is between 0 and 3, ensure the response is humorous and encouraging.
    `
  });

  try {
    const prompt = `
      As Tulsidas, analyze the following chanting transcript of the Hanuman Chalisa: "${transcript}", which was chanted in ${time}. Determine if it matches the Hanuman Chalisa and provide suggestions for improvement and a score out of 10. If a few words from the Hanuman Chalisa are correct, give at least 1 or 2 points. If no words from the Hanuman Chalisa are present in the transcript, give a score of 0. If the score is between 0 and 3, provide a humorous and encouraging response. Use the following schema:
      {
        "type": "object",
        "properties": {
          "analysis": { "type": "string" },
          "score": { "type": "number" }
        },
        "required": ["analysis", "score"]
      }
    `;
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    let parsedResponse: { analysis: string, score: number };
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Response text:", responseText);
      parsedResponse = { analysis: 'Unable to parse analysis. Please try again.', score: 0 };
    }

    const analysisText = parsedResponse.analysis || 'No analysis available.';
    const score = parsedResponse.score !== undefined ? parsedResponse.score : 0;

    return { analysisText, score };
  } catch (error) {
    console.error("Error analyzing chanting:", error);
    return { analysisText: 'Unable to analyze chanting due to an internal error. Please try again later.', score: 0 };
  }
});
