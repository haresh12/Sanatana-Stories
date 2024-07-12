import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Button, Modal, CircularProgress as MuiCircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebaseConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface GenerateQuizQuestionsResponse {
  questions: {
    questions: QuizQuestion[];
  };
  topics: string[];
}

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const OptionButton = styled(Button)<{ isCorrect?: boolean; isIncorrect?: boolean }>(({ theme, isCorrect, isIncorrect }) => ({
  marginTop: theme.spacing(1),
  textAlign: 'left',
  justifyContent: 'flex-start',
  padding: theme.spacing(1.5),
  borderRadius: '25px',
  backgroundColor: isCorrect ? '#4caf50' : isIncorrect ? '#f44336' : '#ff5722',
  color: '#fff',
  '&:hover': {
    backgroundColor: isCorrect ? '#4caf50' : isIncorrect ? '#f44336' : '#e64a19',
  },
  transition: 'background-color 0.3s, transform 0.2s',
  transform: isCorrect || isIncorrect ? 'scale(1.05)' : 'scale(1)',
  '&:active': {
    transform: 'scale(0.95)',
  },
  fontSize: '1rem',
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  '& .MuiButton-label': {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: '20px',
  padding: '20px',
  borderRadius: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  backgroundColor: '#ffebee',
}));

const TopicsContainer = styled(Box)(({ theme }) => ({
  marginBottom: '20px',
  padding: '10px 20px',
  borderRadius: '10px',
  backgroundColor: '#e0f7fa',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const generateQuiz = httpsCallable<{}, GenerateQuizQuestionsResponse>(functions, 'generateQuiz');
        const response = await generateQuiz();
        console.log('Response:', response);
        const data = response.data as GenerateQuizQuestionsResponse;
        if (Array.isArray(data.questions.questions)) {
          setQuestions(data.questions.questions);
          setTopics(data.topics);
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

  const handleAnswerSelect = async (option: string) => {
    setSelectedAnswer(option);
    setUserAnswers((prev) => [...prev, option]);

    setTimeout(async () => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Calculate score
        const score = questions.reduce((acc, question, index) => {
          if (question.correctAnswer === userAnswers[index]) {
            return acc + 1;
          }
          return acc;
        }, 0);

        // Store user responses and score in Firestore
        if (currentUser) {
          const userQuizRef = collection(db, 'users', currentUser.uid, 'quizzes');
          await addDoc(userQuizRef, {
            questions,
            userAnswers,
            score,
            topics,
            timestamp: new Date(),
          });

          // Display score or redirect to results page
          setModalOpen(true);
        }
      }
    }, 1000);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    navigate('/dashboard');
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <Box textAlign="center">
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px', color: '#ff5722' }}>
          Quiz
        </Typography>
        {!loading && (
          <TopicsContainer>
            <Typography variant="h6" sx={{ color: '#00796b', fontWeight: 'bold' }}>
              Topics: {topics.join(', ')}
            </Typography>
          </TopicsContainer>
        )}
        {loading ? (
          <CircularProgress />
        ) : (
          questions.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <QuestionCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ marginBottom: '20px', color: '#333', borderRadius: '20px', padding: '10px', backgroundColor: '#ffcccb', fontSize: '1rem' }}>
                      {questions[currentQuestionIndex].question}
                    </Typography>
                    <ProgressContainer>
                      <Typography variant="body1" sx={{ marginRight: '10px', color: '#333', fontSize: '0.875rem' }}>
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <MuiCircularProgress
                          variant="determinate"
                          value={progress}
                          size={40}
                          thickness={4}
                          sx={{
                            color: progress === 100 ? '#4caf50' : '#ff5722',
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                            progress
                          )}%`}</Typography>
                        </Box>
                      </Box>
                    </ProgressContainer>
                    {questions[currentQuestionIndex].options.map((option: string, idx: number) => {
                      const isCorrect = selectedAnswer === option && option === questions[currentQuestionIndex].correctAnswer;
                      const isIncorrect = selectedAnswer === option && option !== questions[currentQuestionIndex].correctAnswer;
                      return (
                        <OptionButton
                          key={idx}
                          fullWidth
                          isCorrect={isCorrect}
                          isIncorrect={isIncorrect}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={selectedAnswer !== null}
                        >
                          {option}
                        </OptionButton>
                      );
                    })}
                  </CardContent>
                </QuestionCard>
              </motion.div>
            </AnimatePresence>
          )
        )}
      </Box>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>
            Quiz Completed!
          </Typography>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Your score: {questions.reduce((acc, question, index) => question.correctAnswer === userAnswers[index] ? acc + 1 : acc, 0)}/{questions.length}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleModalClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default Quiz;
