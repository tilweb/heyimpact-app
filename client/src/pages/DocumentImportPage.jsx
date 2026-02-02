import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReport } from '../hooks/useReport.js';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../hooks/useAuth.js';
import tokens from '../theme/tokens.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import TabPanel from '../components/ui/TabPanel.jsx';
import FormField from '../components/ui/FormField.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';

const phases = [
  { key: 'upload', label: '1. Upload', icon: '📁' },
  { key: 'extracting', label: '2. Extraktion', icon: '🔄' },
  { key: 'review', label: '3. Prüfung', icon: '👁️' },
  { key: 'merge', label: '4. Übernahme', icon: '✅' },
];

const formatSize = (bytes) =>
  bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';

export default function DocumentImportPage() {
  const navigate = useNavigate();
  const { report } = useReport();
  const { apiFetch } = useApi();
  const { token } = useAuth();

  const [phase, setPhase] = useState('upload');
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [progress, setProgress] = useState(0);

  const fileInputRef = React.useRef(null);

  if (!report) {
    return (
      <div style={{ padding: tokens.spacing.xxxl }}>
        <PlaceholderBox
          icon="📄"
          title="Kein Bericht geladen"
          description="Bitte zuerst einen Bericht erstellen oder laden"
          action={
            <Button onClick={() => navigate('/')} icon="🏠">
              Zur Startseite
            </Button>
          }
        />
      </div>
    );
  }

  const handleUpload = async () => {
    setPhase('extracting');
    setProgress(0);
    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        uploaded.push({ ...data, original_name: file.name });
      } catch (err) {
        console.error('Upload failed:', err);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    setUploadedFiles(uploaded);
    setPhase('review');
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const phaseIndex = phases.findIndex((p) => p.key === phase);

  return (
    <div style={{ padding: tokens.spacing.xxxl, maxWidth: tokens.layout.maxContentWidth, margin: '0 auto' }}>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        fontFamily: tokens.typography.fontFamily,
        marginBottom: tokens.spacing.xxl,
      }}>
        Dokumenten-Import
      </h1>

      {/* Phase Indicator */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacing.md,
        marginBottom: tokens.spacing.xxxl,
      }}>
        {phases.map((p, i) => {
          const isActive = p.key === phase;
          const isCompleted = i < phaseIndex;
          return (
            <div
              key={p.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: tokens.spacing.lg,
                borderRadius: tokens.radii.md,
                background: isActive
                  ? tokens.colors.primary
                  : isCompleted
                    ? tokens.colors.successLight
                    : tokens.colors.surface,
                border: `1px solid ${isActive ? tokens.colors.primary : isCompleted ? tokens.colors.success : tokens.colors.border}`,
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: 24, marginBottom: tokens.spacing.xs }}>{p.icon}</span>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: isActive
                  ? tokens.colors.white
                  : isCompleted
                    ? tokens.colors.success
                    : tokens.colors.textSecondary,
                fontFamily: tokens.typography.fontFamily,
              }}>
                {p.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Upload Phase */}
      {phase === 'upload' && (
        <Card>
          <div style={{ padding: tokens.spacing.xxl }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              fontFamily: tokens.typography.fontFamily,
              marginBottom: tokens.spacing.lg,
            }}>
              Dokumente hochladen
            </h2>

            <InfoBox type="info">
              Laden Sie Ihre bestehenden Berichte und Dokumente hoch. Unterstützte Formate: PDF, Word, PowerPoint, Excel, Text und Markdown.
            </InfoBox>

            <div style={{ marginTop: tokens.spacing.xl }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md"
                style={{ display: 'none' }}
                onChange={(e) => {
                  setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
                  e.target.value = '';
                }}
              />
              <Button onClick={() => fileInputRef.current?.click()} icon="📁">
                Dateien auswählen
              </Button>
            </div>

            {files.length > 0 && (
              <div style={{ marginTop: tokens.spacing.xl }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  fontFamily: tokens.typography.fontFamily,
                  marginBottom: tokens.spacing.md,
                }}>
                  Ausgewählte Dateien ({files.length})
                </div>
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                      background: tokens.colors.background,
                      borderRadius: tokens.radii.sm,
                      marginBottom: tokens.spacing.xs,
                      border: `1px solid ${tokens.colors.borderLight}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
                      <span style={{ fontSize: 16 }}>📄</span>
                      <span style={{
                        fontSize: tokens.typography.fontSize.md,
                        color: tokens.colors.text,
                        fontFamily: tokens.typography.fontFamily,
                      }}>
                        {file.name}
                      </span>
                      <span style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.textSecondary,
                        fontFamily: tokens.typography.fontFamily,
                      }}>
                        ({formatSize(file.size)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      icon="✕"
                    >
                      Entfernen
                    </Button>
                  </div>
                ))}

                <div style={{ marginTop: tokens.spacing.xl }}>
                  <Button
                    onClick={handleUpload}
                    disabled={files.length === 0}
                    icon="⬆️"
                  >
                    Hochladen und verarbeiten
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Extracting Phase */}
      {phase === 'extracting' && (
        <Card>
          <div style={{
            padding: tokens.spacing.xxl,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tokens.spacing.xl,
          }}>
            <Spinner />
            <div style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              fontFamily: tokens.typography.fontFamily,
            }}>
              Dokumente werden verarbeitet...
            </div>
            <div style={{ width: '100%', maxWidth: 400 }}>
              <ProgressBar value={progress} />
            </div>
            <InfoBox type="info">
              Die Dokumente werden konvertiert und analysiert. Dies kann je nach Dateigröße einige Minuten dauern.
            </InfoBox>
          </div>
        </Card>
      )}

      {/* Review Phase */}
      {phase === 'review' && (
        <Card>
          <div style={{ padding: tokens.spacing.xxl }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              fontFamily: tokens.typography.fontFamily,
              marginBottom: tokens.spacing.lg,
            }}>
              Ergebnisse prüfen
            </h2>

            <InfoBox type="warning">
              Die vollständige Dokumentenextraktion mit KI-gestützter Analyse wird in einer späteren Version implementiert.
            </InfoBox>

            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: tokens.spacing.xl }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  fontFamily: tokens.typography.fontFamily,
                  marginBottom: tokens.spacing.md,
                }}>
                  Hochgeladene Dateien ({uploadedFiles.length})
                </div>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                      background: tokens.colors.successLight,
                      borderRadius: tokens.radii.sm,
                      marginBottom: tokens.spacing.xs,
                      border: `1px solid ${tokens.colors.success}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
                      <span style={{ fontSize: 16 }}>✅</span>
                      <span style={{
                        fontSize: tokens.typography.fontSize.md,
                        color: tokens.colors.text,
                        fontFamily: tokens.typography.fontFamily,
                      }}>
                        {file.original_name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.success,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      fontFamily: tokens.typography.fontFamily,
                    }}>
                      Hochgeladen
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: tokens.spacing.md,
              marginTop: tokens.spacing.xxl,
            }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setPhase('upload');
                  setFiles([]);
                  setUploadedFiles([]);
                }}
                icon="⬅️"
              >
                Zurück zum Upload
              </Button>
              <Button
                onClick={() => navigate('/organization')}
                icon="➡️"
              >
                Weiter zum Bericht
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Merge Phase */}
      {phase === 'merge' && (
        <Card>
          <div style={{ padding: tokens.spacing.xxl }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.text,
              fontFamily: tokens.typography.fontFamily,
              marginBottom: tokens.spacing.lg,
            }}>
              Daten übernehmen
            </h2>

            <InfoBox type="info">
              Merge-Funktionalität wird in einer späteren Version implementiert.
            </InfoBox>

            <div style={{ marginTop: tokens.spacing.xxl }}>
              <Button
                onClick={() => navigate('/organization')}
                icon="➡️"
              >
                Weiter zum Bericht
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
