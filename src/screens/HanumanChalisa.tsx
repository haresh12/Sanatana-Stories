import React, { useState } from 'react';
import { Container, Typography, Popover, Button } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';

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
  const [selectedText, setSelectedText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [meaning, setMeaning] = useState('');

  const handleTextSelect = (event: React.MouseEvent<HTMLElement>) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      setAnchorEl(event.currentTarget);
    }
  };

  const handleKnowMeaning = async () => {
    const getMeaning = httpsCallable<{ text: string }, { meaning: string }>(functions, 'getMeaning');
    const response = await getMeaning({ text: selectedText });
    setMeaning(response.data.meaning);
    setAnchorEl(null); // Close the popover after getting the meaning
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: '40px', fontWeight: 'bold', color: '#fff' }}>
        Hanuman Chalisa
      </Typography>
      <Typography variant="body1" align="center" sx={{ color: '#fff' }} onMouseUp={handleTextSelect}>
        {chalisaText}
      </Typography>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Typography sx={{ p: 2 }}>{selectedText}</Typography>
        <Button onClick={handleKnowMeaning}>Know Meaning</Button>
      </Popover>
      {meaning && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px' }}>
          <Typography variant="h6">Meaning:</Typography>
          <Typography variant="body1">{meaning}</Typography>
        </div>
      )}
    </Container>
  );
};

export default Chalisa;
