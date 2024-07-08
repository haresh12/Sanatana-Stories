import React, { useState, useCallback, useRef } from 'react';
import { Container, Typography, Button, Card, CardContent, Box, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../firebaseConfig';
import { motion } from 'framer-motion';
import { saveUserAnalysis } from '../store/userSlice';

interface AnalysisResponse {
  analysisText: string;
}

const StartChantingAndAnalysis: React.FC = () => {
  const dispatch = useDispatch();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcriptText = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setTranscript(transcriptText);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setOpenSnackbar(true);
    };

    recognition.onend = () => {
      setListening(false);
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
    startListening();
  };

  const handleChantingStop = async () => {
    stopListening();
    setLoading(true);
    try {
      const analyzeChanting = httpsCallable<{ transcript: string }, AnalysisResponse>(functions, 'analyzeChanting');
      const response = await analyzeChanting({ transcript });
      const analysisResult = response.data.analysisText;
      const currentTimestamp = new Date().toISOString();

      setAnalysis(analysisResult);
      setTimestamp(currentTimestamp);

      const db = getFirestore();
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'chantingAnalysis', currentTimestamp), {
          transcript,
          timestamp: currentTimestamp,
          analysis: analysisResult,
        }, { merge: true });
        dispatch(saveUserAnalysis({ analysis: analysisResult, transcript, timestamp: currentTimestamp }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to save analysis:', error);
      setError('Failed to save analysis. Please try again.');
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
        <Card sx={{ marginBottom: '20px', backgroundColor: '#e0f7fa', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom sx={{ color: '#00796b' }}>
              Start chanting the Hanuman Chalisa, and we'll analyze your performance. Click the button below to begin.
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
              color="primary"
              sx={{
                backgroundColor: '#ff5722',
                '&:hover': { backgroundColor: '#e64a19' },
                borderRadius: '25px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
              }}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Start Chanting'}
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button
              onClick={handleChantingStop}
              variant="contained"
              color="secondary"
              sx={{
                backgroundColor: '#f44336',
                '&:hover': { backgroundColor: '#d32f2f' },
                borderRadius: '25px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
              }}
            >
              Stop Chanting
            </Button>
          </motion.div>
        )}
      </Box>
      {transcript && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card sx={{ backgroundColor: '#fff3e0', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            <CardContent>
              <Typography variant="body1" sx={{ color: '#000', fontSize: '18px', lineHeight: 1.6 }}>
                {transcript}
              </Typography>
              {timestamp && (
                <Typography variant="body2" sx={{ color: '#555', fontSize: '14px', marginTop: '10px' }}>
                  Timestamp: {new Date(timestamp).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
      {analysis && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card sx={{ backgroundColor: '#e0f2f1', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', marginTop: '20px' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#00796b', marginBottom: '10px' }}>
                Analysis:
              </Typography>
              <Box
                sx={{
                  fontSize: '16px',
                  lineHeight: 1.5,
                  '& ul': {
                    listStyleType: 'disc',
                    paddingInlineStart: '20px',
                  },
                  '& li': {
                    marginBottom: '10px',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: analysis }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StartChantingAndAnalysis;
