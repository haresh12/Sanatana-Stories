import { handleChat } from './chat/handleChat';
import {templeChat} from './chat/templeChat';

import { checkInactivity } from './scheduler/checkInactivity';
import { scheduledFunction } from './scheduler/scheduledFunction';
import { generateStory } from './temples/generateStory';
import { getMeaning } from './chalisa/getMeaning';
import { analyzeChanting } from './chalisa/analyzeChanting';
import { generateQuiz } from './quiz/generateQuiz';
import { summarizeSatsang } from './summerize/summarizeSatsang';
import { generatePodcast } from './podcast/generatePodcast';  


import './firebaseApp'; 

exports.handleChat = handleChat;
exports.templeChat = templeChat;
exports.generateStory = generateStory;
exports.checkInactivity = checkInactivity;
exports.getMeaning = getMeaning;
exports.scheduledFunction = scheduledFunction;
exports.analyzeChanting = analyzeChanting;
exports.generateQuiz = generateQuiz;
exports.summarizeSatsang = summarizeSatsang;
exports.generatePodcast = generatePodcast;

