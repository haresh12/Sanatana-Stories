import React, { useEffect, useState } from 'react';
import { Container, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';
import BackButton from '../../components/BackButton';
import ChatComponent from '../../components/ChatComponent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setActiveEpicsChat } from '../../store/epicsChatSlice';
import { clearChats, loadInitialMessages } from './utils';
import { tabContainerStyle, loadingContainerStyle, containerStyle, tabPanelStyle } from './styles';

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
  [theme.breakpoints.down('sm')]: {
    minWidth: '80px',
    fontSize: '0.8rem',
  },
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
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
}));

const Epic: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      clearChats(currentUser, dispatch).then(() => loadInitialMessages(currentUser, dispatch)).then(() => setLoading(false));
    }
  }, [dispatch, currentUser]);

  if (loading) {
    return (
      <Container
        component="main"
        maxWidth="lg"
        sx={loadingContainerStyle}
        role="status"
        aria-live="polite"
      >
        <CircularProgress aria-label="Loading" />
      </Container>
    );
  }

  return (
    <>
      <BackButton />
      <Container
        component="main"
        maxWidth="lg"
        sx={containerStyle}
        role="main"
        aria-label="Epic Chat"
      >
        <Box sx={tabContainerStyle}>
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
            sx={tabPanelStyle}
          >
            <ChatComponent chatType="ramayan" />
          </Box>
        )}
        {tabIndex === 1 && (
          <Box
            id="tabpanel-1"
            role="tabpanel"
            aria-labelledby="tab-1"
            sx={tabPanelStyle}
          >
            <ChatComponent chatType="mahabharat" />
          </Box>
        )}
        {tabIndex === 2 && (
          <Box
            id="tabpanel-2"
            role="tabpanel"
            aria-labelledby="tab-2"
            sx={tabPanelStyle}
          >
            <ChatComponent chatType="puranas" />
          </Box>
        )}
        <style>
          {`
          @keyframes dotElastic {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
          }
          .dot-elastic {
            width: 8px; height: 8px; background-color: #fff; border-radius: 50%; animation: dotElastic 0.6s infinite;
          }
          .dot-elastic:nth-of-type(1) { animation-delay: 0s; }
          .dot-elastic:nth-of-type(2) { animation-delay: 0.1s; }
          .dot-elastic:nth-of-type(3) { animation-delay: 0.2s; }
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
          }
        `}
        </style>
      </Container>
    </>
  );
};

export default Epic;
