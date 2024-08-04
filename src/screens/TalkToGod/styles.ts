import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';

export const ContainerStyles: SxProps<Theme> = {
  paddingTop: '40px',
  paddingBottom: '40px',
  position: 'relative',
};

export const CardStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '20px',
  borderRadius: '15px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  height: { xs: '275px', sm: '325px' },
  width: '100%',
  maxWidth: { xs: '100%', sm: '350px' },
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
};

export const AvatarStyles: SxProps<Theme> = {
  width: 80,
  height: 80,
  margin: 'auto',
  marginBottom: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.5)',
  },
};

export const CardContentStyles: SxProps<Theme> = {
  flexGrow: 1,
};

export const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' },
};

export const colors = ['#FF7043', '#4FC3F7', '#81C784', '#FF8A65', '#BA68C8', '#64B5F6', '#4DB6AC', '#9575CD', '#E57373'];
