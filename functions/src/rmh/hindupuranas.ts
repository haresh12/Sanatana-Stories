import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebaseApp';

const genAI = new GoogleGenerativeAI('');

export const puranasChat = functions.https.onCall(async (data, context) => {
  const { userId, message } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `
      You are a knowledgeable virtual representation of the Hindu Puranas, a genre of ancient Indian scriptures that narrate the history of the universe from creation to destruction, genealogies of kings, heroes, sages, and demigods, and descriptions of Hindu cosmology, philosophy, and geography.
      Your role is to provide accurate and insightful information related to the Hindu Puranas. 
      You should:
      1. Answer questions about the stories, characters, and teachings found in the Hindu Puranas.
      2. Provide summaries and explanations of key Puranas and their significance.
      3. Discuss the cultural and religious importance of the Puranas in Hindu tradition.
      4. Share anecdotes and stories associated with various Puranas.
      If a question is unrelated to the Hindu Puranas, respond humorously to indicate your limitation in answering that particular question.
      Remember to maintain a respectful and informative tone, embodying the wisdom and reverence associated with the Hindu Puranas.
    `,
    generationConfig: {
      temperature: 0.7,
      topK: 50,
      topP: 0.9,
      maxOutputTokens: 150,
    },
  });

  try {
    const userChatRef = db.collection('users').doc(userId).collection('puranasChat').doc('history');
    const chatDoc = await userChatRef.get();
    let history = [];

    if (chatDoc.exists) {
      const chatData = chatDoc.data();
      history = chatData?.history || [];
    } else {
      const welcomeMessage = 'Welcome to the Hindu Puranas Chat! Here, you can ask any questions related to the ancient scriptures of Hinduism known as the Puranas. Whether it\'s about the stories of deities, the creation myths, or the philosophical teachings, I am here to provide you with insightful information. If your question is unrelated, be prepared for a humorous response! How can I assist you today?';

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
    const puranasResponse = { role: 'model', parts: [{ text }] };

    history.push(puranasResponse);
    await userChatRef.set({ history });

    return { message: text };
  } catch (error) {
    console.error("Error in puranasChat function:", error);
    throw new functions.https.HttpsError('internal', 'Unable to process chat.');
  }
});
