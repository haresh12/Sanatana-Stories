import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, Box, Grid, List, ListItem, ListItemText, CircularProgress, Button, CardContent, CardActions, Tabs, Tab, useMediaQuery } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
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

  const handleGenerate = async () => {
    await handleGeneratePodcast(currentUser, setLoading, setScript, setAudioUrl, setTitle);
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
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom sx={{ color: '#ff5722', fontWeight: 'bold' }}>
            {STRINGS.generatePodcast}
          </Typography>
          <GenerateButton
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            sx={{ fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '8px 20px' : '10px 30px' }}
          >
            {STRINGS.generatePodcast}
          </GenerateButton>
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
                          borderRadius: '30px',
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
                          borderRadius: '30px',
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
                      borderRadius: '30px',
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
                      borderRadius: '30px',
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
