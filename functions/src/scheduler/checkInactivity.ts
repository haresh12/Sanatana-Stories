import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendAIMessage } from './sendAIMessage';

const db = admin.firestore();

/**
 * Cloud Function to check for inactivity in the comments section.
 *
 * This function runs every 24 hours and checks the timestamp of the latest message
 * in the 'comments' collection. If the last message is older than 24 hours,
 * it sends an AI message to the comments section.
 *
 * @param {Object} context - The context of the function call.
 * @returns {Promise<null>} A promise that resolves to null.
 */
export const checkInactivity = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    const messagesRef = db.collection('comments').orderBy('timestamp', 'desc').limit(1);
    const snapshot = await messagesRef.get();

    const currentTime = Date.now();

    if (!snapshot.empty) {
      const lastMessage = snapshot.docs[0].data();

      // Ensure the 'timestamp' field exists and is a valid Firestore Timestamp
      if (!lastMessage.timestamp || !lastMessage.timestamp.toMillis) {
        console.error("Error: Missing or invalid 'timestamp' field in the last message.");
        throw new Error("Invalid message timestamp");
      }

      const lastTimestamp = lastMessage.timestamp.toMillis();

      // If the last message is older than 24 hours
      if (currentTime - lastTimestamp > 24 * 60 * 60 * 1000) {
        await sendAIMessage();
      }
    } else {
      // If there are no messages, send an AI message
      await sendAIMessage();
    }
  } catch (error) {
    // Narrowing down the type of error
    if (error instanceof Error) {
      console.error("Error in checkInactivity function:", error.message);

      // Optionally, you can log the error to Firestore for monitoring
      await db.collection('errors').add({
        message: error.message,
        stack: error.stack,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      console.error("Unknown error in checkInactivity function:", error);
      
      // Log unknown error types for future debugging
      await db.collection('errors').add({
        message: "Unknown error occurred",
        detail: JSON.stringify(error),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Re-throw the error to allow Firebase to handle retries or logging
    throw new functions.https.HttpsError('internal', 'An error occurred while checking for inactivity.');
  }

  return null;
});
