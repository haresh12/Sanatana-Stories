
import { SxProps, Theme } from '@mui/system';

export const containerStyle: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

export const chatBoxStyle: SxProps<Theme> = {
  padding: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  mt: 4,
  height: '80vh',
  borderRadius: '20px',
  boxShadow: 4,
  backgroundColor: '#ffffff',
};

export const messagesContainerStyle: SxProps<Theme> = {
  flex: 1,
  overflowY: 'auto',
  padding: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

export const messageStyle = (isUser: boolean): SxProps<Theme> => ({
  maxWidth: '75%',
  bgcolor: isUser ? '#ff5722' : '#4caf50',
  color: '#fff',
  p: 2,
  borderRadius: '20px',
  wordWrap: 'break-word',
});

export const inputBoxStyle: SxProps<Theme> = {
  display: 'flex',
  mt: 1,
};

export const textFieldStyle: SxProps<Theme> = {
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
};

export const iconButtonStyle = (isListening: boolean): SxProps<Theme> => ({
  borderRadius: '50%',
  padding: '10px',
  backgroundColor: isListening ? '#ff5722' : '#e0e0e0',
  color: '#fff',
  ml: 1,
  animation: isListening ? 'pulse 1s infinite' : 'none',
});
