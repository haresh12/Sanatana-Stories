import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { GenerateQuizQuestionsResponse, QuizQuestion } from './types';

/**
 * Fetches quiz questions from the backend.
 * 
 * @returns {Promise<GenerateQuizQuestionsResponse | null>} - The fetched quiz questions or null if an error occurs.
 */
export const fetchQuizQuestions = async (): Promise<GenerateQuizQuestionsResponse | null> => {
  try {
    const generateQuiz = httpsCallable<{}, GenerateQuizQuestionsResponse>(functions, 'generateQuiz');
    const response = await generateQuiz();
    return response.data as GenerateQuizQuestionsResponse;
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return null;
  }
};

/**
 * Validates the structure and content of the quiz data.
 * 
 * @param {GenerateQuizQuestionsResponse} data - The quiz data to validate.
 * @returns {boolean} - True if the data is valid, false otherwise.
 */
export const validateQuizData = (data: GenerateQuizQuestionsResponse): boolean => {
  return (
    data &&
    data.questions &&
    Array.isArray(data.questions.questions) &&
    data.questions.questions.length > 0 &&
    data.questions.questions.every(
      (question) =>
        question.question &&
        Array.isArray(question.options) &&
        question.options.length >= 2 &&
        question.options.length <= 4 &&
        question.correctAnswer
    ) &&
    Array.isArray(data.topics)
  );
};

/**
 * Stores the quiz results in the database.
 * 
 * @param {any} currentUser - The current user object.
 * @param {QuizQuestion[]} questions - The quiz questions.
 * @param {string[]} userAnswers - The user's answers.
 * @param {number} score - The user's score.
 * @param {string[]} topics - The quiz topics.
 * @returns {Promise<void>} - A promise that resolves when the data is stored.
 */
export const storeQuizResults = async (
  currentUser: any,
  questions: QuizQuestion[],
  userAnswers: string[],
  score: number,
  topics: string[]
): Promise<void> => {
  if (currentUser) {
    const userQuizRef = collection(db, 'users', currentUser.uid, 'quizzes');
    await addDoc(userQuizRef, {
      questions,
      userAnswers,
      score,
      topics,
      timestamp: new Date(),
    });
  }
};
