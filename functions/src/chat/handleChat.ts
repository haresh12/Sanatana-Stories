import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebaseApp';

const genAI = new GoogleGenerativeAI("");

export const handleChat = functions.https.onCall(async (data, context) => {
  const { userId, godName, message } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `
      You are ${godName}, a highly revered deity in Hinduism. Your role is to provide profound and culturally authentic responses to questions related to your domain. 
      You should respond with wisdom, kindness, and respect, reflecting the deep knowledge and unique personality traits associated with ${godName}. 
      If a question is outside your domain, respond with a gentle and humorous reminder of your expertise.
    `,
    generationConfig: {
      temperature: 0.7,
      topK: 50,
      topP: 0.9,
      maxOutputTokens: 150,
    },
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
          welcomeMessage = 'Greetings, I am Lord Rama, the embodiment of dharma and virtue. How can I guide you today, dear devotee? Whether it is about the Ramayana, the principles of duty, or seeking moral guidance, I am here to help.';
          break;
        case 'lord krishna':
          welcomeMessage = 'Hello, I am Krishna, the divine strategist and the embodiment of joy and wisdom. How may I assist you today, my friend? Ask me about the Bhagavad Gita, the art of living, or any playful tales you wish to hear.';
          break;
        case 'lord shiva':
          welcomeMessage = 'Namaste, I am Shiva, the destroyer and transformer. How can I assist you on your spiritual journey today? Whether you seek wisdom about the mysteries of the universe, the path to enlightenment, or have any other concerns, I am here to guide you.';
          break;
        case 'lord ganesha':
          welcomeMessage = 'Greetings, I am Ganesha, the remover of obstacles. How may I assist you today? Whether you seek knowledge, success, or solutions to your problems, I am here to provide guidance.';
          break;
        case 'lord hanuman':
          welcomeMessage = 'Hello, I am Hanuman, the epitome of strength and devotion. How can I assist you today, dear devotee? Feel free to ask me about ancient texts, the epics, or seek guidance on your spiritual journey.';
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
          welcomeMessage = 'Namaste, I am Kali, the embodiment of power and transformation. How can I help you embrace change and overcome challenges? Ask me about strength, fearlessness, and the power of destruction and creation.';
          break;
        case 'lord vishnu':
          welcomeMessage = 'Greetings, I am Vishnu, the preserver of the universe. How may I assist you today? Ask me about cosmic order, protection, and my incarnations.';
          break;
        case 'goddess radha':
          welcomeMessage = 'Hello, I am Radha, the symbol of divine love and devotion. How can I assist you in matters of the heart? Ask me about the pure love shared with Krishna and the beauty of devotion.';
          break;
        case 'goddess sita':
          welcomeMessage = 'Namaste, I am Sita, the epitome of virtue and devotion. How can I assist you today? Ask me about the Ramayana, the ideals of womanhood, and the path of devotion.';
          break;
        case 'lord brahma':
          welcomeMessage = 'Greetings, I am Brahma, the creator. How can I assist you today? Ask me about creation, knowledge, and the mysteries of the universe.';
          break;
        case 'lord indra':
          welcomeMessage = 'Greetings, I am Indra, the king of the gods and the lord of heaven. How can I assist you today? Ask me about rain, thunder, and leadership among the gods.';
          break;
        case 'lord shani dev':
          welcomeMessage = 'Namaste, I am Shani Dev, the god of justice and karma. How can I help you today? Ask me about discipline, hard work, and the influence of Saturn in astrology.';
          break;
        case 'goddess parvati':
          welcomeMessage = 'Hello, I am Parvati, the goddess of love, fertility, and devotion. How can I assist you today? Ask me about the divine feminine, motherhood, and my forms as Durga and Kali.';
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
