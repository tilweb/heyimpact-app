import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as reportService from '../services/reportService.js';

const router = Router();
router.use(authenticateToken);

// List all reports
router.get('/', (req, res) => {
  try {
    const reports = reportService.listReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new report
router.post('/', (req, res) => {
  try {
    const { company_name, fiscal_year } = req.body;
    const report = reportService.createNewReport(company_name, fiscal_year);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import from 2024
router.post('/import', (req, res) => {
  try {
    const report = reportService.importFrom2024();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload/import exported JSON report
router.post('/upload', (req, res) => {
  try {
    const reportData = req.body;
    if (!reportData || typeof reportData !== 'object') {
      return res.status(400).json({ error: 'Ungueltige Berichtsdaten' });
    }
    const report = reportService.importUploadedReport(reportData);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get report by ID
router.get('/:id', (req, res) => {
  try {
    const report = reportService.getReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Bericht nicht gefunden' });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update report
router.put('/:id', (req, res) => {
  try {
    const success = reportService.saveReport(req.params.id, req.body);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete report
router.delete('/:id', (req, res) => {
  try {
    const success = reportService.deleteReport(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
