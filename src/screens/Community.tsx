import React from 'react';
import { Container, Typography } from '@mui/material';

const Community: React.FC = () => {
    return (
        <Container maxWidth="lg" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
            <Typography variant="h4" align="center" gutterBottom style={{ marginBottom: '40px', fontWeight: 'bold', color: '#fff' }}>
                Community
            </Typography>
            <Typography variant="body1" align="center" style={{ color: '#fff' }}>
                Content for Community
            </Typography>
        </Container>
    );
};

export default Community;