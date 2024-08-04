import { styled } from '@mui/system';
import IconButton from '@mui/material/IconButton';

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: '15px',
  left: '15px',
  zIndex: 1000,
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '5px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  '& svg': {
    fontSize: '20px',
  },
}));
