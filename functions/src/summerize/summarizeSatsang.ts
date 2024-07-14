import * as functions from 'firebase-functions';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("");

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

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: `
          You are an expert summarizer. Your task is to transform the provided transcript into a concise, coherent, and engaging summary. Highlight the main points, essential details, and key takeaways. Make the summary easy to read and understand for a general audience, ensuring that it captures the essence of the content effectively.
        `,
        generationConfig: {
          temperature: 0.7,
          topK: 50,
          topP: 0.9,
        },
      });
  
      const prompt = `
        Here is a transcript from a Satsang video. Please provide a summary that highlights the main points, essential details, and key takeaways. Ensure the summary is concise, engaging, and easy to understand:
        "${transcript}"
      `;
  

    const result = await model.generateContent(prompt);
    const summary = await result.response.text();

    return { summary };
  } catch (error) {
    console.error('Error summarizing video:', error);
    throw new functions.https.HttpsError('internal', 'Unable to summarize video. Please ensure the video has captions enabled.');
  }
});
