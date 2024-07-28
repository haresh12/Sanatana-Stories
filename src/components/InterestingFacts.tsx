import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

interface InterestingFactsProps {
  templeId: string;
}

const InterestingFacts: React.FC<InterestingFactsProps> = ({ templeId }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Card 
          sx={{ 
            boxShadow: 3, 
            p: 2, 
            backgroundColor: '#fff', 
            borderRadius: 2 
          }}
          aria-label={`Interesting facts about ${templeId}`}
        >
          <CardContent>
            <Typography 
              variant="h6" 
              sx={{ color: '#ff5722', mb: 1 }}
              aria-label={`Interesting facts header for ${templeId}`}
            >
              Interesting Facts about {templeId}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: '#333' }}
              aria-label={`Interesting facts content for ${templeId}`}
            >
              These are interesting facts about the temple.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default InterestingFacts;
