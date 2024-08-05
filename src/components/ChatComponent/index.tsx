import React, { useEffect, useState, useRef } from 'react';
import { TextField, Container, Typography, Box, IconButton, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';
import { containerStyles, messageBoxStyles, inputStyles, iconButtonStyles } from './styles';
import { ChatProps, Message } from './types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import { addEpicsMessage } from '../../store/epicsChatSlice';
import { STRINGS } from '../../const/strings';

const ChatComponent: React.FC<ChatProps> = ({ chatType }) => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.epicsChat.epicsMessages[chatType]);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    setLoading(true);
    setTyping(true);

    const newMessage: Message = { role: 'user', message: input };
    dispatch(addEpicsMessage({ chatType, message: newMessage }));
    setInput('');

    try {
      const handleChat = httpsCallable(functions, `${chatType}Chat`);
      const response = await handleChat({ userId: currentUser!.uid, message: input });
      const responseData = response.data as { message: string, audioUrl: string };
      const chatResponse: Message = { role: 'model', message: responseData.message, audioUrl: responseData.audioUrl };
      dispatch(addEpicsMessage({ chatType, message: chatResponse }));
    } catch (error) {
      console.error(STRINGS.errorSendingMessage, error);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };

      recognitionRef.current.onstart = () => {
        setListening(true);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    } else {
      alert(STRINGS.browserNotSupported);
    }
  }, []);

  const handleSpeechInput = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
    }
  };

  const playAudio = (index: number, audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (playingIndex === index) {
      setPlayingIndex(null);
    } else {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      audioRef.current.onended = () => {
        setPlayingIndex(null);
      };
      setPlayingIndex(index);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  if (messages.length === 0) {
    return (
      <Container
        component="main"
        maxWidth="lg"
        style={{
          paddingTop: '40px',
          paddingBottom: '40px',
          position: 'relative',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress aria-label={STRINGS.loading} />
      </Container>
    );
  }

  return (
    <Container component="main" sx={containerStyles(isMobile)}>
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: isMobile ? '85vh' : '90vh', borderRadius: '20px', boxShadow: 4, backgroundColor: '#ffffff' }}>
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: isMobile ? 1 : 2 }}>
            {STRINGS.chatAbout} {chatType.charAt(0).toUpperCase() + chatType.slice(1)}
          </Typography>
        </motion.div>
        <Box sx={{ flex: 1, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {messages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
              <Box sx={messageBoxStyles(msg.role === 'user', isMobile)} aria-live="polite">
                {msg.message}
              </Box>
              {msg.role === 'model' && msg.audioUrl && (
                <IconButton
                  onClick={() => playAudio(index, `${msg.audioUrl}`)}
                  sx={{
                    ml: 1,
                    borderRadius: '50%',
                    backgroundColor: playingIndex === index ? '#388e3c' : '#4caf50',
                    color: '#fff',
                    p: isMobile ? 0.5 : 1,
                    '&:hover': { backgroundColor: '#388e3c' },
                    fontSize: isMobile ? '1rem' : '1.25rem',
                  }}
                  aria-label={playingIndex === index ? STRINGS.pauseAudio : STRINGS.playAudio}
                >
                  {playingIndex === index ? <PauseIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} /> : <PlayArrowIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />}
                </IconButton>
              )}
            </Box>
          ))}
          {typing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Box sx={{ ...messageBoxStyles(false, isMobile), color: '#000' }} aria-live="polite">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '40px', height: '11px' }}>
                  <Box className="dot-elastic"></Box>
                  <Box className="dot-elastic"></Box>
                  <Box className="dot-elastic"></Box>
                </Box>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Box sx={{ display: 'flex', mt: 1 }}>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={inputStyles(isMobile)}
            placeholder={STRINGS.typeYourMessage}
            aria-label="Message input"
          />
          <IconButton onClick={handleSendMessage} disabled={loading} sx={iconButtonStyles(isMobile)} aria-label="Send message">
            <SendIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
          </IconButton>
          <IconButton onClick={handleSpeechInput} sx={{ ...iconButtonStyles(isMobile), backgroundColor: listening ? '#ff5722' : '#e0e0e0', animation: listening ? 'pulse 1s infinite' : 'none' }} aria-label="Start voice input">
            <MicIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
          </IconButton>
        </Box>
      </Box>
      <style>
        {`
          @keyframes dotElastic {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
          }
          .dot-elastic {
            width: 8px;
            height: 8px;
            background-color: #fff;
            border-radius: 50%;
            animation: dotElastic 0.6s infinite;
          }
          .dot-elastic:nth-of-type(1) { animation-delay: 0s; }
          .dot-elastic:nth-of-type(2) { animation-delay: 0.1s; }
          .dot-elastic:nth-of-type(3) { animation-delay: 0.2s; }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Container>
  );
};

export default ChatComponent;
