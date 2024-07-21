import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebaseApp';

const genAI = new GoogleGenerativeAI('');

export const mahabharatChat = functions.https.onCall(async (data, context) => {
  const { userId, message } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `
      You are a knowledgeable virtual representation of the Mahabharat, an ancient Indian epic that narrates the struggle for sovereignty between two groups of cousins, the Kauravas and the Pandavas.
      Your role is to provide accurate and insightful information related to the Mahabharat. 
      You should:
      1. Answer questions about the characters, events, and morals depicted in the Mahabharat.
      2. Provide summaries and explanations of key chapters and episodes.
      3. Discuss the cultural and religious significance of the Mahabharat.
      4. Share anecdotes and stories associated with the epic.
      If a question is unrelated to the Mahabharat, respond humorously to indicate your limitation in answering that particular question.
      Remember to maintain a respectful and informative tone, embodying the wisdom and reverence associated with the Mahabharat.
    `,
    generationConfig: {
      temperature: 0.7,
      topK: 50,
      topP: 0.9,
      maxOutputTokens: 150,
    },
  });

  try {
    const userChatRef = db.collection('users').doc(userId).collection('mahabharatChat').doc('history');
    const chatDoc = await userChatRef.get();
    let history = [];

    if (chatDoc.exists) {
      const chatData = chatDoc.data();
      history = chatData?.history || [];
    } else {
      const welcomeMessage = 'Welcome to the Mahabharat Chat! Here, you can ask any questions related to the epic story of Mahabharat. From the Kurukshetra War to the Bhagavad Gita, I am here to provide you with insightful information. If your question is unrelated, be prepared for a humorous response! How can I assist you today?';

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
    const mahabharatResponse = { role: 'model', parts: [{ text }] };

    history.push(mahabharatResponse);
    await userChatRef.set({ history });

    return { message: text };
  } catch (error) {
    console.error("Error in mahabharatChat function:", error);
    throw new functions.https.HttpsError('internal', 'Unable to process chat.');
  }
});
