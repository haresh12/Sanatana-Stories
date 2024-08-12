import React, { useState } from 'react';
import { Container, Typography, CircularProgress, Button, Card, CardContent, Box, Modal, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import { RootState, AppDispatch } from '../../store';
import { saveMeaning } from '../../store/chalisaSlice';
import { modalStyle } from './styles';
import { fetchMeaning } from './utils';
import { HANUMAN_CHALISA_HINDI, HANUMAN_CHALISA_ENGLISH } from '../../const/consts';

const MobileUnderstandMeanings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const savedWords = useSelector((state: RootState) => state.chalisa.savedMeanings);
  const [selectedText, setSelectedText] = useState('');
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleTextClick = async (word: string) => {
    setSelectedText(word);
    setShowModal(true);
    setLoading(true);
    try {
      const fetchedMeaning = await fetchMeaning(word);
      setMeaning(fetchedMeaning);
    } catch (error) {
      console.error('Error fetching meaning:', error);
      setMeaning('Unable to fetch meaning at the moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMeaning('');
  };

  const handleSaveWord = () => {
    dispatch(saveMeaning({ word: selectedText, meaning }));
    handleCloseModal();
  };

  const formatText = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <Card key={index} sx={{ marginBottom: '10px', backgroundColor: '#f5f5f5', borderRadius: '15px', padding: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <CardContent>
          {paragraph.split(' ').map((word, wordIndex) => (
            <span
              key={wordIndex}
              onClick={() => handleTextClick(word)}
              style={{ color: savedWords[word] ? 'green' : 'black', fontWeight: savedWords[word] ? 'bold' : 'normal', cursor: 'pointer' }}
            >
              {word}{' '}
            </span>
          ))}
        </CardContent>
      </Card>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: '30px', fontWeight: 'bold', color: '#ff5722' }}>
        Hanuman Chalisa
      </Typography>
      <Card sx={{ marginBottom: '20px', backgroundColor: '#e0f7fa', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <CardContent>
          <Typography variant="body1" sx={{ fontSize: '18px', lineHeight: 1.6 }}>
            {formatText(HANUMAN_CHALISA_HINDI)}
          </Typography>
        </CardContent>
      </Card>

      <Modal
        open={showModal}
        onClose={handleCloseModal}
        aria-labelledby="mobile-meaning-modal"
        aria-describedby="meaning-of-selected-word"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#ff5722' }}>
              Meaning of: {selectedText}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          {loading ? (
            <CircularProgress color="secondary" />
          ) : (
            <>
              <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                {meaning}
              </Typography>
              <Button onClick={handleSaveWord} sx={{ backgroundColor: '#4caf50', color: '#fff', '&:hover': { backgroundColor: '#388e3c' } }}>
                Save
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default MobileUnderstandMeanings;
