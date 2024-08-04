import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Container } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import { motion } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ChatProps, ChatResponse } from './types';
import { containerStyle, chatBoxStyle, messagesContainerStyle, messageStyle, inputBoxStyle, textFieldStyle, iconButtonStyle } from './styles';

const Chat: React.FC<ChatProps> = ({ templeId, templeName, initialMessages, setMessages }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [animateOnce, setAnimateOnce] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    if (initialMessages.length === 0) {
      const fetchWelcomeMessage = async () => {
        setLoading(true);
        const handleTempleChat = httpsCallable<{ userId: string; templeName: string; message: string }, ChatResponse>(functions, 'templeChat');
        try {
          const response = await handleTempleChat({ userId: `${currentUser?.uid}`, templeName, message: '' });
          setMessages([{ role: 'model', text: response.data.message }]);
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

  return (
    <Container component="main" maxWidth="lg" sx={containerStyle}>
      <Box sx={chatBoxStyle}>
        {animateOnce && initialMessages.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} onAnimationComplete={() => setAnimateOnce(false)}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
              Chat about {templeName}
            </Typography>
          </motion.div>
        ) : (
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
            Chat about {templeName}
          </Typography>
        )}
        <Box sx={messagesContainerStyle}>
          {initialMessages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
              <Box sx={messageStyle(msg.role === 'user')}>
                {msg.text}
              </Box>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Box sx={messageStyle(false)}>
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
        <Box sx={inputBoxStyle}>
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={textFieldStyle}
            placeholder="Type your message..."
          />
          <IconButton onClick={handleSendMessage} disabled={loading} sx={{ borderRadius: '50%', padding: '10px', backgroundColor: '#ff5722', color: '#fff', ml: 1 }}>
            <SendIcon />
          </IconButton>
          <IconButton onClick={handleSpeechInput} sx={iconButtonStyle(listening)}>
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
