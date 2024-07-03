// import * as admin from 'firebase-admin';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const db = admin.firestore();
// const genAI = new GoogleGenerativeAI("AIzaSyCLl1vRl61LdEKzeudoYETOu9o61-ji1nI");

// export const sendAIMessage = async () => {
//   const messagesRef = db.collection('comments').orderBy('timestamp', 'desc').limit(5);
//   const snapshot = await messagesRef.get();

//   let prompt = "Generate a warm and inviting message to encourage participation in a community chat. The message should be friendly, engaging, and relevant to spiritual discussions.";

//   if (!snapshot.empty) {
//     const recentMessages = snapshot.docs.map(doc => doc.data().text);
//     if (recentMessages.length > 0) {
//       prompt = `Based on these recent messages: "${recentMessages.join('", "')}", generate a friendly, engaging, and inviting message to encourage participation in a community chat. The message should reflect the current topics of discussion, encourage spiritual conversations, and invite users to share their thoughts and experiences.`;
//     }
//   }

//   const model = genAI.getGenerativeModel({
//     model: 'gemini-1.5-flash',
//     systemInstruction: "This community is about gods, Puranas, and different temples. Your job is to increase communication within the community. Ensure that discussions remain on-topic. If the community strays from these topics, gently redirect them to the purpose of this community."
//   });

//   const result = await model.generateContent(prompt);
//   const messageText = result.response.text();

//   await db.collection('comments').add({
//     user: 'AI',
//     name: 'CommunityBot',
//     text: messageText,
//     timestamp: admin.firestore.FieldValue.serverTimestamp(),
//   });
// };
