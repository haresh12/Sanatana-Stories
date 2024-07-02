import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Card, CardContent, CardActions } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { motion } from 'framer-motion';

interface StoriesProps {
  templeId: string;
  templeName: string;
  initialStory: string;
  setStory: React.Dispatch<React.SetStateAction<string>>;
}

const Stories: React.FC<StoriesProps> = ({ templeId, templeName, initialStory, setStory }) => {
  const [loading, setLoading] = useState<boolean>(initialStory === '');
  const [error, setError] = useState<string | null>(null);
  const [animateOnce, setAnimateOnce] = useState<boolean>(false);

  useEffect(() => {
    const storedStory = localStorage.getItem(`templeStory_${templeId}`);
    if (storedStory) {
      setStory(storedStory);
      setLoading(false);
      return;
    }

    const fetchStory = async () => {
      try {
        const generateStory = httpsCallable(functions, 'generateStory');
        const response = await generateStory({ templeName });
        const { story } = response.data as { story: string };
        setStory(story);
        localStorage.setItem(`templeStory_${templeId}`, story);
      } catch (error) {
        console.error('Error fetching story:', error);
        setError('Failed to load the story. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [templeId, templeName, initialStory, setStory]);

  const handleGenerateNewStory = async () => {
    setLoading(true);
    try {
      const generateStory = httpsCallable(functions, 'generateStory');
      const response = await generateStory({ templeName });
      const { story } = response.data as { story: string };
      setStory(story);
      localStorage.setItem(`templeStory_${templeId}`, story);
      setAnimateOnce(false);
    } catch (error) {
      console.error('Error generating new story:', error);
      setError('Failed to generate a new story. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ paddingBottom: '40px', height: '85vh' }}>
      {animateOnce && !initialStory ? (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
            Story about {templeName}
          </Typography>
        </motion.div>
      ) : (
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
          Story about {templeName}
        </Typography>
      )}
      <Card
        sx={{
          mt: 2,
          p: 2,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          borderRadius: '15px',
          backgroundColor: '#fff',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <CircularProgress color="success" />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </Box>
        ) : (
          <CardContent sx={{ overflowY: 'auto', flex: '1 1 auto' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', textAlign: 'justify', fontSize: '18px' }}>
              {initialStory}
            </Typography>
          </CardContent>
        )}
        <CardActions sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateNewStory}
            sx={{
              backgroundColor: '#ff7043',
              borderRadius: '30px',
              padding: '10px 30px',
              fontSize: '16px',
              '&:hover': {
                backgroundColor: '#ff5722',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
              mr: 2,
            }}
          >
            Generate New
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#81c784',
              borderRadius: '30px',
              padding: '10px 30px',
              fontSize: '16px',
              '&:hover': {
                backgroundColor: '#66bb6a',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Listen
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
};

export default Stories;
