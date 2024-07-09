import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebaseApp';

const genAI = new GoogleGenerativeAI('AIzaSyBpZs6pcBEwfm3iNVWlqKtfpYqpIYxU26Q');

export const templeChat = functions.https.onCall(async (data, context) => {
  const { userId, templeName, message } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are ${templeName} and you only have to answer if a question is related to ${templeName}. If any question that the user asks is not related to ${templeName}, respond with a funny answer to let them know that you cannot answer this question because it is not related to ${templeName}.`,
  });

  try {
    const userChatRef = db.collection('users').doc(userId).collection('templeChat').doc(templeName);
    const chatDoc = await userChatRef.get();
    let history = [];

    if (chatDoc.exists) {
      const chatData = chatDoc.data();
      history = chatData?.history || [];
    } else {
      let welcomeMessage = '';
      switch (templeName.toLowerCase()) {
        case 'vaishno devi temple':
          welcomeMessage = 'Welcome to Vaishno Devi Temple, nestled in the Trikuta Mountains. How can I assist you today? Feel free to ask about the pilgrimage, the Goddess Vaishno Devi, or any related legends.';
          break;
        case 'tirumala venkateswara temple':
          welcomeMessage = 'Welcome to Tirumala Venkateswara Temple. How can I assist you today? Feel free to ask about Lord Venkateswara, the Tirumala temple, rituals, or any related stories.';
          break;
        case 'jagannath temple':
          welcomeMessage = 'Welcome to Jagannath Temple in Puri. How can I assist you today? Ask about the annual Rath Yatra, Lord Jagannath, or the temple’s historical significance.';
          break;
        case 'kashi vishwanath temple':
          welcomeMessage = 'Welcome to Kashi Vishwanath Temple in Varanasi. How can I assist you today? Feel free to ask about Lord Shiva, the temple’s history, or the rituals performed here.';
          break;
        case 'meenakshi amman temple':
          welcomeMessage = 'Welcome to Meenakshi Amman Temple in Madurai. How can I assist you today? Ask about the temple’s stunning architecture, the Goddess Meenakshi, or any related stories.';
          break;
        case 'golden temple':
          welcomeMessage = 'Welcome to the Golden Temple in Amritsar. How can I assist you today? Feel free to ask about its history, Sikh traditions, or the peaceful atmosphere here.';
          break;
        case 'somnath temple':
          welcomeMessage = 'Welcome to Somnath Temple in Gujarat. How can I assist you today? Ask about Lord Shiva, the temple’s history, or the rituals performed here.';
          break;
        case 'siddhivinayak temple':
          welcomeMessage = 'Welcome to Siddhivinayak Temple in Mumbai. How can I assist you today? Feel free to ask about Lord Ganesha, the temple’s significance, or the traditions followed here.';
          break;
        case 'ramanathaswamy temple':
          welcomeMessage = 'Welcome to Ramanathaswamy Temple in Rameswaram. How can I assist you today? Ask about the temple’s long corridors, Lord Shiva, or any related legends.';
          break;
        case 'mahabodhi temple':
          welcomeMessage = 'Welcome to Mahabodhi Temple in Bodh Gaya. How can I assist you today? Feel free to ask about Lord Buddha, the Bodhi tree, or the temple’s historical significance.';
          break;
        case 'lingaraja temple':
          welcomeMessage = 'Welcome to Lingaraja Temple in Bhubaneswar. How can I assist you today? Ask about Lord Shiva, the temple’s architecture, or any related traditions.';
          break;
        case 'akshardham temple':
          welcomeMessage = 'Welcome to Akshardham Temple in Delhi. How can I assist you today? Feel free to ask about its stunning architecture, the gardens, or the spiritual ambiance.';
          break;
        case 'shirdi sai baba temple':
          welcomeMessage = 'Welcome to Shirdi Sai Baba Temple. How can I assist you today? Feel free to ask about Sai Baba’s teachings, miracles, or anything related to Shirdi.';
          break;
        case 'kedarnath temple':
          welcomeMessage = 'Welcome to Kedarnath Temple in the Himalayas. How can I assist you today? Ask about Lord Shiva, the temple’s history, or the pilgrimage journey.';
          break;
        case 'badrinath temple':
          welcomeMessage = 'Welcome to Badrinath Temple in Uttarakhand. How can I assist you today? Feel free to ask about Lord Vishnu, the temple’s significance, or the traditions followed here.';
          break;
        default:
          welcomeMessage = `Welcome to ${templeName}. How can I assist you today?`;
      }

      history = [
        { role: 'user', parts: [{ text: '' }] },
        { role: 'model', parts: [{ text: welcomeMessage }] }
      ];

      await userChatRef.set({ history });
      return { message: welcomeMessage };
    }

    history.push({ role: 'user', parts: [{ text: message }] });

    const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 100 } });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    const templeResponse = { role: 'model', parts: [{ text }] };

    history.push(templeResponse);
    await userChatRef.set({ history });

    return { message: text };
  } catch (error) {
    console.error("Error in handleTempleChat function:", error);
    throw new functions.https.HttpsError('internal', 'Unable to process chat.');
  }
});
