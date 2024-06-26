// src/components/Login.tsx

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, Avatar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/authSlice';
import { RootState } from '../store';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dispatch(setUser(userCredential.user));
      navigate('/dashboard');
    } catch (error) {
      setError('Oops! Wrong credentials. Did you forget your password or your username?');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = doc(db, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDoc);

      if (!userDocSnapshot.exists()) {
        // Add user to Firestore if they don't exist
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString()
        });
      }

      dispatch(setUser(user));
      navigate('/dashboard');
    } catch (error) {
      setError('Google Sign-In failed. Please try again.');
    }
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
      }}
    >
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Paper elevation={10} style={{ padding: '30px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar style={{ margin: '10px', backgroundColor: '#ff5722' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" style={{ color: '#ff5722' }}>
              Login
            </Typography>
            {error && <Alert severity="error" style={{ marginTop: '10px' }}>{error}</Alert>}
            <form onSubmit={handleLogin} style={{ marginTop: '20px', width: '100%' }}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
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
                  style={{
                    marginTop: '20px',
                    backgroundColor: '#ff5722',
                    color: '#fff',
                    borderRadius: '50px',
                    padding: '10px 0',
                    fontSize: '16px',
                    textTransform: 'none',
                  }}
                >
                  Login
                </Button>
              </motion.div>
              <Box mt={2} textAlign="center">
                <Typography variant="body2" style={{ color: '#ff5722' }}>or</Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%', marginTop: '10px' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    style={{
                      borderColor: '#ff5722',
                      color: '#ff5722',
                      borderRadius: '50px',
                      padding: '10px 0',
                      fontSize: '16px',
                      textTransform: 'none',
                    }}
                  >
                    Login with Google
                  </Button>
                </motion.div>
                <Link to="/signup" style={{ textDecoration: 'none', color: '#ff5722', marginTop: '20px', display: 'block' }}>
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </form>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Login;
  