import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { dialogPaperStyles, dialogTitleStyles, dialogContentTextStyles, listItemStyles, dialogActionsStyles, buttonStyles } from './styles';
import { RulesModalProps } from './types';

const RulesModal: React.FC<RulesModalProps> = ({ open, handleClose }) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{ style: dialogPaperStyles }}
            aria-labelledby="community-rules-title"
            aria-describedby="community-rules-description"
        >
            <DialogTitle id="community-rules-title" sx={dialogTitleStyles}>
                Community Rules
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="community-rules-description" sx={dialogContentTextStyles}>
                    <Box component="div" sx={{ mb: 2 }}>
                        Welcome to the Community Chat! Please adhere to the following rules:
                    </Box>
                    <Box component="ul" sx={{ textAlign: 'left' }}>
                        <Box component="li" sx={listItemStyles}>No abusive language.</Box>
                        <Box component="li" sx={listItemStyles}>Focus on spiritual topics.</Box>
                        <Box component="li" sx={listItemStyles}>Respect everyone's opinion.</Box>
                        <Box component="li" sx={listItemStyles}>No spamming or advertising.</Box>
                        <Box component="li" sx={listItemStyles}>Maintain a friendly environment.</Box>
                    </Box>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={dialogActionsStyles}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        sx={buttonStyles}
                    >
                        Agree
                    </Button>
                </motion.div>
            </DialogActions>
        </Dialog>
    );
};

export default RulesModal;
