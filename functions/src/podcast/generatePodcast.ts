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

const topics = [
  'Hindu Puranas', 'Ramayan', 'Mahabharat', 'Hindu culture', 'Vedas', 
  'Upanishads', 'Yoga philosophy', 'Ayurveda', 'Hindu temples', 'Bhagavad Gita',
  'Love and Relationships', 'Life and Happiness', 'Overcoming Challenges', 
  'Finding Purpose', 'Mindfulness and Meditation', 'Spiritual Practices', 
  'Festivals and Celebrations', 'Hindu Mythology', 'Deities and Worship', 
  'Karma and Dharma', 'Pilgrimages'
];

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
  console.log(`Audio content written to file: ${outputFile}`);
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

export const generatePodcast = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    const { userId } = data;
    if (!userId) {
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with the userId.');
    }

    shuffle(topics);
    shuffle(hosts);
    shuffle(guests);
    const chosenTopics = topics.slice(0, 3);
    const hostName = hosts[0];
    const guestName = guests[0];
    const podcastTitle = `Podcast about ${chosenTopics.join(', ')}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 1.0, 
        topK: 50,
        topP: 0.95,
        responseMimeType: "application/json"
      },
      systemInstruction: `
        You are an expert in ${chosenTopics.join(', ')}. 
        Generate a podcast script that is engaging, informative, and captivating for the listeners. 
        Structure the podcast as an engaging dialogue between the host, ${hostName}, and the guest, ${guestName}. 
        Ensure the conversation flows naturally, covering various aspects of the topics such as historical significance, modern relevance, spiritual insights, and practical applications. 
        Each dialogue should be well-researched, unique, and offer fresh perspectives to provide an enriching experience for the audience.
      `
    });

    const prompt = `
      Generate a podcast script of at least 20 minutes or 25,000 words about ${chosenTopics.join(', ')}. 
      Structure the response as an array of objects with dialogues between host ${hostName} and guest ${guestName}. 
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
      Ensure that the script is unique and covers different aspects and insights related to the chosen topics to make each podcast episode distinctive.
    `;

    try {
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
        throw new functions.https.HttpsError('internal', 'Generated script is empty.');
      }

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

      // Generate a download URL with a token to make the file public
      const [fileMetadata] = await finalFile.getMetadata();
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(finalFile.name)}?alt=media&token=${fileMetadata?.metadata?.firebaseStorageDownloadTokens}`;

      // Store the podcast script and audio URL in Firestore
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
