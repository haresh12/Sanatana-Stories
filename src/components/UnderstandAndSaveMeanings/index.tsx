import React, { useState, MouseEvent } from 'react';
import { Container, Typography, Popover, Button, CircularProgress, Card, CardContent, Box, Modal } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { saveMeaning, clearMeaning } from '../../store/chalisaSlice';
import { StyledTabs, StyledTab, highlightText, modalStyle } from './styles';
import { fetchMeaning } from './utils';
import { HANUMAN_CHALISA_ENGLISH, HANUMAN_CHALISA_HINDI } from '../../const/consts';

const UnderstandAndSaveMeanings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const savedWords = useSelector((state: RootState) => state.chalisa.savedMeanings);
  const [selectedText, setSelectedText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'hindi' | 'english'>('hindi');
  const [isMobile, setIsMobile] = useState(/Mobi|Android/i.test(navigator.userAgent)); // Detect mobile devices
  const [showModal, setShowModal] = useState(false);
  const [wordsList, setWordsList] = useState<string[]>([]);

  const handleTextSelect = (event: MouseEvent<HTMLElement>) => {
    if (isMobile) {
      const words = event.currentTarget.innerText.split(' ');
      setWordsList(words);
      setShowModal(true);
    } else {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const word = selection.toString().trim();
        setSelectedText(word);
        setAnchorEl(event.currentTarget);

        if (savedWords[word]) {
          setMeaning(savedWords[word]);
        } else {
          setMeaning('');
        }
      }
    }
  };

  const handleKnowMeaning = async () => {
    setLoading(true);
    try {
      const meaning = await fetchMeaning(selectedText);
      setMeaning(meaning);
    } catch (error) {
      console.error('Error fetching meaning:', error);
      setMeaning('Unable to fetch meaning at the moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMeaning('');
    setShowModal(false);
  };

  const handleSaveWord = () => {
    dispatch(saveMeaning({ word: selectedText, meaning }));
    handleClose();
  };

  const handleClearWord = () => {
    dispatch(clearMeaning(selectedText));
    handleClose();
  };

  const handleLanguageToggle = (event: React.ChangeEvent<{}>, newLanguage: 'hindi' | 'english') => {
    setLanguage(newLanguage);
  };

  const formatText = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <Card key={index} sx={{ marginBottom: '10px', backgroundColor: '#f5f5f5', borderRadius: '15px', padding: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <CardContent onMouseUp={handleTextSelect}>
          {paragraph.split('\n').map((line, lineIndex) => (
            <Typography
              key={lineIndex}
              variant="body1"
              sx={{ color: '#000', fontSize: '18px', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: highlightText(line, savedWords) }}
            />
          ))}
        </CardContent>
      </Card>
    ));
  };

  const popoverId = Boolean(anchorEl) ? 'simple-popover' : undefined; // Renamed to avoid conflict

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <Box display="flex" justifyContent="center" mb={2}>
        <StyledTabs value={language} onChange={handleLanguageToggle} aria-label="language toggle tabs" centered>
          <StyledTab value="hindi" label="Hindi" />
          <StyledTab value="english" label="English" />
        </StyledTabs>
      </Box>
      <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#ff5722' }}>
        Hanuman Chalisa
      </Typography>
      <Card sx={{ marginBottom: '20px', backgroundColor: '#e0f7fa', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom sx={{ color: '#00796b' }}>
            Many people recite the Hanuman Chalisa daily but struggle to grasp its deeper meanings. With this feature, you can click on any word to understand its significance and save it for future reference.
          </Typography>
        </CardContent>
      </Card>
      {formatText(language === 'hindi' ? HANUMAN_CHALISA_HINDI : HANUMAN_CHALISA_ENGLISH)}
      <Popover
        id={popoverId}
        open={Boolean(anchorEl) && !isMobile} 
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{ maxWidth: '100%', width: '90%' }}
      >
        <Box sx={{ padding: '10px', maxWidth: '300px', width: '100%' }}>
          <Typography variant="h6" sx={{ marginBottom: '10px', color: '#ff5722' }}>
            Meaning of: {selectedText}
          </Typography>
          {loading ? (
            <CircularProgress color="secondary" />
          ) : (
            <>
              <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                {meaning}
              </Typography>
              {!savedWords[selectedText] && (
                <Button onClick={handleKnowMeaning} sx={{ backgroundColor: '#ff5722', color: '#fff', '&:hover': { backgroundColor: '#e64a19' } }}>
                  Get Explanation
                </Button>
              )}
              {meaning && !savedWords[selectedText] && (
                <Button onClick={handleSaveWord} sx={{ marginLeft: '10px', backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#388e3c' } }}>
                  Save
                </Button>
              )}
              {savedWords[selectedText] && (
                <Button onClick={handleClearWord} sx={{ marginLeft: '10px', backgroundColor: '#f44336', color: '#fff', '&:hover': { backgroundColor: '#d32f2f' } }}>
                  Clear
                </Button>
              )}
            </>
          )}
        </Box>
      </Popover>

      {/* Modal for mobile */}
      <Modal
        open={showModal && isMobile}
        onClose={handleClose}
        aria-labelledby="mobile-word-list"
        aria-describedby="select-a-word-from-list"
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ marginBottom: '10px', color: '#ff5722' }}>
            Select a Word
          </Typography>
          <Box>
            {wordsList.map((word, index) => (
              <Button
                key={index}
                onClick={() => {
                  setSelectedText(word);
                  handleKnowMeaning();
                }}
                sx={{ margin: '5px', backgroundColor: '#ff5722', color: '#fff', '&:hover': { backgroundColor: '#e64a19' } }}
              >
                {word}
              </Button>
            ))}
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default UnderstandAndSaveMeanings;
