import React, { useEffect, useState, useRef } from 'react';
import { TextField, IconButton, Container, Typography, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { collection, addDoc, getDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import RulesModal from '../components/RulesModal';
import { setHasSeenRules } from '../store/authSlice';

interface Message {
    id: string;
    user: string;
    name: string;
    text: string;
    timestamp: any;
    attribute_scores?: {
        TOXICITY?: number;
        SEVERE_TOXICITY?: number;
        IDENTITY_ATTACK?: number;
        INSULT?: number;
        PROFANITY?: number;
        THREAT?: number;
    };
}

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

    useEffect(() => {
        const fetchMessages = async () => {
            const q = query(collection(db, 'comments'), orderBy('timestamp', 'asc'));
            onSnapshot(q, (snapshot) => {
                const messagesList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Message[];
                setMessages(messagesList);
            });
        };
        fetchMessages();
    }
    , []);

    const handleSendMessage = async () => {
        if (input.trim() === '') return;
        setLoading(true);
        try {
            const docRef = await addDoc(collection(db, 'comments'), {
                user: currentUser?.email,
                text: input,
                name: userName ?? currentUser?.displayName ?? 'Anonymous',
                timestamp: serverTimestamp()
            });

            // Wait for the extension to update the document with attribute_scores
            setTimeout(async () => {
                const docSnapshot = await getDoc(docRef);
                const data = docSnapshot.data() as Message;
                const scores = data.attribute_scores;
                if (
                    scores &&
                    (
                        (scores.TOXICITY && scores.TOXICITY > 0.4) ||
                        (scores.IDENTITY_ATTACK && scores.IDENTITY_ATTACK > 0.4) ||
                        (scores.INSULT && scores.INSULT > 0.4) ||
                        (scores.PROFANITY && scores.PROFANITY > 0.4) ||
                        (scores.SEVERE_TOXICITY && scores.SEVERE_TOXICITY > 0.4) ||
                        (scores.THREAT && scores.THREAT > 0.4)
                    )
                )  {
                    await updateDoc(doc(db, 'comments', docRef.id), {
                        text: "[Message Removed due to inappropriate content]"
                    });
                }
            }, 2000);

            setInput('');
        } catch (error) {
            console.error('Error sending message: ', error);
        }
        setLoading(false);
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            alert("Your browser does not support speech recognition.");
        }
    }, []);

    const handleSpeechInput = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("Speech recognition already started");
            }
        }
    };

    const handleCloseRules = () => {
        dispatch(setHasSeenRules(true));
    };

    return (
        <Container component="main" maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
            {!hasSeenRules ? (
                <RulesModal open={!hasSeenRules} handleClose={handleCloseRules} />
            ) : (
                <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '98vh', borderRadius: '20px', boxShadow: 4, backgroundColor: '#ffffff' }}>
                    <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', mt: 2 }}>
                            Community Chat
                        </Typography>
                    </motion.div>
                    <Box sx={{ flex: 1, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column', gap: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                        {messages.map((msg) => (
                            <Box key={msg.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.user === currentUser?.email ? 'flex-end' : 'flex-start', mb: 1 }}>
                                <Box sx={{ maxWidth: '75%', bgcolor: msg.user === currentUser?.email ? '#ff5722' : '#4caf50', color: '#fff', p: 2, borderRadius: '20px', wordWrap: 'break-word', textAlign: msg.user === currentUser?.email ? 'right' : 'left' }}>
                                    {msg.text}
                                </Box>
                                {msg.user !== currentUser?.email && (
                                    <Typography variant="caption" sx={{ color: '#888', textAlign: 'left', fontSize: '0.875rem', fontWeight: 'bold', ml: 1 }}>
                                        {msg.name || 'Anonymous'}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>
                    <Box sx={{ display: 'flex', mt: 1, alignItems: 'center' }}>
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
                        <IconButton onClick={handleSendMessage} disabled={loading} sx={{ borderRadius: '50%', padding: '10px', backgroundColor: '#ff5722', color: '#fff', minWidth: 56, height: 56 }}>
                            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : <SendIcon />}
                        </IconButton>
                        <IconButton onClick={handleSpeechInput} sx={{ marginLeft: 1, borderRadius: '50%', padding: '10px', backgroundColor: '#ff5722', color: '#fff', minWidth: 56, height: 56, animation: isListening ? 'pulse 1.5s infinite' : 'none' }}>
                            <MicIcon />
                        </IconButton>
                    </Box>
                </Box>
            )}
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
                  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
                }
                70% {
                  transform: scale(1.1);
                  box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
                }
                100% {
                  transform: scale(1);
                  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
                }
              }
            `}
            </style>
        </Container>
    );

};

export default Community;
