import { styled } from '@mui/system';
import { Card, CardContent } from '@mui/material';

export const StyledCard = styled(Card)<{ color: string; expanded: boolean }>(({ color, expanded }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',  
  textAlign: 'center',
  padding: 0,
  margin: '20px',
  borderRadius: '15px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  height: expanded ? 'auto' : '500px', 
  backgroundColor: color,
  transition: 'transform 0.2s, box-shadow 0.2s, height 0.3s ease-in-out',
  paddingBottom: expanded ? '20px' : '0px', 
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
  flexGrow: 1, 
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
