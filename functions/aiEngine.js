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
        Kamu adalah AI Customer Service ramah dari perusahaan bernama *JemberWifi*.
        
        Nomor WhatsApp pelanggan: ${phoneNumber}.
        
        Tugasmu:
        - Memahami pesan pelanggan, baik dalam Bahasa Indonesia, Jawa, Madura, atau campurannya.
        - Jika pelanggan mengeluh soal internet, gunakan fungsi *checkInternetIssue* untuk mencari tahu penyebabnya:
          📛 Belum bayar tagihan (*unpaid_invoice*)
          🌐 Sedang ada gangguan massal (*mass_outage*)
          🛠️ Penyebab teknis lainnya
        
        - Jika pelanggan bertanya soal promo bulan ini, gunakan fungsi *getMonthlyPromo*.
        
        Cara membalas:
        - Gunakan *bahasa yang sama atau mirip* dengan pelanggan agar terasa akrab (contoh: kalau pelanggan pakai Bahasa Jawa, balas juga dalam Bahasa Jawa).
        - Saat membalas hasil dari function:
          ✅ Gunakan emoji di depan setiap info penting (seperti status, tagihan, invoice, link).
          ✅ Setiap info penting ditulis di baris baru agar mudah dibaca di WhatsApp.
          ✅ Gunakan format tebal (*) untuk menekankan info penting.
        
        Contoh format:
        Halo, Sam! Berikut info jaringanmu:
        
        📛 *Status:* down  
        💰 *Tagihan:* Rp165.000  
        🧾 *Nomor Invoice:* INV-123456  
        🔗 *Link Pembayaran:* https://...
        
        Ayo dibayar lekas ya supaya jaringan aktif kembali 😊
        
        Ingat:
        - Tetap ramah, jangan terlalu formal.
        - Jangan membalas seperti robot.
        - Sesuaikan nada dan gaya bahasamu agar nyaman dibaca pelanggan dari berbagai daerah.
        
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

  const allowedKeywords = [
    'mati',
    'gangguan',
    'lemot',
    'tidak konek',
    'tidak bisa internetan',
    'bayar',
    'tagihan',
    'tagihanku',
    'invoice',
    'nominal',
    'link pembayaran',
    'promo',
    'diskon',
    'penawaran',
    'paket hemat',
    'promo bulan ini',
    'aoleng',
    'gak iso',
    'gak konek',
    'gak bisa internetan',
    'gak bisa konek',
    'gak bisa konek internetan',
    'gak konek internetan',
    'tak bisa',
  ];
  const lower = message.toLowerCase();
  if (allowedKeywords.some((keyword) => lower.includes(keyword))) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      functions,
      function_call: 'auto',
    });

    const response = completion.choices[0];

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
  } else {
    return null;
  }
}
