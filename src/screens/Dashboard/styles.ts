import { SxProps } from '@mui/material';
import { keyframes } from '@mui/system';

export const movingBorder = keyframes`
  0%, 100% {
    border-color: transparent;
  }
  50% {
    border-color: #FFD700; 
  }
`;

export const pulsingShadow = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(255, 179, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 179, 0, 1);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 179, 0, 0.5);
  }
`;

export const containerStyle: SxProps = {
  paddingTop: { xs: '20px', sm: '40px' },
  paddingBottom: { xs: '20px', sm: '40px' },
  position: 'relative',
};

export const logoutButtonStyle: SxProps = {
  backgroundColor: '#ff5722',
  color: '#fff',
  fontWeight: 'bold',
  padding: { xs: '5px 10px', sm: '10px 20px' },
  borderRadius: '25px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#e64a19',
  },
};

export const dialogStyle: SxProps = {
  '& .MuiDialog-paper': {
    backgroundColor: '#fff',
    color: '#333',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  },
};

export const cardStyle = (card: any, isMobile: boolean, animateFunFact: boolean, animateMyth: boolean): SxProps => ({
  backgroundColor: card.color,
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  height: isMobile ? '180px' : '220px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  padding: isMobile ? '10px' : '20px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  borderRadius: '15px',
  border: (card.title === 'Fun Fact' && animateFunFact) || (card.title === 'Myth' && animateMyth)
    ? `2px solid transparent`
    : 'none',
  animation: (card.title === 'Fun Fact' && animateFunFact) || (card.title === 'Myth' && animateMyth)
    ? `${movingBorder} 2s linear`
    : 'none',
});

export const cardTitleStyle: SxProps = {
  fontWeight: 'bold',
  marginTop: { xs: '10px', sm: '20px' },
  color: '#fff',
};

export const cardDescriptionStyle: SxProps = {
  marginTop: '10px',
  color: '#fff',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
};

export const knowMoreButtonStyle: SxProps = {
  color: '#fff',
  fontWeight: 'bold',
  padding: '5px 10px',
};
