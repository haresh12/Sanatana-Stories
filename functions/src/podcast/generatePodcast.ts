import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { admin } from '../firebaseApp';

const storage = admin.storage();
const bucket = storage.bucket();
const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);
const textToSpeechClient = new TextToSpeechClient();

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const hosts = ['Neha Sharma', 'Priya Kumar', 'Shreya Mehta'];
const guests = ['Sadhguru', 'Swami Vivekananda', 'Sri Sri Ravi Shankar', 'Baba Ramdev', 'Osho'];

async function textToSpeech(text: string, voiceName: string, outputFile: string) {
  if (!text) {
    throw new Error('Text input is empty');
  }
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: { languageCode: 'en-IN', name: voiceName },
    audioConfig: { audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 }
  };

  const [response] = await textToSpeechClient.synthesizeSpeech(request);
  fs.writeFileSync(outputFile, response.audioContent as Uint8Array, 'binary');
}

async function mergeAudioFiles(audioFiles: string[], outputFile: string, tmpFolder: string) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    audioFiles.forEach((file) => {
      command.input(file);
    });

    command
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        resolve(outputFile);
      })
      .mergeToFile(outputFile, tmpFolder);
  });
}

async function generatePodcastScript(topic: string, hostName: string, guestName: string): Promise<{ title: string, script: { host: string, guest: string }[] }> {
  const podcastTitle = `Podcast about ${topic}`;
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature:1, 
      responseMimeType: "application/json",
      maxOutputTokens: 16000  
    },
    systemInstruction: `
      You are an expert in ${topic}. 
      Generate a comprehensive and complete podcast script that is engaging, informative, and captivating for the listeners. 
      Structure the podcast as a detailed dialogue between the host, ${hostName}, and the guest, ${guestName}. 
      Ensure that the conversation flows naturally and that the script is complete, covering various aspects such as historical significance, modern relevance, spiritual insights, and practical applications. 
      Confirm that the script is complete and does not require further expansion.
    `
  });

  const prompt = `
    Generate a podcast script of around 20 minutes or approximately 25,000 words on the topic of ${topic}. 
    The script should be structured as an array of objects with dialogues between host ${hostName} and guest ${guestName}. 
    Each object should have 'host' and 'guest' properties containing the dialogue. 
    Use the following schema:
    {
      "title": "${podcastTitle}",
      "script": [
        {
          "host": "string",
          "guest": "string"
        }
      ]
    }
    Ensure the script is fully complete and that each aspect of the topic is well covered.
  `;

  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  let podcastData: { title: string, script: { host: string, guest: string }[] };
  try {
    podcastData = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
    console.error("Response text:", responseText);
    throw new functions.https.HttpsError('internal', 'Unable to parse podcast script.');
  }

  if (!podcastData || !podcastData.script || podcastData.script.length === 0) {
    throw new functions.https.HttpsError('internal', 'Generated script is empty or incomplete.');
  }

  return podcastData;
}

export const generatePodcast = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    const { userId, topic } = data;
    if (!userId || !topic) {
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with the userId and topic.');
    }

    shuffle(hosts);
    shuffle(guests);
    const chosenHost = hosts[0];
    const chosenGuest = guests[0];

    try {
      const podcastData = await generatePodcastScript(topic, chosenHost, chosenGuest);

      const audioFiles: string[] = [];
      for (let i = 0; i < podcastData.script.length; i++) {
        const segment = podcastData.script[i];
        const hostText = segment?.host?.trim();
        const guestText = segment?.guest?.trim();

        if (!hostText) {
          console.warn(`Skipping empty host dialogue at index ${i}`);
          continue;
        }

        if (!guestText) {
          console.warn(`Skipping empty guest dialogue at index ${i}`);
          continue;
        }

        const hostFile = path.join('/tmp', `host_${i}.mp3`);
        const guestFile = path.join('/tmp', `guest_${i}.mp3`);

        await textToSpeech(hostText, 'en-IN-Neural2-A', hostFile);
        await textToSpeech(guestText, 'en-IN-Neural2-B', guestFile);

        audioFiles.push(hostFile, guestFile);
      }

      const outputFilePath = path.join('/tmp', 'final_podcast.mp3');
      await mergeAudioFiles(audioFiles, outputFilePath, '/tmp');

      const finalFile = bucket.file(`tts/final_podcast_${Date.now()}.mp3`);
      await bucket.upload(outputFilePath, {
        destination: finalFile.name,
        metadata: { contentType: 'audio/mpeg' }
      });

      const [fileMetadata] = await finalFile.getMetadata();
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(finalFile.name)}?alt=media&token=${fileMetadata?.metadata?.firebaseStorageDownloadTokens}`;

      const userDocRef = admin.firestore().collection('users').doc(userId);
      await userDocRef.collection('podcasts').add({
        title: podcastData.title,
        script: podcastData.script,
        audioUrl: publicUrl,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return { title: podcastData.title, script: podcastData.script, audioUrl: publicUrl };
    } catch (error) {
      console.error("Error generating podcast script:", error);
      throw new functions.https.HttpsError('internal', 'Unable to generate podcast script.');
    }
  });
