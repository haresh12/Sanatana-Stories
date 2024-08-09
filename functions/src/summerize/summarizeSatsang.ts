import * as functions from 'firebase-functions';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);

/**
 * Cloud Function to summarize a YouTube Satsang video.
 *
 * This function fetches the transcript of a YouTube video, classifies the content as either
 * "spiritual" or "other," and generates a summary if the content is spiritual. If the content
 * is not spiritual, it provides a humorous response.
 *
 * @param {Object} data - The input data for the function.
 * @param {string} data.videoUrl - The URL of the YouTube video.
 * @param {Object} context - The context of the function call.
 * @returns {Promise<Object>} An object containing the summary of the video or a humorous response.
 * @throws {functions.https.HttpsError} Throws an error if the video URL is invalid, no transcript is found, or the video cannot be processed.
 */
export const summarizeSatsang = functions.https.onCall(async (data, context) => {
  const { videoUrl } = data;

  const videoIdMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch || videoIdMatch.length < 2) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid YouTube URL');
  }

  const videoId = videoIdMatch[1];

  let transcript = '';

  try {
    const transcriptParts = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcriptParts || transcriptParts.length === 0) {
      throw new Error('Transcript not found');
    }

    transcript = transcriptParts.map(part => part.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript from YouTube:', error);

    // Fallback to Gemini to obtain the transcript
    const fallbackPrompt = `
      Please provide a transcript for the following YouTube video:
      URL: ${videoUrl}
    `;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: `
          You are an expert in analyzing and summarizing content. Your task is to retrieve the transcript for the provided YouTube URL.
        `,
        generationConfig: {
          temperature: 0.7,
          topK: 50,
          topP: 0.9,
          maxOutputTokens: 2000,
        },
      });

      const fallbackResult = await model.generateContent(fallbackPrompt);
      transcript = await fallbackResult.response.text();

      if (!transcript || transcript.trim() === '') {
        throw new Error('Gemini failed to retrieve the transcript');
      }
    } catch (fallbackError) {
      console.error('Error retrieving transcript using Gemini:', fallbackError);
      throw new functions.https.HttpsError('internal', 'Unable to retrieve transcript. Please ensure the video has captions enabled.');
    }
  }

  try {
    const prompt = `
    Here is a transcript from a video:
    "${transcript}"
  
    Your task is to classify the content of this transcript into one of two categories: "spiritual" or "other."
  
    **Spiritual Content Criteria:**
    - Consider the content "spiritual" if it contains any references to Hinduism, including but not limited to the following:
      - Mention of Hindu deities (e.g., Lord Krishna, Lord Shiva, Goddess Durga)
      - References to Hindu scriptures (e.g., Bhagavad Gita, Ramayana, Vedas, Upanishads)
      - Discussions about gurus, spiritual leaders, or practices (e.g., meditation, yoga, satsang)
      - Themes of self-realization, moksha, dharma, karma, or any other spiritual or religious teachings
      - Any mention of temples, rituals, or spiritual ceremonies
  
    **Non-Spiritual Content Criteria:**
    - Consider the content "other" if it does not contain any of the above-mentioned elements.
  
    **Instructions:**
    - If the content is spiritual, generate a concise summary that highlights the main points, essential details, and key takeaways. The summary should be engaging, easy to understand, and focused on the spiritual aspects.
    - If the content is not spiritual, respond with a humorous statement saying: "This video is not spiritual, so we can't generate a summary."
  
    Ensure that your classification is based on a deep understanding of Hinduism and spiritual concepts, and be as accurate as possible in your assessment.
  `;
  

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: `
        You are an expert in analyzing and summarizing content. Your task is to classify the provided transcript and either summarize it if it is spiritual or provide a humorous response if it is not.
      `,
      generationConfig: {
        temperature: 0.8,
        topK: 50,
        topP: 0.9,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    return { summary: responseText.trim() };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new functions.https.HttpsError('internal', 'Unable to generate summary. Please try again later.');
  }
});
