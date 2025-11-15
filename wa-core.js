import * as wa from '@open-wa/wa-automate';

let globalClient = null;

// Start WA connection
wa.create({
  sessionId: 'TEST_HELPER',
  multiDevice: false,
  authTimeout: 60,
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  logConsole: false,
  popup: false,
  qrTimeout: 0,
}).then((client) => {
  globalClient = client;
  console.log('WA device connected ✔');
});

// Global export function
export async function sendWaMessage(phone, message) {
  if (!globalClient) {
    throw new Error('WA not ready');
  }

  const jid = phone.includes('@') ? phone : `${phone}@c.us`;
  return await globalClient.sendText(jid, message);
}
