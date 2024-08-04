import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';

export const fetchMeaning = async (text: string): Promise<string> => {
  const getMeaning = httpsCallable<{ text: string }, { meaning: string }>(functions, 'getMeaning');
  const response = await getMeaning({ text });
  return response.data.meaning;
};
