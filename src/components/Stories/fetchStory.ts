import { doc, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../../firebaseConfig';

export const fetchStory = async (
  templeId: string,
  templeName: string,
  setStory: React.Dispatch<React.SetStateAction<string>>,
  currentUserUid: string | undefined,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    const storyDocRef = doc(db, `users/${currentUserUid}/stories/${templeId}`);
    const storyDoc = await getDoc(storyDocRef);
    if (storyDoc.exists()) {
      const storyData = storyDoc.data();
      setStory(storyData?.text || '');
    } else {
      const generateStory = httpsCallable(functions, 'generateStory');
      const response = await generateStory({ templeName });
      const { story } = response.data as { story: string };

      setStory(story);

      const storyData = { text: story };

      await setDoc(storyDocRef, storyData);
    }
  } catch (error) {
    console.error('Error fetching story:', error);
    setError('Failed to load the story. Please try again later.');
  } finally {
    setLoading(false);
  }
};
