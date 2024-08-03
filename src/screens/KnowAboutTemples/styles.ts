import { styled } from '@mui/system';
import { Card, CardContent, Box } from '@mui/material';

export const StyledCard = styled(Card)<{ color: string }>(({ color }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: 0,
  margin: '20px',
  borderRadius: '15px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  height: '450px',
  backgroundColor: color,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
  cursor: 'pointer',
  '&:focus': {
    outline: '2px solid #ff5722',
  },
}));

export const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: '16px',
  textAlign: 'center',
  width: '100%',
}));

export const StyledImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  borderTopLeftRadius: '15px',
  borderTopRightRadius: '15px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));
