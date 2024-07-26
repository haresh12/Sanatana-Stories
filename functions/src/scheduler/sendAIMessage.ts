import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as functions from 'firebase-functions';
const db = admin.firestore();
const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);

export const sendAIMessage = async () => {
  const messagesRef = db.collection('comments').orderBy('timestamp', 'desc').limit(5);
  const snapshot = await messagesRef.get();

  let prompt = "Generate a warm and inviting message to encourage participation in a community chat. The message should be friendly, engaging, and relevant to spiritual discussions.";

  if (!snapshot.empty) {
    const recentMessages = snapshot.docs.map(doc => doc.data().text);
    if (recentMessages.length > 0) {
      prompt = `Based on these recent messages: "${recentMessages.join('", "')}", generate a friendly, engaging, and inviting message to encourage participation in a community chat. The message should reflect the current topics of discussion, encourage spiritual conversations, and invite users to share their thoughts and experiences.`;
    }
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `
      You are CommunityBot, an AI assistant that helps facilitate and encourage meaningful discussions in a community focused on gods, Puranas, and different temples. 
      Your tasks are to:
      1. Craft engaging and welcoming messages to foster a sense of community.
      2. Ensure that discussions remain on the topics of spirituality, gods, Puranas, and temples.
      3. Gently redirect conversations back to relevant topics if they stray.
      4. Encourage users to share their experiences, thoughts, and questions about the discussed topics.
    `,
    generationConfig: {
      temperature: 0.9,   
      topK: 50,          
      topP: 0.9,         
    }
  });

  const result = await model.generateContent(prompt);
  const messageText = result.response.text();

  await db.collection('comments').add({
    user: 'AI',
    name: 'CommunityBot',
    text: messageText,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
};
