import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Button, Modal } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { styled } from '@mui/system';

interface PodcastSegment {
  host: string;
  guest: string;
}

interface GeneratePodcastResponse {
  script: PodcastSegment[];
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  textAlign: 'center',
}));

const GenerateButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: '#4caf50',
  color: '#fff',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#388e3c',
  },
}));

const ResultCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  backgroundColor: '#f0f4c3',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  borderRadius: '20px',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
}));

const GeneratePodcast: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<PodcastSegment[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generatePodcast = httpsCallable<{}, GeneratePodcastResponse>(functions, 'generatePodcast');
      const response = await generatePodcast({});
      const data = response.data as GeneratePodcastResponse; // Explicitly type the response data
      setScript(data.script);
    } catch (error) {
      console.error('Error generating podcast:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Generate Spiritual Podcast
      </Typography>
      <GenerateButton
        variant="contained"
        onClick={handleGenerate}
        disabled={loading}
      >
        Generate Podcast
      </GenerateButton>

      <AnimatePresence>
        {loading && (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!loading && script.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultCard>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Generated Podcast Script
                </Typography>
                {script.map((segment, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="body1"><strong>Host:</strong> {segment.host}</Typography>
                    <Typography variant="body1"><strong>Guest:</strong> {segment.guest}</Typography>
                  </Box>
                ))}
              </CardContent>
            </ResultCard>
          </motion.div>
        )}
      </AnimatePresence>
    </StyledContainer>
  );
};

export default GeneratePodcast;
