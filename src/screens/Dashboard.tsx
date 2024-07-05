import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { logout } from '../store/authSlice';
import { reset as resetChalisa } from '../store/chalisaSlice';
import RamayanIcon from '@mui/icons-material/MenuBook';
import MahabharatIcon from '@mui/icons-material/MenuBook';
import PuranasIcon from '@mui/icons-material/Book';
import HanumanChalisaIcon from '@mui/icons-material/MenuBook';
import TalkToGodIcon from '@mui/icons-material/EmojiPeople';
import CommunityIcon from '@mui/icons-material/People';
import TemplesIcon from '@mui/icons-material/TempleHindu';
import { keyframes } from '@mui/system';

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

const cards = [
  { title: 'Ramayan', description: 'Explore the epic story of Ramayan.', icon: <RamayanIcon style={{ fontSize: 40, color: '#fff' }} />, color: '#FF7043', route: '/ramayan' },
  { title: 'Mahabharat', description: 'Discover the tales of Mahabharat.', icon: <MahabharatIcon style={{ fontSize: 40, color: '#fff' }} />, color: '#4FC3F7', route: '/mahabharat' },
  { title: 'Hindu Puranas', description: 'Learn about Hindu Puranas.', icon: <PuranasIcon style={{ fontSize: 40, color: '#fff' }} />, color: '#81C784', route: '/hindu-puranas' },
  { title: 'Hanuman Chalisa', description: 'Recite the Hanuman Chalisa.', icon: <HanumanChalisaIcon style={{ fontSize: 40, color: '#fff' }} />, color: '#FF8A65', route: '/hanuman-chalisa' },
  { title: 'Talk To God', description: 'Pray and connect spiritually.', icon: <TalkToGodIcon style={{ fontSize: 40, color: '#fff' }} />, color: '#BA68C8', route: '/talk-to-god' },
  { title: 'Community', description: 'Join the community of believers.', icon: <CommunityIcon style={{ fontSize: 40, color: '#fff' }} />, color: '#64B5F6', route: '/community' },
  { title: 'Know About Temples', description: 'Get to know various temples.', icon: <TemplesIcon style={{ fontSize: 40, color: '#fff' }} />, color: '#4DB6AC', route: '/know-about-temples' },
  { title: 'Fun Fact', description: '', icon: null, color: '#9575CD' },
  { title: 'Myth', description: '', icon: null, color: '#E57373' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [funFact, setFunFact] = useState('');
  const [animateFunFact, setAnimateFunFact] = useState(false);
  const [animateMyth, setAnimateMyth] = useState(false);
  const [myth, setMyth] = useState('');

  const handleLogout = async () => {
    await auth.signOut();
    dispatch(logout());
    dispatch(resetChalisa()); // Dispatch reset action to clear saved words
    localStorage.setItem('seenRules', 'false');
    navigate('/');
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

    return () => {
      unsubscribeFunFact();
      unsubscribeMyth();
    };
  }, []);

  const triggerAnimation = (setAnimate: any) => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '40px', paddingBottom: '40px', position: 'relative' }}>
    <Button
      variant="contained"
      onClick={handleClickOpen}
      sx={{
        position: 'absolute',
        top: '20px',
        right: '20px',
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
    >
      Logout
    </Button>

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
      <DialogTitle id="alert-dialog-slide-title">{"Logout Confirmation"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure you want to logout? You'll miss us!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ fontWeight: 'bold', color: '#ff5722' }}>
          Cancel
        </Button>
        <Button onClick={handleLogout} sx={{ fontWeight: 'bold', color: '#ff5722' }} autoFocus>
          Yes, Logout
        </Button>
      </DialogActions>
    </Dialog>

    <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: '40px', fontWeight: 'bold', color: '#fff' }}>
      Welcome to the Spiritual Dashboard
    </Typography>
    <Grid container spacing={4} justifyContent="center">
      {cards.map((card, index) => (
        <Grid item key={index}>
          <motion.div variants={cardAnimation} whileHover="hover" whileTap="tap" onClick={() => card.route && navigate(card.route)}>
            <Card
              sx={{
                backgroundColor: card.color,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                height: '220px',
                width: '350px',
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
                    <Avatar sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>{card.icon}</Avatar>
                  ) : null}
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', marginTop: '20px', color: '#fff' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ marginTop: '10px', color: '#fff' }}>
                    {card.title === 'Fun Fact' ? funFact : card.title === 'Myth' ? myth : card.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  </Container>
  );
};

export default Dashboard;
