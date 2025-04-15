import { handleChatMessageWithAI } from './functions/aiEngine.js';

const phoneNumber = '085769000007';
const message = 'Pak internetku mak matek ???';

const runHandle = await handleChatMessageWithAI(message, phoneNumber);

//console.log(runHandle);
