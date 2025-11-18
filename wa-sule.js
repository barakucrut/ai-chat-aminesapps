import express from 'express';
import { sendWaMessage } from './wa-core.js';

const app = express();
app.use(express.json());

// -------------------------------
// CONFIG (bisa disimpan di .env)
// -------------------------------
const APP_KEY = 'SULE';
const AUTH_KEY = 'BISMILLAHBERKAHLARIS';

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

app.post('/send', authMiddleware, async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'phone and message are required',
    });
  }

  try {
    await sendWaMessage(phone, message);
    return res.json({ success: true, sent_to: phone });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`WA Sender API running on port ${PORT}`);
});
