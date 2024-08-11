import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Modal, CircularProgress, Typography, Box, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchTemples } from '../../store/templesSlice';
import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { handleCardClick, clearPreviousData } from './utils';
import { StyledCard, StyledCardContent, StyledImage } from './styles';
import { Temple } from './types';
import { STRINGS } from '../../const/strings';
import { colors } from '../../const/consts';

const KnowAboutTemples: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { temples, loading } = useSelector((state: RootState) => state.temples);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [expandedDescription, setExpandedDescription] = useState<{ [key: string]: boolean }>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (currentUser) {
      clearPreviousData(currentUser);
    }
    dispatch(fetchTemples());
  }, [dispatch, currentUser]);

  const toggleDescription = (id: string) => {
    setExpandedDescription(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

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
              expanded={expandedDescription[temple.id]} // Prop to manage expansion
              onKeyPress={(e) => {
                if (e.key === STRINGS.enterKey || e.key === STRINGS.spaceKey) {
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
                        WebkitLineClamp: expandedDescription[temple.id] ? 'none' : 2, 
                        WebkitBoxOrient: 'vertical',
                        overflow: expandedDescription[temple.id] ? 'visible' : 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: isMobile ? '0.8rem' : '1rem',
                      }}
                    >
                      {temple.description}
                    </Typography>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleDescription(temple.id);
                      }}
                      sx={{ mt: 1, color: '#ffcccb', textTransform: 'none', fontSize: '0.8rem' }}
                    >
                      {expandedDescription[temple.id] ? STRINGS.showLess : STRINGS.readMore}
                    </Button>
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
            {loading ? STRINGS.loadingTemples : STRINGS.loadingDetails}
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
};

export default KnowAboutTemples;
