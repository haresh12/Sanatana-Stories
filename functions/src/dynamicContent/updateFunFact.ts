// import * as admin from 'firebase-admin';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const db = admin.firestore();
// const genAI = new GoogleGenerativeAI('');

// export const updateFunFact = async () => {
//   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//   try {
//     const prompt = "Generate a fun fact in Hindi about either Hanuman Chalisa, Ramayana, Mahabharata, Hindu Puranas, or Hindu temples. The fact should be interesting and must not exceed 3 lines. Ensure each fact is unique and not repeated.";
//     const result = await model.generateContent(prompt);
//     const text = await result.response.text();

//     await db.collection('dynamicContent').doc('funFact').set({
//       content: text,
//       timestamp: admin.firestore.FieldValue.serverTimestamp(),
//     });

//     console.log("Fun fact updated:", text);
//   } catch (error) {
//     console.error("Error generating fun fact:", error);
//   }
// };
