import { Dispatch } from 'redux';
import { collection, deleteDoc, getDocs, query } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebaseConfig';
import { clearAllEpicsMessages, setEpicsMessages } from '../../store/epicsChatSlice';

/**
 * Clears all chat messages for the current user from the specified chat collections.
 * @param {any} currentUser - The current user object containing user details.
 * @param {Dispatch} dispatch - The Redux dispatch function.
 */
export const clearChats = async (currentUser: any, dispatch: Dispatch) => {
  const chatTypes = ['ramayanChat', 'mahabharatChat', 'puranasChat'];
  const promises = chatTypes.map(async chatType => {
    const chatCollection = collection(db, 'users', currentUser.uid, chatType);
    const chatDocs = await getDocs(query(chatCollection));
    const deletePromises = chatDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  });
  await Promise.all(promises);
  dispatch(clearAllEpicsMessages());
};

/**
 * Loads the initial chat messages for the current user from the specified chat collections.
 * @param {any} currentUser - The current user object containing user details.
 * @param {Dispatch} dispatch - The Redux dispatch function.
 */
export const loadInitialMessages = async (currentUser: any, dispatch: Dispatch) => {
  const chatTypes = ['ramayan', 'mahabharat', 'puranas'];
  const loadMessagePromises = chatTypes.map(async chatType => {
    const handleChat = httpsCallable(functions, `${chatType}Chat`);
    const response = await handleChat({ userId: currentUser.uid, message: '' });
    const responseData = response.data as { message: string, audioUrl: string };
    dispatch(setEpicsMessages({ chatType, messages: [{ role: 'model', message: responseData.message, audioUrl: responseData.audioUrl }] }));
  });

  await Promise.all(loadMessagePromises);
};
