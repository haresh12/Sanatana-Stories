import React from 'react';
import { Container, Typography } from '@mui/material';
import BackButton from '../components/BackButton';

const HinduPuranas: React.FC = () => {
  return (
    <Container maxWidth="lg" style={{ paddingTop: '40px', paddingBottom: '40px', position: 'relative' }}>
      <BackButton /> 
      <Typography variant="h4" align="center" gutterBottom style={{ marginBottom: '40px', fontWeight: 'bold', color: '#fff' }}>
       Hindu Puranas
      </Typography>
      <Typography variant="body1" align="center" style={{ color: '#fff' }}>
        Content for Hindu Puranas
      </Typography>
    </Container>
  );
};

export default HinduPuranas;
