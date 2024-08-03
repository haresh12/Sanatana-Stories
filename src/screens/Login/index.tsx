import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db, remoteConfig } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, Avatar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/authSlice';
import { RootState } from '../../store';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import WhyThisProduct from '../../components/WhyThisProduct';
import { fetchAndActivate, getValue } from 'firebase/remote-config';
import {
  containerStyle,
  paperStyle,
  avatarStyle,
  typographyStyle,
  buttonStyle,
  textFieldStyle,
  linkStyle,
  whyProductTextStyle,
  StyledRouterLink,
} from './styles';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });
  const [showWhyProduct, setShowWhyProduct] = useState(false);

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

  useEffect(() => {
    const fetchRemoteConfig = async () => {
      try {
        await fetchAndActivate(remoteConfig);
        const showWhyProductConfig = getValue(remoteConfig, 'show_why_product').asBoolean();
        setShowWhyProduct(showWhyProductConfig);
      } catch (error) {
        console.error('Error fetching remote config:', error);
      }
    };

    fetchRemoteConfig();
  }, []);

  const validateInputs = () => {
    let valid = true;
    const errors = {
      email: '',
      password: '',
    };

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
    }

    setValidationErrors(errors);
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) {
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dispatch(setUser(userCredential.user));
      navigate('/dashboard');
    } catch (error: any) {
      handleFirebaseError(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = doc(db, 'users', user.uid);
      const userDocSnapshot = await getDoc(userDoc);

      if (!userDocSnapshot.exists()) {
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }

      dispatch(setUser(user));
      navigate('/dashboard');
    } catch (error: any) {
      handleFirebaseError(error);
    }
  };

  const handleFirebaseError = (error: any) => {
    let errorMessage = 'An unknown error occurred. Please try again.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email. Please sign up first.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'The email address is not valid.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'The Google sign-in popup was closed before completing the sign-in. Please try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Multiple popup requests. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    setError(errorMessage);
  };

  const handleOpenWhyThisProduct = () => {
    const element = document.getElementById('why-this-product-container');
    if (element) {
      element.style.display = 'block';
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ ...containerStyle, padding: isMobile ? '10px' : '20px' }}>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Paper elevation={10} component="section" sx={paperStyle(isMobile)}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={avatarStyle(isMobile)}>
              <LockOutlinedIcon aria-hidden="true" sx={{ fontSize: isMobile ? 20 : 24 }} />
            </Avatar>
            <Typography component="h1" variant="h5" sx={typographyStyle(isMobile)}>
              Login
            </Typography>
            {error && (
              <Alert role="alert" severity="error" sx={{ marginTop: '10px' }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleLogin} style={{ marginTop: '20px', width: '100%' }} aria-label="Login form">
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
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                InputProps={{ style: { color: '#000' } }}
                sx={textFieldStyle(isMobile)}
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
                InputProps={{ style: { color: '#000' } }}
                sx={textFieldStyle(isMobile)}
                aria-describedby="password-helper-text"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%' }}>
                <Button type="submit" variant="contained" fullWidth sx={buttonStyle(isMobile)}>
                  Login
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
                    startIcon={<GoogleIcon aria-hidden="true" />}
                    onClick={handleGoogleLogin}
                    sx={buttonStyle(isMobile)}
                  >
                    Login with Google
                  </Button>
                </motion.div>
                <StyledRouterLink to="/signup" sx={linkStyle(isMobile)} aria-label="Don't have an account? Sign Up">
                  Don't have an account? Sign Up
                </StyledRouterLink>
                {showWhyProduct && (
                  <Typography sx={whyProductTextStyle(isMobile)} onClick={handleOpenWhyThisProduct}>
                    Why this product and its use cases?
                  </Typography>
                )}
              </Box>
            </form>
          </Box>
        </Paper>
      </motion.div>
      <Box id="why-this-product-container" sx={{ display: 'none', marginTop: '20px' }}>
        <WhyThisProduct />
      </Box>
    </Container>
  );
};

export default Login;
