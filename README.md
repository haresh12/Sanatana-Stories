
# Sanatan Stories

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Frontend](#frontend)
- [Backend](#backend)
- [Installation and Setup](#installation-and-setup)
- [Running the App](#running-the-app)
- [Usage](#usage)
- [Firebase and Gemini API Integration](#firebase-and-gemini-api-integration)
- [License](#license)

## Overview
Sanatan Stories is a spiritual web application that aims to provide users with a comprehensive and engaging platform to explore various aspects of Hindu culture and spirituality. The application includes functionalities like reading and listening to the Hanuman Chalisa, engaging in spiritual conversations through the "Talk to God" feature, generating and listening to spiritual podcasts, joining a community of spiritual seekers, taking quizzes, summarizing satsangs, learning about Hindu temples, discovering fun facts, and uncovering myths and legends of Hindu culture.

## Features
- **Hanuman Chalisa:** Delve into the powerful verses of the Hanuman Chalisa.
- **Talk to God:** Engage in spiritual conversations and seek divine guidance.
- **Generate Podcast:** Create and share your spiritual journey through podcasts.
- **Community:** Join a community of like-minded spiritual seekers.
- **Quiz:** Test and expand your knowledge with our engaging quizzes.
- **Summarize Satsang:** Get concise summaries of spiritual talks and satsangs.
- **Know About Temples:** Explore and learn about various Hindu temples.
- **Fun Fact:** Discover interesting and lesser-known facts.
- **Myth:** Uncover the myths and legends of Hindu culture.
- **Epics and Puranas:** Dive into the rich stories of Ramayan, Mahabharat, and Puranas.

## Tech Stack
### Frontend
- **React:** Core library for building the user interface.
- **TypeScript:** Ensures type-safe code.
- **Material-UI:** Provides UI components.
- **Framer Motion:** Adds animations.
- **Redux:** Manages state.
- **Axios:** Makes HTTP requests.
- **Firebase:** Manages authentication and real-time database.

### Backend
- **Firebase Functions:** Serverless functions to handle backend logic.
- **Node.js:** JavaScript runtime environment.
- **@google-cloud/text-to-speech:** Converts text to speech for the podcast generation feature.
- **Google APIs:** Integrates various Google services.

## Installation and Setup
### Prerequisites
- Node.js (v18 or higher)
- npm (v10 or higher)
- Firebase CLI

### Clone the Repository
\`\`\`bash
git clone https://github.com/haresh12/Sanatana-Stories.git
cd sanatan-stories
\`\`\`

### Frontend Setup
1. Install dependencies:
\`\`\`bash
npm install
\`\`\`
2. Create a \`.env\` file with your Firebase configuration:
\`\`\`env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
\`\`\`
3. Start the development server:
\`\`\`bash
npm start
\`\`\`

### Backend Setup
1. Navigate to the \`functions\` directory:
\`\`\`bash
cd functions
\`\`\`
2. Install dependencies:
\`\`\`bash
npm install
\`\`\`
3. Set up Firebase project:
\`\`\`bash
firebase init
\`\`\`
4. Deploy Firebase functions:
\`\`\`bash
npm run deploy
\`\`\`

## Running the App
1. Ensure both frontend and backend are set up and running.
2. Open your browser and navigate to \`http://localhost:3000\`.

## Usage
1. **Hanuman Chalisa:** Click on the "Hanuman Chalisa" card to read and listen to the Hanuman Chalisa.
2. **Talk to God:** Click on the "Talk to God" card to start a spiritual conversation.
3. **Generate Podcast:** Click on the "Generate Podcast" card to create and listen to a podcast.
4. **Community:** Join and interact with the community through the "Community" card.
5. **Quiz:** Test your knowledge by clicking on the "Quiz" card.
6. **Summarize Satsang:** Get summaries of spiritual talks via the "Summarize Satsang" card.
7. **Know About Temples:** Learn about Hindu temples by clicking on the "Know About Temples" card.
8. **Fun Fact:** Discover fun facts by clicking on the "Fun Fact" card.
9. **Myth:** Explore myths and legends through the "Myth" card.
10. **Epics and Puranas:** Read stories from Ramayan, Mahabharat, and Puranas by clicking on the "Epics and Puranas" card.

## Firebase and Gemini API Integration
Sanatan Stories extensively utilizes Firebase and Gemini API for various functionalities. Here's a detailed overview:

### Firebase
- **Authentication:** Manages user authentication, ensuring secure access to the application.
- **Firestore:** Stores user data, podcasts, temple information, and other dynamic content.
- **Cloud Functions:** Handles backend logic, including calls to the Gemini API and other server-side operations.
- **Storage:** Stores images, audio files, and other media assets.
- **Extensions:** Integrates services like Google Text-to-Speech and Perspective API to enhance functionality.
- **Remote Config:** Controls which functionalities to show or hide, allowing for dynamic updates without redeploying the app.
- **Hosting:** Hosts the web application, providing fast and secure delivery of content.

### Gemini API
- **Prompt Response:** Uses AI to generate responses for the "Talk to God" feature.
- **Chat:** Implements chat functionalities, allowing users to engage in spiritual conversations.

### React Integration
- **State Management:** Uses Redux for efficient state management across the application.
- **UI Components:** Material-UI provides a robust set of components to create a visually appealing and responsive user interface.
- **Animations:** Framer Motion adds dynamic animations to improve user experience.
- **Type Safety:** TypeScript ensures type safety, reducing runtime errors and improving code maintainability.

## License
This project is licensed under the MIT License.
