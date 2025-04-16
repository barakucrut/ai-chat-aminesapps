import OpenAI from 'openai';
import dotenv from 'dotenv';
import { checkInternetIssue, getMonthlyPromo } from './index.js';
export async function handleChatMessageWithAI(message, phoneNumber) {
  dotenv.config();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 4. Compose messages array untuk GPT
  const messages = [
    {
      role: 'system',
      content: `
      Kamu adalah AI Customer Service dari Perusahaan bernama JemberWifi.
      
      Nomor WhatsApp pelanggan: ${phoneNumber}.
      
      Tugasmu:
      - Memahami keluhan pelanggan dari pesan yang diketik (bisa dalam Bahasa Indonesia, Jawa, Madura, dll).
      - Tentukan apakah pelanggan mengalami gangguan internet karena:
        1. Belum membayar tagihan (unpaid_invoice).
        2. Sedang ada gangguan massal (mass_outage).
        3. Penyebab teknis lainnya.
      
      Gunakan fungsi 'checkInternetIssue' untuk mencari tahu penyebabnya berdasarkan nomor WA pelanggan. 
      Pelanggan juga bisa menanyakan promo bulan ini dengan fungsi 'getMonthlyPromo'.
    
      Balas dengan gaya ramah, akrab, dan bahasa yang sesuai dengan nada si pelanggan.
      Tolong balas dengan format Whatsapp, beri tanda bold untuk semua info penting yang didapat dari response API function.
          `.trim(),
    },
    {
      role: 'user',
      content: message + ` (nomor WA saya ${phoneNumber})`,
    },
  ];

  // 5. Definisikan function(s) yang bisa dipanggil
  const functions = [
    {
      name: 'checkInternetIssue',
      description:
        'Cek penyebab internet pelanggan mati berdasarkan nomor WhatsApp',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Nomor WhatsApp pelanggan',
          },
        },
        required: ['phoneNumber'],
      },
    },
    {
      name: 'getMonthlyPromo',
      description:
        'Mengembalikan informasi promo internet yang berlaku bulan ini, jika ada.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  ];

  // 6. Kirim permintaan ke OpenAI
  // async function run() {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      functions,
      function_call: 'auto',
    });

    const response = completion.choices[0];
    console.log('\n--- RESPONSE DARI GPT ---\n');
    console.log(response);

    if (response.finish_reason === 'function_call') {
      const { name, arguments: argsJSON } = response.message.function_call;
      const args = JSON.parse(argsJSON);

      if (name === 'checkInternetIssue') {
        const result = await checkInternetIssue(args.phoneNumber);
        
        // Tambahkan hasil function ke messages
        messages.push({
          role: 'function',
          name: 'checkInternetIssue',
          content: JSON.stringify(result),
        });
      } else if (name === 'getMonthlyPromo') {
        const result = await getMonthlyPromo(phoneNumber);

        messages.push({
          role: 'function',
          name: 'getMonthlyPromo',
          content: JSON.stringify(result),
        });
      }
      const followup = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
      });

      const finalReply = followup.choices[0].message.content;
      console.log(finalReply);

      return finalReply;
    }
  // }

  // run().catch(console.error);
}
