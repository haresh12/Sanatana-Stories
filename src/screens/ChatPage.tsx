import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebaseConfig';
import { God } from '../types/God';
import { motion } from 'framer-motion';
import { setGodName, setMessages, addMessage } from '../store/chatSlice';
import BackButton from '../components/BackButton';

interface Message {
  role: string;
  message: string;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const ChatPage: React.FC = () => {
  const { godId } = useParams<{ godId: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const godName = useSelector((state: RootState) => state.chat.godName);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const fetchGodName = async () => {
      const godsCollection = collection(db, 'gods');
      const godsSnapshot = await getDocs(godsCollection);
      const godsList = godsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as God[];
      const god = godsList.find(g => g.id === godId);
      if (god) {
        dispatch(setGodName(god.name));
      }
    };
    fetchGodName();
  }, [godId, dispatch]);

  useEffect(() => {
    const initializeChat = async () => {
      if (currentUser && godName && messages.length === 0) {
        const handleChat = httpsCallable(functions, 'handleChat');
        const response = await handleChat({ userId: currentUser.uid, godName, message: '' });
        const responseData = response.data as { message: string, welcomeMessage: string };
        dispatch(setMessages([{ role: 'model', message: responseData.welcomeMessage }]));
      }
    };
    initializeChat();
  }, [godName, messages.length, currentUser, dispatch]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    setLoading(true);
    setTyping(true);

    const newMessage: Message = { role: 'user', message: input };
    dispatch(addMessage(newMessage));
    setInput('');

    const handleChat = httpsCallable(functions, 'handleChat');
    const response = await handleChat({ userId: currentUser!.uid, godName, message: input });
    const responseData = response.data as { message: string };
    const godResponse: Message = { role: 'model', message: responseData.message };
    dispatch(addMessage(godResponse));
    setLoading(false);
    setTyping(false);
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

  return (
    <Container component="main" maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
      <BackButton /> {/* Add BackButton here */}
      <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '98vh', borderRadius: '20px', boxShadow: 4, backgroundColor: '#ffffff' }}>
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
            Chat with {godName}
          </Typography>
        </motion.div>
        <Box sx={{ flex: 1, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {messages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
              <Box sx={{ maxWidth: '75%', bgcolor: msg.role === 'user' ? '#ff5722' : '#4caf50', color: '#fff', p: 2, borderRadius: '20px', wordWrap: 'break-word' }}>
                {msg.message}
              </Box>
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

export default ChatPage;
