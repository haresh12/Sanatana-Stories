import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Avatar, Box, Modal, CircularProgress } from '@mui/material';
import { db, functions } from '../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { God } from '../../types/God';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setGodName, setMessages, setGods } from '../../store/chatSlice';
import { httpsCallable } from 'firebase/functions';
import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton';

const colors = ['#FF7043', '#4FC3F7', '#81C784', '#FF8A65', '#BA68C8', '#64B5F6', '#4DB6AC', '#9575CD', '#E57373'];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }
};

const TalkToGod = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const gods = useSelector((state: RootState) => state.chat.gods) || [];
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    const clearUserChat = async () => {
      if (currentUser) {
        const userChatCollection = collection(db, 'users', currentUser.uid, 'godChat');
        const userChatSnapshot = await getDocs(userChatCollection);
        userChatSnapshot.forEach(async (chatDoc) => {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'godChat', chatDoc.id));
        });
      }
    };

    clearUserChat();
  }, [currentUser]);

  useEffect(() => {
    const fetchGods = async () => {
      const godsCollection = collection(db, 'gods');
      const godsSnapshot = await getDocs(godsCollection);
      const godsList = godsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as God[];
      dispatch(setGods(godsList));
    };

    fetchGods();
  }, [dispatch]);

  const handleCardClick = async (god: God) => {
    setLoading(true);
    const handleChat = httpsCallable(functions, 'handleChat');
    const response = await handleChat({ userId: `${currentUser?.uid}`, godName: god.name, message: '' });
    const responseData = response.data as { message: string, audioUrl: string };
    dispatch(setGodName(god.name));
    dispatch(setMessages([{ role: 'model', message: responseData.message, audioUrl: responseData.audioUrl }]));

    setLoading(false);
    navigate(`/talk-to-god/${god.id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '40px', paddingBottom: '40px', position: 'relative' }}>
      <BackButton />
      <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: '40px', fontWeight: 'bold', color: '#ff5722' }}>
        Talk to Your God
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {gods.map((god, index) => (
          <Grid item key={god.id} xs={12} sm={6} md={4} lg={3} display="flex" justifyContent="center">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '20px',
                  borderRadius: '15px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  height: { xs: '275px', sm: '325px' },
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '350px' },
                  backgroundColor: colors[index % colors.length],
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  },
                }}
                onClick={() => handleCardClick(god)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(god);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Talk to ${god.name}`}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    <Avatar
                      src={god.image}
                      alt={god.name}
                      sx={{
                        width: 80,
                        height: 80,
                        margin: 'auto',
                        marginBottom: '10px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.5)',
                        }
                      }}
                    />
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: 'bold',
                        marginTop: '10px',
                        color: '#fff'
                      }}
                      aria-label={`God Name: ${god.name}`}
                    >
                      {god.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        marginTop: '5px',
                        color: '#fff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical'
                      }}
                      aria-label={`God Description: ${god.description}`}
                    >
                      {god.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      <Modal open={loading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <CircularProgress color='success' />
          <Typography variant="h6" sx={{ color: '#fff', mt: 2 }}>
            Initiating chat...
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
};

export default TalkToGod;
