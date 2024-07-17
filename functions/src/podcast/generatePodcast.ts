import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('');

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const topics = [
    'Hindu Puranas', 
    'Ramayan', 
    'Mahabharat', 
    'Hindu culture', 
    'Vedas', 
    'Upanishads', 
    'Yoga philosophy',
    'Ayurveda', 
    'Hindu temples', 
    'Bhagavad Gita',
    'Love and Relationships', 
    'Life and Happiness', 
    'Overcoming Challenges', 
    'Finding Purpose', 
    'Mindfulness and Meditation'
  ];

export const generatePodcast = functions.https.onCall(async (data, context) => {
  shuffle(topics);
  const chosenTopics = topics.slice(0, 3);

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.9,
      responseMimeType: "application/json"
    },
    systemInstruction: `
      You are an expert in ${chosenTopics.join(', ')}. 
      Generate a podcast script of at least 10 minutes or 12,000 words about these topics. 
      Structure the response as an array of objects with host and guest dialogues. 
      Each object should have 'host' and 'guest' properties containing the dialogue.
    `
  });

  const prompt = `
    Generate a podcast script of at least 10 minutes or 12,000 words about ${chosenTopics.join(', ')}. 
    Structure the response as an array of objects with host and guest dialogues. 
    Each object should have 'host' and 'guest' properties containing the dialogue. 
    Use the following schema:
    [
      {
        "host": "string",
        "guest": "string"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    
    let script;
    try {
      script = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Response text:", responseText);
      throw new functions.https.HttpsError('internal', 'Unable to parse podcast script.');
    }

    return { script, topics: chosenTopics };
  } catch (error) {
    console.error("Error generating podcast script:", error);
    throw new functions.https.HttpsError('internal', 'Unable to generate podcast script.');
  }
});
