import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebaseApp';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import { admin } from '../firebaseApp';
import * as path from 'path';
import * as util from 'util';

const storage = admin.storage();
const bucket = storage.bucket();
const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);
const textToSpeechClient = new TextToSpeechClient();
const writeFile = util.promisify(fs.writeFile);

/**
 * Synthesizes speech from text and saves it as an MP3 file.
 *
 * @param {string} text - The text to synthesize.
 * @param {string} outputFile - The path to the output file.
 * @returns {Promise<void>}
 */
async function synthesizeSpeech(text: string, outputFile: string): Promise<void> {
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-C' },
    audioConfig: { audioEncoding: 'MP3' },
  };
  const [response] = await textToSpeechClient.synthesizeSpeech(request);
  await writeFile(outputFile, response.audioContent as Uint8Array, 'binary');
}

async function uploadFileToStorage(filePath: string, destination: string): Promise<string> {
  const [file] = await bucket.upload(filePath, {
    destination,
    metadata: {
      contentType: 'audio/mpeg',
      metadata: {
        firebaseStorageDownloadTokens: Math.random().toString(36).substring(2),
      },
    },
  });
  const [fileMetadata] = await file.getMetadata();
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${fileMetadata?.metadata?.firebaseStorageDownloadTokens}`;
}

function cleanTextForAudio(text: string): string {
  return text.replace(/\*\*/g, '').replace(/[\u{1F600}-\u{1F64F}]/gu, '');
}

/**
 * Cloud Function to handle chat interactions related to the Hindu Puranas.
 *
 * This function receives a message from a user, processes it using Google Generative AI,
 * and returns a response with synthesized speech. The response is based on the Hindu Puranas.
 *
 * @param {Object} data - The input data for the function.
 * @param {string} data.userId - The user ID.
 * @param {string} data.message - The message from the user.
 * @param {Object} context - The context of the function call.
 * @returns {Promise<Object>} An object containing the message and audio URL.
 * @throws {functions.https.HttpsError} Throws an internal error if the chat cannot be processed.
 */
export const puranasChat = functions.https.onCall(async (data, context) => {
  const { userId, message } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `
      You are a knowledgeable virtual representation of the Hindu Puranas, a genre of ancient Indian scriptures that narrate the history of the universe from creation to destruction, genealogies of kings, heroes, sages, and demigods, and descriptions of Hindu cosmology, philosophy, and geography.
      Your role is to provide accurate and insightful information related to the Hindu Puranas. 
      You should:
      1. Answer questions about the stories, characters, and teachings found in the Hindu Puranas.
      2. Provide summaries and explanations of key Puranas and their significance.
      3. Discuss the cultural and religious importance of the Puranas in Hindu tradition.
      4. Share anecdotes and stories associated with various Puranas.
      If a question is unrelated to the Hindu Puranas, respond humorously to indicate your limitation in answering that particular question.
      Remember to maintain a respectful and informative tone, embodying the wisdom and reverence associated with the Hindu Puranas.
    `,
    generationConfig: {
      temperature: 1,
      topK: 50,
      topP: 0.9,
      maxOutputTokens: 15000
    },
  });

  try {
    const userChatRef = db.collection('users').doc(userId).collection('puranasChat').doc('history');
    const chatDoc = await userChatRef.get();
    let history = [];

    if (!chatDoc.exists) {
      const welcomeMessage = 'Welcome to the Hindu Puranas Chat! Here, you can ask any questions related to the ancient scriptures of Hinduism known as the Puranas. Whether it\'s about the stories of deities, the creation myths, or the philosophical teachings, I am here to provide you with insightful information. If your question is unrelated, be prepared for a humorous response! How can I assist you today?';

      const welcomeAudioFile = path.join('/tmp', 'puranas_welcome.mp3');
      await synthesizeSpeech(welcomeMessage, welcomeAudioFile);
      const welcomeAudioUrl = await uploadFileToStorage(welcomeAudioFile, `tts/puranas_welcome_${Date.now()}.mp3`);

      history = [
        { role: 'user', parts: [{ text: '' }] },
        { role: 'model', parts: [{ text: welcomeMessage }] }
      ];

      await userChatRef.set({ history, welcomeAudioUrl });
      return { message: welcomeMessage, audioUrl: welcomeAudioUrl };
    } else {
      history = chatDoc.data()?.history || [];
    }

    history.push({ role: 'user', parts: [{ text: message }] });

    const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 30000 } });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    const cleanedText = cleanTextForAudio(text);

    const responseAudioFile = path.join('/tmp', 'puranas_response.mp3');
    await synthesizeSpeech(cleanedText, responseAudioFile);
    const responseAudioUrl = await uploadFileToStorage(responseAudioFile, `tts/puranas_response_${Date.now()}.mp3`);

    const puranasResponse = { role: 'model', parts: [{ text }] };

    puranasResponse.parts.push({ text: responseAudioUrl });
    history.push(puranasResponse);
    await userChatRef.update({ history });

    return { message: text, audioUrl: responseAudioUrl };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Unable to process chat.');
  }
});
