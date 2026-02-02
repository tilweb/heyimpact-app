import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReport } from '../hooks/useReport.js';
import { useApi } from '../hooks/useApi.js';
import tokens from '../theme/tokens.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/ui/FormField.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { createReport, importReport, uploadReport, loadReport } = useReport();
  const { apiFetch } = useApi();
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [fiscalYear, setFiscalYear] = useState(2025);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadReportList();
  }, []);

  const loadReportList = async () => {
    try {
      const data = await apiFetch('/api/reports');
      setReports(data);
    } catch {} finally {
      setLoadingReports(false);
    }
  };

  const handleCreate = async () => {
    if (!companyName) return;
    setCreating(true);
    try {
      await createReport(companyName, fiscalYear);
      navigate('/organization');
    } catch {} finally {
      setCreating(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      await importReport();
      navigate('/organization');
    } catch {} finally {
      setImporting(false);
    }
  };

  const handleLoad = async (id) => {
    await loadReport(id);
    navigate('/organization');
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset file input so same file can be re-selected
    e.target.value = '';
    setUploadError(null);

    if (!file.name.endsWith('.json')) {
      setUploadError('Bitte waehlen Sie eine JSON-Datei aus.');
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object') {
        throw new Error('Ungueltige Daten');
      }
      await uploadReport(data);
      navigate('/organization');
    } catch (err) {
      setUploadError(err.message === 'Unexpected token' || err instanceof SyntaxError
        ? 'Die Datei enthaelt kein gueltiges JSON.'
        : `Fehler beim Import: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/reports/${id}`, { method: 'DELETE' });
      setReports(r => r.filter(x => x.id !== id));
    } catch {}
    setDeleteId(null);
  };

  return (
    <div>
      <h1 style={{ fontSize: tokens.typography.fontSize.xxxl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.text, marginBottom: tokens.spacing.xxxl }}>
        ESRS Bericht
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing.xxl, marginBottom: tokens.spacing.xxxxl }}>
        {/* Create new report */}
        <Card padding={tokens.spacing.xxl}>
          <h2 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.xl, color: tokens.colors.text }}>
            Neuen Bericht erstellen
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
            <FormField
              label="Unternehmensname"
              value={companyName}
              onChange={setCompanyName}
              placeholder="z.B. Adacor Hosting GmbH"
              required
            />
            <FormField
              label="Geschäftsjahr"
              type="number"
              value={fiscalYear}
              onChange={setFiscalYear}
              min={2020}
              max={2030}
            />
            <Button onClick={handleCreate} disabled={!companyName || creating} icon="📝">
              {creating ? 'Erstelle...' : 'Neuen Bericht erstellen'}
            </Button>
          </div>
        </Card>

        {/* Upload exported report */}
        <Card padding={tokens.spacing.xxl}>
          <h2 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.xl, color: tokens.colors.text }}>
            Export hochladen
          </h2>
          <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.textSecondary, marginBottom: tokens.spacing.xl }}>
            Laden Sie einen zuvor exportierten Bericht (JSON-Datei) hoch, um ihn weiterzubearbeiten.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleUpload}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="secondary" icon="📤">
            {uploading ? 'Importiere...' : 'JSON-Datei hochladen'}
          </Button>
          {uploadError && (
            <InfoBox variant="error" style={{ marginTop: tokens.spacing.md }}>
              {uploadError}
            </InfoBox>
          )}
        </Card>

        {/* Import from 2024 */}
        <Card padding={tokens.spacing.xxl}>
          <h2 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.xl, color: tokens.colors.text }}>
            Vorjahresdaten importieren
          </h2>
          <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.textSecondary, marginBottom: tokens.spacing.xl }}>
            Importiert die vollständigen ESRS-Daten aus dem Vorjahr (2024) als Vorlage für den neuen Berichtszeitraum.
          </p>
          <Button onClick={handleImport} disabled={importing} variant="secondary" icon="📥">
            {importing ? 'Importiere...' : '2024-Daten importieren'}
          </Button>
        </Card>
      </div>

      {/* Saved reports */}
      <h2 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.xl, color: tokens.colors.text }}>
        Gespeicherte Berichte
      </h2>

      {loadingReports ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.xxxxl }}>
          <Spinner />
        </div>
      ) : reports.length === 0 ? (
        <PlaceholderBox
          icon="📋"
          title="Keine Berichte vorhanden"
          description="Erstellen Sie einen neuen Bericht oder importieren Sie die Vorjahresdaten."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          {reports.map((r) => (
            <Card key={r.id} onClick={() => handleLoad(r.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                  {r.company || 'Unbenannt'}
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary, marginTop: tokens.spacing.xs }}>
                  Zeitraum: {r.period} | Aktualisiert: {r.updated_at ? new Date(r.updated_at).toLocaleString('de-DE') : '-'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
                <StatusBadge status={r.status || 'Entwurf'} />
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: tokens.colors.textLight, padding: 4 }}
                  title="Löschen"
                >
                  🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId)}
        title="Bericht löschen"
        message="Möchten Sie diesen Bericht wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        danger
      />
    </div>
  );
}
