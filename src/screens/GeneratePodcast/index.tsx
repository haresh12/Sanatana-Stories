import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, Box, Grid, List, ListItem, ListItemText, CircularProgress, Button, CardContent, CardActions, useMediaQuery, MenuItem, FormControl, Select, OutlinedInput } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import BackButton from '../../components/BackButton';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { StyledTab, StyledTabs, GenerateButton, ResultCard, LoadingContainer, LoaderMessage } from './styles';
import { PodcastSegment, Podcast } from './types';
import { handleGeneratePodcast, handleListenToPodcast, handleStopPodcast } from './utils';
import { STRINGS } from '../../const/strings';
import { FACTS } from '../../const/consts';

const topics = [
  'Hindu Puranas', 'Ramayan', 'Mahabharat', 'Hindu culture', 'Vedas',
  'Upanishads', 'Yoga philosophy', 'Ayurveda', 'Bhagavad Gita',
  'Indian Festivals', 'Hindu Mythology', 'Deities and Worship',
  'Karma and Dharma', 'Spiritual Practices', 'Temples of India',
  'Hindu Rituals', 'Meditation and Mindfulness', 'Bhakti Movement',
  'Ancient Indian Sciences', 'Philosophy of Hinduism'
];

const GeneratePodcast: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<PodcastSegment[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [title, setTitle] = useState<string>('');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (!currentUser) return;

    const podcastsRef = collection(db, 'users', currentUser.uid, 'podcasts');
    const unsubscribe = onSnapshot(podcastsRef, (querySnapshot) => {
      const fetchedPodcasts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Podcast[];
      setPodcasts(fetchedPodcasts);

      // Select the first podcast by default if available
      if (fetchedPodcasts.length > 0) {
        setScript(fetchedPodcasts[0].script);
        setAudioUrl(fetchedPodcasts[0].audioUrl);
        setTitle(fetchedPodcasts[0].title);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loading) {
      interval = setInterval(() => {
        setFactIndex((prevIndex: number) => (prevIndex + 1) % FACTS.length);
      }, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading]);

  useEffect(() => {
    return () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, []);

  const handleGenerate = async () => {
    await handleGeneratePodcast(currentUser, setLoading, setScript, setAudioUrl, setTitle, selectedTopic);
  };

  const handleListen = () => {
    handleListenToPodcast(audioUrl, audioRef, setIsPlaying);
  };

  const handleStop = () => {
    handleStopPodcast(audioRef, setIsPlaying);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handlePodcastClick = (podcast: Podcast) => {
    // Stop the current podcast if playing
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    setScript(podcast.script);
    setAudioUrl(podcast.audioUrl);
    setTitle(podcast.title);
  };

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={{
        paddingTop: isMobile ? '10px' : '20px',
        paddingBottom: isMobile ? '5px' : '10px',
        height: '100vh',
        alignItems: 'center',
        backgroundImage: 'url(/path-to-your-background-image.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <BackButton />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: isMobile ? 5 : 0 }}>
        <StyledTabs value={tabIndex} onChange={handleTabChange} centered aria-label={STRINGS.podcastTabs}>
          <StyledTab label={STRINGS.generatePodcastTab} id="tab-0" aria-controls="tabpanel-0" />
          <StyledTab label={STRINGS.previousPodcastsTab} id="tab-1" aria-controls="tabpanel-1" />
        </StyledTabs>
      </Box>
      {tabIndex === 0 && (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ gap: '20px', padding: isMobile ? '10px' : '20px' }}>
          <FormControl variant="outlined" sx={{ minWidth: 200, maxWidth: 300, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none', position: 'relative' }}>
            <Box
              sx={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '24px',
                padding: '2px',
                background: 'linear-gradient(90deg, rgba(255, 85, 0, 1) 0%, rgba(255, 212, 0, 1) 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'destination-out',
                maskComposite: 'exclude',
                animation: 'borderAnimation 3s infinite',
                '@keyframes borderAnimation': {
                  '0%': {
                    transform: 'translateX(0%)',
                  },
                  '100%': {
                    transform: 'translateX(100%)',
                  },
                },
              }}
            />
            <Select
              labelId="select-topic-label"
              id="select-topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as string)}
              input={<OutlinedInput />}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '24px', '& .MuiOutlinedInput-input': { padding: '10px 24px' }, '& fieldset': { border: 'none' } }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    mt: 1,
                  },
                },
              }}
            >
              {topics.map((topic, index) => (
                <MenuItem key={index} value={topic}>
                  {topic}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <GenerateButton
              variant="contained"
              onClick={handleGenerate}
              sx={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '8px 20px' : '10px 30px', width: isMobile ? '100%' : 'auto', borderRadius: '24px' }}
            >
              {STRINGS.generatePodcast}
            </GenerateButton>
          </motion.div>
        </Box>
      )}
      {tabIndex === 1 && (
        <Grid container spacing={2} sx={{ marginTop: isMobile ? '10px' : '20px' }} role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1">
          <Grid item xs={12} md={4}>
            <List sx={{ backgroundColor: '#ffe0b2', borderRadius: '20px', padding: isMobile ? '5px' : '10px', maxHeight: '70vh', overflow: 'auto' }} aria-label={STRINGS.podcastListAriaLabel}>
              {podcasts.map((podcast) => (
                <ListItem
                  key={podcast.id}
                  button
                  onClick={() => handlePodcastClick(podcast)}
                  sx={{ borderBottom: '1px solid #ccc', padding: isMobile ? '5px 10px' : '10px 20px' }}
                  aria-label={`${STRINGS.podcast} ${podcast.title}`}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                        {podcast.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {new Date(podcast.timestamp.seconds * 1000).toLocaleDateString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={8}>
            {script.length > 0 && (
              <ResultCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
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
                          borderRadius: '24px',
                          padding: isMobile ? '8px 20px' : '10px 30px',
                          fontSize: isMobile ? '14px' : '16px',
                          '&:hover': {
                            backgroundColor: '#66bb6a',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                        aria-label={STRINGS.stopPodcast}
                      >
                        {STRINGS.stopPodcast}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleListen}
                        sx={{
                          backgroundColor: '#81c784',
                          borderRadius: '24px',
                          padding: isMobile ? '8px 20px' : '10px 30px',
                          fontSize: isMobile ? '14px' : '16px',
                          '&:hover': {
                            backgroundColor: '#66bb6a',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                        aria-label={STRINGS.listenToPodcast}
                      >
                        {STRINGS.listenToPodcast}
                      </Button>
                    )}
                  </CardActions>
                )}
              </ResultCard>
            )}
          </Grid>
        </Grid>
      )}
      <AnimatePresence>
        {loading && (
          <LoadingContainer>
            <CircularProgress color="primary" aria-label={STRINGS.loading} />
            <LoaderMessage>{FACTS[factIndex]}</LoaderMessage>
          </LoadingContainer>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!loading && script.length > 0 && tabIndex === 0 && (
          <ResultCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
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
                      borderRadius: '24px',
                      padding: isMobile ? '8px 20px' : '10px 30px',
                      fontSize: isMobile ? '14px' : '16px',
                      '&:hover': {
                        backgroundColor: '#66bb6a',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    aria-label={STRINGS.stopPodcast}
                  >
                    {STRINGS.stopPodcast}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleListen}
                    sx={{
                      backgroundColor: '#81c784',
                      borderRadius: '24px',
                      padding: isMobile ? '8px 20px' : '10px 30px',
                      fontSize: isMobile ? '14px' : '16px',
                      '&:hover': {
                        backgroundColor: '#66bb6a',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    aria-label={STRINGS.listenToPodcast}
                  >
                    {STRINGS.listenToPodcast}
                  </Button>
                )}
              </CardActions>
            )}
          </ResultCard>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default GeneratePodcast;
