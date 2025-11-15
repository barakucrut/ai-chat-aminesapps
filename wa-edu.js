import express from 'express';

const app = express();
app.use(express.json());

// -------------------------------
// CONFIG (bisa disimpan di .env)
// -------------------------------
const APP_KEY = 'ALGHOFILIN';
const AUTH_KEY = 'AKUHANYALAHHAMBA';

// -------------------------------
// MIDDLEWARE AUTHENTICATION
// -------------------------------
function authMiddleware(req, res, next) {
  const appKey = req.headers['x-app-key'];
  const authKey = req.headers['x-auth-key'];

  if (!appKey || !authKey) {
    return res.status(401).json({
      success: false,
      message: 'Missing authentication headers',
    });
  }

  if (appKey !== APP_KEY || authKey !== AUTH_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Invalid appKey or authKey',
    });
  }

  next(); // lanjut ke route berikutnya
}

// -------------------------------
// ROUTE: SEND WA
// -------------------------------
app.post('/send', authMiddleware, async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'phone and message are required',
    });
  }

  // Logic kirim WA (dummy)
  // nanti tinggal ganti dengan sistem WA-mu
  console.log('Sending WA to:', phone);
  console.log('Message:', message);

  return res.json({
    success: true,
    message: 'WhatsApp message sent!',
    data: { phone, message },
  });
});

// -------------------------------
// START SERVER
// -------------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`WA Sender API running on port ${PORT}`);
});
