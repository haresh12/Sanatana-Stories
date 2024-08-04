import React, { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Card, CardContent, CardActions } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { handleGenerateNewStory, handleListen, handlePause } from './utils';
import { fetchStory } from './fetchStory';
import { audioLoadingState, cardStyles, buttonStyles, cardContentStyles, cardActionsStyles, errorBoxStyles } from './styles';

interface StoriesProps {
  templeId: string;
  templeName: string;
  initialStory: string;
  setStory: React.Dispatch<React.SetStateAction<string>>;
}

const Stories: React.FC<StoriesProps> = ({ templeId, templeName, initialStory, setStory }) => {
  const [loading, setLoading] = useState<boolean>(initialStory === '');
  const [error, setError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchStory(templeId, templeName, setStory, currentUser?.uid, setLoading, setError);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [templeId, templeName, setStory, currentUser?.uid]);

  const renderStoryWithHighlights = (story: string, highlightedIndex: number) => {
    const words = story.split(' ');
    return words.map((word, index) => (
      <span key={index} style={{ backgroundColor: index === highlightedIndex ? 'yellow' : 'transparent' }}>
        {word}{' '}
      </span>
    ));
  };

  return (
    <Container maxWidth="md" sx={{ paddingBottom: '40px', height: '85vh' }}>
      {!initialStory ? (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: isMobile ? -3 : -5, fontSize: isMobile ? '1.5rem' : '2rem' }}>
            Story about {templeName}
          </Typography>
        </motion.div>
      ) : (
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: isMobile ? -3 : -5, fontSize: isMobile ? '1.3rem' : '2rem' }}>
          Story about {templeName}
        </Typography>
      )}
      <Card sx={cardStyles(isMobile)}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <CircularProgress color="success" aria-label="Loading story" />
          </Box>
        ) : error ? (
          <Box sx={errorBoxStyles}>
            <Typography variant="h6" color="error" aria-label="Error message">
              {error}
            </Typography>
          </Box>
        ) : (
          <CardContent sx={cardContentStyles}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', textAlign: 'justify', fontSize: isMobile ? '16px' : '18px' }} aria-label="Story content">
              {renderStoryWithHighlights(initialStory, highlightedWordIndex)}
            </Typography>
          </CardContent>
        )}
        <CardActions sx={cardActionsStyles(isMobile)}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleGenerateNewStory(templeId, templeName, setLoading, setError, setStory, currentUser?.uid)}
            sx={buttonStyles(isMobile, '#ff7043', '#ff5722')}
            aria-label="Generate new story"
          >
            Generate New
          </Button>
          {!loading && initialStory && (
            <>
              {audioLoading ? (
                <Button variant="contained" color="primary" disabled sx={audioLoadingState(isMobile)} aria-label="Audio loading">
                  <CircularProgress size={20} color="inherit" aria-label="Loading audio" />
                </Button>
              ) : isPlaying ? (
                <Button variant="contained" color="primary" onClick={() => handlePause(audioRef, setIsPlaying)} sx={buttonStyles(isMobile, '#81c784', '#66bb6a')} aria-label="Pause audio">
                  Pause
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={() => handleListen(templeId, initialStory, setAudioLoading, setError, setIsPlaying, setHighlightedWordIndex, audioRef, currentUser?.uid)} sx={buttonStyles(isMobile, '#81c784', '#66bb6a')} aria-label="Listen to story">
                  Listen
                </Button>
              )}
            </>
          )}
        </CardActions>
      </Card>
    </Container>
  );
};

export default Stories;
