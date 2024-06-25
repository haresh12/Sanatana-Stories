import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

admin.initializeApp();
const db = admin.firestore();

const genAI = new GoogleGenerativeAI("");

const updateFunFact = async () => {
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const prompt = "Generate a fun fact in Hindi about either Hanuman Chalisa, Ramayana, Mahabharata, Hindu Puranas, or Hindu temples. The fact should be interesting and must not exceed 3 lines. Ensure each fact is unique and not repeated.";
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    await db.collection('dynamicContent').doc('funFact').set({
      content: text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Fun fact updated:", text);
  } catch (error) {
    console.error("Error generating fun fact:", error);
  }
};

const updateMyth = async () => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  try {
    const prompt = "Generate a myth in Hindi related to Hanuman Chalisa, Ramayana, Mahabharata, Hindu Puranas, or Hindu temples. The myth should be interesting and must not exceed 3 lines. Ensure each myth is unique and not repeated.";
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    await db.collection('dynamicContent').doc('myth').set({
      content: text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Myth updated:", text);
  } catch (error) {
    console.error("Error generating myth:", error);
  }
};

exports.scheduledFunction = functions.pubsub.schedule('every 300 minutes').onRun(async () => {
  await updateFunFact();
  await updateMyth();
  return null;
});

export const handleChat = functions.https.onCall(async (data, context) => {
  const { userId, godName, message } = data;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction : `You are ${godName} and you only have to answer if question is related to ${godName} if any question that user ask you ask you which are not related to ${godName} then response them some funny answer that let them know that you can not answer this question because its not related to ${godName} ` });

  try {

    // Delete existing chat if any
    const userChatRef = db.collection('users').doc(userId).collection('godChat').doc(godName);
    await userChatRef.delete();

    // Create a new chat session with a welcome message based on the godName
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
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "" }],
        },
        {
          role: "model",
          parts: [{ text: welcomeMessage }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    const godResponse = { role: 'model', parts: [{ text: text }] };

    // Save chat history
    const history = [
      { role: 'model', parts: [{ text: welcomeMessage }] },
      { role: 'user', parts: [{ text: message }] },
      godResponse,
    ];

    await userChatRef.set({ history });

    return { message: text, welcomeMessage };
  } catch (error) {
    console.error("Error in handleChat function:", error);
    throw new functions.https.HttpsError('internal', 'Unable to process chat.');
  }
});
