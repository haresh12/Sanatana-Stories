import { handleChat } from './chat/handleChat';
import {handleTempleChat} from './chat/templeChat';

import { checkInactivity } from './scheduler/checkInactivity';
import { scheduledFunction } from './scheduler/scheduledFunction';
import { generateStory } from './temples/generateStory';
import './firebaseApp'; 

exports.handleChat = handleChat;
exports.templeChat = handleTempleChat;
exports.generateStory = generateStory;
exports.checkInactivity = checkInactivity
exports.scheduledFunction = scheduledFunction
