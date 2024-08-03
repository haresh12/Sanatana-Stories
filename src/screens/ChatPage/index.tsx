import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Container, Typography, Box, IconButton, useMediaQuery } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { motion } from 'framer-motion';
import { addMessage } from '../../store/chatSlice';
import BackButton from '../../components/BackButton';
import { httpsCallable } from 'firebase/functions';
import { fetchGodName, initializeChat, playAudio, handleSpeechInput, initializeRecognition } from './utils';
import {
  chatContainer,
  boxStyle,
  mobileTitleStyle,
  titleStyle,
  messageContainerStyle,
  messageBoxStyle,
  messageContentStyle,
  audioButtonStyle,
  typingBoxStyle,
  typingContentStyle,
  typingDotsStyle,
  inputContainerStyle,
  inputFieldStyle,
  sendButtonStyle,
  speechButtonStyle,
} from './styles';
import { Message } from './types';
import { functions } from '../../firebaseConfig';

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
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchGodName(godId, dispatch);
  }, [godId, dispatch]);

  useEffect(() => {
    initializeChat(currentUser, godName, messages, dispatch);
  }, [godName, messages, currentUser, dispatch]);

  useEffect(() => {
    initializeRecognition(recognitionRef, setInput, setListening);
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    setLoading(true);
    setTyping(true);

    const newMessage: Message = { role: 'user', message: input };
    dispatch(addMessage(newMessage));
    setInput('');

    try {
      const handleChat = httpsCallable(functions, 'handleChat');
      const response = await handleChat({ userId: currentUser!.uid, godName, message: input });
      const responseData = response.data as { message: string; audioUrl: string };
      const godResponse: Message = { role: 'model', message: responseData.message, audioUrl: responseData.audioUrl };
      dispatch(addMessage(godResponse));
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

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={chatContainer}
      role="main"
      aria-label={`Chat with ${godName}`}
    >
      <BackButton />
      <Box sx={boxStyle}>
        {isMobile ? (
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={mobileTitleStyle}
            tabIndex={0}
          >
            Chat with {godName}
          </Typography>
        ) : (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={titleStyle}
              tabIndex={0}
            >
              Chat with {godName}
            </Typography>
          </motion.div>
        )}
        <Box
          sx={messageContainerStyle}
          aria-live="polite"
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                ...messageBoxStyle,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  ...messageContentStyle,
                  bgcolor: msg.role === 'user' ? '#ff5722' : '#4caf50',
                }}
                tabIndex={0}
                aria-label={`${msg.role === 'user' ? 'User' : 'God'} message: ${msg.message}`}
              >
                {msg.message}
              </Box>
              {msg.role === 'model' && msg.audioUrl && (
                <IconButton
                  onClick={() => playAudio(index, `${msg.audioUrl}`, audioRef, playingIndex, setPlayingIndex)}
                  sx={{
                    ...audioButtonStyle,
                    backgroundColor: playingIndex === index ? '#388e3c' : '#4caf50',
                  }}
                  aria-label={playingIndex === index ? 'Pause audio' : 'Play audio'}
                >
                  {playingIndex === index ? <PauseIcon sx={{ fontSize: '20px' }} /> : <PlayArrowIcon sx={{ fontSize: '20px' }} />}
                </IconButton>
              )}
            </Box>
          ))}
          {typing && (
            <Box sx={typingBoxStyle}>
              <Box sx={typingContentStyle} aria-live="polite">
                <Box sx={typingDotsStyle}>
                  <Box className="dot-elastic"></Box>
                  <Box className="dot-elastic"></Box>
                  <Box className="dot-elastic"></Box>
                </Box>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Box sx={inputContainerStyle}>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={inputFieldStyle}
            placeholder="Type your message..."
            aria-label="Type your message"
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={loading}
            sx={sendButtonStyle}
            aria-label="Send message"
          >
            <SendIcon />
          </IconButton>
          <IconButton
            onClick={() => handleSpeechInput(recognitionRef, listening, setListening)}
            sx={{
              ...speechButtonStyle,
              backgroundColor: listening ? '#ff5722' : '#e0e0e0',
            }}
            aria-label={listening ? 'Listening...' : 'Start listening'}
          >
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
            width: 8px; height: 8px; background-color: #fff; border-radius: 50%; animation: dotElastic 0.6s infinite;
          }
          .dot-elastic:nth-of-type(1) { animation-delay: 0s; }
          .dot-elastic:nth-of-type(2) { animation-delay: 0.1s; }
          .dot-elastic:nth-of-type(3) { animation-delay: 0.2s; }
        `}
      </style>
    </Container>
  );
};

export default ChatPage;
