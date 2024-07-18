import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Button, CardActions } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { functions, db } from '../firebaseConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { styled } from '@mui/system';

interface PodcastSegment {
  host: string;
  guest: string;
}

interface GeneratePodcastResponse {
  script: PodcastSegment[];
  audioUrl: string;
  title: string;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  textAlign: 'center',
  color: '#ffffff',
}));

const GenerateButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff5722',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: '30px',
  padding: '10px 30px',
  fontSize: '16px',
  marginTop: theme.spacing(2),
  '&:hover': {
    backgroundColor: '#e64a19',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
}));

const ResultCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  backgroundColor: '#ffe0b2',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  borderRadius: '20px',
  padding: '20px',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
}));

const LoaderMessage = styled(Typography)(({ theme }) => ({
  color: '#ff5722',
  fontWeight: 'bold',
  fontSize: '20px',
  marginTop: theme.spacing(2),
}));

const facts = [
  "Hinduism is the world's oldest religion.",
  "The Ramayana is an ancient Indian epic poem.",
  "Yoga has its origins in Hindu philosophy.",
  "Ayurveda is a traditional Hindu system of medicine.",
  "The Bhagavad Gita is a 700-verse Hindu scripture.",
  "Hinduism has no single founder; it developed over thousands of years.",
  "The Mahabharata is the longest epic poem in the world.",
  "Diwali, the festival of lights, is one of the most important Hindu festivals.",
  "Karma is a core concept in Hinduism, meaning action or deed.",
  "Hindus believe in a cycle of birth, death, and rebirth called Samsara.",
  "Hindu temples are often dedicated to a particular deity.",
  "The Vedas are the oldest sacred texts of Hinduism.",
  "The sacred syllable 'Om' is considered the sound of the universe.",
  "Holi is known as the festival of colors and celebrates the arrival of spring.",
  "The Ganges River is considered sacred in Hinduism.",
  "Hindus worship multiple deities, including Brahma, Vishnu, and Shiva.",
  "Sanskrit is the ancient language of Hindu scriptures.",
  "Rangoli is a traditional Indian art form created during festivals.",
  "Many Hindus follow a vegetarian diet for religious reasons.",
  "The concept of Dharma represents duty, righteousness, and moral law."
];

const GeneratePodcast: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<PodcastSegment[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [title, setTitle] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loading) {
      interval = setInterval(() => {
        setFactIndex((prevIndex: number) => (prevIndex + 1) % facts.length);
      }, 5000); // Change fact every 5 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading]);

  const handleGenerate = async () => {
    if (!currentUser) {
      console.error('No user is logged in');
      return;
    }

    setLoading(true);
    try {
      const generatePodcast = httpsCallable<{ userId: string }, GeneratePodcastResponse>(functions, 'generatePodcast');
      const response = await generatePodcast({ userId: currentUser.uid });
      const data = response.data;
      setScript(data.script);
      setAudioUrl(data.audioUrl);
      setTitle(data.title); // Set the title
    } catch (error) {
      console.error('Error generating podcast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListen = () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <StyledContainer maxWidth="md">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#ff5722', fontWeight: 'bold' }}>
          Generate Spiritual Podcast
        </Typography>
        <GenerateButton
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
        >
          Generate Podcast
        </GenerateButton>
      </motion.div>

      <AnimatePresence>
        {loading && (
          <LoadingContainer>
            <CircularProgress color="inherit" />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              key={factIndex}
            >
              <LoaderMessage>{facts[factIndex]}</LoaderMessage>
            </motion.div>
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
                <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '20px' }}>
                  {title}
                </Typography>
                {script.map((segment, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="body1"><strong>Host:</strong> {segment.host}</Typography>
                    <Typography variant="body1"><strong>Guest:</strong> {segment.guest}</Typography>
                  </Box>
                ))}
              </CardContent>
              {audioUrl && (
                <CardActions sx={{ justifyContent: 'center' }}>
                  {isPlaying ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleStop}
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
                      Stop
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
                </CardActions>
              )}
            </ResultCard>
          </motion.div>
        )}
      </AnimatePresence>
    </StyledContainer>

  );
};

export default GeneratePodcast;
