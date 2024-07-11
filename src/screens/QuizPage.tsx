import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';

interface QuizQuestion {
  question: string;
  options: string[];
}

interface GenerateQuizQuestionsResponse {
  questions: {
    questions: QuizQuestion[];
  };
}

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const generateQuiz = httpsCallable<{}, GenerateQuizQuestionsResponse>(functions, 'generateQuiz');
        const response = await generateQuiz();
        // Log the response to see its structure
        console.log('Response:', response);
        const data = response.data as GenerateQuizQuestionsResponse;
        // Handle nested structure
        if (Array.isArray(data.questions.questions)) {
          setQuestions(data.questions.questions);
        } else {
          console.error('Invalid data structure:', data);
        }
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        textAlign="center"
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          Quiz
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          questions.map((q, index) => (
            <Card key={index} sx={{ marginBottom: '20px' }}>
              <CardContent>
                <Typography variant="h6">{q.question}</Typography>
                {q.options.map((option: string, idx: number) => (
                  <Typography key={idx}>{`${idx + 1}. ${option}`}</Typography>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default Quiz;
