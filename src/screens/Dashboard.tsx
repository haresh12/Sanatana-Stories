import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions, auth, remoteConfig } from '../firebaseConfig';
import { logout } from '../store/authSlice';
import { reset as resetChalisa } from '../store/chalisaSlice';
import MahabharatIcon from '@mui/icons-material/MenuBook';
import HanumanChalisaIcon from '@mui/icons-material/MenuBook';
import TalkToGodIcon from '@mui/icons-material/EmojiPeople';
import CommunityIcon from '@mui/icons-material/People';
import TemplesIcon from '@mui/icons-material/TempleHindu';
import QuizIcon from '@mui/icons-material/Quiz';
import { keyframes } from '@mui/system';
import { fetchAndActivate, getValue } from 'firebase/remote-config';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const movingBorder = keyframes`
  0%, 100% {
    border-color: transparent;
  }
  50% {
    border-color: #FFD700; 
  }
`;

const pulsingShadow = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(255, 179, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 179, 0, 1);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 179, 0, 0.5);
  }
`;

const cardAnimation = {
  hover: {
    scale: 1.05,
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
    transition: {
      duration: 0.3,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.3,
    },
  },
};

const quizCardAnimation = {
  hover: {
    scale: 1.05,
    animation: `${pulsingShadow} 1.5s infinite`,
    transition: {
      duration: 0.3,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.3,
    },
  },
};

const defaultCards = [
  {
    title: 'Hanuman Chalisa',
    description: 'Delve into the powerful verses of the Hanuman Chalisa.',
    icon: <HanumanChalisaIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#FF8A65',
    route: '/hanuman-chalisa',
    key: 'show_hanuman_chalisa'
  },
  {
    title: 'Talk To God',
    description: 'Engage in spiritual conversations and seek divine guidance.',
    icon: <TalkToGodIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#BA68C8',
    route: '/talk-to-god',
    key: 'show_talk_to_god'
  },
  {
    title: 'Generate Podcast',
    description: 'Create and share your spiritual journey through podcasts.',
    icon: <MahabharatIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#4169E1',
    route: '/generate-podcast',
    animation: cardAnimation,
    key: 'show_generate_podcast'
  },
  {
    title: 'Community',
    description: 'Join a community of like-minded spiritual seekers.',
    icon: <CommunityIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#64B5F6',
    route: '/community',
    key: 'show_community'
  },
  {
    title: 'Quiz',
    description: 'Test and expand your knowledge with our engaging quizzes.',
    icon: <QuizIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#FFA726',
    route: '/quiz',
    animation: quizCardAnimation,
    key: 'show_quiz'
  },
  {
    title: 'Summarize Satsang',
    description: 'Get concise summaries of spiritual talks and satsangs.',
    icon: <MahabharatIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#FFD54F',
    route: '/summarize-satsang',
    animation: quizCardAnimation,
    key: 'show_summarize_satsang'
  },
  {
    title: 'Know About Temples',
    description: 'Explore and learn about various Hindu temples.',
    icon: <TemplesIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#4DB6AC',
    route: '/know-about-temples',
    key: 'show_know_about_temples'
  },
  {
    title: 'Fun Fact',
    description: 'Discover interesting and lesser-known facts.',
    icon: null,
    color: '#9575CD',
    key: 'show_fun_fact'
  },
  {
    title: 'Myth',
    description: 'Uncover the myths and legends of Hindu culture.',
    icon: null,
    color: '#E57373',
    key: 'show_myth'
  },
  {
    title: 'Epics and Puranas',
    description: 'Dive into the rich stories of Ramayan, Mahabharat, and Puranas.',
    icon: <MahabharatIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#FF7043',
    route: '/epic',
    key: 'show_epics_and_puranas'
  }
];



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [funFact, setFunFact] = useState('');
  const [animateFunFact, setAnimateFunFact] = useState(false);
  const [cards, setCards] = useState(defaultCards)
  const [animateMyth, setAnimateMyth] = useState(false);
  const [myth, setMyth] = useState('');
  const [detailedInfo, setDetailedInfo] = useState<string>('');
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchingCard, setFetchingCard] = useState<'funFact' | 'myth' | null>(null);

  const handleLogout = async () => {
    await auth.signOut();
    dispatch(logout());
    dispatch(resetChalisa());
    localStorage.setItem('seenRules', 'false');
    navigate('/');
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDetailedClose = () => {
    setDetailedOpen(false);
    setDetailedInfo('');
    setFetchingCard(null);
  };

  const fetchDetailedInfo = async (content: string, type: 'funFact' | 'myth') => {
    setFetching(true);
    setFetchingCard(type);
    try {
      const getDetailedInfo = httpsCallable<{ content: string, type: 'funFact' | 'myth' }, { detailedInfo: string }>(functions, 'getDetailedInfo');
      const response = await getDetailedInfo({ content, type });
      const data = response.data as { detailedInfo: string };
      setDetailedInfo(data.detailedInfo);
      setDetailedOpen(true);
    } catch (error) {
      console.error('Error fetching detailed information:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      let newCards = [];
      try {
        await fetchAndActivate(remoteConfig);
        newCards = defaultCards.filter(card => getValue(remoteConfig, card.key).asBoolean());
        setCards(newCards);
      } catch (error) {
        setCards(defaultCards);
      } finally {
        if (newCards.length === 0) {
          setCards(defaultCards);
        }
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const db = getFirestore();
    const unsubscribeFunFact = onSnapshot(doc(db, 'dynamicContent', 'funFact'), (doc) => {
      setFunFact(doc.data()?.content || '');
      triggerAnimation(setAnimateFunFact);
    });
    const unsubscribeMyth = onSnapshot(doc(db, 'dynamicContent', 'myth'), (doc) => {
      setMyth(doc.data()?.content || '');
      triggerAnimation(setAnimateMyth);
    });

    const updateContent = async () => {
      try {
        const updateFunFact = httpsCallable(functions, 'generateFunFact');
        const updateMyth = httpsCallable(functions, 'generateMyth');

        await updateFunFact();
        await updateMyth();
      } catch (error) {
        console.error('Error updating content:', error);
      }
    };

    const interval = setInterval(updateContent, 5 * 60 * 1000);

    return () => {
      unsubscribeFunFact();
      unsubscribeMyth();
      clearInterval(interval);
    };
  }, []);

  const triggerAnimation = (setAnimate: any) => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 2000);
  };

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={{ paddingTop: '40px', paddingBottom: '40px', position: 'relative' }}
      role="main"
    >
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '10px', md: '20px' },
          right: { xs: '10px', md: '20px' },
          zIndex: 1100,
        }}
      >
        <Button
          variant="contained"
          onClick={handleClickOpen}
          sx={{
            backgroundColor: '#ff5722',
            color: '#fff',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '25px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#e64a19',
            },
          }}
          aria-label="Logout"
        >
          Logout
        </Button>
      </Box>
  
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#fff',
            color: '#333',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle id="alert-dialog-slide-title">Logout Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to logout? You'll miss us!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ fontWeight: 'bold', color: '#ff5722' }}>
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            sx={{ fontWeight: 'bold', color: '#ff5722' }}
            autoFocus
          >
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>
  
      <Dialog
        open={detailedOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDetailedClose}
        aria-labelledby="detailed-dialog-title"
        aria-describedby="detailed-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#fff',
            color: '#333',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle id="detailed-dialog-title">Detailed Information</DialogTitle>
        <DialogContent>
          <DialogContentText id="detailed-dialog-description">
            {fetching ? 'Fetching...' : detailedInfo}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailedClose} sx={{ fontWeight: 'bold', color: '#ff5722' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
  
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          marginBottom: '40px',
          fontWeight: 'bold',
          color: '#fff',
          marginTop: { xs: '50px', md: '0px' },
        }}
      >
        Welcome to the Spiritual Dashboard
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              variants={card.animation || cardAnimation}
              whileHover="hover"
              whileTap="tap"
              onClick={() => card.route && navigate(card.route)}
              role="button"
              aria-label={`Navigate to ${card.title}`}
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && card.route) {
                  navigate(card.route);
                }
              }}
            >
              <Card
                sx={{
                  backgroundColor: card.color,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  height: '220px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: '15px',
                  border: (card.title === 'Fun Fact' && animateFunFact) || (card.title === 'Myth' && animateMyth)
                    ? `2px solid transparent`
                    : 'none',
                  animation: (card.title === 'Fun Fact' && animateFunFact) || (card.title === 'Myth' && animateMyth)
                    ? `${movingBorder} 2s linear`
                    : 'none',
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    {card.icon ? (
                      <Avatar sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', marginBottom: '10px' }} aria-hidden="true">
                        {card.icon}
                      </Avatar>
                    ) : null}
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', marginTop: '20px', color: '#fff' }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: '10px', color: '#fff' }}>
                      {card.title === 'Fun Fact' ? funFact : card.title === 'Myth' ? myth : card.description}
                    </Typography>
                    {(card.title === 'Fun Fact' || card.title === 'Myth') && (
                      <Box display="flex" flexDirection="column" alignItems="flex-end" sx={{ width: '100%', marginTop: '10px' }}>
                        <hr style={{ width: '100%', borderColor: '#fff', marginBottom: '5px' }} />
                        <Button
                          variant="text"
                          sx={{ color: '#fff', fontWeight: 'bold', padding: '5px 10px' }}
                          onClick={() => fetchDetailedInfo(card.title === 'Fun Fact' ? funFact : myth, card.title.toLowerCase() as 'funFact' | 'myth')}
                          disabled={fetching && fetchingCard === card.title.toLowerCase()}
                          aria-label={`Know more about ${card.title}`}
                        >
                          {fetching && fetchingCard === card.title.toLowerCase() ? 'Fetching...' : 'Know More'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;
