import React, { useEffect, useState, useRef } from 'react';
import { TextField, IconButton, Container, Typography, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import RulesModal from '../../components/RulesModal';
import BackButton from '../../components/BackButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  containerStyle,
  boxStyle,
  messageContainerStyle,
  messageBoxStyle,
  messageContentStyle,
  inputContainerStyle,
  inputFieldStyle,
  sendButtonStyle,
  speechButtonStyle,
} from './styles';
import { Message } from './types';
import {
  fetchMessages,
  handleSendMessage,
  scrollToBottom,
  initializeRecognition,
  handleSpeechInput,
  handleCloseRules,
} from './utils';

const Community: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const hasSeenRules = useSelector((state: RootState) => state.auth.hasSeenRules);
  const userName = useSelector((state: RootState) => state.auth.name);
  const dispatch = useDispatch();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchMessages(setMessages);
  }, []);

  useEffect(() => {
    scrollToBottom(messagesEndRef);
  }, [messages]);

  useEffect(() => {
    initializeRecognition(recognitionRef, setInput, setIsListening);
  }, []);

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={containerStyle}
      role="main"
      aria-label="Community Chat"
    >
      <BackButton />
      {!hasSeenRules ? (
        <RulesModal open={!hasSeenRules} handleClose={() => handleCloseRules(dispatch)} />
      ) : (
        <Box sx={boxStyle}>
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              align="center"
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}
              tabIndex={0}
            >
              Community Chat
            </Typography>
          </motion.div>
          <Box
            sx={messageContainerStyle}
            aria-live="polite"
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  ...messageBoxStyle,
                  alignItems: msg.user === currentUser?.email ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={messageContentStyle(msg.user === currentUser?.email)}
                  tabIndex={0}
                  aria-label={`${msg.user === currentUser?.email ? 'You' : msg.name || 'Anonymous'}: ${msg.text}`}
                >
                  {msg.text}
                </Box>
                {msg.user !== currentUser?.email && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#888',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      mt: 0.5,
                      ml: 1,
                    }}
                  >
                    {msg.name || 'Anonymous'}
                  </Typography>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={inputContainerStyle}>
            <TextField
              variant="outlined"
              fullWidth
              multiline
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={inputFieldStyle}
              placeholder="Type your message..."
              aria-label="Type your message"
            />
            <IconButton
              onClick={() => handleSendMessage(input, setLoading, currentUser, userName, setInput)}
              disabled={loading}
              sx={sendButtonStyle(loading)}
              aria-label="Send message"
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : <SendIcon />}
            </IconButton>
            <IconButton
              onClick={() => handleSpeechInput(recognitionRef)}
              sx={speechButtonStyle(isListening)}
              aria-label={isListening ? 'Listening...' : 'Start listening'}
            >
              <MicIcon />
            </IconButton>
          </Box>
        </Box>
      )}
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
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
          }
        `}
      </style>
    </Container>
  );
};

export default Community;
