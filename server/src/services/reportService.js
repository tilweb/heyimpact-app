import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { createDefaultReport } from '../models/defaults.js';

export function listReports() {
  if (!fs.existsSync(config.reportsDir)) {
    fs.mkdirSync(config.reportsDir, { recursive: true });
    return [];
  }
  const files = fs.readdirSync(config.reportsDir).filter(f => f.endsWith('.json'));
  return files.map(filename => {
    const filepath = path.join(config.reportsDir, filename);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    return {
      id: path.basename(filename, '.json'),
      filename,
      company: data.organization?.name || 'Unbekannt',
      period: data.metadata?.reporting_period || '',
      status: data.metadata?.status || '',
      updated_at: data.metadata?.updated_at || '',
    };
  }).sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
}

export function createNewReport(companyName, fiscalYear) {
  const report = createDefaultReport(companyName, fiscalYear);
  const id = report.metadata.report_id;
  const filepath = path.join(config.reportsDir, `${id}.json`);
  fs.mkdirSync(config.reportsDir, { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8');
  return report;
}

export function importFrom2024() {
  const data = JSON.parse(fs.readFileSync(config.importFile, 'utf-8'));
  // Give it a new ID
  const now = new Date().toISOString();
  data.metadata.report_id = `import_${Date.now()}`;
  data.metadata.updated_at = now;
  const id = data.metadata.report_id;
  const filepath = path.join(config.reportsDir, `${id}.json`);
  fs.mkdirSync(config.reportsDir, { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

export function importUploadedReport(reportData) {
  const now = new Date().toISOString();
  const id = `upload_${Date.now()}`;
  reportData.metadata = reportData.metadata || {};
  reportData.metadata.report_id = id;
  reportData.metadata.updated_at = now;
  const filepath = path.join(config.reportsDir, `${id}.json`);
  fs.mkdirSync(config.reportsDir, { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2), 'utf-8');
  return reportData;
}

export function getReport(id) {
  const filepath = path.join(config.reportsDir, `${id}.json`);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

export function saveReport(id, reportData) {
  const filepath = path.join(config.reportsDir, `${id}.json`);
  reportData.metadata = reportData.metadata || {};
  reportData.metadata.updated_at = new Date().toISOString();
  fs.mkdirSync(config.reportsDir, { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2), 'utf-8');
  return true;
}

export function deleteReport(id) {
  const filepath = path.join(config.reportsDir, `${id}.json`);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
}
