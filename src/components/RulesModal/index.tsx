import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { dialogPaperStyles, dialogTitleStyles, dialogContentTextStyles, listItemStyles, dialogActionsStyles, buttonStyles } from './styles';
import { RulesModalProps } from './types';
import { STRINGS } from '../../const/strings';

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
                {STRINGS.communityRulesTitle}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="community-rules-description" sx={dialogContentTextStyles}>
                    <Box component="div" sx={{ mb: 2 }}>
                        {STRINGS.communityRulesDescription}
                    </Box>
                    <Box component="ul" sx={{ textAlign: 'left' }}>
                        <Box component="li" sx={listItemStyles}>{STRINGS.ruleNoAbusiveLanguage}</Box>
                        <Box component="li" sx={listItemStyles}>{STRINGS.ruleFocusOnSpiritualTopics}</Box>
                        <Box component="li" sx={listItemStyles}>{STRINGS.ruleRespectOpinions}</Box>
                        <Box component="li" sx={listItemStyles}>{STRINGS.ruleNoSpamming}</Box>
                        <Box component="li" sx={listItemStyles}>{STRINGS.ruleMaintainFriendlyEnvironment}</Box>
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
                        {STRINGS.buttonAgree}
                    </Button>
                </motion.div>
            </DialogActions>
        </Dialog>
    );
};

export default RulesModal;
