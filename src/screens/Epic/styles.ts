import { SxProps } from '@mui/system';

export const tabContainerStyle: SxProps = {
  display: 'flex',
  justifyContent: 'center',
  mb: { xs: 1, sm: 2 },
  mt: { xs: 4, sm: 2 },
};

export const loadingContainerStyle: SxProps = {
  paddingTop: '40px',
  paddingBottom: '40px',
  position: 'relative',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export const containerStyle: SxProps = {
  paddingTop: '20px',
  paddingBottom: '20px',
  position: 'relative',
  height: '100vh',
};

export const tabPanelStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};
