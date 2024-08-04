import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';

/**
 * Validates if the given URL is a valid YouTube URL.
 * 
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is a valid YouTube URL, false otherwise.
 */
export const validateYouTubeUrl = (url: string): boolean => {
  const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
};

/**
 * Fetches the summary for a given YouTube video URL.
 * 
 * @param {string} videoUrl - The URL of the YouTube video.
 * @returns {Promise<{ summary: string } | null>} - The fetched summary or null if an error occurs.
 */
export const fetchSummary = async (videoUrl: string): Promise<{ summary: string } | null> => {
  try {
    const summarizeSatsang = httpsCallable<{ videoUrl: string }, { summary: string }>(functions, 'summarizeSatsang');
    const response = await summarizeSatsang({ videoUrl });
    return response.data;
  } catch (error) {
    console.error('Error summarizing Satsang:', error);
    return null;
  }
};
