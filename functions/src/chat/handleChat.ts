import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebaseApp';

const genAI = new GoogleGenerativeAI("");

export const handleChat = functions.https.onCall(async (data, context) => {
  const { userId, godName, message } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are ${godName} and you only have to answer if a question is related to ${godName}. If any question that the user asks is not related to ${godName}, respond with a funny answer to let them know that you cannot answer this question because it is not related to ${godName}.`,
  });

  try {
    const userChatRef = db.collection('users').doc(userId).collection('godChat').doc(godName);
    const chatDoc = await userChatRef.get();
    let history = [];

    if (chatDoc.exists) {
      const chatData = chatDoc.data();
      history = chatData?.history || [];
    } else {
      let welcomeMessage = '';
      switch (godName.toLowerCase()) {
        case 'lord rama':
          welcomeMessage = 'Greetings, I am Lord Rama. How may I guide you today, dear devotee? I am here to uphold dharma and righteousness. Feel free to ask me about the Ramayana, principles of duty, or seek moral guidance.';
          break;
        case 'lord krishna':
          welcomeMessage = 'Hello, I am Krishna. How can I help you today, dear friend? Whether it’s about the Bhagavad Gita, the art of life, or playful stories, I am here to share wisdom and joy with you.';
          break;
        case 'lord shiva':
          welcomeMessage = 'Namaste, I am Shiva. How can I assist you on your spiritual journey today? As the destroyer and transformer, I am here to provide you with wisdom and guidance. Ask me about the mysteries of the universe, the path to enlightenment, or any concerns you may have.';
          break;
        case 'lord ganesha':
          welcomeMessage = 'Greetings, I am Ganesha, the remover of obstacles. How may I assist you today? Whether you seek knowledge, success, or solutions to your problems, I am here to guide you.';
          break;
        case 'lord hanuman':
          welcomeMessage = 'Hello, I am Hanuman. How can I assist you today, dear devotee? I am here to provide you with strength, courage, and unwavering devotion. Feel free to ask me anything about the ancient texts, the epics, or seek guidance on your spiritual journey.';
          break;
        case 'goddess durga':
          welcomeMessage = 'Greetings, I am Durga, the warrior goddess. How can I protect and empower you today? Ask me about strength, courage, and the fight against evil.';
          break;
        case 'goddess lakshmi':
          welcomeMessage = 'Hello, I am Lakshmi, the goddess of wealth and prosperity. How can I bring abundance and fortune into your life today? Ask me about financial success, well-being, and spiritual prosperity.';
          break;
        case 'goddess saraswati':
          welcomeMessage = 'Greetings, I am Saraswati, the goddess of knowledge and arts. How may I enlighten you today? Ask me about wisdom, music, arts, and learning.';
          break;
        case 'goddess kali':
          welcomeMessage = 'Namaste, I am Kali. How can I help you embrace transformation and change? Ask me about strength, fearlessness, and the power of destruction and creation.';
          break;
        case 'lord vishnu':
          welcomeMessage = 'Greetings, I am Vishnu, the preserver of the universe. How may I assist you today? Ask me about cosmic order, protection, and my incarnations.';
          break;
        case 'goddess radha':
          welcomeMessage = 'Hello, I am Radha. How can I assist you in matters of love and devotion? Ask me about the pure love shared with Krishna and the beauty of devotion.';
          break;
        case 'goddess sita':
          welcomeMessage = 'Namaste, I am Sita, the embodiment of virtue and devotion. How can I assist you today? Ask me about the Ramayana, the ideals of womanhood, and the path of devotion.';
          break;
        case 'lord brahma':
          welcomeMessage = 'Greetings, I am Brahma, the creator. How can I assist you today? Ask me about creation, knowledge, and the mysteries of the universe.';
          break;
        default:
          welcomeMessage = 'Hello, I am here to help you.';
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
    const godResponse = { role: 'model', parts: [{ text }] };

    history.push(godResponse);
    await userChatRef.set({ history });

    return { message: text };
  } catch (error) {
    console.error("Error in handleChat function:", error);
    throw new functions.https.HttpsError('internal', 'Unable to process chat.');
  }
});
