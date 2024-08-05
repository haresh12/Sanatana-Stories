import React, { useState } from 'react';
import { Typography, Box, TextField, CardContent, CardActions, Grid, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';
import BackButton from '../../components/BackButton';
import { StyledContainer, StyledCard, ProgressButton } from './styles';
import { validateYouTubeUrl, fetchSummary } from './utils';
import { Video } from './types';
import { STRINGS } from '../../const/strings';

const cardAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const inputAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SummarizeSatsang: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSummarize = async () => {
    if (!videoUrl.trim()) {
      setError(STRINGS.enterYoutubeUrl);
      return;
    }

    if (!validateYouTubeUrl(videoUrl)) {
      setError(STRINGS.validYoutubeUrl);
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');

    const response = await fetchSummary(videoUrl);
    if (response) {
      setSummary(response.summary);
    } else {
      setError(STRINGS.summarizeSatsangError);
    }
    setLoading(false);
  };

  const spiritualVideos: Video[] = [
    { url: 'https://www.youtube.com/watch?v=MpbOnKYxjWg', title: 'Spiritual Video 1' },
    { url: 'https://www.youtube.com/watch?v=Y8O5GdWVjqA', title: 'Spiritual Video 2' },
  ];

  const nonSpiritualVideos: Video[] = [
    { url: 'https://www.youtube.com/watch?v=_cZa_7KaQ3c', title: 'Non-Spiritual Video 1' },
    { url: 'https://www.youtube.com/watch?v=lSq3h-_PTVY&t=346s', title: 'Non-Spiritual Video 2' },
  ];

  return (
    <StyledContainer>
      <style>
        {`
          .dots::after {
            content: '.';
            animation: dots 1s steps(5, end) infinite;
          }

          @keyframes dots {
            0%, 20% {
              color: rgba(0, 0, 0, 0);
              text-shadow:
                .25em 0 0 rgba(0, 0, 0, 0),
                .5em 0 0 rgba(0, 0, 0, 0);
            }
            40% {
              color: white;
              text-shadow:
                .25em 0 0 rgba(0, 0, 0, 0),
                .5em 0 0 rgba(0, 0, 0, 0);
            }
            60% {
              text-shadow:
                .25em 0 0 white,
                .5em 0 0 rgba(0, 0, 0, 0);
            }
            80%, 100% {
              text-shadow:
                .25em 0 0 white,
                .5em 0 0 white;
            }
          }
        `}
      </style>
      <BackButton />
      <motion.div initial="hidden" animate="visible" variants={cardAnimation}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#ff5722', mt: isMobile ? -5 : -3 }}
        >
          {STRINGS.summarizeSatsang}
        </Typography>
      </motion.div>
      <Box sx={{ mt: 4, width: '100%' }}>
        <motion.div initial="hidden" animate="visible" variants={inputAnimation} style={{ width: '100%' }}>
          <StyledCard>
            <CardContent sx={{ textAlign: isMobile ? 'center' : 'left' }}>
              <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', color: '#ff5722', mb: 3 }}>
                {STRINGS.enterYoutubeVideoUrl}
              </Typography>
              <TextField
                label={STRINGS.youtubeVideoUrl}
                variant="outlined"
                fullWidth
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                sx={{
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '30px',
                    fontSize: isMobile ? '16px' : '18px',
                  },
                }}
                aria-label={STRINGS.youtubeVideoUrl}
                aria-required="true"
              />
              <CardActions sx={{ justifyContent: 'center', padding: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ProgressButton
                      onClick={handleSummarize}
                      disabled={loading}
                      isLoading={loading}
                      aria-busy={loading}
                      aria-live="polite"
                    >
                      {loading ? <span>{STRINGS.summarizing}<span className="dots"></span></span> : STRINGS.summarize}
                    </ProgressButton>
                  </motion.div>
                </Box>
              </CardActions>
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }} role="alert">
                  {error}
                </Typography>
              )}
              {summary && (
                <Box sx={{ mt: 4, textAlign: isMobile ? 'center' : 'left' }}>
                  <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1 } } }}>
                    <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', color: '#ff5722', mb: 2 }}>
                      {STRINGS.summary}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: isMobile ? '14px' : '16px', textAlign: 'justify' }}>
                      {summary.split('\n').map((paragraph, index) => (
                        <Box key={index} sx={{ marginBottom: '10px' }}>
                          {paragraph}
                        </Box>
                      ))}
                    </Typography>
                  </motion.div>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </motion.div>
        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <motion.div initial="hidden" animate="visible" variants={cardAnimation}>
              <StyledCard sx={{ backgroundColor: '#e8f5e9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#388e3c', mb: 2 }}>
                    Spiritual Videos
                  </Typography>
                  <List>
                    {spiritualVideos.map((video, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemButton onClick={() => setVideoUrl(video.url)}>
                          <ListItemText primary={video.title} secondary={video.url} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div initial="hidden" animate="visible" variants={cardAnimation}>
              <StyledCard sx={{ backgroundColor: '#ffebee' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 2 }}>
                    Non-Spiritual Videos
                  </Typography>
                  <List>
                    {nonSpiritualVideos.map((video, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemButton onClick={() => setVideoUrl(video.url)}>
                          <ListItemText primary={video.title} secondary={video.url} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </StyledContainer>
  );
};

export default SummarizeSatsang;
