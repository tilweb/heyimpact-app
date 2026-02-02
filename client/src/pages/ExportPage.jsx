import React, { useState, useEffect, useCallback } from 'react';
import { useReport } from '../hooks/useReport.js';
import { useApi } from '../hooks/useApi.js';
import { useLLM } from '../hooks/useLLM.js';
import tokens from '../theme/tokens.js';
import TabPanel from '../components/ui/TabPanel.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/ui/FormField.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';
import { getMaterialTopicCodes } from '../utils/scoring.js';
import { formatNumber, formatPercent } from '../utils/formatting.js';
import { stringify as yamlStringify } from 'yaml';

// ---------------------------------------------------------------------------
// Tab 1 -- Validierung
// ---------------------------------------------------------------------------
function ValidierungTab({ report, reportId, apiFetch }) {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);

  const runValidation = useCallback(async () => {
    if (!report) return;
    setLoading(true);
    try {
      const result = await apiFetch('/api/export/validate', {
        method: 'POST',
        body: JSON.stringify(report),
      });
      setValidation(result);
    } catch {
      setValidation(null);
    } finally {
      setLoading(false);
    }
  }, [report, apiFetch]);

  useEffect(() => {
    runValidation();
  }, []); // run once on mount

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.xxxxl }}>
        <Spinner />
      </div>
    );
  }

  if (!validation) {
    return (
      <InfoBox variant="warning">
        Validierung konnte nicht durchgefuehrt werden.
      </InfoBox>
    );
  }

  const errors = validation.errors || [];
  const warnings = validation.warnings || [];
  const infos = validation.info || [];
  const isValid = errors.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xl }}>
      {/* Completion */}
      <Card padding={tokens.spacing.xxl}>
        <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
          Vollstaendigkeit
        </h3>
        <ProgressBar
          value={validation.completion_percentage ?? 0}
          max={100}
          label="Berichtsfortschritt"
        />
      </Card>

      {/* Summary MetricCards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing.lg }}>
        <MetricCard label="Fehler" value={errors.length} icon="❌" />
        <MetricCard label="Warnungen" value={warnings.length} icon="⚠️" />
        <MetricCard label="Hinweise" value={infos.length} icon="ℹ️" />
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <InfoBox variant="error">
          <div>
            <strong>Fehler</strong>
            <ul style={{ margin: `${tokens.spacing.sm}px 0 0 ${tokens.spacing.lg}px`, padding: 0 }}>
              {errors.map((e, i) => (
                <li key={i} style={{ marginBottom: tokens.spacing.xs }}>{e}</li>
              ))}
            </ul>
          </div>
        </InfoBox>
      )}

      {/* Warning list */}
      {warnings.length > 0 && (
        <InfoBox variant="warning">
          <div>
            <strong>Warnungen</strong>
            <ul style={{ margin: `${tokens.spacing.sm}px 0 0 ${tokens.spacing.lg}px`, padding: 0 }}>
              {warnings.map((w, i) => (
                <li key={i} style={{ marginBottom: tokens.spacing.xs }}>{w}</li>
              ))}
            </ul>
          </div>
        </InfoBox>
      )}

      {/* Info list */}
      {infos.length > 0 && (
        <InfoBox variant="info">
          <div>
            <strong>Hinweise</strong>
            <ul style={{ margin: `${tokens.spacing.sm}px 0 0 ${tokens.spacing.lg}px`, padding: 0 }}>
              {infos.map((info, i) => (
                <li key={i} style={{ marginBottom: tokens.spacing.xs }}>{info}</li>
              ))}
            </ul>
          </div>
        </InfoBox>
      )}

      {/* All clear */}
      {isValid && warnings.length === 0 && (
        <InfoBox variant="success">
          Bericht ist vollstaendig
        </InfoBox>
      )}

      <div>
        <Button onClick={runValidation} icon="🔄">
          Erneut validieren
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2 -- Vorschau
// ---------------------------------------------------------------------------
function VorschauTab({ report }) {
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const { generating, generateExecutiveSummary } = useLLM();

  const org = report?.organization || {};
  const meta = report?.metadata || {};
  const env = report?.environmental || {};
  const soc = report?.social || {};
  const targets = report?.targets || [];
  const emissions = env?.emissions || {};
  const energy = env?.energy || {};

  const materialCodes = getMaterialTopicCodes(report);

  const sectionTitle = (text) => (
    <h3 style={{
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.text,
      marginBottom: tokens.spacing.lg,
      marginTop: tokens.spacing.xxl,
    }}>
      {text}
    </h3>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
      {/* Executive Summary */}
      {sectionTitle('Executive Summary')}
      <Card style={{ marginBottom: tokens.spacing.xxl }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.md }}>
          <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
            Zusammenfassung des Berichts
          </span>
          <Button variant="ai" size="sm" disabled={generating} onClick={async () => {
            const text = await generateExecutiveSummary(report);
            setExecutiveSummary(text);
          }}>
            {generating ? 'Generiere...' : 'KI-Zusammenfassung generieren'}
          </Button>
        </div>
        {executiveSummary ? (
          <div style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {executiveSummary}
          </div>
        ) : (
          <div style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.textLight, fontStyle: 'italic' }}>
            Klicken Sie auf "KI-Zusammenfassung generieren", um eine Executive Summary aus allen Berichtsdaten zu erstellen.
          </div>
        )}
      </Card>

      {/* Kerndaten */}
      {sectionTitle('Kerndaten')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing.lg }}>
        <MetricCard label="Unternehmen" value={org.name || '-'} />
        <MetricCard label="Berichtszeitraum" value={meta.reporting_period || '-'} />
        <MetricCard label="Status" value={meta.status || 'Entwurf'} />
      </div>

      {/* Kennzahlen */}
      {sectionTitle('Kennzahlen')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing.lg }}>
        <MetricCard
          label="Umsatz"
          value={org.revenue != null ? formatNumber(org.revenue / 1_000_000, 1) : '-'}
          unit="Mio. EUR"
        />
        <MetricCard label="Mitarbeitende" value={org.employees != null ? formatNumber(org.employees) : '-'} />
        <MetricCard label="Standorte" value={org.locations?.length ?? '-'} />
      </div>

      {/* Wesentliche Themen */}
      {sectionTitle('Wesentliche Themen')}
      {materialCodes.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
          {materialCodes.map((code) => (
            <StatusBadge key={code} status={code} />
          ))}
        </div>
      ) : (
        <InfoBox variant="info">Keine wesentlichen Themen ermittelt.</InfoBox>
      )}

      {/* Emissionen */}
      {sectionTitle('Emissionen (t CO2e)')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing.lg }}>
        <MetricCard label="Scope 1" value={emissions.scope1 != null ? formatNumber(emissions.scope1) : '-'} unit="t CO2e" />
        <MetricCard label="Scope 2" value={emissions.scope2 != null ? formatNumber(emissions.scope2) : '-'} unit="t CO2e" />
        <MetricCard label="Scope 3" value={emissions.scope3 != null ? formatNumber(emissions.scope3) : '-'} unit="t CO2e" />
        <MetricCard
          label="Gesamt"
          value={
            (emissions.scope1 != null || emissions.scope2 != null || emissions.scope3 != null)
              ? formatNumber((emissions.scope1 || 0) + (emissions.scope2 || 0) + (emissions.scope3 || 0))
              : '-'
          }
          unit="t CO2e"
        />
      </div>

      {/* Energie */}
      {sectionTitle('Energie')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing.lg }}>
        <MetricCard label="Gesamtverbrauch" value={energy.total_kwh != null ? formatNumber(energy.total_kwh) : '-'} unit="kWh" />
        <MetricCard label="Erneuerbare Energie" value={energy.renewable_percent != null ? formatPercent(energy.renewable_percent) : '-'} />
      </div>

      {/* Soziales */}
      {sectionTitle('Soziales')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing.lg }}>
        <MetricCard label="Mitarbeitende" value={soc.employees != null ? formatNumber(soc.employees) : '-'} />
        <MetricCard label="Frauenanteil" value={soc.female_percent != null ? formatPercent(soc.female_percent) : '-'} />
        <MetricCard label="Arbeitsunfaelle" value={soc.work_accidents != null ? formatNumber(soc.work_accidents) : '-'} />
        <MetricCard label="Schulungsstunden/MA" value={soc.training_hours_per_employee != null ? formatNumber(soc.training_hours_per_employee, 1) : '-'} />
      </div>

      {/* Ziele */}
      {sectionTitle('Ziele')}
      {targets.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          {targets.map((t, i) => (
            <Card key={i} padding={tokens.spacing.lg}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                    {t.title || 'Ohne Titel'}
                  </div>
                  <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary, marginTop: tokens.spacing.xs }}>
                    Thema: {t.topic || '-'} | Zieljahr: {t.target_year || '-'}
                  </div>
                </div>
                <StatusBadge status={t.status || 'Geplant'} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <InfoBox variant="info">Keine Ziele definiert.</InfoBox>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3 -- Export
// ---------------------------------------------------------------------------
function ExportTab({ report, reportId, apiFetch, updateReport }) {
  const statusOptions = ['Entwurf', 'In Prüfung', 'Final'];
  const currentStatus = report?.metadata?.status || 'Entwurf';

  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [esrsIndex, setEsrsIndex] = useState(null);
  const [loadingEsrs, setLoadingEsrs] = useState(false);

  // Generate filename
  const companySlug = (report?.organization?.name || 'bericht')
    .replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')
    .replace(/_+/g, '_');
  const year = report?.metadata?.reporting_period || report?.metadata?.fiscal_year || 'YYYY';
  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
  const filename = `${companySlug}_${year}_${status}_${timestamp}.json`;

  // Load saved versions
  const loadVersions = useCallback(async () => {
    setLoadingVersions(true);
    try {
      const data = await apiFetch('/api/reports');
      setVersions(data);
    } catch {} finally {
      setLoadingVersions(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadVersions();
  }, []);

  // Update status on report
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setSaveSuccess(false);
    if (updateReport && report) {
      updateReport({
        ...report,
        metadata: { ...report.metadata, status: newStatus },
      });
    }
  };

  // Save to server
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updatedReport = {
        ...report,
        metadata: { ...report.metadata, status },
      };
      await apiFetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedReport),
      });
      setSaveSuccess(true);
      loadVersions();
    } catch {} finally {
      setSaving(false);
    }
  };

  // JSON download
  const downloadJSON = () => {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // YAML download
  const downloadYAML = () => {
    const yamlStr = yamlStringify(report);
    const blob = new Blob([yamlStr], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.json', '.yaml');
    a.click();
    URL.revokeObjectURL(url);
  };

  // File size comparison
  const jsonStr = JSON.stringify(report, null, 2);
  const yamlStr = yamlStringify(report);
  const jsonSize = new Blob([jsonStr]).size;
  const yamlSize = new Blob([yamlStr]).size;
  const formatBytes = (b) => b > 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`;

  // ESRS Index
  const generateEsrsIndex = async () => {
    setLoadingEsrs(true);
    try {
      const result = await apiFetch('/api/export/esrs-index', {
        method: 'POST',
        body: JSON.stringify(report),
      });
      setEsrsIndex(result);
    } catch {} finally {
      setLoadingEsrs(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xl }}>
      {/* Status & filename */}
      <Card padding={tokens.spacing.xxl}>
        <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
          Exporteinstellungen
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
          <FormField label="Berichtsstatus">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                width: '100%',
                padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                borderRadius: tokens.radii.sm,
                border: `1px solid ${tokens.colors.border}`,
                fontSize: tokens.typography.fontSize.md,
                fontFamily: tokens.typography.fontFamily,
                background: tokens.colors.surface,
                color: tokens.colors.text,
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Dateiname">
            <input
              type="text"
              value={filename}
              readOnly
              style={{
                width: '100%',
                padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                borderRadius: tokens.radii.sm,
                border: `1px solid ${tokens.colors.border}`,
                fontSize: tokens.typography.fontSize.md,
                fontFamily: tokens.typography.fontFamily,
                background: tokens.colors.borderLight,
                color: tokens.colors.textSecondary,
                boxSizing: 'border-box',
              }}
            />
          </FormField>
        </div>
      </Card>

      {/* Actions */}
      <Card padding={tokens.spacing.xxl}>
        <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
          Aktionen
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.md }}>
          <Button onClick={handleSave} disabled={saving} icon="💾">
            {saving ? 'Speichere...' : 'Als Datei speichern'}
          </Button>
          <Button onClick={downloadJSON} variant="secondary" icon="📄">
            JSON herunterladen
          </Button>
          <Button onClick={downloadYAML} variant="secondary" icon="📝">
            YAML herunterladen
          </Button>
        </div>

        {saveSuccess && (
          <div style={{ marginTop: tokens.spacing.lg }}>
            <InfoBox variant="success">Bericht erfolgreich gespeichert.</InfoBox>
          </div>
        )}
      </Card>

      {/* File size comparison */}
      <Card padding={tokens.spacing.xxl}>
        <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
          Dateigroesse
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing.lg }}>
          <MetricCard label="JSON" value={formatBytes(jsonSize)} icon="📄" />
          <MetricCard label="YAML" value={formatBytes(yamlSize)} icon="📝" />
        </div>
      </Card>

      {/* ESRS Index */}
      <Card padding={tokens.spacing.xxl}>
        <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
          ESRS Index
        </h3>
        <Button onClick={generateEsrsIndex} disabled={loadingEsrs} icon="📊">
          {loadingEsrs ? 'Generiere...' : 'ESRS Index generieren'}
        </Button>

        {esrsIndex && Array.isArray(esrsIndex.entries) && esrsIndex.entries.length > 0 && (
          <div style={{ marginTop: tokens.spacing.lg, overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: tokens.typography.fontSize.sm,
              fontFamily: tokens.typography.fontFamily,
            }}>
              <thead>
                <tr style={{ background: tokens.colors.borderLight }}>
                  {Object.keys(esrsIndex.entries[0]).map((key) => (
                    <th key={key} style={{
                      padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                      textAlign: 'left',
                      borderBottom: `2px solid ${tokens.colors.border}`,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.text,
                    }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {esrsIndex.entries.map((entry, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? tokens.colors.surface : tokens.colors.borderLight }}>
                    {Object.values(entry).map((val, j) => (
                      <td key={j} style={{
                        padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                        borderBottom: `1px solid ${tokens.colors.borderLight}`,
                        color: tokens.colors.text,
                      }}>
                        {val != null ? String(val) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Gespeicherte Versionen */}
      <Card padding={tokens.spacing.xxl}>
        <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
          Gespeicherte Versionen
        </h3>

        {loadingVersions ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing.xl }}>
            <Spinner />
          </div>
        ) : versions.length === 0 ? (
          <InfoBox variant="info">Keine gespeicherten Versionen vorhanden.</InfoBox>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
            {versions.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
                  background: tokens.colors.borderLight,
                  borderRadius: tokens.radii.sm,
                }}
              >
                <div>
                  <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                    {v.company || 'Unbenannt'}
                  </div>
                  <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary, marginTop: tokens.spacing.xs }}>
                    Zeitraum: {v.period || '-'} | Aktualisiert: {v.updated_at ? new Date(v.updated_at).toLocaleString('de-DE') : '-'}
                  </div>
                </div>
                <StatusBadge status={v.status || 'Entwurf'} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ExportPage
// ---------------------------------------------------------------------------
export default function ExportPage() {
  const { report, reportId, updateReport } = useReport();
  const { apiFetch } = useApi();

  if (!report) {
    return (
      <div style={{ padding: tokens.spacing.xxxxl }}>
        <PlaceholderBox
          icon="📦"
          title="Kein Bericht geladen"
          description="Bitte laden oder erstellen Sie zuerst einen Bericht, um die Export-Funktionen nutzen zu koennen."
        />
      </div>
    );
  }

  const tabs = [
    {
      label: 'Validierung',
      content: <ValidierungTab report={report} reportId={reportId} apiFetch={apiFetch} />,
    },
    {
      label: 'Vorschau',
      content: <VorschauTab report={report} />,
    },
    {
      label: 'Export',
      content: <ExportTab report={report} reportId={reportId} apiFetch={apiFetch} updateReport={updateReport} />,
    },
  ];

  return (
    <div>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxxl,
      }}>
        Export
      </h1>
      <TabPanel tabs={tabs} />
    </div>
  );
}
