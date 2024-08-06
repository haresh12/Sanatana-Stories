import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendAIMessage } from './sendAIMessage';

const db = admin.firestore();

/**
 * Cloud Function to check for inactivity in the comments section.
 *
 * This function runs every 200 minutes and checks the timestamp of the latest message
 * in the 'comments' collection. If the last message is older than 200 minutes and was not
 * sent by the AI, it sends an AI message to the comments section. If no messages are found,
 * it sends an AI message.
 *
 * @param {Object} context - The context of the function call.
 * @returns {Promise<null>} A promise that resolves to null.
 */
export const checkInactivity = functions.pubsub.schedule('every 200 minutes').onRun(async (context) => {
  const messagesRef = db.collection('comments').orderBy('timestamp', 'desc').limit(1);
  const snapshot = await messagesRef.get();

  if (!snapshot.empty) {
    const lastMessage = snapshot.docs[0].data();
    const lastTimestamp = lastMessage.timestamp.toMillis();
    const currentTime = Date.now();

    if (currentTime - lastTimestamp >  1* 60 * 10000 && lastMessage.user !== 'AI') {
      await sendAIMessage();
    }
  } else {
    await sendAIMessage();
  }
  return null;
});