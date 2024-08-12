import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { httpsCallable } from 'firebase/functions';
import { functions, auth, remoteConfig } from '../../firebaseConfig';
import { logout } from '../../store/authSlice';
import { RootState } from '../../store';
import { reset as resetChalisa } from '../../store/chalisaSlice';
import MahabharatIcon from '@mui/icons-material/MenuBook';
import HanumanChalisaIcon from '@mui/icons-material/MenuBook';
import TalkToGodIcon from '@mui/icons-material/EmojiPeople';
import CommunityIcon from '@mui/icons-material/People';
import TemplesIcon from '@mui/icons-material/TempleHindu';
import QuizIcon from '@mui/icons-material/Quiz';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { CardInfo } from './types';
import { containerStyle, logoutButtonStyle, dialogStyle, cardStyle, cardTitleStyle, cardDescriptionStyle, knowMoreButtonStyle, movingBorder, pulsingShadow } from './styles';
import { truncateText, fetchDetailedInfo, capitalizeName } from './utils';
import { STRINGS } from '../../const/strings';
import {
  SHOW_HANUMAN_CHALISA,
  SHOW_TALK_TO_GOD,
  SHOW_GENERATE_PODCAST,
  SHOW_COMMUNITY,
  SHOW_QUIZ,
  SHOW_KNOW_ABOUT_TEMPLES,
  SHOW_FUN_FACT,
  SHOW_MYTH,
  SHOW_EPICS_AND_PURANAS
} from '../../const/consts';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const cardAnimation = {
  hover: {
    scale: 1.05,
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
    transition: { duration: 0.3 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

const quizCardAnimation = {
  hover: {
    scale: 1.05,
    animation: `${pulsingShadow} 1.5s infinite`,
    transition: { duration: 0.3 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

const defaultCards: CardInfo[] = [
  {
    title: STRINGS.hanumanChalisaTitle,
    description: STRINGS.hanumanChalisaDescription,
    icon: <HanumanChalisaIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#FF8A65',
    route: '/hanuman-chalisa',
    key: SHOW_HANUMAN_CHALISA
  },
  {
    title: STRINGS.talkToGodTitle,
    description: STRINGS.talkToGodDescription,
    icon: <TalkToGodIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#BA68C8',
    route: '/talk-to-god',
    key: SHOW_TALK_TO_GOD
  },
  {
    title: STRINGS.generatePodcastTitle,
    description: STRINGS.generatePodcastDescription,
    icon: <MahabharatIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#4169E1',
    route: '/generate-podcast',
    animation: cardAnimation,
    key: SHOW_GENERATE_PODCAST
  },
  {
    title: STRINGS.communityTitle,
    description: STRINGS.communityDescription,
    icon: <CommunityIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#64B5F6',
    route: '/community',
    key: SHOW_COMMUNITY
  },
  {
    title: STRINGS.quizTitle,
    description: STRINGS.quizDescription,
    icon: <QuizIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#FFA726',
    route: '/quiz',
    animation: quizCardAnimation,
    key: SHOW_QUIZ
  },
  {
    title: STRINGS.knowAboutTemplesTitle,
    description: STRINGS.knowAboutTemplesDescription,
    icon: <TemplesIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#4DB6AC',
    route: '/know-about-temples',
    key: SHOW_KNOW_ABOUT_TEMPLES
  },
  {
    title: STRINGS.funFactTitle,
    description: STRINGS.funFactDescription,
    color: '#9575CD',
    key: SHOW_FUN_FACT
  },
  {
    title: STRINGS.mythTitle,
    description: STRINGS.mythDescription,
    color: '#E57373',
    key: SHOW_MYTH
  },
  {
    title: STRINGS.epicsAndPuranasTitle,
    description: STRINGS.epicsAndPuranasDescription,
    icon: <MahabharatIcon style={{ fontSize: 40, color: '#fff' }} />,
    color: '#FF7043',
    route: '/epic',
    key: SHOW_EPICS_AND_PURANAS
  }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [funFact, setFunFact] = useState('');
  const [animateFunFact, setAnimateFunFact] = useState(false);
  const [cards, setCards] = useState(defaultCards);
  const [animateMyth, setAnimateMyth] = useState(false);
  const [myth, setMyth] = useState('');
  const [detailedInfo, setDetailedInfo] = useState<string>('');
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchingCard, setFetchingCard] = useState<'funFact' | 'myth' | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const name = useSelector((state: RootState) => state.auth.name);

  const theme = useTheme();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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

  useEffect(() => {
    const fetchConfig = async () => {
      let newCards = [];
      try {
        await fetchAndActivate(remoteConfig);
        newCards = defaultCards.filter(card => getValue(remoteConfig, card.key).asBoolean());
        setCards(newCards);
      } catch (error) {
        console.error(STRINGS.fetchDataError, error);
        setCards(defaultCards);
      } finally {
        if (newCards.length === 0) {
          setCards(defaultCards);
        }
      }
    };
    fetchConfig();
  }, []);

  /**
   * useEffect hook to manage the real-time updates and periodic refreshing of fun fact and myth content.
   * 
   * - Listens to changes in the 'funFact' and 'myth' documents in Firestore and updates the respective state variables.
   * - Triggers animations when new content is received.
   * - Sets up an interval to periodically refresh the content by calling the 'generateFunFact' and 'generateMyth' cloud functions.
   * 
   * Cleanup:
   * - Unsubscribes from Firestore listeners.
   * - Clears the interval when the component unmounts.
   */
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
        console.error(STRINGS.errorUpdatingContent, error);
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

  // Reorder cards for mobile
  const orderedCards = isMobile
    ? [...cards.slice(1), cards[0]] // Move the first card to the last position on mobile
    : cards; // Keep the original order on desktop

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={containerStyle}
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
          sx={logoutButtonStyle}
          aria-label={STRINGS.logout}
        >
          {STRINGS.logout}
        </Button>
      </Box>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        sx={dialogStyle}
      >
        <DialogTitle id="alert-dialog-slide-title">{STRINGS.logoutConfirmation}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {STRINGS.logoutConfirmationDescription}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ fontWeight: 'bold', color: '#ff5722' }}>
            {STRINGS.cancel}
          </Button>
          <Button
            onClick={handleLogout}
            sx={{ fontWeight: 'bold', color: '#ff5722' }}
            autoFocus
          >
            {STRINGS.yesLogout}
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
        sx={dialogStyle}
      >
        <DialogTitle id="detailed-dialog-title">{STRINGS.detailedInformation}</DialogTitle>
        <DialogContent>
          <DialogContentText id="detailed-dialog-description">
            {fetching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box className="dot-elastic" />
                <Box className="dot-elastic" />
                <Box className="dot-elastic" />
              </Box>
            ) : (
              detailedInfo
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailedClose} sx={{ fontWeight: 'bold', color: '#ff5722' }}>
            {STRINGS.close}
          </Button>
        </DialogActions>
      </Dialog>

      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          marginBottom: isSmallScreen ? '20px' : '40px',
          fontWeight: 'bold',
          color: '#fff',
          fontSize: 18,
          marginTop: { xs: '40px', md: '0px' },
        }}
      >
        Hi, {currentUser && currentUser.displayName && currentUser.displayName ? capitalizeName(`${currentUser.displayName}`) : capitalizeName(`${name}`)} {STRINGS.welcomeDashboard}
      </Typography>
      <Grid container spacing={isSmallScreen ? 2 : 4} justifyContent="center">
        {orderedCards.map((card, index) => (
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
                sx={cardStyle(card, isSmallScreen, animateFunFact, animateMyth)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    {card.icon ? (
                      <Avatar sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', marginBottom: '10px' }} aria-hidden="true">
                        {card.icon}
                      </Avatar>
                    ) : null}
                    <Typography variant="h5" component="div" sx={cardTitleStyle}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={cardDescriptionStyle}>
                      {card.title === 'Fun Fact' ? truncateText(funFact, 1000000) : card.title === 'Myth' ? truncateText(myth, 800) : card.description}
                    </Typography>
                    {(card.title === 'Fun Fact' || card.title === 'Myth') && (
                      <Box display="flex" flexDirection="column" alignItems="flex-end" sx={{ width: '100%', marginTop: '10px' }}>
                        <hr style={{ width: '100%', borderColor: '#fff', marginBottom: '5px' }} />
                        <Button
                          variant="text"
                          sx={knowMoreButtonStyle}
                          onClick={() => fetchDetailedInfo(card.title === 'Fun Fact' ? funFact : myth, card.title.toLowerCase() as 'funFact' | 'myth', setDetailedInfo, setDetailedOpen, setFetching, setFetchingCard)}
                          disabled={fetching && fetchingCard === card.title.toLowerCase()}
                          aria-label={`Know more about ${card.title}`}
                        >
                          {fetching && fetchingCard === card.title.toLowerCase() ? STRINGS.fetching : STRINGS.knowMore}
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
        `}
      </style>
      <Typography
        variant="body2"
        align="center"
        sx={{
          marginTop: isSmallScreen ? '20px' : '40px',
          color: '#fff',
          fontSize: '12px',
          opacity: 0.8,
        }}
      >
        Disclaimer: All AI-generated content on this platform is for informational and educational purposes only. Please verify with traditional sources.
      </Typography>
    </Container>
  );
};

export default Dashboard;
