import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import chatHandler from './api/chat.js';

const app = express();
const port = process.env.PORT || 3000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/chat', chatHandler);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
