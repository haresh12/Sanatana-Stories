import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Container, Paper, Typography, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { God } from '../types/God';
import { motion } from 'framer-motion';

interface Message {
  role: string;
  message: string;
}

const ChatPage: React.FC = () => {
  const { godId } = useParams<{ godId: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [godName, setGodName] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const fetchGodName = async () => {
      const godsCollection = collection(db, 'gods');
      const godsSnapshot = await getDocs(godsCollection);
      const godsList = godsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as God[];
      const god = godsList.find(g => g.id === godId);
      if (god) {
        setGodName(god.name);
      }
    };
    fetchGodName();
  }, [godId]);

  useEffect(() => {
    const initializeChat = async () => {
      
      if (currentUser && godName) {
        const handleChat = httpsCallable(functions, 'handleChat');
        const response = await handleChat({ userId: currentUser.uid, godName, message: '' });
        const responseData = response.data as { message: string, welcomeMessage: string };
        setMessages([{ role: 'model', message: responseData.welcomeMessage }]);
      }
    };
    initializeChat();
  }, [godName]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    setLoading(true);
    setTyping(true);

    const newMessage: Message = { role: 'user', message: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    const handleChat = httpsCallable(functions, 'handleChat');
    const response = await handleChat({ userId: currentUser!.uid, godName, message: input });
    const responseData = response.data as { message: string };
    const godResponse: Message = { role: 'model', message: responseData.message };
    setMessages((prev) => [...prev, godResponse]);
    setLoading(false);
    setTyping(false);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
      <Paper sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80vh', borderRadius: '20px', boxShadow: 3, backgroundColor: '#ffffff' }}>
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
            Chat with {godName}
          </Typography>
        </motion.div>
        <Box sx={{ flex: 1, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
              <Box sx={{ maxWidth: '75%', bgcolor: msg.role === 'user' ? '#ff5722' : '#4caf50', color: '#fff', p: 2, borderRadius: '20px', wordWrap: 'break-word' }}>
                {msg.message}
              </Box>
            </Box>
          ))}
          {typing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Box sx={{ maxWidth: '75%', bgcolor: '#e0e0e0', color: '#000', p: 2, borderRadius: '20px', wordWrap: 'break-word' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '40px', height: '24px' }}>
                  <Box className="dot-elastic"></Box>
                  <Box className="dot-elastic"></Box>
                  <Box className="dot-elastic"></Box>
                </Box>
              </Box>
            </Box>
          )}
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
          <Button variant="contained" onClick={handleSendMessage} disabled={loading} sx={{ borderRadius: '20px', padding: '10px 20px', backgroundColor: '#ff5722', color: '#fff' }}>
            Send
          </Button>
        </Box>
      </Paper>
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
          background-color: #000;
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
        `}
      </style>
    </Container>
  );
};

export default ChatPage;
