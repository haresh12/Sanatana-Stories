import { SxProps } from '@mui/material';

export const chatContainer: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  justifyContent: 'center',
  backgroundColor: '#f0f0f0',
  padding: { xs: '8px', sm: '24px' },
};

export const boxStyle: SxProps = {
  padding: { xs: '8px', sm: '24px' },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '98vh',
  borderRadius: '20px',
  boxShadow: 4,
  backgroundColor: '#ffffff',
};

export const mobileTitleStyle: SxProps = {
  fontWeight: 'bold',
  color: '#ff5722',
  marginTop: 4,
};

export const titleStyle: SxProps = {
  fontWeight: 'bold',
  color: '#ff5722',
  marginTop: 2,
};

export const messageContainerStyle: SxProps = {
  flex: 1,
  overflowY: 'auto',
  padding: { xs: '8px', sm: '16px' },
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: '8px', sm: '16px' },
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

export const messageBoxStyle: SxProps = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: { xs: '8px', sm: '16px' },
};

export const messageContentStyle: SxProps = {
  maxWidth: '75%',
  color: '#fff',
  padding: { xs: '8px', sm: '16px' },
  borderRadius: '20px',
  wordWrap: 'break-word',
};

export const audioButtonStyle: SxProps = {
  marginLeft: 1,
  borderRadius: '50%',
  color: '#fff',
  padding: 1,
  '&:hover': { backgroundColor: '#388e3c' },
};

export const typingBoxStyle: SxProps = {
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: 1,
};

export const typingContentStyle: SxProps = {
  maxWidth: '75%',
  backgroundColor: '#4caf50',
  color: '#000',
  padding: 2,
  borderRadius: '20px',
  wordWrap: 'break-word',
};

export const typingDotsStyle: SxProps = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '40px',
  height: '11px',
};

export const inputContainerStyle: SxProps = {
  display: 'flex',
  marginTop: 1,
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

export const sendButtonStyle: SxProps = {
  borderRadius: '50%',
  padding: '10px',
  backgroundColor: '#ff5722',
  color: '#fff',
  marginLeft: 1,
};

export const speechButtonStyle: SxProps = {
  borderRadius: '50%',
  padding: '10px',
  marginLeft: 1,
};
