import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Container } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import { motion } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

interface ChatProps {
  templeId: string;
  templeName: string;
}

interface ChatResponse {
  message: string;
}

const Chat: React.FC<ChatProps> = ({ templeId, templeName }) => {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      if (!userId) return;

      setLoading(true);
      const handleTempleChat = httpsCallable<{ userId: string; templeName: string; message: string }, ChatResponse>(functions, 'templeChat');
      try {
        const response = await handleTempleChat({ userId, templeName, message: '' });
        setMessages([{ role: 'model', text: response.data.message }]);
      } catch (error) {
        console.error('Error fetching welcome message:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWelcomeMessage();
  }, [templeName, userId]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || !userId) return;

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const handleTempleChat = httpsCallable<{ userId: string; templeName: string; message: string }, ChatResponse>(functions, 'templeChat');
    try {
      const response = await handleTempleChat({ userId, templeName, message: input });
      setMessages((prevMessages) => [...prevMessages, { role: 'model', text: response.data.message }]);
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

  return (
    <Container component="main" maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center'}}>
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '98vh', borderRadius: '20px', boxShadow: 4, backgroundColor: '#ffffff' }}>
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
            Chat about {templeName}
          </Typography>
        </motion.div>
        <Box sx={{ flex: 1, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {messages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
              <Box sx={{ maxWidth: '75%', bgcolor: msg.role === 'user' ? '#ff5722' : '#4caf50', color: '#fff', p: 2, borderRadius: '20px', wordWrap: 'break-word' }}>
                {msg.text}
              </Box>
            </Box>
          ))}
          {loading && (
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
          />
          <IconButton onClick={handleSendMessage} disabled={loading} sx={{ borderRadius: '50%', padding: '10px', backgroundColor: '#ff5722', color: '#fff', ml: 1 }}>
            <SendIcon />
          </IconButton>
          <IconButton onClick={handleSpeechInput} sx={{ borderRadius: '50%', padding: '10px', backgroundColor: listening ? '#ff5722' : '#e0e0e0', color: '#fff', ml: 1, animation: listening ? 'pulse 1s infinite' : 'none' }}>
            <MicIcon />
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
