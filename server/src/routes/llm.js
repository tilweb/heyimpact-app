import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as llmService from '../services/llmService.js';

const router = Router();
router.use(authenticateToken);

router.post('/impact-summary', async (req, res) => {
  try {
    const { iro_assessment } = req.body;
    const text = await llmService.generateImpactSummary(iro_assessment);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/financial-summary', async (req, res) => {
  try {
    const { iro_assessment } = req.body;
    const text = await llmService.generateFinancialSummary(iro_assessment);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/justification', async (req, res) => {
  try {
    const { type, data } = req.body;
    const text = await llmService.generateJustification(type, data);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/non-relevance-justification', async (req, res) => {
  try {
    const { topicCode, topicName, companyName, industrySector } = req.body;
    const text = await llmService.generateNonRelevanceJustification(topicCode, topicName, companyName, industrySector);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/iro-description', async (req, res) => {
  try {
    const { type, title, topicName, topicCode } = req.body;
    const text = await llmService.generateIRODescription(type, title, topicName, topicCode);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/item-description', async (req, res) => {
  try {
    const { type, title, topic, context, existingDescription } = req.body;
    const text = await llmService.generateItemDescription(type, title, topic, context, existingDescription);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/suggest-sdg', async (req, res) => {
  try {
    const { title, description, topic } = req.body;
    const goals = await llmService.suggestSDG(title, description, topic);
    res.json({ goals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/executive-summary', async (req, res) => {
  try {
    const { report } = req.body;
    const text = await llmService.generateExecutiveSummary(report);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/management-report', async (req, res) => {
  try {
    const { report } = req.body;
    const text = await llmService.generateManagementReport(report);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/esg-management-system', async (req, res) => {
  try {
    const { report } = req.body;
    const text = await llmService.generateESGManagementSystem(report);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cockpit-status', async (req, res) => {
  try {
    const { report, gap_summary } = req.body;
    const text = await llmService.generateCockpitStatus(report, gap_summary);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
