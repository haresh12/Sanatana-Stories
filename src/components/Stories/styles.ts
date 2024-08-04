import { SxProps, Theme } from '@mui/material';

export const cardStyles = (isMobile: boolean): SxProps<Theme> => ({
  mt: 2,
  p: isMobile ? 1 : 2,
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  borderRadius: '15px',
  backgroundColor: '#fff',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
  margin: isMobile ? '10px 0' : '20px 0',
});

export const buttonStyles = (isMobile: boolean, bgColor: string, hoverColor: string): SxProps<Theme> => ({
  backgroundColor: bgColor,
  borderRadius: '30px',
  padding: isMobile ? '8px 20px' : '10px 30px',
  fontSize: isMobile ? '12px' : '16px',
  '&:hover': {
    backgroundColor: hoverColor,
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
});

export const audioLoadingState = (isMobile: boolean): SxProps<Theme> => ({
  backgroundColor: '#81c784',
  borderRadius: '30px',
  padding: isMobile ? '8px 20px' : '10px 30px',
  fontSize: isMobile ? '12px' : '16px',
  '&:hover': {
    backgroundColor: '#66bb6a',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
});

export const cardContentStyles: SxProps<Theme> = {
  overflowY: 'auto',
  flex: '1 1 auto',
};

export const cardActionsStyles = (isMobile: boolean): SxProps<Theme> => ({
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: isMobile ? 1 : 2,
});

export const errorBoxStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexGrow: 1,
};
