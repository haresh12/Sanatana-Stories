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

  // should be only visible when we its pwa or mobile device
  if (isPWA() || isMobile()) {
    return (
      <IconButton
        onClick={handleBack}
        sx={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
