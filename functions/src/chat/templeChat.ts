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

export const templeChat = functions.https.onCall(async (data, context) => {
  const { userId, templeName, message } = data;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `
      You are the virtual representation of ${templeName}, a temple of great cultural and historical significance in Hinduism. 
      Your role is to provide accurate and insightful information related to ${templeName}. 
      You should:
      1. Answer questions about ${templeName}'s history, significance, deities, rituals, festivals, and architecture.
      2. Provide guidance on pilgrimage, visiting hours, special events, and local customs at ${templeName}.
      3. Offer spiritual insights and stories related to the deities worshiped at ${templeName}.
      4. If the user's question is unrelated to ${templeName}, respond humorously to indicate your limitation in answering that particular question.
      Remember to maintain a respectful and informative tone, embodying the spirit and reverence associated with ${templeName}.
    `,
    generationConfig: {
      temperature: 0.7,
      topK: 50,
      topP: 0.9,
      maxOutputTokens: 150,
    },
  });

  try {
    const userChatRef = db.collection('users').doc(userId).collection('templeChat').doc(templeName);
    const chatDoc = await userChatRef.get();
    let history = [];

    if (!chatDoc.exists) {
      let welcomeMessage = '';
      switch (templeName.toLowerCase()) {
        case 'vaishno devi temple':
          welcomeMessage = 'Welcome to Vaishno Devi Temple, nestled in the Trikuta Mountains. How can I assist you today? Feel free to ask about the pilgrimage, the Goddess Vaishno Devi, or any related legends.';
          break;
        case 'tirumala venkateswara temple':
          welcomeMessage = 'Welcome to Tirumala Venkateswara Temple. How can I assist you today? Feel free to ask about Lord Venkateswara, the Tirumala temple, rituals, or any related stories.';
          break;
        case 'jagannath temple':
          welcomeMessage = 'Welcome to Jagannath Temple in Puri. How can I assist you today? Ask about the annual Rath Yatra, Lord Jagannath, or the temple’s historical significance.';
          break;
        case 'kashi vishwanath temple':
          welcomeMessage = 'Welcome to Kashi Vishwanath Temple in Varanasi. How can I assist you today? Feel free to ask about Lord Shiva, the temple’s history, or the rituals performed here.';
          break;
        case 'meenakshi amman temple':
          welcomeMessage = 'Welcome to Meenakshi Amman Temple in Madurai. How can I assist you today? Ask about the temple’s stunning architecture, the Goddess Meenakshi, or any related stories.';
          break;
        case 'golden temple':
          welcomeMessage = 'Welcome to the Golden Temple in Amritsar. How can I assist you today? Feel free to ask about its history, Sikh traditions, or the peaceful atmosphere here.';
          break;
        case 'somnath temple':
          welcomeMessage = 'Welcome to Somnath Temple in Gujarat. How can I assist you today? Ask about Lord Shiva, the temple’s history, or the rituals performed here.';
          break;
        case 'siddhivinayak temple':
          welcomeMessage = 'Welcome to Siddhivinayak Temple in Mumbai. How can I assist you today? Feel free to ask about Lord Ganesha, the temple’s significance, or the traditions followed here.';
          break;
        case 'ramanathaswamy temple':
          welcomeMessage = 'Welcome to Ramanathaswamy Temple in Rameswaram. How can I assist you today? Ask about the temple’s long corridors, Lord Shiva, or any related legends.';
          break;
        case 'mahabodhi temple':
          welcomeMessage = 'Welcome to Mahabodhi Temple in Bodh Gaya. How can I assist you today? Feel free to ask about Lord Buddha, the Bodhi tree, or the temple’s historical significance.';
          break;
        case 'lingaraja temple':
          welcomeMessage = 'Welcome to Lingaraja Temple in Bhubaneswar. How can I assist you today? Ask about Lord Shiva, the temple’s architecture, or any related traditions.';
          break;
        case 'akshardham temple':
          welcomeMessage = 'Welcome to Akshardham Temple in Delhi. How can I assist you today? Feel free to ask about its stunning architecture, the gardens, or the spiritual ambiance.';
          break;
        case 'shirdi sai baba temple':
          welcomeMessage = 'Welcome to Shirdi Sai Baba Temple. How can I assist you today? Feel free to ask about Sai Baba’s teachings, miracles, or anything related to Shirdi.';
          break;
        case 'kedarnath temple':
          welcomeMessage = 'Welcome to Kedarnath Temple in the Himalayas. How can I assist you today? Ask about Lord Shiva, the temple’s history, or the pilgrimage journey.';
          break;
        case 'badrinath temple':
          welcomeMessage = 'Welcome to Badrinath Temple in Uttarakhand. How can I assist you today? Feel free to ask about Lord Vishnu, the temple’s significance, or the traditions followed here.';
          break;
        default:
          welcomeMessage = `Welcome to ${templeName}, a place of great reverence and spiritual significance. How can I assist you today?`;
      }

      const welcomeAudioFile = path.join('/tmp', `${templeName}_welcome.mp3`);
      await synthesizeSpeech(welcomeMessage, welcomeAudioFile);
      const welcomeAudioUrl = await uploadFileToStorage(welcomeAudioFile, `tts/${templeName}_welcome_${Date.now()}.mp3`);

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
    const templeResponse = { role: 'model', parts: [{ text, audioUrl: '' }] };

    const responseAudioFile = path.join('/tmp', `${templeName}_response.mp3`);
    await synthesizeSpeech(text, responseAudioFile);
    const responseAudioUrl = await uploadFileToStorage(responseAudioFile, `tts/${templeName}_response_${Date.now()}.mp3`);

    templeResponse.parts[0].audioUrl = responseAudioUrl;
    history.push(templeResponse);
    await userChatRef.set({ history });

    return { message: text, audioUrl: responseAudioUrl };
  } catch (error) {
    console.error("Error in handleTempleChat function:", error);
    throw new functions.https.HttpsError('internal', 'Unable to process chat.');
  }
});
