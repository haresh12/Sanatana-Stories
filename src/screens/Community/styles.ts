import { SxProps } from '@mui/material';

export const containerStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  justifyContent: 'center',
  backgroundColor: '#f0f0f0',
  padding: { xs: '10px', sm: '20px' },
};

export const boxStyle: SxProps = {
  padding: { xs: '10px', sm: '20px' },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '98vh',
  borderRadius: '20px',
  boxShadow: 4,
  backgroundColor: '#ffffff',
};

export const messageContainerStyle: SxProps = {
  flex: 1,
  overflowY: 'auto',
  padding: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 1, sm: 2 },
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

export const messageBoxStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  mb: { xs: 0.5, sm: 1 },
};

export const messageContentStyle = (user: boolean): SxProps => ({
  maxWidth: '75%',
  bgcolor: user ? '#ff5722' : '#4caf50',
  color: '#fff',
  p: 2,
  borderRadius: '20px',
  wordWrap: 'break-word',
  textAlign: 'left',
  alignSelf: user ? 'flex-end' : 'flex-start',
});

export const inputContainerStyle: SxProps = {
  display: 'flex',
  mt: 1,
  alignItems: 'center',
};

export const inputFieldStyle: SxProps = {
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

export const sendButtonStyle = (loading: boolean): SxProps => ({
  borderRadius: '50%',
  padding: { xs: '8px', sm: '10px' },
  backgroundColor: '#ff5722',
  color: '#fff',
  minWidth: 48,
  height: 48,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  ...(loading && { position: 'relative' }),
});

export const speechButtonStyle = (isListening: boolean): SxProps => ({
  marginLeft: 1,
  borderRadius: '50%',
  padding: { xs: '8px', sm: '10px' },
  backgroundColor: '#ff5722',
  color: '#fff',
  minWidth: 48,
  height: 48,
  animation: isListening ? 'pulse 1.5s infinite' : 'none',
});
