import React from 'react';
import { Container, Typography } from '@mui/material';
import BackButton from '../components/BackButton';

const Ramayan: React.FC = () => {
  return (
    <Container maxWidth="lg" style={{ paddingTop: '40px', paddingBottom: '40px', position: 'relative' }}>
      <BackButton />
      <Typography variant="h4" align="center" gutterBottom style={{ marginBottom: '40px', fontWeight: 'bold', color: '#fff' }}>
        Ramayan
      </Typography>
      <Typography variant="body1" align="center" style={{ color: '#fff' }}>
        Content for Ramayan screen
      </Typography>
    </Container>
  );
};

export default Ramayan;
