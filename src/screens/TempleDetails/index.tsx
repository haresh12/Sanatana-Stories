// index.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Stories from '../../components/Stories';
import Chat from '../../components/Chat';
import BackButton from '../../components/BackButton'; 
import { StyledTabs, StyledTab } from './styles';
import { Temple, TabPanelProps } from './types';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TempleDetail: React.FC = () => {
  const { templeId } = useParams<{ templeId: string }>();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);

  useEffect(() => {
    if (!templeId) {
      setError("No temple ID provided");
      setLoading(false);
      return;
    }

    const fetchTemple = async () => {
      try {
        const templeRef = doc(db, 'temples', templeId);
        const templeDoc = await getDoc(templeRef);

        if (!templeDoc.exists()) {
          setError("Temple not found");
          setLoading(false);
          return;
        }

        setTemple(templeDoc.data() as Temple);
      } catch (error) {
        console.error('Error fetching temple:', error);
        setError('Error fetching temple details');
      } finally {
        setLoading(false);
      }
    };

    fetchTemple();
  }, [templeId]);

  useEffect(() => {
    const welcomeMessage = localStorage.getItem(`templeWelcomeMessage_${templeId}`);
    if (welcomeMessage) {
      setChatMessages([{ role: 'model', text: welcomeMessage }]);
    }
  }, [templeId]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    return () => {
      setChatMessages([]);
    };
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="success" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '40px', paddingBottom: '10px', height: '100vh' }}>
      <BackButton />
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <StyledTabs value={value} onChange={handleChange} aria-label="temple details tabs" centered>
          <StyledTab label="Stories" />
          <StyledTab label="Chat" />
        </StyledTabs>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <TabPanel value={value} index={0}>
          <Stories templeId={`${templeId}`} templeName={`${temple?.name}`} initialStory={story} setStory={setStory} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Chat templeName={`${temple?.name}`} templeId={`${templeId}`} initialMessages={chatMessages} setMessages={setChatMessages} />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default TempleDetail;
