export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface GenerateQuizQuestionsResponse {
  questions: {
    questions: QuizQuestion[];
  };
  topics: string[];
}
