import { Container, Card, Button } from '@mui/material';
import { styled } from '@mui/system';

export const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  borderRadius: '15px',
  padding: theme.spacing(4),
  maxWidth: '800px',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
}));

export const ProgressButton = styled(Button)<{ isLoading: boolean }>(({ theme, isLoading }) => ({
  backgroundColor: isLoading ? '#4caf50' : '#ff7043',
  color: '#fff',
  borderRadius: '30px',
  padding: theme.spacing(isLoading ? 1.5 : 2, 4),
  fontSize: theme.spacing(2),
  '&:hover': {
    backgroundColor: isLoading ? '#388e3c' : '#ff5722',
  },
  transition: 'all 0.3s ease',
}));
