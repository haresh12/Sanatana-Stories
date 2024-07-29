import React, { useEffect, useState } from 'react';
import { Container, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import BackButton from '../components/BackButton';
import ChatComponent from '../components/ChatComponent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setActiveEpicsChat, clearAllEpicsMessages, setEpicsMessages } from '../store/epicsChatSlice';
import { collection, deleteDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';

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
      };

      const loadInitialMessages = async () => {
        const chatTypes = ['ramayan', 'mahabharat', 'puranas'];
        const loadMessagePromises = chatTypes.map(async chatType => {
          const handleChat = httpsCallable(functions, `${chatType}Chat`);
          const response = await handleChat({ userId: currentUser.uid, message: '' });
          const responseData = response.data as { message: string, audioUrl: string };
          dispatch(setEpicsMessages({ chatType, messages: [{ role: 'model', message: responseData.message, audioUrl: responseData.audioUrl }] }));
        });

        await Promise.all(loadMessagePromises);
        setLoading(false);
      };

      clearChats().then(loadInitialMessages);
    }
  }, [dispatch, currentUser]);

  if (loading) {
    return (
      <Container
        component="main"
        maxWidth="lg"
        style={{
          paddingTop: '40px',
          paddingBottom: '40px',
          position: 'relative',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress aria-label="Loading" />
      </Container>
    );
  }

  return (
    <Container
      component="main"
      maxWidth="lg"
      style={{ paddingTop: '20px', paddingBottom: '20px', position: 'relative', height: '100vh' }}
      role="main"
      aria-label="Epic Chat"
    >
      <BackButton />
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <StyledTabs
          value={tabIndex}
          onChange={handleTabChange}
          centered
          aria-label="Epic Chat Tabs"
        >
          <StyledTab label="Ramayan" id="tab-0" aria-controls="tabpanel-0" />
          <StyledTab label="Mahabharat" id="tab-1" aria-controls="tabpanel-1" />
          <StyledTab label="Hindu Puranas" id="tab-2" aria-controls="tabpanel-2" />
        </StyledTabs>
      </Box>
      {tabIndex === 0 && (
        <Box
          id="tabpanel-0"
          role="tabpanel"
          aria-labelledby="tab-0"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <ChatComponent chatType="ramayan" />
        </Box>
      )}
      {tabIndex === 1 && (
        <Box
          id="tabpanel-1"
          role="tabpanel"
          aria-labelledby="tab-1"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <ChatComponent chatType="mahabharat" />
        </Box>
      )}
      {tabIndex === 2 && (
        <Box
          id="tabpanel-2"
          role="tabpanel"
          aria-labelledby="tab-2"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <ChatComponent chatType="puranas" />
        </Box>
      )}
      <style>
        {`
      @keyframes dotElastic {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.5);
        }
        100% {
          transform: scale(1);
        }
      }
      .dot-elastic {
        width: 8px;
        height: 8px;
        background-color: #fff;
        border-radius: 50%;
        animation: dotElastic 0.6s infinite;
      }
      .dot-elastic:nth-of-type(1) {
        animation-delay: 0s;
      }
      .dot-elastic:nth-of-type(2) {
        animation-delay: 0.1s;
      }
      .dot-elastic:nth-of-type(3) {
        animation-delay: 0.2s;
      }
      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
        }
        70% {
          transform: scale(1.1);
          box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
      }
    `}
      </style>
    </Container>
  );
};

export default Epic;
