import React, { useEffect, useState, useRef } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Card, CardContent, CardActions } from '@mui/material';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions, db, storage } from '../firebaseConfig';
import { getDownloadURL, ref } from 'firebase/storage';

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

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const storyDocRef = doc(db, `users/${currentUser?.uid}/stories/${templeId}`);
        const storyDoc = await getDoc(storyDocRef);
        if (storyDoc.exists()) {
          const storyData = storyDoc.data();
          setStory(storyData?.text || '');
        } else {
          const generateStory = httpsCallable(functions, 'generateStory');
          const response = await generateStory({ templeName });
          const { story } = response.data as { story: string };

          setStory(story);

          const storyData = { text: story };

          await setDoc(storyDocRef, storyData);
        }
      } catch (error) {
        console.error('Error fetching story:', error);
        setError('Failed to load the story. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [templeId, templeName, initialStory, setStory, currentUser?.uid]);

  const handleGenerateNewStory = async () => {
    setLoading(true);
    try {
      const storyDocRef = doc(db, `users/${currentUser?.uid}/stories/${templeId}`);
      await deleteDoc(storyDocRef); // Delete the existing story

      const generateStory = httpsCallable(functions, 'generateStory');
      const response = await generateStory({ templeName });
      const { story } = response.data as { story: string };

      setStory(story);

      const storyData = { text: story };

      await setDoc(storyDocRef, storyData);
    } catch (error) {
      console.error('Error generating new story:', error);
      setError('Failed to generate a new story. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleListen = async () => {
    setAudioLoading(true);
    setTimeout(async () => {
      try {
        const storyDocRef = doc(db, `users/${currentUser?.uid}/stories/${templeId}`);
        const storyDoc = await getDoc(storyDocRef);
        if (storyDoc.exists()) {
          const storyData = storyDoc.data();
          const audioPath = storyData?.audioPath;
          if (audioPath) {
            const audioRefPath = ref(storage, audioPath);
            const audioDownloadUrl = await getDownloadURL(audioRefPath);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            audioRef.current = new Audio(audioDownloadUrl);
            audioRef.current.playbackRate = 0.9;
            audioRef.current.play();
            setIsPlaying(true);
            audioRef.current.ontimeupdate = () => {
              const currentTime = audioRef.current?.currentTime || 0;
              const words = initialStory.split(' ');
              const wordsPerSecond = words.length / (audioRef.current?.duration || 1);
              const currentWordIndex = Math.floor(currentTime * wordsPerSecond);
              setHighlightedWordIndex(currentWordIndex);
            };
            audioRef.current.onended = () => {
              setIsPlaying(false);
              setHighlightedWordIndex(-1);
            };
          } else {
            setError('No audio available for this story.');
          }
        } else {
          setError('No story available for this temple.');
        }
      } catch (error) {
        console.error('Error during text-to-speech:', error);
        setError('Failed to play the audio. Please try again later.');
      } finally {
        setAudioLoading(false);
      }
    }, 3000); // 3-second delay
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const renderStoryWithHighlights = () => {
    const words = initialStory.split(' ');
    return words.map((word, index) => (
      <span key={index} style={{ backgroundColor: index === highlightedWordIndex ? 'yellow' : 'transparent' }}>
        {word}{' '}
      </span>
    ));
  };

  return (
    <Container maxWidth="md" sx={{ paddingBottom: '40px', height: '85vh' }}>
      {!initialStory ? (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: -5 }}>
            Story about {templeName}
          </Typography>
        </motion.div>
      ) : (
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: -5 }}>
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
              {renderStoryWithHighlights()}
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
          {!loading && initialStory && (
            <>
              {audioLoading ? (
                <Button
                  variant="contained"
                  color="primary"
                  disabled
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
                  <CircularProgress size={24} color="inherit" />
                </Button>
              ) : isPlaying ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePause}
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
                  Pause
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleListen}
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
              )}
            </>
          )}
        </CardActions>
      </Card>
    </Container>
  );
};

export default Stories;
