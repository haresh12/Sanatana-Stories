import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Button, CardActions, Tabs, Tab, Grid, List, ListItem, ListItemText } from '@mui/material';
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

interface Podcast {
  id: string;
  script: PodcastSegment[];
  audioUrl: string;
  title: string;
  timestamp: { seconds: number; nanoseconds: number };
}

const GenerateButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff5722',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: '30px',
  marginBottom : theme.spacing(4),
  padding: '10px 30px',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#e64a19',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
}));

const ResultCard = styled(Card)(({ theme }) => ({
  marginTop: 0,
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

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  minWidth: '160px',
  padding: theme.spacing(1, 2),
  '&.Mui-selected': {
    color: '#ff5722',
  },
  '&:hover': {
    color: '#ff5722',
  },
  transition: 'color 0.3s',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'auto',
  '& .MuiTabs-indicator': {
    backgroundColor: '#ff5722',
    height: '4px',
    borderRadius: '4px'
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
  },
  marginBottom: theme.spacing(2)
}));

const GeneratePodcast: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<PodcastSegment[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [title, setTitle] = useState<string>('');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    const fetchPodcasts = async () => {
      if (!currentUser) return;
      const podcastsRef = collection(db, 'users', currentUser.uid, 'podcasts');
      const q = query(podcastsRef);
      const querySnapshot = await getDocs(q);
      const fetchedPodcasts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Podcast[];
      setPodcasts(fetchedPodcasts);
    };

    fetchPodcasts();
  }, [currentUser]);

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
      console.log('data.script', data.script)
      setScript(data.script);
      setAudioUrl(data.audioUrl);
      setTitle(data.title);
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

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handlePodcastClick = (podcast: Podcast) => {
    setScript(podcast.script);
    setAudioUrl(podcast.audioUrl);
    setTitle(podcast.title);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '20px', paddingBottom: '10px', height: '100vh', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <StyledTabs value={tabIndex} onChange={handleTabChange} centered>
          <StyledTab label="Generate Podcast" />
          <StyledTab label="Previous Podcasts" />
        </StyledTabs>
      </Box>
      {tabIndex === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
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
          </Box>
        </motion.div>
      )}

      {tabIndex === 1 && (
        <Grid container spacing={2} sx={{ marginTop: '20px' }}>
          <Grid item xs={12} md={4}>
            <List sx={{ backgroundColor: '#ffe0b2', borderRadius: '20px', padding: '10px', maxHeight: '70vh', overflow: 'auto' }}>
              {podcasts.map((podcast) => (
                <ListItem
                  key={podcast.id}
                  button
                  onClick={() => handlePodcastClick(podcast)}
                  sx={{ borderBottom: '1px solid #ccc', padding: '10px 20px' }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                        {podcast.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {new Date(podcast.timestamp.seconds * 1000).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={8}>
            {script.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ResultCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '20px'  , textAlign : 'center'}}>
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
          </Grid>
        </Grid>
      )}
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
        {!loading && script.length > 0 && tabIndex === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '20px', alignSelf : 'center', textAlign : 'center' }}>
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
    </Container>
  );

};

export default GeneratePodcast;
