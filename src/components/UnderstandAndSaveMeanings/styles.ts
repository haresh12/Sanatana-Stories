import { styled } from '@mui/system';
import { Tabs, Tab } from '@mui/material';

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#ffffffcc',
  borderRadius: '8px',
  padding: '5px',
  marginBottom: '20px',
  // Mobile-specific styling
  [theme.breakpoints.down('sm')]: {
    marginBottom: '15px',
    padding: '3px',
  },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  '&.Mui-selected': {
    backgroundColor: '#ff5722',
    color: '#fff',
  },
  // Mobile-specific styling
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
  },
}));

export const highlightText = (text: string, savedWords: { [key: string]: string }) => {
  let highlightedText = text;
  Object.keys(savedWords).forEach((savedWord) => {
    const regex = new RegExp(`(${savedWord})`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span style="color: green; font-weight: bold;">$1</span>`);
  });
  return highlightedText;
};

// Mobile-specific modal styles
export const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  borderRadius: '15px',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh', 
  overflowY: 'auto'
};
