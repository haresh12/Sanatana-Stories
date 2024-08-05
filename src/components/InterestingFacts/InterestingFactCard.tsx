import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { cardStyles, cardContentStyles, headerStyles, bodyStyles } from './styles';
import { STRINGS } from '../../const/strings';

interface InterestingFactCardProps {
  templeId: string;
}

const InterestingFactCard: React.FC<InterestingFactCardProps> = ({ templeId }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card sx={cardStyles} aria-label={`${STRINGS.interestingFactsAbout} ${templeId}`}>
        <CardContent sx={cardContentStyles}>
          <Typography variant="h6" sx={headerStyles} aria-label={`${STRINGS.interestingFactsHeader} ${templeId}`}>
            {STRINGS.interestingFactsAbout} {templeId}
          </Typography>
          <Typography variant="body2" sx={bodyStyles} aria-label={`${STRINGS.interestingFactsContent} ${templeId}`}>
            {STRINGS.interestingFactsContent}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InterestingFactCard;
