import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Typography, Box, Modal, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTemples, Temple } from '../store/templesSlice';
import { motion } from 'framer-motion';

const colors = ['#FF7043', '#4FC3F7', '#81C784', '#FF8A65', '#BA68C8', '#64B5F6', '#4DB6AC', '#9575CD', '#E57373'];

const KnowAboutTemples: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { temples, loading } = useSelector((state: RootState) => state.temples);

  useEffect(() => {
    if (temples.length === 0) {
      dispatch(fetchTemples());
    }
  }, [dispatch, temples.length]);

  const truncateDescription = (description: string, maxLength: number) => {
    const words = description.split(' ');
    if (words.length > maxLength) {
      return words.slice(0, maxLength).join(' ') + '...';
    }
    return description;
  };

  const handleCardClick = (templeId: string) => {
    navigate(`/temple/${templeId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '40px', paddingBottom: '40px', position: 'relative' }}>
      <Grid container spacing={4} justifyContent="center">
        {temples.map((temple: Temple, index: number) => (
          <Grid item key={temple.id} xs={12} sm={6} md={4}>
            <Card
              onClick={() => handleCardClick(temple.id)}
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
                height: '450px',
                backgroundColor: colors[index % colors.length],
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                },
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
                      height: 'auto',
                      marginBottom: '0px',
                      borderRadius: '15px 15px 0 0',
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
                    <Typography variant="body2" sx={{ marginTop: '10px', color: '#fff', textAlign: 'left', width: '100%', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {truncateDescription(temple.description, 50)}
                    </Typography>
                  </CardContent>
                </Box>
              </motion.div>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Modal open={loading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <CircularProgress color='success'/>
          <Typography variant="h6" sx={{ color: '#fff', mt: 2 }}>
            Loading temples...
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
};

export default KnowAboutTemples;
