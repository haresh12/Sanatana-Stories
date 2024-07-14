import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('');

export const generateStory = functions.https.onCall(async (data, context) => {
  const { templeName } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `
      You are an expert storyteller with deep knowledge of Hindu temples and their histories. 
      Your task is to weave an engaging and unique story about ${templeName}. The story should include:
      1. Historical significance and founding legends of the temple.
      2. Unique rituals, festivals, or practices associated with the temple.
      3. Anecdotes, miracles, or supernatural events linked to the temple.
      4. Cultural, spiritual, and social impact of the temple on the local community.
      5. Famous visitors, saints, or figures associated with the temple.
      6. Any architectural marvels or unique features of the temple.
      Ensure the story is not only informative but also captivating, filled with vivid descriptions and rare insights that are not easily found on the internet. 
      Infuse the narrative with elements of mystique, tradition, and cultural richness.
    `,
    generationConfig: {
      temperature: 1,  
      topK: 40,        
      topP: 0.95,       
      maxOutputTokens: 500 
    }
  });

  const prompts = [
    `Share an unknown legend or anecdote about the founding of the ${templeName} that highlights its historical significance.`,
    `Tell a unique story about a special ritual or festival at the ${templeName} that most people don't know about.`,
    `Describe the cultural and spiritual importance of the ${templeName} in the local community, including any lesser-known facts and traditions.`,
    `Narrate an interesting and rare story about a miracle or supernatural event associated with the ${templeName}.`,
    `Highlight the role of ${templeName} in the lives of famous visitors, saints, or figures and any special events related to them.`,
    `Describe the architectural marvels and unique features of the ${templeName} that set it apart from other temples.`,
    `Unveil a story about the social impact of the ${templeName} on its surrounding community and its role in local traditions.`,
    `Tell a captivating story about a little-known festival or celebration unique to the ${templeName}.`,
  ];

  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  try {
    const result = await model.generateContent(prompt);
    const story = await result.response.text();
    return { story };
  } catch (error) {
    console.error('Error generating story:', error);
    throw new functions.https.HttpsError('internal', 'Unable to generate story.');
  }
});
