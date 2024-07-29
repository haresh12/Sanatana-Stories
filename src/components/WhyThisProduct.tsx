import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const WhyThisProduct: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    const element = document.getElementById('why-this-product-container');
    if (element) {
      element.style.display = 'none';
    }
  };

  return (
    <Box
      id="why-this-product-container"
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: '800px',
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: '10px',
        p: 4,
        overflowY: 'auto',
        maxHeight: '90vh',
        zIndex: 1300,
      }}
    >
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'grey.500',
        }}
      >
        <CloseIcon />
      </IconButton>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#ff5722', textAlign: 'center', fontSize: isMobile ? '1.5rem' : '2rem' }}
        id="why-this-product-title"
      >
        Why Sanatan Stories?
      </Typography>
      <Typography variant="body1" gutterBottom id="why-this-product-description" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
        Sanatan Dharma is a profound spiritual path followed by over <strong>1.4 billion people</strong> worldwide. Despite this, many remain unaware of the vast array of stories and teachings it encompasses. Our app, <strong>Sanatan Stories</strong>, bridges this gap by bringing the rich narratives of Sanatan Dharma to life.
      </Typography>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Understanding Hanuman Chalisa
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Millions recite the <strong>Hanuman Chalisa</strong> daily but often don't understand its profound meanings. Our app helps users connect with the spiritual essence of each verse, making the recitation more meaningful. The Hanuman Chalisa video has over <strong>3.2 billion views</strong> on YouTube, highlighting its global impact.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Ramayan and Mahabharat
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Shows like <strong>Ramayan</strong> and <strong>Mahabharat</strong> have captivated audiences with <strong>77 million</strong> and <strong>22 million viewers</strong> respectively. Our app allows users to dive deeper into these epics, chat, and learn, enriching their understanding and appreciation.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Talk to God and Know About Temples
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Imagine having a personal conversation with a deity. Our 'Talk to God' feature, powered by the Gemini API, offers a unique interactive spiritual experience. Additionally, 'Know About Temples' provides comprehensive information on temples, including the best times to visit.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Quiz Functionality
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Test your knowledge with our engaging quizzes, covering over <strong>100 topics</strong>. Powered by the Gemini API, these quizzes are generated dynamically, ensuring a fresh and challenging experience every time.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Community Feature
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Connect with like-minded individuals through our community feature. Discuss, share, and grow in your understanding of Sanatan Dharma. The Gemini API boosts engagement by generating discussion topics, ensuring the community stays vibrant and active.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Fun Facts and Myths
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Our app dispels myths and shares fascinating facts about Sanatan Dharma every five minutes. With the 'Know More' button, users can delve deeper into these intriguing stories.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Podcast Generation
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Leveraging the Gemini API, we generate engaging podcasts featuring renowned podcasters and gurus. These podcasts offer rich, diverse content, enhancing your spiritual journey with different voices and perspectives.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Accessibility Features
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          To ensure everyone can benefit from our app, we've integrated text-to-speech and speech-to-text functionalities, making our content accessible to all users.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Progressive Web App (PWA)
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Our app is also a Progressive Web App (PWA), offering a native app-like experience on the web. This ensures users have a seamless experience regardless of the device they use.
        </Typography>
      </Box>

      <Box sx={{ marginBottom: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '10px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722', fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Technology Stack
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Our app harnesses the power of modern technology to deliver a seamless user experience.
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#00796b', fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Backend: Firebase
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          We utilize Firebase for cloud functions, storage, authentication, hosting, remote config, and extensions like Google Text-to-Speech and Perspective API.
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#00796b', fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Frontend: React
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Our frontend is built with React, using state-of-the-art libraries and tools to ensure a smooth and responsive user interface.
        </Typography>
      </Box>
    </Box>
  );
};

export default WhyThisProduct;
