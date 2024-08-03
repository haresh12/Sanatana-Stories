import { Dispatch } from 'redux';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebaseConfig';
import { setGodName, setMessages } from '../../store/chatSlice';
import { God, Message } from './types';

/**
 * Fetches the name of the god based on the provided godId and dispatches it to the Redux store.
 * @param {string | undefined} godId - The ID of the god to fetch the name for.
 * @param {Dispatch} dispatch - The Redux dispatch function.
 * @returns {Promise<void>}
 */
export const fetchGodName = async (godId: string | undefined, dispatch: Dispatch): Promise<void> => {
  try {
    const godsCollection = collection(db, 'gods');
    const godsSnapshot = await getDocs(godsCollection);
    const godsList = godsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as God[];
    const god = godsList.find(g => g.id === godId);
    if (god) {
      dispatch(setGodName(god.name));
    }
  } catch (error) {
    console.error('Error fetching god name:', error);
  }
};

/**
 * Initializes the chat with a welcome message from the god.
 * @param {any} currentUser - The current user object.
 * @param {string} godName - The name of the god.
 * @param {Message[]} messages - The current list of messages in the chat.
 * @param {Dispatch} dispatch - The Redux dispatch function.
 * @returns {Promise<void>}
 */
export const initializeChat = async (currentUser: any, godName: string, messages: Message[], dispatch: Dispatch): Promise<void> => {
  if (currentUser && godName && messages.length === 0) {
    try {
      const handleChat = httpsCallable(functions, 'handleChat');
      const response = await handleChat({ userId: currentUser.uid, godName, message: '' });
      const responseData = response.data as { message: string; welcomeMessage: string; audioUrl: string };
      dispatch(setMessages([{ role: 'model', message: responseData.welcomeMessage, audioUrl: responseData.audioUrl }]));
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  }
};

/**
 * Plays or pauses the audio message based on the provided index.
 * @param {number} index - The index of the audio message to play or pause.
 * @param {string} audioUrl - The URL of the audio message.
 * @param {React.MutableRefObject<HTMLAudioElement | null>} audioRef - The reference to the audio element.
 * @param {number | null} playingIndex - The index of the currently playing audio message.
 * @param {React.Dispatch<React.SetStateAction<number | null>>} setPlayingIndex - The function to set the currently playing audio index.
 */
export const playAudio = (
  index: number,
  audioUrl: string,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  playingIndex: number | null,
  setPlayingIndex: React.Dispatch<React.SetStateAction<number | null>>
): void => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  if (playingIndex === index) {
    setPlayingIndex(null);
  } else {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.play().catch(error => {
      console.error('Error playing audio:', error);
    });
    audioRef.current.onended = () => {
      setPlayingIndex(null);
    };
    setPlayingIndex(index);
  }
};

/**
 * Initializes the speech recognition object and sets up event handlers.
 * @param {React.MutableRefObject<SpeechRecognition | null>} recognitionRef - The reference to the speech recognition object.
 * @param {React.Dispatch<React.SetStateAction<string>>} setInput - The function to set the input text.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setListening - The function to set the listening state.
 */
export const initializeRecognition = (
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>,
  setInput: React.Dispatch<React.SetStateAction<string>>,
  setListening: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };
  } else {
    alert('Your browser does not support speech recognition.');
  }
};

/**
 * Handles the speech input by starting the speech recognition if it's not already listening.
 * @param {React.MutableRefObject<SpeechRecognition | null>} recognitionRef - The reference to the speech recognition object.
 * @param {boolean} listening - The current listening state.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setListening - The function to set the listening state.
 */
export const handleSpeechInput = (
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>,
  listening: boolean,
  setListening: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  if (recognitionRef.current && !listening) {
    recognitionRef.current.start();
  }
};
