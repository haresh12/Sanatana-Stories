import * as functions from 'firebase-functions';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';
//REMOVED FEATURE
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

  try {
    const transcriptParts = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcriptParts || transcriptParts.length === 0) {
      throw new functions.https.HttpsError('not-found', 'No transcript found for this video');
    }

    const transcript = transcriptParts.map(part => part.text).join(' ');

    const prompt = `
      Here is a transcript from a video:
      "${transcript}"
      
      First, classify the content of this transcript. Respond with "spiritual" if it is related to spiritual or satsang topics, otherwise respond with "other".
      If the content is spiritual, make sure if transcript contains any single word about hindu things then it is spritual video provide a summary that highlights the main points, essential details, and key takeaways. Ensure the summary is concise, engaging, and easy to understand.
      If the content is not spiritual, then don't need to say anything about transcript of video we just need to say this video is not spritual so can't not generate transcript but we need to say it funny way
    `;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: `
        You are an expert in analyzing and summarizing content. Your task is to classify the provided transcript and either summarize it if it is spiritual or provide a humorous response if it is not.
      `,
      generationConfig: {
        temperature: 0.7,
        topK: 50,
        topP: 0.9,
        maxOutputTokens: 300,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    return { summary: responseText.trim() };
  } catch (error) {
    console.error('Error processing video:', error);
    throw new functions.https.HttpsError('internal', 'Unable to process video. Please ensure the video has captions enabled.');
  }
});
