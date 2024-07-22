import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('');

const mustTopics = [
  'Hindu Puranas', 'Ramayan', 'Mahabharat', 'Bhagavad Gita', 'Hindu gods and goddesses',
  'Hindu temples', 'Hindu festivals'
];

const selectedTopics = [
  'Hindu culture',
  'Vedas',
  'Upanishads',
  'Indian mythology',
  'Ancient Indian history',
  'Hindu rituals',
  'Yoga philosophy',
  'Ayurveda',
  'Hindu scriptures',
  'Hindu cosmology and creation myths'
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface GenerateQuizQuestionsResponse {
  questions: QuizQuestion[];
  topics: string[];
}

function shuffle(array: string[]): string[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const generateQuizContent = async (chosenTopics: string[]): Promise<GenerateQuizQuestionsResponse | null> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 1.0,
      topK: 50,
      topP: 0.9,
      responseMimeType: "application/json"
    }
  });


  const prompt = `
  Generate a JSON with up to 6 questions about ${chosenTopics.join(', ')}. Each question should have 2 to 4 options where users can select an answer. Also provide the correct answer for each question. Use the following schema:
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
        "maxItems": 6
      }
    },
    "required": ["questions"]
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    let parsedResponse: GenerateQuizQuestionsResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return null;
    }
  
    return parsedResponse;
  } catch (error) {
    console.error("Error generating content or parsing JSON:", error);
    return null;
  }
};

export const generateQuiz = functions.https.onCall(async (data, context) => {
  try {
    const shuffledMustTopics = shuffle([...mustTopics]);
    const shuffledShouldTopics = shuffle([...selectedTopics]);

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
