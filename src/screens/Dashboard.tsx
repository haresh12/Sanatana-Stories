import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { logout } from '../store/authSlice';
import RamayanIcon from '@mui/icons-material/MenuBook';
import MahabharatIcon from '@mui/icons-material/MenuBook';
import PuranasIcon from '@mui/icons-material/Book';
import HanumanChalisaIcon from '@mui/icons-material/MenuBook';
import TalkToGodIcon from '@mui/icons-material/EmojiPeople';
import CommunityIcon from '@mui/icons-material/People';
import TemplesIcon from '@mui/icons-material/TempleHindu';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  { title: 'Fun Fact', description: 'The Bhagavad Gita is a 700-verse Hindu scripture that is part of the Indian epic Mahabharata.', icon: null, color: '#9575CD', route: '/fun-fact' },
  { title: 'Myth', description: 'Myth: Hanuman once attempted to eat the sun, mistaking it for a ripe fruit.', icon: null, color: '#E57373', route: '/myth' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    dispatch(logout());
    navigate('/');
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
      <Grid container spacing={4}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div variants={cardAnimation} whileHover="hover" whileTap="tap" onClick={() => navigate(card.route)}>
              <Card
                sx={{
                  backgroundColor: card.color,
                  borderRadius: '15px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '20px',
                  cursor: 'pointer',
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    {card.icon && (
                      <Avatar sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                        {card.icon}
                      </Avatar>
                    )}
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', marginTop: '20px', color: '#fff' }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: '10px', color: '#fff' }}>
                      {card.description}
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
