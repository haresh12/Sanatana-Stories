import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI('AIzaSyDS39wuTLFenZMS8-VW5Q5PLTafz8B1QRs');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function run() {
  try {
    const prompt = "Generate a fun fact about Hindu mythology.";
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    console.log("Generated Text: ", text);
  } catch (error) {
    console.error("Error generating content: ", error);
  }
}

run();
