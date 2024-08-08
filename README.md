
# Sanatan Stories

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Running the App](#running-the-app)
- [Usage](#usage)
- [Firebase and Gemini API Integration](#firebase-and-gemini-api-integration)
- [License](#license)

## Overview
Sanatan Stories is a spiritual web application designed to provide users with a comprehensive platform to explore Hindu culture and spirituality. Features include reading and listening to the Hanuman Chalisa, engaging in spiritual conversations, generating podcasts, joining a spiritual community, taking quizzes, summarizing satsangs, learning about Hindu temples, discovering fun facts, and uncovering myths and legends of Hindu culture.

## Features
- **Hanuman Chalisa:** Read and listen to the Hanuman Chalisa.
- **Talk to God:** Engage in spiritual conversations and seek guidance.
- **Generate Podcast:** Create and share spiritual podcasts.
- **Community:** Join a community of spiritual seekers.
- **Quiz:** Test and expand your spiritual knowledge.
- **Summarize Satsang:** Get summaries of spiritual talks.
- **Know About Temples:** Learn about various Hindu temples.
- **Fun Fact:** Discover interesting facts about Hindu culture.
- **Myth:** Uncover myths and legends.
- **Epics and Puranas:** Explore stories from Ramayan, Mahabharat, and Puranas.

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
- **Firebase Functions:** Serverless functions for backend logic.
- **Node.js:** JavaScript runtime environment.
- **@google-cloud/text-to-speech:** Converts text to speech for podcast generation.
- **Google APIs:** Integrates various Google services.

## Installation and Setup
### Prerequisites
- Node.js (v18+)
- npm (v10+)
- Firebase CLI

### Clone the Repository
git clone https://github.com/haresh12/Sanatana-Stories.git

cd sanatan-stories

### Frontend Setup
1. Install dependencies:
   npm install
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
   npm start

### Backend Setup
1. Navigate to the \`functions\` directory:
   cd functions
2. Install dependencies:
   npm install

3. Set up Firebase project:
   firebase init

4. Deploy Firebase functions:
   npm run deploy

## Running the App
1. Ensure both frontend and backend are set up and running.
2. Open your browser and navigate to \`http://localhost:3000\`.

## Usage
1. **Hanuman Chalisa:** Read and listen to the Hanuman Chalisa.
2. **Talk to God:** Start a spiritual conversation.
3. **Generate Podcast:** Create and listen to a podcast.
4. **Community:** Join and interact with the community.
5. **Quiz:** Test your knowledge.
6. **Summarize Satsang:** Get summaries of spiritual talks.
7. **Know About Temples:** Learn about Hindu temples.
8. **Fun Fact:** Discover fun facts.
9. **Myth:** Explore myths and legends.
10. **Epics and Puranas:** Read stories from Ramayan, Mahabharat, and Puranas.

## Firebase and Gemini API Integration
Sanatan Stories extensively uses Firebase and Gemini API for various functionalities.

### Firebase
- **Authentication:** Manages user authentication.
- **Firestore:** Stores user data and dynamic content.
- **Cloud Functions:** Handles backend logic and API calls.
- **Storage:** Stores media assets.
- **Extensions:** Integrates services like Google Text-to-Speech.
- **Remote Config:** Allows dynamic updates.
- **Hosting:** Hosts the web application.

### Gemini API
- **Prompt Response:** Uses AI for the "Talk to God" feature.
- **Chat:** Implements chat functionalities.

### React Integration
- **State Management:** Uses Redux for efficient state management.
- **UI Components:** Material-UI for responsive UI.
- **Animations:** Framer Motion for dynamic animations.
- **Type Safety:** TypeScript for type safety.

## License
This project is licensed under the MIT License.
