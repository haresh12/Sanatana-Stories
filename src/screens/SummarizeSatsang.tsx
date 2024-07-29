import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Card, CardContent, CardActions } from '@mui/material';
import { motion } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { useTheme, styled } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';
import BackButton from '../components/BackButton';

const cardAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const inputAnimation = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  borderRadius: '15px',
  padding: theme.spacing(4),
  maxWidth: '800px',
  margin: '0 auto',
}));

const SummarizeSatsang: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateYouTubeUrl = (url: string) => {
    const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  const handleSummarize = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube video URL.');
      return;
    }

    if (!validateYouTubeUrl(videoUrl)) {
      setError('Please enter a valid YouTube video URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');

    try {
      const summarizeSatsang = httpsCallable<{ videoUrl: string }, { summary: string }>(functions, 'summarizeSatsang');
      const response = await summarizeSatsang({ videoUrl });
      setSummary(response.data.summary);
    } catch (error: any) {
      console.error('Error summarizing Satsang:', error);
      setError('Failed to summarize the Satsang video. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

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
              color: black;
              text-shadow:
                .25em 0 0 rgba(0, 0, 0, 0),
                .5em 0 0 rgba(0, 0, 0, 0);
            }
            60% {
              text-shadow:
                .25em 0 0 black,
                .5em 0 0 rgba(0, 0, 0, 0);
            }
            80%, 100% {
              text-shadow:
                .25em 0 0 black,
                .5em 0 0 black;
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
          Summarize Satsang
        </Typography>
      </motion.div>
      <Box sx={{ mt: 4, width: '100%' }}>
        <motion.div initial="hidden" animate="visible" variants={inputAnimation} style={{ width: '100%' }}>
          <StyledCard>
            <CardContent sx={{ textAlign: isMobile ? 'center' : 'left' }}>
              <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', color: '#ff5722', mb: 3 }}>
                Enter YouTube Video URL
              </Typography>
              <TextField
                label="YouTube Video URL"
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
                aria-label="YouTube Video URL"
                aria-required="true"
              />
              <CardActions sx={{ justifyContent: 'center', padding: 0 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSummarize}
                  disabled={loading}
                  sx={{
                    backgroundColor: loading ? '#4caf50' : '#ff7043',
                    borderRadius: '30px',
                    padding: isMobile ? '12px 30px' : '16px 40px',
                    fontSize: isMobile ? '16px' : '18px',
                    '&:hover': {
                      backgroundColor: loading ? '#388e3c' : '#ff5722',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  aria-busy={loading}
                  aria-live="polite"
                >
                  {loading ? <span>Summarizing<span className="dots"></span></span> : 'Summarize'}
                </Button>
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
                      Summary
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
      </Box>
    </StyledContainer>
  );
};

export default SummarizeSatsang;
