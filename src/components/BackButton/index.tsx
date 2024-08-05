import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { StyledIconButton } from './styles';
import { STRINGS } from '../../const/strings';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const isPWA = () => window.matchMedia('(display-mode: standalone)').matches;
  const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isPWA() || isMobile()) {
    return (
      <StyledIconButton
        onClick={handleBack}
        aria-label={STRINGS.goBack}
      >
        <ArrowBackIcon />
      </StyledIconButton>
    );
  } else {
    return null;
  }
};

export default BackButton;
