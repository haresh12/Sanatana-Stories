import React, { useState } from 'react';
import { Container, AppBar, Tabs, Tab, Box } from '@mui/material';
import { motion } from 'framer-motion';
import UnderstandAndSaveMeanings from '../components/UnderstandAndSaveMeanings';
import StartChantingAndAnalysis from '../components/StartChantingAndAnalysis';
import BackButton from '../components/BackButton';

const HanumanChalisa: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '20px', paddingBottom: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <BackButton />
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <AppBar position="static" sx={{ borderRadius: '15px', marginBottom: '20px', backgroundColor: '#ff5722' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          textColor="inherit"
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
            },
            '& .MuiTab-root': {
              fontWeight: 'bold',
              fontSize: { xs: '10px', sm: '12px', md: '14px' },
              minWidth: { xs: '80px', sm: '100px' },
              padding: { xs: '4px 8px', sm: '6px 12px' },
              marginRight: { xs: '5px', sm: '10px' },
              borderRadius: '10px',
              '&.Mui-selected': {
                border: '2px solid white',
              },
              '&:focus': {
                outline: '2px solid white',
              },
            },
          }}
          aria-label="Hanuman Chalisa Tabs"
        >
          <Tab
            label="Understand Meanings"
            id="tab-0"
            aria-controls="tabpanel-0"
            sx={{
              border: value === 0 ? '2px solid white' : 'none',
              borderRadius: '10px',
            }}
          />
          <Tab
            label="Chant & Analyze"
            id="tab-1"
            aria-controls="tabpanel-1"
            sx={{
              border: value === 1 ? '2px solid white' : 'none',
              borderRadius: '10px',
            }}
          />
        </Tabs>
      </AppBar>
    </motion.div>
    <Box sx={{ flex: 1 }}>
      <div role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0" hidden={value !== 0}>
        {value === 0 && <UnderstandAndSaveMeanings />}
      </div>
      <div role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1" hidden={value !== 1}>
        {value === 1 && <StartChantingAndAnalysis />}
      </div>
    </Box>
  </Container>
  
  );
};

export default HanumanChalisa;
