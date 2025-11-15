import * as wa from '@open-wa/wa-automate';

import { handleChatMessageWithAI } from './functions/aiEngine.js';

const PORT = 8082;
let globalClient;

wa.create({
  sessionId: 'TEST_HELPER',
  multiDevice: false, //required to enable multiDevice support
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: 'PT_BR',
  logConsole: false,
  popup: false,
  restartOnCrash: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then((client) => globalClient = client;
  console.log("WA device connected ✔"););

export async function sendWaMessage(phone, message) {
  if (!globalClient) {
    throw new Error("WA not ready");
  }

  const jid = phone.includes('@') ? phone : `${phone}@c.us`;
  return await globalClient.sendText(jid, message);
}