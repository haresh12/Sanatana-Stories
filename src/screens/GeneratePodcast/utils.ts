import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import { GeneratePodcastResponse } from './types';

/**
 * Handles the generation of a podcast by calling the Firebase function and updating the state with the response data.
 * @param {any} currentUser - The current user object containing user details.
 * @param {(value: boolean) => void} setLoading - Function to set the loading state.
 * @param {(script: any[]) => void} setScript - Function to set the podcast script.
 * @param {(url: string | null) => void} setAudioUrl - Function to set the audio URL of the podcast.
 * @param {(title: string) => void} setTitle - Function to set the title of the podcast.
 */
export const handleGeneratePodcast = async (
  currentUser: any,
  setLoading: (value: boolean) => void,
  setScript: (script: any[]) => void,
  setAudioUrl: (url: string | null) => void,
  setTitle: (title: string) => void
) => {
  if (!currentUser) {
    return;
  }

  setLoading(true);
  try {
    const generatePodcast = httpsCallable<{ userId: string }, GeneratePodcastResponse>(functions, 'generatePodcast');
    const response = await generatePodcast({ userId: currentUser.uid });
    const data = response.data;
    setScript(data.script);
    setAudioUrl(data.audioUrl);
    setTitle(data.title);
  } catch (error) {
    console.error('Error generating podcast:', error);
  } finally {
    setLoading(false);
  }
};

/**
 * Handles playing the podcast audio by setting up a new Audio object and playing the audio.
 * @param {string | null} audioUrl - The URL of the podcast audio.
 * @param {React.MutableRefObject<HTMLAudioElement | null>} audioRef - A reference to the HTMLAudioElement.
 * @param {(value: boolean) => void} setIsPlaying - Function to set the playing state.
 */
export const handleListenToPodcast = (
  audioUrl: string | null,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  setIsPlaying: (value: boolean) => void
) => {
  if (audioUrl) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioRef.current = new Audio(audioUrl);
    audioRef.current.play();
    setIsPlaying(true);
    audioRef.current.onended = () => setIsPlaying(false);
  }
};

/**
 * Handles stopping the podcast audio by pausing the current audio and setting the playing state to false.
 * @param {React.MutableRefObject<HTMLAudioElement | null>} audioRef - A reference to the HTMLAudioElement.
 * @param {(value: boolean) => void} setIsPlaying - Function to set the playing state.
 */
export const handleStopPodcast = (
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  setIsPlaying: (value: boolean) => void
) => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
  }
  setIsPlaying(false);
};
