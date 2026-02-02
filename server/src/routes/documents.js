import { Router } from 'express';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import config from '../config.js';
import * as extractionService from '../services/extractionService.js';

const router = Router();
router.use(authenticateToken);

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }
    res.json({
      source_id: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/extract', async (req, res) => {
  try {
    const { source_id } = req.body;
    const scratchpad = await extractionService.extractFromDocument(source_id);
    res.json({ scratchpad });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/extract-policy', async (req, res) => {
  try {
    const { source_id } = req.body;
    if (!source_id) {
      return res.status(400).json({ error: 'source_id ist erforderlich' });
    }
    const filePath = path.join(config.uploadsDir, source_id);
    const result = await extractionService.extractPolicyFromDocument(filePath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
