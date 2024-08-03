import { SxProps } from '@mui/material';
import { styled } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';

export const containerStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
};

export const paperStyle = (isMobile: boolean): SxProps => ({
  padding: isMobile ? '20px' : '30px',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
});

export const avatarStyle = (isMobile: boolean): SxProps => ({
  margin: '10px',
  backgroundColor: '#ff5722',
  width: isMobile ? 40 : 56,
  height: isMobile ? 40 : 56,
});

export const typographyStyle = (isMobile: boolean): SxProps => ({
  color: '#ff5722',
  fontSize: isMobile ? '1.2rem' : '1.5rem',
});

export const buttonStyle = (isMobile: boolean): SxProps => ({
  marginTop: '20px',
  backgroundColor: '#ff5722',
  color: '#fff',
  borderRadius: '50px',
  padding: isMobile ? '8px 0' : '10px 0',
  fontSize: isMobile ? '0.9rem' : '1rem',
  textTransform: 'none',
  '&:focus': {
    outline: '2px solid #ff5722',
    outlineOffset: '2px',
  },
});

export const textFieldStyle = (isMobile: boolean): SxProps => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ff5722',
    },
    '&:hover fieldset': {
      borderColor: '#ff5722',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ff5722',
    },
  },
  '& .MuiInputLabel-outlined': {
    color: '#ff5722',
  },
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: '#ff5722',
  },
  fontSize: isMobile ? '0.8rem' : '1rem',
});

export const linkStyle = (isMobile: boolean): SxProps => ({
  textDecoration: 'none',
  color: '#ff5722',
  marginTop: '20px',
  display: 'block',
  textAlign: 'center',
  fontSize: isMobile ? '0.8rem' : '1rem',
});

export const StyledRouterLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: 'none',
  color: '#ff5722',
  marginTop: '20px',
  display: 'block',
  textAlign: 'center',
  fontSize: '1rem',
}));
