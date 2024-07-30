import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Container } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { motion } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface ChatProps {
  templeId: string;
  templeName: string;
  initialMessages: { role: string; text: string; audioUrl?: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: string; text: string; audioUrl?: string }[]>>;
}

interface ChatResponse {
  message: string;
  audioUrl: string;
}

const Chat: React.FC<ChatProps> = ({ templeId, templeName, initialMessages, setMessages }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (initialMessages.length === 0) {
      const fetchWelcomeMessage = async () => {
        setLoading(true);
        const handleTempleChat = httpsCallable<{ userId: string; templeName: string; message: string }, ChatResponse>(functions, 'templeChat');
        try {
          const response = await handleTempleChat({ userId: `${currentUser?.uid}`, templeName, message: '' });
          setMessages([{ role: 'model', text: response.data.message, audioUrl: response.data.audioUrl }]);
        } catch (error) {
          console.error('Error fetching welcome message:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWelcomeMessage();
    }
  }, [templeName, currentUser, initialMessages.length, setMessages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newMessages = [...initialMessages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const handleTempleChat = httpsCallable<{ userId: string; templeName: string; message: string }, ChatResponse>(functions, 'templeChat');
    try {
      const response = await handleTempleChat({ userId: `${currentUser?.uid}`, templeName, message: input });
      setMessages((prevMessages) => [...prevMessages, { role: 'model', text: response.data.message, audioUrl: response.data.audioUrl }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [initialMessages, loading]);

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
      alert("Your browser does not support speech recognition.");
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

  return (
    <Container component="main" maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: '#ff5722', 
            mt : isMobile ? -3 : 0,
            fontSize: isMobile ? '1.2rem' : '2rem' 
          }} 
          aria-label={`Chat about ${templeName}`}
        >
          Chat about {templeName}
        </Typography>
      </motion.div>
      <Box sx={{ 
        padding: isMobile ? 1 : 2, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        mt: isMobile ? 1 : -3, 
        height: '85vh', 
        borderRadius: '20px', 
        boxShadow: 4, 
        backgroundColor: '#ffffff' 
      }}>
        <Box 
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: isMobile ? 1 : 2, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isMobile ? 1 : 2, 
            scrollbarWidth: 'none', 
            '&::-webkit-scrollbar': { display: 'none' } 
          }}
        >
          {initialMessages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
              <Box sx={{ maxWidth: '75%', bgcolor: msg.role === 'user' ? '#ff5722' : '#4caf50', color: '#fff', p: isMobile ? 1 : 2, borderRadius: '20px', wordWrap: 'break-word' }} aria-live="polite">
                {msg.text}
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
                  }}
                  aria-label={playingIndex === index ? "Pause audio" : "Play audio"}
                >
                  {playingIndex === index ? <PauseIcon sx={{ fontSize: isMobile ? '16px' : '20px' }} /> : <PlayArrowIcon sx={{ fontSize: isMobile ? '16px' : '20px' }} />}
                </IconButton>
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Box sx={{ maxWidth: '75%', bgcolor: '#4caf50', color: '#000', p: isMobile ? 1 : 2, borderRadius: '20px', wordWrap: 'break-word' }} aria-live="polite">
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{
              mr: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff5722',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff5722',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff5722',
              },
            }}
            placeholder="Type your message..."
            aria-label="Message input"
          />
          <IconButton onClick={handleSendMessage} disabled={loading} sx={{ borderRadius: '50%', padding: isMobile ? '5px' : '10px', backgroundColor: '#ff5722', color: '#fff', ml: 1 }} aria-label="Send message">
            <SendIcon sx={{ fontSize: isMobile ? '20px' : '24px' }} />
          </IconButton>
          <IconButton onClick={handleSpeechInput} sx={{ borderRadius: '50%', padding: isMobile ? '5px' : '10px', backgroundColor: listening ? '#ff5722' : '#e0e0e0', color: '#fff', ml: 1, animation: listening ? 'pulse 1s infinite' : 'none' }} aria-label="Start voice input">
            <MicIcon sx={{ fontSize: isMobile ? '20px' : '24px' }} />
          </IconButton>
        </Box>
      </Box>
      <style>
        {`
          @keyframes dotElastic {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.5);
            }
            100% {
              transform: scale(1);
            }
          }
          .dot-elastic {
            width: 8px;
            height: 8px;
            background-color: #fff;
            border-radius: 50%;
            animation: dotElastic 0.6s infinite;
          }
          .dot-elastic:nth-of-type(1) {
            animation-delay: 0s;
          }
          .dot-elastic:nth-of-type(2) {
            animation-delay: 0.1s;
          }
          .dot-elastic:nth-of-type(3) {
            animation-delay: 0.2s;
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </Container>
  );
};

export default Chat;
