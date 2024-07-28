import React, { useEffect, useState, useRef } from 'react';
import { TextField, Container, Typography, Box, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { motion } from 'framer-motion';
import { setEpicsMessages, addEpicsMessage } from '../store/epicsChatSlice';

const ChatComponent: React.FC<{ chatType: string }> = ({ chatType }) => {
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

  useEffect(() => {
    if (currentUser && messages?.length === 0) {
      setTyping(true);
      const handleChat = httpsCallable(functions, `${chatType}Chat`);
      handleChat({ userId: currentUser.uid, message: '' }).then(response => {
        const responseData = response.data as { message: string, audioUrl: string };
        dispatch(setEpicsMessages({ chatType, messages: [{ role: 'model', message: responseData.message, audioUrl: responseData.audioUrl }] }));
        setTyping(false);
      });
    }
  }, [currentUser, messages?.length, dispatch, chatType]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    setLoading(true);
    setTyping(true);

    const newMessage = { role: 'user', message: input };
    dispatch(addEpicsMessage({ chatType, message: newMessage }));
    setInput('');

    try {
      const handleChat = httpsCallable(functions, `${chatType}Chat`);
      const response = await handleChat({ userId: currentUser!.uid, message: input });
      const responseData = response.data as { message: string, audioUrl: string };
      const chatResponse = { role: 'model', message: responseData.message, audioUrl: responseData.audioUrl };
      dispatch(addEpicsMessage({ chatType, message: chatResponse }));
    } catch (error) {
      console.error('Error sending message:', error);
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
    <Container component="main" sx={{ display: 'flex', flexDirection: 'column', height: '90vh', justifyContent: 'center' }}>
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '90vh', borderRadius: '20px', boxShadow: 4, backgroundColor: '#ffffff' }}>
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
            Chat about {chatType.charAt(0).toUpperCase() + chatType.slice(1)}
          </Typography>
        </motion.div>
        <Box sx={{ flex: 1, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {messages?.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
              <Box sx={{ maxWidth: '75%', bgcolor: msg.role === 'user' ? '#ff5722' : '#4caf50', color: '#fff', p: 2, borderRadius: '20px', wordWrap: 'break-word' }}>
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
                    p: 1,
                    '&:hover': { backgroundColor: '#388e3c' },
                  }}
                  aria-label={playingIndex === index ? "Pause audio" : "Play audio"}
                >
                  {playingIndex === index ? <PauseIcon sx={{ fontSize: '20px' }} /> : <PlayArrowIcon sx={{ fontSize: '20px' }} />}
                </IconButton>
              )}
            </Box>
          ))}
          {typing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Box sx={{ maxWidth: '75%', bgcolor: '#4caf50', color: '#000', p: 2, borderRadius: '20px', wordWrap: 'break-word' }}>
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
          <IconButton onClick={handleSendMessage} disabled={loading} sx={{ borderRadius: '50%', padding: '10px', backgroundColor: '#ff5722', color: '#fff', ml: 1 }} aria-label="Send message">
            <SendIcon />
          </IconButton>
          <IconButton onClick={handleSpeechInput} sx={{ borderRadius: '50%', padding: '10px', backgroundColor: listening ? '#ff5722' : '#e0e0e0', color: '#fff', ml: 1, animation: listening ? 'pulse 1s infinite' : 'none' }} aria-label="Start voice input">
            <MicIcon />
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
