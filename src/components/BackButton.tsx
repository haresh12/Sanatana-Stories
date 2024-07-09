import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const isPWA = () => window.matchMedia('(display-mode: standalone)').matches;
  const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isPWA() && isMobile() || true) {
    return (
      <IconButton onClick={handleBack} sx={{ position: 'fixed', top: '10px', left: '10px', zIndex: 1000, color : 'white' }}>
        <ArrowBackIcon />
      </IconButton>
    );
  }
};

export default BackButton;
