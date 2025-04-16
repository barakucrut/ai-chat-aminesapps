import * as wa from "@open-wa/wa-automate";

// const express = require("express");

import { handleChatMessageWithAI } from "./functions/aiEngine.js";

const PORT = 8082;
let globalClient;
// const app = express();
// app.use(express.json());

wa.create({
  sessionId: "TEST_HELPER",
  multiDevice: false, //required to enable multiDevice support
  authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  popup: false,
  restartOnCrash: true,
  qrTimeout: 0, //0 means it will wait forever for you to scan the qr code

}).then((client) => start(client));

const nameClient = "Amines";
const welcomeText = `*Hallo*! Selamat datang di layanan whatsaap Amines`;



function start(client) {
  globalClient = client;
  client.onMessage(async (message) => {
    // console.log("message", message);
    const body = message.body.toString();
    const phone = message.from.toString().split("@")[0].toString();
    let pesankirim = welcomeText;
    let sendText = true;
    try {
      pesankirim = await handleChatMessageWithAI(body, phone);
    } catch (error) {
      console.log("error", error);
      
      pesankirim = "Terjadi kesalahan, Silahkan coba lagi.";
    }
    console.log("pesankirim", pesankirim);


    if (sendText) {
      if (message.contact != null) {
        await client.sendText(message.chatId, pesankirim);
      } else {
        await client.sendText(message.from, pesankirim);
      }
    }
  });
}


// app.listen(PORT, function () {
//   console.log(`\n• Listening on port ${PORT}!`);
// });
