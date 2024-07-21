import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('');

const mustTopics = [
  'Hindu Puranas', 'Ramayan', 'Mahabharat', 'Bhagavad Gita', 'Hindu gods and goddesses',
  'Hindu temples', 'Hindu festivals'
];

const shouldTopics = [
  'Hindu culture', 'Vedas', 'Upanishads', 'Indian mythology', 'Ancient Indian history', 
  'Hindu rituals', 'Yoga philosophy', 'Ayurveda', 'Sanskrit literature', 'Indian philosophy', 
  'Hindu scriptures', 'Hindu symbols', 'Indian architecture', 'Indian music', 'Indian dance',
  'Hindu cosmology', 'Hindu ethics', 'Hindu practices', 'Sacred geography', 'Hindu legends',
  'Hindu folklore', 'Indian astrology', 'Hindu metaphysics', 'Hindu eschatology', 'Sacred trees in Hinduism',
  'Pilgrimage sites in India', 'Hindu mythology and legends', 'Hindu saints and sages', 'Hindu cosmology and creation myths',
  'Dharma and Karma', 'Indian cuisine', 'Hindu wedding traditions', 'Hindu funeral rites', 'Hindu birth rituals',
  'Famous Hindu temples around the world', 'The significance of the Ganges River', 'The role of animals in Hindu mythology',
  'Hindu views on ecology and nature conservation', 'Hindu meditation practices', 'The significance of the Om symbol', 
  'Hindu chants and mantras', 'Hinduism and science', 'The concept of moksha in Hinduism', 'The significance of the cow in Hinduism'
];

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const generateQuizContent = async (chosenTopics: string[]) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 1.0,
      topK: 50,
      topP: 0.9,
      responseMimeType: "application/json"
    },
    systemInstruction: `
      You are an expert in ${chosenTopics.join(', ')}. 
      Generate a JSON with up to 10 questions about these topics. 
      Each question should have 2 to 4 options where users can select an answer. 
      Also provide the correct answer for each question. Ensure the JSON structure strictly follows the provided schema.
    `
  });

  const prompt = `
  Generate a JSON with up to 10 questions about ${chosenTopics.join(', ')}. Each question should have 2 to 4 options where users can select an answer. Also provide the correct answer for each question. Use the following schema:
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
    const responseText = await result.response.text();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error generating content or parsing JSON:", error);
    return null;
  }
};

export const generateQuiz = functions.https.onCall(async (data, context) => {
  try {
    const shuffledMustTopics = shuffle([...mustTopics]);
    const shuffledShouldTopics = shuffle([...shouldTopics]);

    const chosenTopics = [shuffledMustTopics[0], ...shuffledShouldTopics.slice(0, 2 + Math.floor(Math.random() * 2))];
    
    let questions = await generateQuizContent(chosenTopics);

    if (!questions) {
      // Retry with a fallback prompt
      questions = await generateQuizContent(['Hindu Puranas', 'Ramayan', 'Mahabharat']);
      if (!questions) {
        throw new functions.https.HttpsError('internal', 'Unable to generate valid quiz questions.');
      }
    }

    return { questions, topics: chosenTopics };
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new functions.https.HttpsError('internal', 'Unable to generate quiz questions.');
  }
});
