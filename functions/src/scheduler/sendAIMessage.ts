import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as functions from 'firebase-functions';

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);

/**
 * Generates and sends an AI message to encourage participation in the community chat.
 *
 * This function retrieves the most recent messages from the 'comments' collection and uses
 * Google Generative AI to create a friendly, engaging, and relevant message that encourages
 * users to participate in the chat. The generated message is then added to the 'comments' collection.
 *
 * @returns {Promise<void>}
 */
export const sendAIMessage = async (): Promise<void> => {
  try {
    const messagesRef = db.collection('comments').orderBy('timestamp', 'desc').limit(5);
    const snapshot = await messagesRef.get();

    let prompt = "Generate a warm and inviting message to encourage participation in a community chat. The message should be friendly, engaging, and relevant to spiritual discussions.";

    if (!snapshot.empty) {
      const recentMessages = snapshot.docs.map(doc => doc.data().text).filter(Boolean);
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
    const messageText = result.response?.text?.().trim();

    if (!messageText) {
      throw new Error("AI generated an empty or invalid response.");
    }

    await db.collection('comments').add({
      user: 'AI',
      name: 'CommunityBot',
      text: messageText,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in sendAIMessage function:", error.message);
    } else {
      console.error("Unknown error in sendAIMessage function:", error);
    }

    // Optionally, you could log errors to Firestore for further monitoring
    await db.collection('errors').add({
      message: error instanceof Error ? error.message : "Unknown error",
      detail: JSON.stringify(error),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    throw new functions.https.HttpsError('internal', 'An error occurred while generating and sending an AI message.');
  }
};
