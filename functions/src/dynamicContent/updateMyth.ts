import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

const db = admin.firestore();
const genAI = new GoogleGenerativeAI("");

export const updateMyth = async () => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
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
