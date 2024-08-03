import { SxProps } from '@mui/system';

export const generateButtonStyle: SxProps = {
  backgroundColor: '#ff5722',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: '30px',
  marginBottom: 4,
  padding: '10px 30px',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#e64a19',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
};

export const resultCardStyle: SxProps = {
  marginTop: 0,
  backgroundColor: '#ffe0b2',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  borderRadius: '20px',
  padding: '20px',
};

export const loadingContainerStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};

export const loaderMessageStyle: SxProps = {
  color: '#ff5722',
  fontWeight: 'bold',
  fontSize: '20px',
  marginTop: 2,
};

export const styledTabStyle: SxProps = {
  fontWeight: 'bold',
  minWidth: '160px',
  padding: 1,
  '&.Mui-selected': {
    color: '#ff5722',
  },
  '&:hover': {
    color: '#ff5722',
  },
  transition: 'color 0.3s',
};

export const styledTabsStyle: SxProps = {
  backgroundColor: 'background.paper',
  borderRadius: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'auto',
  '& .MuiTabs-indicator': {
    backgroundColor: '#ff5722',
    height: '4px',
    borderRadius: '4px',
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
  },
  marginBottom: 2,
};
import { Button, Card, Box, Typography, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/system';

export const GenerateButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff5722',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: '30px',
  marginBottom: theme.spacing(4),
  padding: '10px 30px',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#e64a19',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
}));

export const ResultCard = styled(Card)(({ theme }) => ({
  marginTop: 0,
  backgroundColor: '#ffe0b2',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  borderRadius: '20px',
  padding: '20px',
}));

export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignSelf: 'center',
  textAlign: 'center',
  alignItems: 'center',
  height: '100vh',
}));

export const LoaderMessage = styled(Typography)(({ theme }) => ({
  color: '#ff5722',
  fontWeight: 'bold',
  fontSize: '20px',
  marginTop: theme.spacing(2),
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  minWidth: '160px',
  padding: theme.spacing(1, 2),
  '&.Mui-selected': {
    color: '#ff5722',
  },
  '&:hover': {
    color: '#ff5722',
  },
  transition: 'color 0.3s',
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'auto',
  '& .MuiTabs-indicator': {
    backgroundColor: '#ff5722',
    height: '4px',
    borderRadius: '4px'
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
  },
  marginBottom: theme.spacing(2)
}));
