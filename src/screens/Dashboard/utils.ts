import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';

/**
 * Truncates text to a specified maximum length and appends ellipses if necessary.
 * @param {string} text - The text to be truncated.
 * @param {number} maxLength - The maximum length of the text.
 * @returns {string} - The truncated text.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Fetches detailed information about a given content.
 * @param {string} content - The content to fetch detailed information for.
 * @param {'funFact' | 'myth'} type - The type of content ('funFact' or 'myth').
 * @param {Function} setDetailedInfo - Function to set the detailed information state.
 * @param {Function} setDetailedOpen - Function to set the state indicating whether the detailed information modal is open.
 * @param {Function} setFetching - Function to set the fetching state.
 */
export const fetchDetailedInfo = async (
  content: string,
  type: 'funFact' | 'myth',
  setDetailedInfo: (info: string) => void,
  setDetailedOpen: (open: boolean) => void,
  setFetching: (fetching: boolean) => void,
  setFetchingCard: (fetchingCard: 'funFact' | 'myth' | null) => void
): Promise<void> => {
  setFetching(true);
  setFetchingCard(type);
  try {
    const getDetailedInfo = httpsCallable<{ content: string, type: 'funFact' | 'myth' }, { detailedInfo: string }>(functions, 'getDetailedInfo');
    const response = await getDetailedInfo({ content, type });
    const data = response.data as { detailedInfo: string };
    setDetailedInfo(data.detailedInfo);
    setDetailedOpen(true);
  } catch (error) {
    console.error('Error fetching detailed information:', error);
  } finally {
    setFetching(false);
    setFetchingCard(null);
  }
};
