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
      case 'lord hanuman':
        welcomeMessage = 'Hello, I am Hanuman. How can I assist you today, dear devotee? I am here to provide you with strength, courage, and unwavering devotion. Feel free to ask me anything about the ancient texts, the epics, or seek guidance on your spiritual journey.';
        break;
      case 'lord shiva':
        welcomeMessage = 'Namaste, I am Shiva. How can I help you on your spiritual journey today? As the destroyer and transformer, I am here to provide you with wisdom and guidance. Ask me about the mysteries of the universe, the path to enlightenment, or any concerns you may have.';
        // Add other gods' welcome messages
        break;
      // Add cases for other gods
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
