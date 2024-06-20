import React from 'react';
import { Container, Typography } from '@mui/material';

const Mahabharat: React.FC = () => {
    return (
        <Container maxWidth="lg" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
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