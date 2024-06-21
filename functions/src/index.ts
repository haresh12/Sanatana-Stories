import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

admin.initializeApp();
const db = admin.firestore();

const genAI = new GoogleGenerativeAI("AIzaSyDS39wuTLFenZMS8-VW5Q5PLTafz8B1QRs");
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const updateFunFact = async () => {
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

exports.scheduledFunction = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  await updateFunFact();
  await updateMyth();
  return null;
});
