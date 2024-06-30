import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardContent, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import { motion } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      setLoading(true);
      const handleTempleChat = httpsCallable<{ templeName: string; message: string }, ChatResponse>(functions, 'handleTempleChat');
      try {
        const response = await handleTempleChat({ templeName, message: '' });
        setMessages([{ role: 'model', text: response.data.message }]);
      } catch (error) {
        console.error('Error fetching welcome message:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWelcomeMessage();
  }, [templeName]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const handleTempleChat = httpsCallable<{ templeName: string; message: string }, ChatResponse>(functions, 'handleTempleChat');
    try {
      const response = await handleTempleChat({ templeName, message: input });
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card sx={{ boxShadow: 3, p: 2, backgroundColor: '#fff', borderRadius: 2, height: '85vh', overflowY: 'auto', flex: '1' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ color: '#ff5722', mb: 1 }}>
              Chat about {templeName}
            </Typography>
            {messages.map((msg, index) => (
              <Box key={index} sx={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: msg.role === 'user' ? '#fff' : '#333',
                    backgroundColor: msg.role === 'user' ? '#ff7043' : '#e0e0e0',
                    borderRadius: 2,
                    padding: '8px 12px',
                    maxWidth: '80%',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.text}
                </Typography>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>
      </motion.div>
      <Box sx={{ display: 'flex', gap: 2, p: 2, backgroundColor: '#fff', borderRadius: '30px', boxShadow: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ borderRadius: '30px', flexGrow: 1 }}
        />
        <IconButton color="primary" onClick={handleSendMessage} sx={{ color: '#ff7043', '&:hover': { color: '#ff5722' } }}>
          <SendIcon />
        </IconButton>
        <IconButton color="primary" sx={{ color: '#ff7043', '&:hover': { color: '#ff5722' } }}>
          <MicIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
