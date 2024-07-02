// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
// import { sendAIMessage } from './sendAIMessage';

// const db = admin.firestore();

// export const checkInactivity = functions.pubsub.schedule('every 2000 minutes').onRun(async (context) => {
//   // const messagesRef = db.collection('comments').orderBy('timestamp', 'desc').limit(1);
//   // const snapshot = await messagesRef.get();

//   // if (!snapshot.empty) {
//   //   const lastMessage = snapshot.docs[0].data();
//   //   const lastTimestamp = lastMessage.timestamp.toMillis();
//   //   const currentTime = Date.now();

//   //   if (currentTime - lastTimestamp > 2 * 60 * 1000000 && lastMessage.user !== 'AI') {
//   //     await sendAIMessage();
//   //   }
//   // } else {
//   //   await sendAIMessage();
//   // }
//   // return null;
// });