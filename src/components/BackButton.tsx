import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const isPWA = () => window.matchMedia('(display-mode: standalone)').matches;
  const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // should be only visible when we it's PWA or mobile device
  if (isPWA() || isMobile()) {
    return (
      <IconButton
        onClick={handleBack}
        sx={{
          position: 'fixed',
          top: '15px',
          left: '15px',
          zIndex: 1000,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '5px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          '& svg': {
            fontSize: '20px',
          },
        }}
        aria-label="Go back"
      >
        <ArrowBackIcon />
      </IconButton>
    );
  } else {
    return null;
  }
};

export default BackButton;
