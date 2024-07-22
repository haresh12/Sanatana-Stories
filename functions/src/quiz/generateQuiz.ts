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
        "maxItems": 10
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

    if (validateResponse(parsedResponse)) {
      return parsedResponse;
    } else {
      console.error('Invalid response structure:', parsedResponse);
      return null;
    }
  } catch (error) {
    console.error("Error generating content or parsing JSON:", error);
    return null;
  }
};

const validateResponse = (data: GenerateQuizQuestionsResponse): boolean => {
  return (
    data &&
    data.questions &&
    Array.isArray(data.questions) &&
    data.questions.length > 0 &&
    data.questions.every(
      (question) =>
        question.question &&
        Array.isArray(question.options) &&
        question.options.length >= 2 &&
        question.options.length <= 4 &&
        question.correctAnswer
    )
  );
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
