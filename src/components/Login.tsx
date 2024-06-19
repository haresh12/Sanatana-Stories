// src/components/Login.tsx

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, Avatar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/authSlice';
import { RootState } from '../store';
import GoogleIcon from '@mui/icons-material/Google';

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
      dispatch(setUser(result.user));
      navigate('/dashboard');
    } catch (error) {
      setError('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Paper elevation={10} style={{ padding: '30px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar style={{ margin: '10px', backgroundColor: '#4e54c8' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" style={{ color: '#4e54c8' }}>
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
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%' }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  style={{
                    marginTop: '20px',
                    backgroundColor: '#4e54c8',
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
                <Typography variant="body2" style={{ color: '#4e54c8' }}>or</Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%', marginTop: '10px' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleLogin}
                    style={{
                      borderColor: '#4e54c8',
                      color: '#4e54c8',
                      borderRadius: '50px',
                      padding: '10px 0',
                      fontSize: '16px',
                      textTransform: 'none',
                    }}
                  >
                    Login with Google
                  </Button>
                </motion.div>
                <Link to="/signup" style={{ textDecoration: 'none', color: '#4e54c8', marginTop: '20px', display: 'block' }}>
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
