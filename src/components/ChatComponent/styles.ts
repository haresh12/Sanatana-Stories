import { SxProps, Theme } from '@mui/system';

export const containerStyles = (isMobile: boolean): SxProps<Theme> => ({
  display: 'flex',
  flexDirection: 'column',
  height: isMobile ? '85vh' : '90vh',
  justifyContent: 'center',
});

export const messageBoxStyles = (isUser: boolean, isMobile: boolean): SxProps<Theme> => ({
  maxWidth: '75%',
  bgcolor: isUser ? '#ff5722' : '#4caf50',
  color: '#fff',
  p: 2,
  borderRadius: '20px',
  wordWrap: 'break-word',
  fontSize: isMobile ? '0.875rem' : '1rem',
});

export const inputStyles = (isMobile: boolean): SxProps<Theme> => ({
  mr: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#ff5722',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#ff5722',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#ff5722',
  },
  fontSize: isMobile ? '0.875rem' : '1rem',
});

export const iconButtonStyles = (isMobile: boolean): SxProps<Theme> => ({
  borderRadius: '50%',
  padding: isMobile ? '8px' : '10px',
  backgroundColor: '#ff5722',
  color: '#fff',
  ml: 1,
  fontSize: isMobile ? '1rem' : '1.25rem',
});
