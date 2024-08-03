import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Modal, CircularProgress, Typography, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchTemples } from '../../store/templesSlice';
import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { handleCardClick, clearPreviousData, truncateDescription } from './utils';
import { StyledCard, StyledCardContent, StyledImage } from './styles';
import { Temple } from './types';

const colors = ['#FF7043', '#4FC3F7', '#81C784', '#FF8A65', '#BA68C8', '#64B5F6', '#4DB6AC', '#9575CD', '#E57373'];

const KnowAboutTemples: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { temples, loading } = useSelector((state: RootState) => state.temples);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (currentUser) {
      clearPreviousData(currentUser);
    }
    dispatch(fetchTemples());
  }, [dispatch, currentUser]);

  return (
    <Container maxWidth="lg" sx={{ paddingTop: { xs: '20px', sm: '40px' }, paddingBottom: { xs: '20px', sm: '40px' }, position: 'relative' }}>
      <BackButton />
      <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center">
        {temples.map((temple: Temple, index: number) => (
          <Grid item key={temple.id} xs={12} sm={6} md={4}>
            <StyledCard
              onClick={() => handleCardClick(temple.id, temple.name, currentUser, setShowLoader, navigate)}
              color={colors[index % colors.length]}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(temple.id, temple.name, currentUser, setShowLoader, navigate);
                }
              }}
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width="100%">
                  <StyledImage src={temple.image} alt={temple.name} />
                  <StyledCardContent>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#fff', width: '100%', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
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
                        WebkitLineClamp: isMobile ? 3 : 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: isMobile ? '0.8rem' : '1rem',
                      }}
                    >
                      {truncateDescription(temple.description, 50)}
                    </Typography>
                  </StyledCardContent>
                </Box>
              </motion.div>
            </StyledCard>
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
