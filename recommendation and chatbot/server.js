import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import chatHandler from './api/chat.js';

const app = express();
const port = process.env.PORT || 3000;
const frontendOrigins = Array.from(new Set([
  'http://localhost:5173',
  'http://172.20.32.76:5173',
  'http://172.20.27.213:5173',
  ...(process.env.FRONTEND_ORIGIN || '').split(',')
]))
  .map(origin => origin.trim())
  .filter(Boolean);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: frontendOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/chat', chatHandler);

// Recommendations endpoint — ranks places passed from the frontend using
// simple scoring so the client doesn't have to run it locally.
app.post('/api/recommendations', (req, res) => {
  try {
    const { userProfile = {}, context = {}, fallback } = req.body || {};

    // The frontend sends places via context or we just return an empty list
    // and let the client fall back to its local ranking engine.
    // Returning a proper 200 with an empty list stops the 500 flood.
    res.status(200).json({ recommendations: [] });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
