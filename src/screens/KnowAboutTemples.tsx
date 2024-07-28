import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Box, Modal, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTemples, Temple } from '../store/templesSlice';
import { motion } from 'framer-motion';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import BackButton from '../components/BackButton';

const colors = ['#FF7043', '#4FC3F7', '#81C784', '#FF8A65', '#BA68C8', '#64B5F6', '#4DB6AC', '#9575CD', '#E57373'];

const KnowAboutTemples: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { temples, loading } = useSelector((state: RootState) => state.temples);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const [showLoader, setShowLoader] = useState<boolean>(false);

  useEffect(() => {
    const clearPreviousData = async () => {
      if (currentUser) {
        const storiesRef = collection(db, 'users', currentUser.uid, 'stories');
        const qStories = query(storiesRef, where('text', '!=', ''));
        const storiesSnapshot = await getDocs(qStories);
        storiesSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        const templeChatRef = collection(db, 'users', currentUser.uid, 'templeChat');
        const qTempleChat = query(templeChatRef);
        const templeChatSnapshot = await getDocs(qTempleChat);
        templeChatSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      }
    };

    clearPreviousData();
    dispatch(fetchTemples());
  }, [dispatch, currentUser]);

  const truncateDescription = (description: string, maxLength: number) => {
    const words = description.split(' ');
    if (words.length > maxLength) {
      return words.slice(0, maxLength).join(' ') + '...';
    }
    return description;
  };

  const handleCardClick = async (templeId: string, templeName: string) => {
    setShowLoader(true);
    try {
      const handleTempleChat = httpsCallable(functions, 'templeChat');
      const response = await handleTempleChat({ userId: `${currentUser?.uid}`, templeName, message: '' });
      const { message, audioUrl } = response.data as { message: string, audioUrl: string };
      localStorage.setItem(`templeWelcomeMessage_${templeId}`, message);
      localStorage.setItem(`templeWelcomeAudio_${templeId}`, audioUrl);


      navigate(`/temple/${templeId}`);
    } catch (error) {
      console.error('Error fetching welcome message:', error);
    } finally {
      setShowLoader(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: { xs: '20px', sm: '40px' }, paddingBottom: { xs: '20px', sm: '40px' }, position: 'relative' }}>
      <BackButton />
      <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center">
        {temples.map((temple: Temple, index: number) => (
          <Grid item key={temple.id} xs={12} sm={6} md={4}>
            <Card
              onClick={() => handleCardClick(temple.id, temple.name)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0px',
                margin: '20px',
                borderRadius: '15px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                height: { xs: '300px', sm: '350px', md: '450px' },
                backgroundColor: colors[index % colors.length],
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                },
                cursor: 'pointer',
                '&:focus': {
                  outline: '2px solid #ff5722',
                },
              }}
              role="button"
              aria-label={`Temple card for ${temple.name}`}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(temple.id, temple.name);
                }
              }}
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width="100%">
                  <Box
                    component="img"
                    src={temple.image}
                    alt={temple.name}
                    sx={{
                      width: '100%',
                      height: { xs: '150px', sm: '200px', md: 'auto' },
                      borderTopLeftRadius: '15px',
                      borderTopRightRadius: '15px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                  <CardContent sx={{ padding: '16px', textAlign: 'center', width: '100%' }}>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#fff', width: '100%' }}>
                      {temple.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        marginTop: '10px',
                        color: '#fff',
                        textAlign: 'left',
                        width: '100%',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {truncateDescription(temple.description, 50)}
                    </Typography>
                  </CardContent>
                </Box>
              </motion.div>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Modal open={loading || showLoader} aria-labelledby="loading-modal" aria-describedby="loading-details">
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <CircularProgress color="success" />
          <Typography id="loading-details" variant="h6" sx={{ color: '#fff', mt: 2 }}>
            {loading ? 'Loading temples...' : 'Loading details...'}
          </Typography>
        </Box>
      </Modal>
    </Container>

  );
};

export default KnowAboutTemples;
