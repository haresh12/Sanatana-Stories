import React, { useEffect, useState } from 'react';
import { Container, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import BackButton from '../components/BackButton';
import ChatComponent from '../components/ChatComponent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setActiveEpicsChat, clearAllEpicsMessages } from '../store/epicsChatSlice';
import { collection, deleteDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  minWidth: '160px',
  padding: theme.spacing(1, 2),
  '&.Mui-selected': {
    color: '#ff5722',
  },
  '&:hover': {
    color: '#ff5722',
  },
  transition: 'color 0.3s',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'auto',
  '& .MuiTabs-indicator': {
    backgroundColor: '#ff5722',
    height: '4px',
    borderRadius: '4px',
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
  },
  marginBottom: theme.spacing(2),
}));

const Epic: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
    if (newValue === 0) {
      dispatch(setActiveEpicsChat('ramayan'));
    } else if (newValue === 1) {
      dispatch(setActiveEpicsChat('mahabharat'));
    } else if (newValue === 2) {
      dispatch(setActiveEpicsChat('puranas'));
    }
  };

  useEffect(() => {
    if (currentUser) {
      const clearChats = async () => {
        const chatTypes = ['ramayanChat', 'mahabharatChat', 'puranasChat'];
        const promises = chatTypes.map(async chatType => {
          const chatCollection = collection(db, 'users', currentUser.uid, chatType);
          const chatDocs = await getDocs(query(chatCollection));
          const deletePromises = chatDocs.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
        });
        await Promise.all(promises);

        dispatch(clearAllEpicsMessages());
        setLoading(false);
      };

      clearChats();
    }
  }, [dispatch, currentUser]);

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ paddingTop: '40px', paddingBottom: '40px', position: 'relative', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ paddingTop: '20px', paddingBottom: '20px', position: 'relative', height: '100vh' }}>
      <BackButton />
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <StyledTabs value={tabIndex} onChange={handleTabChange} centered>
          <StyledTab label="Ramayan" />
          <StyledTab label="Mahabharat" />
          <StyledTab label="Hindu Puranas" />
        </StyledTabs>
      </Box>
      {tabIndex === 0 && (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <ChatComponent chatType="ramayan" />
        </Box>
      )}
      {tabIndex === 1 && (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <ChatComponent chatType="mahabharat" />
        </Box>
      )}
      {tabIndex === 2 && (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <ChatComponent chatType="puranas" />
        </Box>
      )}
    </Container>
  );
};

export default Epic;
