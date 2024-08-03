import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { functions, db } from '../../firebaseConfig';
import { User } from './types';
import { Dispatch, SetStateAction } from 'react';

/**
 * Clears previous data from the Firestore collections for the current user.
 * @param {User} currentUser - The current user object containing user details.
 */
export const clearPreviousData = async (currentUser: User) => {
  const storiesRef = collection(db, 'users', currentUser.uid, 'stories');
  const qStories = query(storiesRef, where('text', '!=', ''));
  const storiesSnapshot = await getDocs(qStories);
  storiesSnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  const templeChatRef = collection(db, 'users', currentUser.uid, 'templeChat');
  const qTempleChat = query(templeChatRef);
  const templeChatSnapshot = await getDocs(qTempleChat);
  templeChatSnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
};

/**
 * Handles the click event on a temple card by fetching the welcome message and navigating to the temple page.
 * @param {string} templeId - The ID of the temple.
 * @param {string} templeName - The name of the temple.
 * @param {User | null} currentUser - The current user object or null.
 * @param {Dispatch<SetStateAction<boolean>>} setShowLoader - Function to set the loader visibility state.
 * @param {(path: string) => void} navigate - Function to navigate to a different route.
 */
export const handleCardClick = async (
  templeId: string,
  templeName: string,
  currentUser: User | null,
  setShowLoader: Dispatch<SetStateAction<boolean>>,
  navigate: (path: string) => void
) => {
  setShowLoader(true);
  try {
    const handleTempleChat = httpsCallable(functions, 'templeChat');
    const response = await handleTempleChat({ userId: `${currentUser?.uid}`, templeName, message: '' });
    const { message, audioUrl } = response.data as { message: string, audioUrl: string };
    localStorage.setItem(`templeWelcomeMessage_${templeId}`, message);
    localStorage.setItem(`templeWelcomeAudio_${templeId}`, audioUrl);

    navigate(`/temple/${templeId}`);
  } catch (error) {
    console.error('Error fetching welcome message:', error);
  } finally {
    setShowLoader(false);
  }
};

/**
 * Truncates a description to a specified maximum length by limiting the number of words.
 * @param {string} description - The description text to be truncated.
 * @param {number} maxLength - The maximum number of words allowed in the truncated description.
 * @returns {string} - The truncated description.
 */
export const truncateDescription = (description: string, maxLength: number): string => {
  const words = description.split(' ');
  if (words.length > maxLength) {
    return words.slice(0, maxLength).join(' ') + '...';
  }
  return description;
};
