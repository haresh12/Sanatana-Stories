import { handleChat } from './chat/handleChat';
import {templeChat} from './chat/templeChat';

import { checkInactivity } from './scheduler/checkInactivity';
import { generateStory } from './temples/generateStory';
import { getMeaning } from './chalisa/getMeaning';
import { analyzeChanting } from './chalisa/analyzeChanting';
import { generateQuiz } from './quiz/generateQuiz';
import { summarizeSatsang } from './summerize/summarizeSatsang';
import { generatePodcast } from './podcast/generatePodcast';  
import { ramayanChat } from './rmh/ramayanChat';
import { mahabharatChat } from './rmh/mahabharatChat';
import { puranasChat } from './rmh/hindupuranas';  
import { updateMyth } from './dynamicContent/updateMyth';  
import { updateFunFact } from './dynamicContent/updateFunFact';  
import { getDetailedInfo } from './dynamicContent/knowMore';  


import './firebaseApp'; 

exports.handleChat = handleChat;
exports.templeChat = templeChat;
exports.generateStory = generateStory;
exports.checkInactivity = checkInactivity;
exports.getMeaning = getMeaning;
exports.analyzeChanting = analyzeChanting;
exports.generateQuiz = generateQuiz;
exports.summarizeSatsang = summarizeSatsang;
exports.generatePodcast = generatePodcast;
exports.ramayanChat = ramayanChat;
exports.mahabharatChat = mahabharatChat;
exports.puranasChat = puranasChat;
exports.updateMyth = updateMyth;
exports.updateFunFact = updateFunFact;
exports.getDetailedInfo = getDetailedInfo;


