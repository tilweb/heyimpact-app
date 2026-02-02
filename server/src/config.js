import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'berichtswerk-jwt-secret-2025',
  appPassword: process.env.APP_PASSWORD || 'esrs2025',
  adacorApiKey: process.env.ADACOR_API_KEY || '',
  adacorApiBase: 'https://api.adacor.ai/chat/privateai/v1',
  adacorModel: 'mistral-3-24b-128k',
  dataDir: path.resolve(__dirname, 'data'),
  reportsDir: path.resolve(__dirname, 'data/reports'),
  uploadsDir: path.resolve(__dirname, 'data/uploads'),
  importFile: path.resolve(__dirname, 'data/import_2024.json'),
};
