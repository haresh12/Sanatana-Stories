import { styled } from '@mui/system';
import { Box, Button, Card } from '@mui/material';

export const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

export const OptionButton = styled(Button)<{ isCorrect?: boolean; isIncorrect?: boolean }>(({ theme, isCorrect, isIncorrect }) => ({
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

export const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  backgroundColor: '#ffebee',
}));

export const TopicsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  borderRadius: '10px',
  backgroundColor: '#e0f7fa',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));
