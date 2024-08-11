import { collection, addDoc, getDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Dispatch } from 'redux';
import { db } from '../../firebaseConfig';
import { Message } from './types';
import { setHasSeenRules } from '../../store/authSlice';
import { STRINGS } from '../../const/strings';

/**
 * Fetches messages from the Firestore database and sets them in the provided state.
 * @param {Function} setMessages - Function to set the messages state.
 */
export const fetchMessages = (setMessages: (messages: Message[]) => void): void => {
  const q = query(collection(db, 'comments'), orderBy('timestamp', 'asc'));
  onSnapshot(q, (snapshot) => {
    const messagesList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    setMessages(messagesList);
  });
};

/**
 * Handles sending a message to the Firestore database.
 * @param {string} input - The input message text.
 * @param {Function} setLoading - Function to set the loading state.
 * @param {any} currentUser - The current user object.
 * @param {string | null} userName - The user's name.
 * @param {Function} setInput - Function to set the input state.
 */
export const handleSendMessage = async (
  input: string,
  setLoading: (loading: boolean) => void,
  currentUser: any,
  userName: string | null,
  setInput: (input: string) => void
): Promise<void> => {
  if (input.trim() === '') return;
  setLoading(true);
  try {
    setInput('');
    const docRef = await addDoc(collection(db, 'comments'), {
      user: currentUser?.email,
      text: input,
      name: userName ?? currentUser?.displayName ?? 'Anonymous',
      timestamp: serverTimestamp()
    });
    setTimeout(async () => {
      const docSnapshot = await getDoc(docRef);
      const data = docSnapshot.data() as Message;
      const scores = data.attribute_scores;
      if (
        scores &&
        (
          (scores.TOXICITY && scores.TOXICITY > 0.4) ||
          (scores.IDENTITY_ATTACK && scores.IDENTITY_ATTACK > 0.4) ||
          (scores.INSULT && scores.INSULT > 0.4) ||
          (scores.PROFANITY && scores.PROFANITY > 0.4) ||
          (scores.SEVERE_TOXICITY && scores.SEVERE_TOXICITY > 0.4) ||
          (scores.THREAT && scores.THREAT > 0.4)
        )
      ) {
        await updateDoc(doc(db, 'comments', docRef.id), {
          text: "[Message Removed due to inappropriate content]"
        });
      }
    }, 2000);

  } catch (error) {
    console.error(STRINGS.errorSendingMessage, error);
  }
  setLoading(false);
};

/**
 * Scrolls to the bottom of the messages container.
 * @param {React.RefObject<HTMLDivElement>} messagesEndRef - Reference to the end of the messages container.
 */
export const scrollToBottom = (messagesEndRef: React.RefObject<HTMLDivElement>): void => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Initializes the speech recognition object and sets up event handlers.
 * @param {React.MutableRefObject<SpeechRecognition | null>} recognitionRef - Reference to the speech recognition object.
 * @param {React.Dispatch<React.SetStateAction<string>>} setInput - Function to set the input text.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsListening - Function to set the listening state.
 */
export const initializeRecognition = (
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>,
  setInput: React.Dispatch<React.SetStateAction<string>>,
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  } else {
    alert(STRINGS.browserNotSupported);
  }
};

/**
 * Handles speech input by starting the speech recognition.
 * @param {React.MutableRefObject<SpeechRecognition | null>} recognitionRef - Reference to the speech recognition object.
 */
export const handleSpeechInput = (
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>
): void => {
  if (recognitionRef.current) {
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Speech recognition already started");
    }
  }
};

/**
 * Closes the rules modal and updates the Redux state.
 * @param {Dispatch<any>} dispatch - The Redux dispatch function.
 */
export const handleCloseRules = (dispatch: Dispatch<any>): void => {
  dispatch(setHasSeenRules(true));
};
