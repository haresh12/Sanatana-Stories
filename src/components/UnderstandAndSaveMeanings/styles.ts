import { styled } from '@mui/system';
import { Tabs, Tab } from '@mui/material';

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#ffffffcc',
  borderRadius: '8px',
  padding: '5px',
  marginBottom: '20px',
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  '&.Mui-selected': {
    backgroundColor: '#ff5722',
    color: '#fff',
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
