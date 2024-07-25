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
const genAI = new GoogleGenerativeAI('');
const textToSpeechClient = new TextToSpeechClient();
const writeFile = util.promisify(fs.writeFile);

async function synthesizeSpeech(text: string, outputFile: string): Promise<void> {
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-C' },  
    audioConfig: { audioEncoding: 'MP3' },
  };
  const [response] = await textToSpeechClient.synthesizeSpeech(request);
  await writeFile(outputFile, response.audioContent as Uint8Array, 'binary');
  console.log(`Audio content written to file: ${outputFile}`);
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

export const ramayanChat = functions.https.onCall(async (data, context) => {
  const { userId, message } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `
      You are a knowledgeable virtual representation of the Ramayan, an ancient Indian epic that narrates the life of Prince Rama of Ayodhya.
      Your role is to provide accurate and insightful information related to the Ramayan. 
      You should:
      1. Answer questions about the characters, events, and morals depicted in the Ramayan.
      2. Provide summaries and explanations of key chapters and episodes.
      3. Discuss the cultural and religious significance of the Ramayan.
      4. Share anecdotes and stories associated with the epic.
      If a question is unrelated to the Ramayan, respond humorously to indicate your limitation in answering that particular question.
      Remember to maintain a respectful and informative tone, embodying the wisdom and reverence associated with the Ramayan.
    `,
    generationConfig: {
      temperature: 0.7,
      topK: 50,
      topP: 0.9,
      maxOutputTokens: 150,
    },
  });

  try {
    const userChatRef = db.collection('users').doc(userId).collection('ramayanChat').doc('history');
    const chatDoc = await userChatRef.get();
    let history = [];

    if (!chatDoc.exists) {
      const welcomeMessage = 'Welcome to the Ramayan Chat! Here, you can ask any questions related to the epic story of Ramayan. From the life of Prince Rama to the adventures of Hanuman, I am here to provide you with insightful information. If your question is unrelated, be prepared for a humorous response! How can I assist you today?';

      const welcomeAudioFile = path.join('/tmp', 'ramayan_welcome.mp3');
      await synthesizeSpeech(welcomeMessage, welcomeAudioFile);
      const welcomeAudioUrl = await uploadFileToStorage(welcomeAudioFile, `tts/ramayan_welcome_${Date.now()}.mp3`);

      history = [
        { role: 'user', parts: [{ text: '' }] },
        { role: 'model', parts: [{ text: welcomeMessage, audioUrl: welcomeAudioUrl }] }
      ];

      await userChatRef.set({ history });
      return { message: welcomeMessage, audioUrl: welcomeAudioUrl };
    }

    history.push({ role: 'user', parts: [{ text: message }] });

    const chat = model.startChat({ history, generationConfig: { maxOutputTokens: 100 } });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    const ramayanResponse = { role: 'model', parts: [{ text, audioUrl: '' }] };

    const responseAudioFile = path.join('/tmp', 'ramayan_response.mp3');
    await synthesizeSpeech(text, responseAudioFile);
    const responseAudioUrl = await uploadFileToStorage(responseAudioFile, `tts/ramayan_response_${Date.now()}.mp3`);

    ramayanResponse.parts[0].audioUrl = responseAudioUrl;
    history.push(ramayanResponse);
    await userChatRef.set({ history });

    return { message: text, audioUrl: responseAudioUrl };
  } catch (error) {
    console.error("Error in ramayanChat function:", error);
    throw new functions.https.HttpsError('internal', 'Unable to process chat.');
  }
});
