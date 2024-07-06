import React, { useState, MouseEvent } from 'react';
import { Container, Typography, Popover, Button, CircularProgress, Card, CardContent, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { motion } from 'framer-motion';
import { saveMeaning, clearMeaning } from '../store/chalisaSlice';

const chalisaText = `
॥ श्री हनुमान चालीसा ॥
श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।
बरनउं रघुबर बिमल जसु, जो दायकु फल चारि॥

बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।
बल बुद्धि विद्या देहु मोहिं, हरहु कलेस बिकार॥

जय हनुमान ज्ञान गुण सागर।
जय कपीस तिहुँ लोक उजागर॥

राम दूत अतुलित बल धामा।
अंजनि-पुत्र पवनसुत नामा॥

महाबीर बिक्रम बजरंगी।
कुमति निवार सुमति के संगी॥

कंचन बरन बिराज सुबेसा।
कानन कुंडल कुंचित केसा॥

हाथ बज्र औ ध्वजा बिराजै।
काँधे मूँज जनेऊ साजै॥

संकर सुवन केसरी नंदन।
तेज प्रताप महा जग बंदन॥

विद्यावान गुनी अति चातुर।
राम काज करिबे को आतुर॥

प्रभु चरित्र सुनिबे को रसिया।
राम लखन सीता मन बसिया॥

सूक्ष्म रूप धरि सियहिं दिखावा।
बिकट रूप धरि लंक जरावा॥

भीम रूप धरि असुर सँहारे।
रामचंद्र के काज सँवारे॥

लाय सजीवन लखन जियाए।
श्रीरघुबीर हरषि उर लाए॥

रघुपति कीन्ही बहुत बड़ाई।
तुम मम प्रिय भरत-हि सम भाई॥

सहस बदन तुम्हरो जस गावैं।
अस कहि श्रीपति कंठ लगावैं॥

सनकादिक ब्रह्मादि मुनीसा।
नारद सारद सहित अहीसा॥

जम कुबेर दिगपाल जहाँ ते।
कवि कोबिद कहि सके कहाँ ते॥

तुम उपकार सुग्रीवहिं कीन्हा।
राम मिलाय राजपद दीन्हा॥

तुम्हरो मंत्र बिभीषण माना।
लंकेस्वर भए सब जग जाना॥

जुग सहस्र जोजन पर भानू।
लील्यो ताहि मधुर फल जानू॥

प्रभु मुद्रिका मेलि मुख माहीं।
जलधि लाँघि गए अचरज नाहीं॥

दुर्गम काज जगत के जेते।
सुगम अनुग्रह तुम्हरे तेते॥

राम दुआरे तुम रखवारे।
होत न आज्ञा बिनु पैसारे॥

सब सुख लहै तुम्हारी सरना।
तुम रक्षक काहू को डर ना॥

आपन तेज सम्हारो आपै।
तीनों लोक हाँक तें काँपै॥

भूत पिसाच निकट नहिं आवै।
महाबीर जब नाम सुनावै॥

नासै रोग हरै सब पीरा।
जपत निरंतर हनुमत बीरा॥

संकट तें हनुमान छुड़ावै।
मन क्रम वचन ध्यान जो लावै॥

सब पर राम तपस्वी राजा।
तिन के काज सकल तुम साजा॥

और मनोरथ जो कोई लावै।
सोई अमित जीवन फल पावै॥

चारों जुग परताप तुम्हारा।
है परसिद्ध जगत उजियारा॥

साधु संत के तुम रखवारे।
असुर निकंदन राम दुलारे॥

अष्ट सिद्धि नौ निधि के दाता।
अस बर दीन जानकी माता॥

राम रसायन तुम्हरे पासा।
सदा रहो रघुपति के दासा॥

तुम्हरे भजन राम को पावै।
जनम जनम के दुख बिसरावै॥

अंतकाल रघुबर पुर जाई।
जहाँ जन्म हरिभक्त कहाई॥

और देवता चित्त न धरई।
हनुमत सेइ सर्ब सुख करई॥

संकट कटै मिटै सब पीरा।
जो सुमिरै हनुमत बलबीरा॥

जय जय जय हनुमान गोसाईं।
कृपा करहु गुरु देव की नाईं॥

जो सत बार पाठ कर कोई।
छूटहि बंदि महा सुख होई॥

जो यह पढ़ै हनुमान चालीसा।
होय सिद्धि साखी गौरीसा॥

तुलसीदास सदा हरि चेरा।
कीजै नाथ हृदय महँ डेरा॥

॥ दोहा ॥
पवनतनय संकट हरन, मंगल मूरति रूप।
राम लखन सीता सहित, हृदय बसहु सुर भूप॥
`;

const Chalisa: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const savedWords = useSelector((state: RootState) => state.chalisa.savedMeanings);
  const [selectedText, setSelectedText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTextSelect = (event: MouseEvent<HTMLElement>) => {
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
  };

  const handleKnowMeaning = async () => {
    setLoading(true);
    const getMeaning = httpsCallable<{ text: string }, { meaning: string }>(functions, 'getMeaning');
    try {
      const response = await getMeaning({ text: selectedText });
      setMeaning(response.data.meaning);
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
  };

  const handleSaveWord = () => {
    dispatch(saveMeaning({ word: selectedText, meaning }));
    handleClose();
  };

  const handleClearWord = () => {
    dispatch(clearMeaning(selectedText));
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const highlightText = (text: string) => {
    let highlightedText = text;
    Object.keys(savedWords).forEach((savedWord) => {
      const regex = new RegExp(`(${savedWord})`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span style="color: green; font-weight: bold;">$1</span>`);
    });
    return highlightedText;
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#ff5722' }}>
        Hanuman Chalisa
      </Typography>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Card sx={{ marginBottom: '20px', backgroundColor: '#e0f7fa', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom sx={{ color: '#00796b' }}>
              Many people recite the Hanuman Chalisa daily but struggle to grasp its deeper meanings. With this feature, you can click on any word to understand its significance and save it for future reference.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
      {chalisaText.split('\n\n').map((paragraph, index) => (
        <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card sx={{ marginBottom: '10px', backgroundColor: '#f5f5f5', borderRadius: '15px', padding: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            <CardContent onMouseUp={handleTextSelect}>
              <Typography
                variant="body1"
                sx={{ color: '#000', fontSize: '18px', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: highlightText(paragraph) }}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
      <Popover
        id={id}
        open={open}
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
      >
        <Box sx={{ padding: '10px', maxWidth: '300px' }}>
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
    </Container>
  );
};

export default Chalisa;
