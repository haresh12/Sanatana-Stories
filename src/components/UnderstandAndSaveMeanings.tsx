import React, { useState, MouseEvent } from 'react';
import { Container, Typography, Popover, Button, CircularProgress, Card, CardContent, Box, Tabs, Tab } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { saveMeaning, clearMeaning } from '../store/chalisaSlice';
import { styled } from '@mui/system';

const hanumanChalisaHindi = `
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

const hanumanChalisaEnglishHindi = `
॥ Shri Hanuman Chalisa ॥
Shriguru charan saroja raja, nija manu mukuru sudhari।
Baranaun Raghuvara bimala jasu, jo dayaku phala chari॥

Buddhihin tanu janike, sumirau Pavana-Kumara।
Bala buddhi vidya dehu mohi, harahu kalesa bikara॥

Jaya Hanuman gyan guna sagara।
Jaya Kapisa tihu loka ujagara॥

Rama duta atulita bala dhama।
Anjani-putra Pavanasuta nama॥

Mahabira bikrama bajarangI।
Kumati nivara sumati ke sangI॥

Kanchana barana biraja subesa।
Kanan kundala kuncita kesa॥

Hatha bajra au dhvaja birajai।
Kandhe munja janeu sajai॥

Sankara suvan Kesari Nandana।
Teja pratapa maha jaga bandana॥

Vidyavan guni ati chatur।
Rama kaja karibe ko atura॥

Prabhu charitra sunibe ko rasiya।
Rama Lakhan Sita mana basiya॥

Sukshma rupa dhari Siyahi dikhava।
Bikata rupa dhari Lanka jarava॥

Bhima rupa dhari asura sanhare।
Ramachandra ke kaja sanvare॥

Laye Sajivana Lakhan jiyaye।
Shriraghubira harashi ura laye॥

Raghupati kinhi bahuta badai।
Tuma mama priya Bharata-hi sam bhai॥

Sahasa badana tumharo jasa gavai।
Asa kahi Shripati kantha lagavai॥

Sankadika Brahmada Munisa।
Narada Sarada sahita Ahisa॥

Yama Kubera Digapala jahan te।
Kavi kobida kahi sake kahan te॥

Tuma upakara Sugrivahin kinha।
Rama milaya rajapada dinha॥

Tumharo mantra Vibhishana mana।
Lankesvara bhaye saba jaga jana॥

Yuga sahasra yojana para bhanu।
Lilyo tahi madhura phala janu॥

Prabhu mudrika meli mukha mahi।
Jaladhi langhi gaye acharaja nahi॥

Durgama kaja jagata ke jete।
Sugama anugraha tumhare tete॥

Rama dware tuma rakhavare।
Hota na ajna binu paisare॥

Saba sukha lahai tumhari sarana।
Tuma rakshaka kahu ko darana॥

Apana teja samharao apai।
Tino loka hanka te kampai॥

Bhuta pisacha nikata nahi avai।
Mahabira jaba nama sunavai॥

Nase roga harai saba pira।
Japata nirantara Hanumata bira॥

Sankata te Hanumana chhuravai।
Mana krama vachana dhyana jo lavai॥

Saba para Rama tapasvi raja।
Tina ke kaja sakala tuma saja॥

Aura manoratha jo koi lavai।
SoI amita jIvana phala pavai॥

Charo yuga paratapa tumhara।
Hai parasiddha jagata ujiyara॥

Sadhu santa ke tuma rakhavare।
Asura nikandana Rama dulare॥

Ashta siddhi nau nidhi ke data।
Asa bara dina Janaki mata॥

Rama rasayana tumhare pasa।
Sada raho Raghupati ke dasa॥

Tumhare bhajana Rama ko pavai।
Janma janma ke dukha bisaravai॥

Antakala Raghubara pura jai।
Jahan janma Haribhakta kahai॥

Aura devata chitta na dharai।
Hanumata sei sarba sukha karai॥

Sankata katai mitai saba pira।
Jo sumirai Hanumata balbira॥

Jaya jaya jaya Hanuman Gosai।
Kripa karahu guru deva ki naI॥

Jo sat bara patha kara koi।
Chhutahi bandi maha sukha hoi॥

Jo yaha padhai Hanuman Chalisa।
Hoya siddhi sakhi Gaurisa॥

Tulasidasa sada Hari chera।
Kijai natha hridaya maha dera॥

॥ Doha ॥
Pavanasuta sankata harana, mangala murati rupa।
Rama Lakhan Sita sahita, hridaya basahu sura bhupa॥
`;

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#ffffffcc',
  borderRadius: '8px',
  padding: '5px',
  marginBottom: '20px',
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 'bold',
  '&.Mui-selected': {
    backgroundColor: '#ff5722',
    color: '#fff',
  },
}));

const UnderstandAndSaveMeanings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const savedWords = useSelector((state: RootState) => state.chalisa.savedMeanings);
  const [selectedText, setSelectedText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'hindi' | 'english'>('hindi');

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
              dangerouslySetInnerHTML={{ __html: highlightText(line) }}
            />
          ))}
        </CardContent>
      </Card>
    ));
  };

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
      {formatText(language === 'hindi' ? hanumanChalisaHindi : hanumanChalisaEnglishHindi)}
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
    </Container>
  );
};

export default UnderstandAndSaveMeanings;