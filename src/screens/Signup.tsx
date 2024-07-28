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
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    name: ''
  });

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

  const validateInputs = () => {
    let valid = true;
    const errors = {
      email: '',
      password: '',
      name: ''
    };

    if (!name) {
      errors.name = 'Name is required';
      valid = false;
    }

    if (!email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid';
      valid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setValidationErrors(errors);
    return valid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) {
      return;
    }

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
    } catch (error: any) {
      handleFirebaseError(error);
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
    } catch (error: any) {
      handleFirebaseError(error);
    }
    setLoadingGoogle(false);
  };

  const handleFirebaseError = (error: any) => {
    let errorMessage = 'An unknown error occurred. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already in use. Please try another one.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'The email address is not valid.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/password accounts are not enabled.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'The password is too weak.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'The Google sign-in popup was closed before completing the sign-in. Please try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Multiple popup requests. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    setError(errorMessage);
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
    <Paper
      elevation={10}
      component="section"
      sx={{ padding: isMobile ? '20px' : '30px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <Avatar sx={{ margin: '10px', backgroundColor: '#ff5722' }}>
          <LockOutlinedIcon aria-hidden="true" />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ color: '#ff5722' }}>
          Sign Up
        </Typography>
        {error && (
          <Alert role="alert" severity="error" sx={{ marginTop: '10px' }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSignup} style={{ marginTop: '20px', width: '100%' }} aria-label="Signup form">
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
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            InputProps={{
              style: {
                color: '#000',
              },
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
            aria-describedby="name-helper-text"
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
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            InputProps={{
              style: {
                color: '#000',
              },
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
            aria-describedby="email-helper-text"
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
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            InputProps={{
              style: {
                color: '#000',
              },
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
            aria-describedby="password-helper-text"
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
                '&:focus': {
                  outline: '2px solid #ff5722',
                  outlineOffset: '2px',
                },
              }}
            >
              {loadingSignup ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign Up'}
            </Button>
          </motion.div>
          <Box mt={2} textAlign="center">
            <Typography variant="body2" sx={{ color: '#ff5722' }}>
              or
            </Typography>
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
                  '&:focus': {
                    outline: '2px solid #ff5722',
                    outlineOffset: '2px',
                  },
                }}
              >
                {loadingGoogle ? <CircularProgress size={24} sx={{ color: '#ff5722' }} /> : 'Sign Up with Google'}
              </Button>
            </motion.div>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: '#ff5722',
                marginTop: '20px',
                display: 'block',
                textAlign: 'center',
              }}
              aria-label="Already have an account? Login"
            >
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
