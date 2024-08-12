import React, { useState, useCallback, useRef } from 'react';
import { Container, Typography, Button, Card, CardContent, Box, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { fetchAnalysis } from './utils';
import { cardStyle, buttonStyle, cardContentStyle, analysisBoxStyle } from './styles';
import { STRINGS } from '../../const/strings';

const StartChantingAndAnalysis: React.FC = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  const isSpeechRecognitionSupported = () => {
    return !!((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
  };

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setError(STRINGS.speechRecognitionNotSupported);
      setOpenSnackbar(true);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let previousTranscript = '';

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Avoid duplicate entries by checking if the final transcript has changed
      if (finalTranscript !== previousTranscript) {
        accumulatedTranscriptRef.current += finalTranscript;
        previousTranscript = finalTranscript;
      }

      setTranscript(accumulatedTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setOpenSnackbar(true);
    };

    recognition.onend = () => {
      setListening(false);
      setTranscript(accumulatedTranscriptRef.current);
    };

    recognition.start();
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  const handleChantingStart = () => {
    if (!isSpeechRecognitionSupported()) {
      setError(`${STRINGS.speechRecognitionNotSupported} ${STRINGS.tryDesktopVersion}`);
      setOpenSnackbar(true);
      return;
    }

    setTranscript('');
    setAnalysis(null);
    setScore(null);
    setTimestamp(null);
    accumulatedTranscriptRef.current = '';
    startListening();
  };

  const handleChantingStop = async () => {
    stopListening();
    setLoading(true);
    try {
      const response = await fetchAnalysis(accumulatedTranscriptRef.current);
      const analysisResult = response.analysisText;
      const analysisScore = response.score;
      const currentTimestamp = new Date().toISOString();

      setAnalysis(analysisResult);
      setScore(analysisScore);
      setTimestamp(currentTimestamp);

      setLoading(false);
    } catch (error) {
      console.error('Failed to analyze chanting:', error);
      setError(STRINGS.errorAnalyzingChanting);
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom sx={cardContentStyle}>
              {STRINGS.startChanting}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
      <Box textAlign="center" sx={{ marginBottom: '20px' }}>
        {!listening ? (
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button
              onClick={handleChantingStart}
              variant="contained"
              sx={{ ...buttonStyle, backgroundColor: '#ff5722', '&:hover': { backgroundColor: '#e64a19' } }}
              disabled={loading}
              aria-label={STRINGS.startChantingButton}
            >
              {loading ? STRINGS.analyzing : STRINGS.startChantingButton}
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button
              onClick={handleChantingStop}
              variant="contained"
              sx={{ ...buttonStyle, backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' } }}
              aria-label={STRINGS.stopChantingButton}
            >
              {STRINGS.stopChantingButton}
            </Button>
          </motion.div>
        )}
      </Box>
      {transcript && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card sx={{ ...cardStyle, backgroundColor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="body1" sx={{ color: '#000', fontSize: '18px', lineHeight: 1.6 }}>
                {transcript}
              </Typography>
              {timestamp && (
                <Typography variant="body2" sx={{ color: '#555', fontSize: '14px', marginTop: '10px' }}>
                  {STRINGS.timestamp}: {new Date(timestamp).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
      {analysis && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card sx={{ ...cardStyle, backgroundColor: '#e0f2f1', marginTop: '20px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#00796b', marginBottom: '10px' }}>
                {STRINGS.analysis}
              </Typography>
              <Box sx={analysisBoxStyle} dangerouslySetInnerHTML={{ __html: analysis }} aria-label="Analysis result" />
              {score !== null && (
                <Typography variant="h6" sx={{ color: '#00796b', marginTop: '10px' }}>
                  {STRINGS.score}: {score}/10
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" aria-label={STRINGS.errorNotification}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StartChantingAndAnalysis;
