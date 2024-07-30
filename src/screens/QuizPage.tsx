import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Button, Modal } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebaseConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';
import BackButton from '../components/BackButton';

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
  padding: theme.spacing(1),
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
  fontSize: theme.breakpoints.down('sm') ? '0.75rem' : '1rem',
  fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  '& .MuiButton-label': {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  backgroundColor: '#ffebee',
}));

const TopicsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  borderRadius: '10px',
  backgroundColor: '#e0f7fa',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const darkFacts = [
  "Hinduism is the world's oldest religion.",
  "The Ramayana is an ancient Indian epic poem.",
  "Yoga has its origins in Hindu philosophy.",
  "Ayurveda is a traditional Hindu system of medicine.",
  "The Bhagavad Gita is a 700-verse Hindu scripture.",
  "Hinduism has no single founder; it developed over thousands of years.",
  "The Mahabharata is the longest epic poem in the world.",
  "Diwali, the festival of lights, is one of the most important Hindu festivals.",
  "Karma is a core concept in Hinduism, meaning action or deed.",
  "Hindus believe in a cycle of birth, death, and rebirth called Samsara.",
  "Hindu temples are often dedicated to a particular deity.",
  "The Vedas are the oldest sacred texts of Hinduism.",
  "The sacred syllable 'Om' is considered the sound of the universe.",
  "Holi is known as the festival of colors and celebrates the arrival of spring.",
  "The Ganges River is considered sacred in Hinduism.",
  "Hindus worship multiple deities, including Brahma, Vishnu, and Shiva.",
  "Sanskrit is the ancient language of Hindu scriptures.",
  "Rangoli is a traditional Indian art form created during festivals.",
  "Many Hindus follow a vegetarian diet for religious reasons.",
  "The concept of Dharma represents duty, righteousness, and moral law."
];

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [retry, setRetry] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const navigate = useNavigate();
  const [factIndex, setFactIndex] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateResponse = (data: GenerateQuizQuestionsResponse): boolean => {
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

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const generateQuiz = httpsCallable<{}, GenerateQuizQuestionsResponse>(functions, 'generateQuiz');
        const response = await generateQuiz();
        const data = response.data as GenerateQuizQuestionsResponse;
        if (validateResponse(data)) {
          setQuestions(data.questions.questions);
          setTopics(data.topics);
        } else {
          console.error('Invalid data structure:', data);
          setRetry(true);
        }
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        setRetry(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [retry]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loading) {
      interval = setInterval(() => {
        setFactIndex((prevIndex) => (prevIndex + 1) % darkFacts.length);
      }, 3000); // Change fact every 3 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading]);

  const handleRetry = () => {
    setRetry(false);
    setQuestions([]);
    setTopics([]);
  };

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
    }, 2000);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    navigate('/dashboard');
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <>
    <BackButton/>
    <Container maxWidth="md" sx={{ paddingTop: isMobile ? '20px' : '40px', paddingBottom: isMobile ? '20px' : '40px' }}>
      <Box textAlign="center">
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 'bold', marginBottom: isMobile ? '10px' : '20px', color: '#ff5722' }}>
          Quiz
        </Typography>
        {!loading && !retry && (
          <TopicsContainer sx={{ padding: isMobile ? '8px' : '10px 20px' }}>
            <Typography variant="h6" sx={{ color: '#00796b', fontWeight: 'bold' }}>
              Topics: {topics.join(', ')}
            </Typography>
          </TopicsContainer>
        )}
        {loading ? (
          <>
            <CircularProgress aria-busy="true" size={isMobile ? 40 : 60} />
            <Typography variant="h6" sx={{ color: '#ff5722', marginTop: '20px' }}>
              {darkFacts[factIndex]}
            </Typography>
          </>
        ) : retry ? (
          <Box>
            <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
              Failed to generate quiz. Please try again.
            </Typography>
            <Button
              onClick={handleRetry}
              variant="contained"
              color="primary"
              sx={{ marginTop: '20px', backgroundColor: '#ff5722' }}
            >
              Retry
            </Button>
          </Box>
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
                <QuestionCard sx={{ padding: isMobile ? '15px' : '20px' }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ marginBottom: isMobile ? '10px' : '20px', color: '#333', borderRadius: '20px', padding: '10px', backgroundColor: '#ffcccb', fontSize: isMobile ? '0.875rem' : '1rem' }}
                    >
                      {questions[currentQuestionIndex].question}
                    </Typography>
                    <ProgressContainer>
                      <Typography variant="body1" sx={{ marginRight: '10px', color: '#333', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={progress}
                          size={isMobile ? 50 : 60}
                          thickness={4}
                          sx={{
                            color: progress === 100 ? '#4caf50' : '#ff5722',
                          }}
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Quiz Progress"
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
                          <Typography variant="caption" component="div" color="textSecondary">
                            {`${Math.round(progress)}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </ProgressContainer>
                    {questions[currentQuestionIndex].options.map((option: string, idx: number) => {
                      const isCorrect = selectedAnswer === option && option === questions[currentQuestionIndex].correctAnswer;
                      const isIncorrect = selectedAnswer === option && option !== questions[currentQuestionIndex].correctAnswer;
                      const showCorrect = selectedAnswer !== null && option === questions[currentQuestionIndex].correctAnswer;
                      return (
                        <OptionButton
                          key={idx}
                          fullWidth
                          isCorrect={isCorrect || showCorrect}
                          isIncorrect={isIncorrect}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={selectedAnswer !== null}
                          aria-pressed={selectedAnswer === option}
                          sx={{ padding: isMobile ? '8px' : '15px', fontSize: isMobile ? '0.75rem' : '1rem' }}
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
      <Modal open={modalOpen} onClose={handleModalClose} aria-labelledby="quiz-result-title" aria-describedby="quiz-result-description">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Card
            sx={{
              padding: '20px',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              backgroundColor: '#ffebee',
              textAlign: 'center',
            }}
          >
            <CardContent>
              <Typography id="quiz-result-title" variant={isMobile ? 'h5' : 'h4'} sx={{ color: '#333', mb: 2 }}>
                Quiz Completed!
              </Typography>
              <Typography id="quiz-result-description" variant={isMobile ? 'h6' : 'h5'} sx={{ color: '#333', mb: 2 }}>
                Your score: {questions.reduce((acc, question, index) => (question.correctAnswer === userAnswers[index] ? acc + 1 : acc), 0)}/{questions.length}
              </Typography>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                sx={{
                  color: questions.reduce((acc, question, index) => (question.correctAnswer === userAnswers[index] ? acc + 1 : acc), 0) > 3 ? '#4caf50' : '#f44336',
                  mb: 2,
                }}
              >
                {questions.reduce((acc, question, index) => (question.correctAnswer === userAnswers[index] ? acc + 1 : acc), 0) > 3 ? 'Passed 😊' : 'Failed 😢'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleModalClose}
                sx={{ mt: 2, borderRadius: '50%', backgroundColor: '#ff5722' }}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </Container>
    </>
  );
  
}

export default Quiz;
