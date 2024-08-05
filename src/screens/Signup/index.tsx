import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, Avatar, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { handleSignup, handleGoogleSignup } from './utils';
import { STRINGS } from '../../const/strings';
import {
  containerStyle,
  paperStyle,
  avatarStyle,
  typographyStyle,
  buttonStyle,
  textFieldStyle,
  linkStyle,
  StyledRouterLink,
} from './styles';

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
    name: '',
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
      name: '',
    };

    if (!name) {
      errors.name = STRINGS.nameRequired;
      valid = false;
    }

    if (!email) {
      errors.email = STRINGS.emailRequired;
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = STRINGS.emailInvalid;
      valid = false;
    }

    if (!password) {
      errors.password = STRINGS.passwordRequired;
      valid = false;
    } else if (password.length < 6) {
      errors.password = STRINGS.passwordMinLength;
      valid = false;
    }

    setValidationErrors(errors);
    return valid;
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
              {STRINGS.signup}
            </Typography>
            {error && (
              <Alert role="alert" severity="error" sx={{ marginTop: '10px' }}>
                {error}
              </Alert>
            )}
            <form
              onSubmit={(e) =>
                handleSignup(e, email, password, name, dispatch, navigate, setError, setLoadingSignup, validateInputs)
              }
              style={{ marginTop: '20px', width: '100%' }}
              aria-label="Signup form"
            >
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="name"
                label={STRINGS.name}
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setUserName(e.target.value)}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                InputProps={{ style: { color: '#000' } }}
                sx={textFieldStyle(isMobile)}
                aria-describedby="name-helper-text"
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label={STRINGS.emailAddress}
                name="email"
                autoComplete="email"
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
                label={STRINGS.password}
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
                <Button type="submit" variant="contained" fullWidth disabled={loadingSignup} sx={buttonStyle(isMobile)}>
                  {loadingSignup ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : STRINGS.signup}
                </Button>
              </motion.div>
              <Box mt={2} textAlign="center">
                <Typography variant="body2" sx={{ color: '#ff5722' }}>
                  {STRINGS.or}
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%', marginTop: '10px' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<GoogleIcon aria-hidden="true" />}
                    onClick={() => handleGoogleSignup(dispatch, navigate, setError, setLoadingGoogle)}
                    disabled={loadingGoogle}
                    sx={buttonStyle(isMobile)}
                  >
                    {loadingGoogle ? <CircularProgress size={24} sx={{ color: '#ff5722' }} /> : STRINGS.signupWithGoogle}
                  </Button>
                </motion.div>
                <StyledRouterLink to="/" sx={linkStyle(isMobile)} aria-label={STRINGS.alreadyHaveAccount}>
                  {STRINGS.alreadyHaveAccount}
                </StyledRouterLink>
              </Box>
            </form>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Signup;
