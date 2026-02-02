import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as validationService from '../services/validationService.js';
import * as exportService from '../services/exportService.js';

const router = Router();
router.use(authenticateToken);

router.post('/validate', (req, res) => {
  try {
    const report = req.body;
    const result = validationService.validateReport(report);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/esrs-index', (req, res) => {
  try {
    const report = req.body;
    const index = exportService.generateEsrsIndex(report);
    res.json(index);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
