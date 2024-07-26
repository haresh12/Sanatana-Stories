import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db, admin } from '../firebaseApp';

const genAI = new GoogleGenerativeAI(functions.config().googleapi.key);

const topics = [
  'Hanuman Chalisa', 'Ramayana', 'Mahabharata', 'Hindu Puranas', 'Hindu temples',
  'Vedas', 'Upanishads', 'Indian mythology', 'Ancient Indian history', 'Bhagavad Gita',
  'Hindu festivals', 'Hindu rituals', 'Hindu gods and goddesses', 'Yoga philosophy',
  'Ayurveda', 'Sanskrit literature', 'Indian philosophy', 'Hindu scriptures',
  'Hindu symbols', 'Indian architecture', 'Indian music', 'Indian dance', 'Hindu cosmology',
  'Hindu ethics', 'Hindu practices', 'Sacred geography', 'Hindu legends', 'Hindu folklore',
  'Indian astrology', 'Hindu metaphysics', 'Hindu eschatology', 'Sacred trees in Hinduism',
  'Pilgrimage sites in India', 'Hindu festivals and their significance', 'Indian art and sculpture',
  'Hindu mythology and legends', 'Hindu saints and sages', 'Hindu cosmology and creation myths',
  'Dharma and Karma', 'Indian cuisine', 'Hindu wedding traditions', 'Hindu funeral rites',
  'Hindu birth rituals', 'Famous Hindu temples around the world', 'The significance of the Ganges River',
  'The role of animals in Hindu mythology', 'The Mahabharata and its lessons', 'The Ramayana and its teachings',
  'Hindu views on ecology and nature conservation', 'The concept of rebirth in Hinduism', 'Hindu meditation practices',
  'The significance of the Om symbol', 'Hindu chants and mantras', 'Hinduism and science', 'The concept of moksha in Hinduism',
  'The significance of the cow in Hinduism', 'Hindu festivals and their rituals', 'Hindu cosmology and the universe', 
  'Hindu gods and their avatars', 'The role of women in Hindu epics', 'Hindu philosophical schools', 'The significance of rituals in Hinduism',
  'Hinduism and its influence on Southeast Asia', 'Hindu art and its symbolism', 'The spiritual significance of the Himalayas in Hinduism',
  'The journey of the soul in Hindu beliefs', 'The concept of time in Hindu cosmology', 'The teachings of Adi Shankaracharya', 
  'Bhakti movement and its impact on Hinduism', 'The significance of the river Ganges in Hindu spirituality', 'The role of animals in Hindu myths and legends',
  'Hindu festivals and their regional variations', 'The architectural marvels of Hindu temples', 'Hindu scriptures and their interpretations over time',
  'The practice of yoga and its origins in Hinduism', 'The influence of Hinduism on Indian classical music and dance', 'The legends of Hindu warrior saints',
  'The concept of dharma and its application in daily life', 'The significance of pilgrimage in Hindu tradition', 'Hindu astrology and its impact on culture',
  'The role of fire in Hindu rituals and ceremonies', 'The significance of the lotus in Hindu iconography', 'Hindu martial arts and their spiritual aspects',
  'The story of Lord Vishnu and his ten avatars', 'The teachings of the Upanishads', 'The role of sages and seers in Hindu tradition', 'The impact of Hinduism on Indian literature',
  'Hindu beliefs about the afterlife', 'The significance of the number three in Hinduism', 'The role of mountains in Hindu mythology', 'The spiritual practices of Hindu monks and ascetics',
  'Hindu beliefs about creation and the cosmos', 'The role of holy plants and trees in Hindu rituals', 'Hindu perspectives on health and wellness', 'The influence of Hinduism on Indian politics and society',
  'The role of rivers in Hindu mythology', 'The significance of fasting in Hindu tradition', 'The impact of Hinduism on Indian visual arts', 'The role of the guru in Hindu spiritual practice',
  'Hindu perspectives on wealth and prosperity', 'The story of the Mahabharata and its moral lessons', 'The importance of chanting and mantras in Hindu worship', 'The influence of Hinduism on Indian cinema'
];

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const generateMyth = functions.https.onCall(async (data, context) => {
  shuffle(topics);
  const chosenTopic = topics[0];

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `
      You are an expert in Hindu mythology, scriptures, temples, and culture. Your task is to generate an interesting myth in English about the topic: ${chosenTopic}. 
      The myth should be:
      1. Unique and not a repeat of previous myths.
      2. Written in English.
      3. No longer than 2-3 lines.
      Make sure the myth is engaging, provides value to the reader, and fits within the context of ${chosenTopic}.
    `,
  });

  try {
    const prompt = `Generate an interesting and unique myth in English about ${chosenTopic} that does not exceed 2-3 lines.`;
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    await db.collection('dynamicContent').doc('myth').set({
      content: text,
      topic: chosenTopic,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { content: text, topic: chosenTopic };
  } catch (error) {
    console.error("Error generating myth:", error);
    throw new functions.https.HttpsError('internal', 'Unable to generate myth.');
  }
});
