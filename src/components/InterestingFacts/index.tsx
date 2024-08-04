import React from 'react';
import { Box } from '@mui/material';
import InterestingFactCard from './InterestingFactCard';

interface InterestingFactsProps {
  templeId: string;
}

const InterestingFacts: React.FC<InterestingFactsProps> = ({ templeId }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <InterestingFactCard templeId={templeId} />
    </Box>
  );
};

export default InterestingFacts;
