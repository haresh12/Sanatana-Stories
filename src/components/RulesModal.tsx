import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface RulesModalProps {
    open: boolean;
    handleClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ open, handleClose }) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                style: {
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', color: '#ff5722', textAlign: 'center' }}>
                Community Rules
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: '#555', textAlign: 'center' }}>
                    <Box component="div" sx={{ mb: 2 }}>
                        Welcome to the Community Chat! Please adhere to the following rules:
                    </Box>
                    <Box component="ul" sx={{ textAlign: 'left' }}>
                        <Box component="li">No abusive language.</Box>
                        <Box component="li">Focus on spiritual topics.</Box>
                        <Box component="li">Respect everyone's opinion.</Box>
                        <Box component="li">No spamming or advertising.</Box>
                        <Box component="li">Maintain a friendly environment.</Box>
                    </Box>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        sx={{
                            backgroundColor: '#ff5722',
                            color: '#fff',
                            borderRadius: '50px',
                            padding: '10px 20px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                        }}
                    >
                        Agree
                    </Button>
                </motion.div>
            </DialogActions>
        </Dialog>
    );
};

export default RulesModal;
