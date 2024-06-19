import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';
import { setUser } from '../store/authSlice';

const Dashboard: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(setUser(null));
    navigate('/');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Welcome, {currentUser.email}
      </Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout} fullWidth>
        Logout
      </Button>
    </Container>
  );
};

export default Dashboard;
