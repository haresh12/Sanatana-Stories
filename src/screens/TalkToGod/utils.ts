import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Clears the user's chat collection in Firestore.
 * 
 * @param {string} userId - The ID of the user whose chat collection should be cleared.
 * @returns {Promise<void>} - A promise that resolves when the user's chat collection has been cleared.
 */
export const clearUserChat = async (userId: string): Promise<void> => {
  const userChatCollection = collection(db, 'users', userId, 'godChat');
  const userChatSnapshot = await getDocs(userChatCollection);
  userChatSnapshot.forEach(async (chatDoc) => {
    await deleteDoc(doc(db, 'users', userId, 'godChat', chatDoc.id));
  });
};
