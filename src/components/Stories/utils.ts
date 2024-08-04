import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref } from 'firebase/storage';
import { functions, db, storage } from '../../firebaseConfig';

export const handleGenerateNewStory = async (
  templeId: string,
  templeName: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setStory: React.Dispatch<React.SetStateAction<string>>,
  currentUserUid: string | undefined
) => {
  setLoading(true);
  try {
    const storyDocRef = doc(db, `users/${currentUserUid}/stories/${templeId}`);
    await deleteDoc(storyDocRef);

    const generateStory = httpsCallable(functions, 'generateStory');
    const response = await generateStory({ templeName });
    const { story } = response.data as { story: string };

    setStory(story);

    const storyData = { text: story };

    await setDoc(storyDocRef, storyData);
  } catch (error) {
    console.error('Error generating new story:', error);
    setError('Failed to generate a new story. Please try again later.');
  } finally {
    setLoading(false);
  }
};

export const handleListen = async (
  templeId: string,
  initialStory: string,
  setAudioLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  setHighlightedWordIndex: React.Dispatch<React.SetStateAction<number>>,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  currentUserUid: string | undefined
) => {
  setAudioLoading(true);
  setTimeout(async () => {
    try {
      const storyDocRef = doc(db, `users/${currentUserUid}/stories/${templeId}`);
      const storyDoc = await getDoc(storyDocRef);
      if (storyDoc.exists()) {
        const storyData = storyDoc.data();
        const audioPath = storyData?.audioPath;
        if (audioPath) {
          const audioRefPath = ref(storage, audioPath);
          const audioDownloadUrl = await getDownloadURL(audioRefPath);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          audioRef.current = new Audio(audioDownloadUrl);
          audioRef.current.playbackRate = 0.9;
          audioRef.current.play();
          setIsPlaying(true);
          audioRef.current.ontimeupdate = () => {
            const currentTime = audioRef.current?.currentTime || 0;
            const words = initialStory.split(' ');
            const wordsPerSecond = words.length / (audioRef.current?.duration || 1);
            const currentWordIndex = Math.floor(currentTime * wordsPerSecond);
            setHighlightedWordIndex(currentWordIndex);
          };
          audioRef.current.onended = () => {
            setIsPlaying(false);
            setHighlightedWordIndex(-1);
          };
        } else {
          setError('No audio available for this story.');
        }
      } else {
        setError('No story available for this temple.');
      }
    } catch (error) {
      console.error('Error during text-to-speech:', error);
      setError('Failed to play the audio. Please try again later.');
    } finally {
      setAudioLoading(false);
    }
  }, 3000);
};

export const handlePause = (
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (audioRef.current) {
    audioRef.current.pause();
    setIsPlaying(false);
  }
};
