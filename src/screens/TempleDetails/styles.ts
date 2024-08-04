import { styled } from '@mui/system';
import { Tabs, Tab } from '@mui/material';

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
