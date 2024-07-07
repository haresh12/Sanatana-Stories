import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, Avatar, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setName } from '../store/authSlice';
import { RootState } from '../store';
import { doc, setDoc } from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSignup(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        createdAt: new Date().toISOString()
      });

      dispatch(setUser(user));
      dispatch(setName(name));
      navigate('/dashboard');
    } catch (error) {
      setError('Oh no! Something went wrong. Are you sure this email isn’t already taken?');
    }
    setLoadingSignup(false);
  };

  const handleGoogleSignup = async () => {
    setLoadingGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'Anonymous',
        createdAt: new Date().toISOString()
      });

      dispatch(setUser(result.user));
      navigate('/dashboard');
    } catch (error) {
      setError('Google Sign-In failed. Please try again.');
    }
    setLoadingGoogle(false);
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: isMobile ? '10px' : '20px',
      }}
    >
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Paper elevation={10} sx={{ padding: isMobile ? '20px' : '30px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ margin: '10px', backgroundColor: '#ff5722' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ color: '#ff5722' }}>
              Sign Up
            </Typography>
            {error && <Alert severity="error" sx={{ marginTop: '10px' }}>{error}</Alert>}
            <form onSubmit={handleSignup} style={{ marginTop: '20px', width: '100%' }}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setUserName(e.target.value)}
                InputProps={{
                  style: {
                    color: '#000'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ff5722',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff5722',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff5722',
                    },
                  },
                  '& .MuiInputLabel-outlined': {
                    color: '#ff5722',
                  },
                  '& .MuiInputLabel-outlined.Mui-focused': {
                    color: '#ff5722',
                  },
                }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  style: {
                    color: '#000'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ff5722',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff5722',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff5722',
                    },
                  },
                  '& .MuiInputLabel-outlined': {
                    color: '#ff5722',
                  },
                  '& .MuiInputLabel-outlined.Mui-focused': {
                    color: '#ff5722',
                  },
                }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  style: {
                    color: '#000'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ff5722',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff5722',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff5722',
                    },
                  },
                  '& .MuiInputLabel-outlined': {
                    color: '#ff5722',
                  },
                  '& .MuiInputLabel-outlined.Mui-focused': {
                    color: '#ff5722',
                  },
                }}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%' }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loadingSignup}
                  sx={{
                    marginTop: '20px',
                    backgroundColor: '#ff5722',
                    color: '#fff',
                    borderRadius: '50px',
                    padding: '10px 0',
                    fontSize: '16px',
                    textTransform: 'none',
                  }}
                >
                  {loadingSignup ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign Up'}
                </Button>
              </motion.div>
              <Box mt={2} textAlign="center">
                <Typography variant="body2" sx={{ color: '#ff5722' }}>or</Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%', marginTop: '10px' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignup}
                    disabled={loadingGoogle}
                    sx={{
                      borderColor: '#ff5722',
                      color: '#ff5722',
                      borderRadius: '50px',
                      padding: '10px 0',
                      fontSize: '16px',
                      textTransform: 'none',
                    }}
                  >
                    {loadingGoogle ? <CircularProgress size={24} sx={{ color: '#ff5722' }} /> : 'Sign Up with Google'}
                  </Button>
                </motion.div>
                <Link to="/" style={{ textDecoration: 'none', color: '#ff5722', marginTop: '20px', display: 'block' }}>
                  Already have an account? Login
                </Link>
              </Box>
            </form>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Signup;
