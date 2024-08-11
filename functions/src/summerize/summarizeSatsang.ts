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
    - Consider the content "spiritual" if it contains any references, even subtle or indirect, to Hinduism or spirituality, including but not limited to the following:
      - **Mention of Hindu deities**: Such as Lord Krishna, Lord Shiva, Goddess Durga, Lord Ganesha, Goddess Lakshmi, or any other Hindu gods and goddesses.
      - **References to Hindu scriptures**: Including but not limited to the Bhagavad Gita, Ramayana, Mahabharata, Vedas, Upanishads, Puranas, or other significant texts.
      - **Discussions about gurus and spiritual leaders**: Teachings, discourses, or stories related to prominent Hindu gurus, saints, sages, or spiritual figures like Swami Vivekananda, Sri Ramakrishna, or modern-day spiritual leaders.
      - **Spiritual practices**: Including but not limited to meditation, yoga, pranayama, satsang, bhajans, kirtans, japa (chanting), or any other spiritual rituals or practices.
      - **Themes of spiritual growth and philosophy**: Such as self-realization, moksha (liberation), dharma (duty/righteousness), karma (action/consequence), reincarnation, the concept of the soul (Atman), or other spiritual teachings.
      - **Mention of temples, rituals, or pilgrimages**: Including descriptions of temple visits, spiritual ceremonies, pujas, festivals like Diwali, Navratri, or other religious observances.
      - **Content that promotes spiritual values and virtues**: Such as peace, love, compassion, devotion (bhakti), humility, detachment (vairagya), or teachings that encourage spiritual or moral development.
      - **References to spiritual symbols**: Such as the Om symbol, the lotus flower, the Trishul, or any other spiritual iconography.
      - **Mention of spiritual myths, stories, or legends**: Stories from the epics like Ramayana, Mahabharata, or other mythological narratives that convey moral and spiritual lessons.
      - **Any language or context**: Even if it's subtle, that hints at spiritual enlightenment, inner peace, divine connection, or the pursuit of spiritual truth.
    
    **Non-Spiritual Content Criteria:**
    - Consider the content "other" if it does not contain any of the above-mentioned elements.
    - Examples of non-spiritual content might include topics such as lifestyle, technology, entertainment, news, or general education that are not explicitly related to spiritual or religious themes.
    
    **Instructions:**
    - If there is even a minimal indication (as low as 0.001%) that the content is spiritual, proceed to generate a transcript and classify it as "spiritual."
    - If the content is spiritual, generate a concise summary that highlights the main points, essential details, and key takeaways. The summary should be engaging, easy to understand, and focused on the spiritual aspects of the video.
    - If the content is classified as "other," respond with a humorous statement like: "This video isn't about spirituality, so we can't generate a summary. Maybe next time!"
    
    Ensure that your classification is based on a comprehensive and deep understanding of Hinduism, spirituality, and related cultural concepts. Your assessment should be as accurate and thoughtful as possible, considering both explicit and implicit references to spiritual content.
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
