import * as wa from '@open-wa/wa-automate';

// const express = require("express");

import { handleChatMessageWithAI } from './functions/aiEngine.js';

const PORT = 8082;
let globalClient;
// const app = express();
// app.use(express.json());

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
}).then((client) => start(client));

const nameClient = 'Amines';
const welcomeText = `*Hallo*! Selamat datang di layanan whatsaap Amines`;

function start(client) {
  globalClient = client;
  client.onMessage(async (message) => {
    console.log('message', message?.type);
    const body = message.body.toString();
    const phone = message.from.toString().split('@')[0].toString();
    let pesankirim = welcomeText;
    let sendText = true;
    try {
      if (message.type == 'location') {
        const formData = new FormData();
        formData.append('latlng', `${message?.lat},${message?.lng}`);
        formData.append(
          'provider_id',
          '26d7f1bc24953328c0865634b788bcd185ee6036',
        );
        formData.append('phone', phone);
        const response = await fetch(
          'https://aminesapps.com/api/helpers/location/check_coverage_odp',
          {
            method: 'POST',
            body: formData,
          },
        );
        const result = await response.json();
        console.log('kordinat', `${message?.lat},${message?.lng}`);
        console.log('result', result);

        if (result?.data?.covered == 1) {
          console.log('data', result?.data?.odp[0]);
          console.log('data length', result?.data);

          pesankirim = `✅ *AMAN!* Lokasi yang anda kirim sudah tercover oleh ODP Jember Wifi.\n
            Berikut adalah daftar ODP terdekat :
            ${result?.data?.odp
              .map(
                (item, i) =>
                  `\n ${i + 1}. 📍 *${item?.odp}*
                   \n*Jarak* : ${Math.ceil(item?.distance_m)}m
                   \n*Kapasitas Slot* : ${Math.ceil(item?.slot_capacity)}
                   \n*Slot Tersedia* : ${Math.ceil(item?.available_slot)}
                   \nSilahkan hubungi tim marketing kami untuk proses lanjutan dengan klik link berikut : https://bit.ly/48IuuRb`,
              )
              .join('\n\n')}`;
        } else if(result?.data?.covered == 2){
           pesankirim = `⚠️ Terima kasih, lokasi yang Anda kirim saat ini belum masuk dalam jangkauan utama jaringan ODP JemberWifi.\n
            Namun, masih memungkinkan untuk dilakukan pemasangan dengan penambahan kabel dari titik ODP terdekat. Estimasi tambahan biaya sekitar Rp ${(Math.ceil(result?.data?.odp[0].distance_m) - 250)* 1000} (tergantung kondisi lapangan).\n
            Berikut detail ODP terdekat:
            ${result?.data?.odp
              .map(
                (item, i) =>
                  `\n🔹 *Nama ODP* : *${item?.odp}*
                   \n🔹 *Jarak* : ± ${Math.ceil(item?.distance_m)}m
                   \n🔹 *Kapasitas Slot* : ${Math.ceil(item?.slot_capacity)}
                   \n🔹 *Slot Tersedia* : ${Math.ceil(item?.available_slot)}
                   \nSilahkan hubungi tim marketing kami untuk proses lanjutan dengan klik link berikut : https://bit.ly/48IuuRb`,
              )
              .join('\n\n')}`;
        } else {
          pesankirim = `⚠️ *MAAF!* Lokasi yang anda kirim *belum tercover* oleh ODP Jember Wifi.
        \n🙏 Silahkan hubungi tim marketing kami untuk proses lanjutan dengan klik link berikut : https://bit.ly/48IuuRb`;
        }
      }
      //   pesankirim = await handleChatMessageWithAI(body, phone);
    } catch (error) {
      console.log('error', error);

      pesankirim = 'Terjadi kesalahan, Silahkan coba lagi.';
    }

    if (sendText && pesankirim != welcomeText) {
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
