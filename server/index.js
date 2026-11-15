import express from 'express';
import cors from 'cors';
import { generateProfile, sendEmail } from './handlers.js';
import { config } from 'dotenv';

config({ path: new URL('../.env', import.meta.url).pathname });

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', 'https://marketingdoesntwork.com'] }));
app.use(express.json({ limit: '10mb' }));

app.post('/api/generate-profile', generateProfile);
app.post('/api/send-email', sendEmail);

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
