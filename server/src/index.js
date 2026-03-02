import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import llmRoutes from './routes/llm.js';
import documentRoutes from './routes/documents.js';
import exportRoutes from './routes/exportRoutes.js';
import chatRoutes from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure persistent data directories exist
fs.mkdirSync(config.reportsDir, { recursive: true });
fs.mkdirSync(config.uploadsDir, { recursive: true });

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve static frontend in production
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
