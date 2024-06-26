// src/components/RulesModal.tsx

import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Typography } from '@mui/material';

interface RulesModalProps {
  open: boolean;
  handleClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="rules-dialog-title"
      aria-describedby="rules-dialog-description"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="rules-dialog-title">
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff5722' }}>
          Community Chat Rules
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="rules-dialog-description" sx={{ fontSize: '1.1rem', color: '#333' }}>
          Welcome to the Community Chat! Please adhere to the following rules to maintain a respectful and engaging environment:
          <ul>
            <li>No abusive or offensive language.</li>
            <li>Respect everyone's opinions and beliefs.</li>
            <li>Keep discussions focused on spiritual topics.</li>
            <li>Avoid spamming the chat with repetitive messages.</li>
            <li>Be supportive and encouraging towards other members.</li>
            <li>Any form of discrimination or harassment will not be tolerated.</li>
            <li>Follow all community guidelines and terms of service.</li>
          </ul>
          Thank you for being a part of our community!
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ backgroundColor: '#ff5722', color: '#fff', '&:hover': { backgroundColor: '#e64a19' } }}>
          I Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RulesModal;
