import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Tabs, Tab, Typography, CircularProgress } from '@mui/material';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Stories from '../components/Stories';
import Chat from '../components/Chat';
import InterestingFacts from '../components/InterestingFacts';
import { styled } from '@mui/system';

interface Temple {
  name: string;
  description: string;
  image: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other }
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  width: '400px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#ff5722',
    height: '4px',
    borderRadius: '4px'
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
  },
  marginBottom: theme.spacing(2)
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  minWidth: '100px',
  padding: theme.spacing(1, 2),
  '&.Mui-selected': {
    color: '#ff5722',
  },
  '&:hover': {
    color: '#ff5722',
  },
  transition: 'color 0.3s',
}));

const TempleDetail: React.FC = () => {
  const { templeId } = useParams<{ templeId: string }>();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<string>('');

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
      <Box sx={{ mb: -5, align: "center", marginLeft: 45 }}>
        <StyledTabs value={value} onChange={handleChange} aria-label="temple details tabs" centered>
          <StyledTab label="Stories" />
          <StyledTab label="Chat" />
          <StyledTab label="Interesting Facts" />
        </StyledTabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Stories templeName={`${temple?.name}`} initialStory={story} setStory={setStory} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Chat templeName={`${temple?.name}`} templeId={`${templeId}`}/>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <InterestingFacts templeId={templeId || ''} />
      </TabPanel>
    </Container>
  );
};

export default TempleDetail;
