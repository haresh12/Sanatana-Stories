import React, { useState } from 'react';
import { Container, AppBar, Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import UnderstandAndSaveMeanings from '../components/UnderstandAndSaveMeanings';
import MobileUnderstandMeanings from '../components/UnderstandAndSaveMeanings/MobileUnderstandMeanings';
import StartChantingAndAnalysis from '../components/StartChantingAndAnalysis';
import BackButton from '../components/BackButton';
import { STRINGS } from '../const/strings';

const HanumanChalisa: React.FC = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '20px', paddingBottom: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <BackButton />
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          style={{ width: '100%', marginTop: isMobile ? 40 : 0 }}
        >
          <AppBar position="static" sx={{ borderRadius: '15px', backgroundColor: '#ff5722' }}>
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
                  fontSize: { xs: '12px', sm: '14px', md: '16px' },
                  minWidth: { xs: '80px', sm: '100px' },
                  padding: { xs: '6px 12px', sm: '8px 16px' },
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
              aria-label={STRINGS.hanumanChalisaTabs}
            >
              <Tab
                label={STRINGS.understandMeaningsTab}
                id="tab-0"
                aria-controls="tabpanel-0"
                sx={{
                  border: value === 0 ? '2px solid white' : 'none',
                  borderRadius: '10px',
                }}
              />
              <Tab
                label={STRINGS.chantAndAnalyzeTab}
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
      </Box>
      <Box sx={{ flex: 1, width: '100%' }}>
        <div role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0" hidden={value !== 0}>
          {value === 0 && (isMobile ? <MobileUnderstandMeanings /> : <UnderstandAndSaveMeanings />)}
        </div>
        <div role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1" hidden={value !== 1}>
          {value === 1 && <StartChantingAndAnalysis />}
        </div>
      </Box>
    </Container>
  );
};

export default HanumanChalisa;
