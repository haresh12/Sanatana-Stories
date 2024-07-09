import React from 'react';
import { Container, Typography } from '@mui/material';
import BackButton from '../components/BackButton'; // Import BackButton component

const Mahabharat: React.FC = () => {
  return (
    <Container maxWidth="lg" style={{ paddingTop: '40px', paddingBottom: '40px', position: 'relative' }}>
      <BackButton /> {/* Add BackButton here */}
      <Typography variant="h4" align="center" gutterBottom style={{ marginBottom: '40px', fontWeight: 'bold', color: '#fff' }}>
        Mahabharat
      </Typography>
      <Typography variant="body1" align="center" style={{ color: '#fff' }}>
        Content for Mahabharat
      </Typography>
    </Container>
  );
};

export default Mahabharat;
