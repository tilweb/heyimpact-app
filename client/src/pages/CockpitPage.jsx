import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReport } from '../hooks/useReport.js';
import { useLLM } from '../hooks/useLLM.js';
import { useTodos } from '../hooks/useTodos.js';
import tokens from '../theme/tokens.js';
import MetricCard from '../components/ui/MetricCard.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';
import { ESRS_TOPICS } from '../utils/esrsConstants.js';
import { getMaterialTopicCodes } from '../utils/scoring.js';
import {
  getTopicCoverage,
  getSectionCompletion,
  getFullyCoveredCount,
  getExportReadiness,
  buildGapSummary,
} from '../utils/completeness.js';

const SECTION_PROGRESS = [
  { route: '/organization', label: 'Unternehmensdaten', icon: '🏢' },
  { route: '/iro', label: 'IRO-Bewertung', icon: '📊' },
  { route: '/materiality', label: 'Wesentlichkeit', icon: '🎯' },
  { route: '/environmental', label: 'Umwelt', icon: '🌿' },
  { route: '/social', label: 'Soziales', icon: '👥' },
  { route: '/governance', label: 'Governance', icon: '⚖️' },
  { route: '/targets', label: 'Ziele & Maßnahmen', icon: '🏹' },
];

const DATA_NAV = {
  E1: '/environmental', E2: '/environmental', E3: '/environmental', E4: '/environmental', E5: '/environmental',
  S1: '/social', S2: '/social', S3: '/social', S4: '/social',
  G1: '/governance',
};

function CoverageCell({ status, count, isMaterial, onClick }) {
  // count mode: number of policies/targets/actions
  // status mode: 'full' | 'partial' | 'empty' for data column
  const isCountMode = count !== undefined;
  let bg, label;

  if (isCountMode) {
    if (count > 0) { bg = tokens.colors.success; label = String(count); }
    else if (isMaterial) { bg = tokens.colors.error; label = '0'; }
    else { bg = tokens.colors.borderLight; label = '0'; }
  } else {
    if (status === 'full') { bg = tokens.colors.success; label = '●'; }
    else if (status === 'partial') { bg = tokens.colors.warning; label = '◑'; }
    else if (isMaterial) { bg = tokens.colors.error; label = '○'; }
    else { bg = tokens.colors.borderLight; label = '○'; }
  }

  const isEmpty = isCountMode ? count === 0 : status === 'empty';
  const isClickable = !!onClick;

  return (
    <div
      onClick={isClickable && isEmpty ? onClick : undefined}
      title={isClickable && isEmpty ? 'Klicken zum Navigieren' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: `${bg}22`,
        border: `2px solid ${bg}`,
        color: bg,
        fontSize: 14,
        fontWeight: tokens.typography.fontWeight.bold,
        cursor: isClickable && isEmpty ? 'pointer' : 'default',
        transition: 'transform 0.1s',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (isClickable && isEmpty) e.currentTarget.style.transform = 'scale(1.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {label}
    </div>
  );
}

export default function CockpitPage() {
  const { report } = useReport();
  const navigate = useNavigate();
  const { generating, generateCockpitStatus } = useLLM();
  const { openCount } = useTodos();
  const [lagebericht, setLagebericht] = useState('');

  if (!report) {
    return (
      <PlaceholderBox
        icon="🧭"
        title="Kein Bericht geladen"
        description="Bitte gehen Sie zur Startseite und erstellen oder laden Sie einen Bericht."
      />
    );
  }

  const materialCodes = getMaterialTopicCodes(report);
  const fullyCovered = getFullyCoveredCount(report);
  const exportReady = getExportReadiness(report);

  const handleGenerateLagebericht = async () => {
    const gapSummary = buildGapSummary(report);
    const text = await generateCockpitStatus(report, gapSummary);
    if (text) setLagebericht(text);
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xxl,
    padding: tokens.spacing.xxl,
    maxWidth: 1100,
    margin: '0 auto',
  };

  const gridFour = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spacing.lg,
  };

  return (
    <div style={containerStyle}>
      {/* Page Title */}
      <div>
        <h1 style={{
          fontSize: tokens.typography.fontSize.xxxl,
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.text,
          margin: 0,
        }}>
          Cockpit
        </h1>
        <p style={{ margin: `${tokens.spacing.xs}px 0 0`, color: tokens.colors.textSecondary, fontSize: tokens.typography.fontSize.md }}>
          {report.organization?.name || 'Ihr Unternehmen'} · Berichtsjahr {report.organization?.fiscal_year || ''}
        </p>
      </div>

      {/* Metric Cards */}
      <div style={gridFour}>
        <MetricCard
          label="Wesentliche Themen"
          value={materialCodes.length}
          unit={`/ 10`}
          icon="🎯"
        />
        <MetricCard
          label="Vollständig abgedeckt"
          value={fullyCovered}
          unit={materialCodes.length > 0 ? `/ ${materialCodes.length} wesentl.` : ''}
          icon="✅"
        />
        <MetricCard
          label="Offene Todos"
          value={openCount}
          icon="☑"
        />
        <MetricCard
          label="Export-Bereitschaft"
          value={exportReady}
          unit="%"
          icon="📤"
        />
      </div>

      {/* Topic Coverage Matrix */}
      <Card padding={tokens.spacing.xxl}>
        <h2 style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text,
          margin: `0 0 ${tokens.spacing.lg}px`,
        }}>
          Themenabdeckung
        </h2>

        {/* Legend */}
        <div style={{ display: 'flex', gap: tokens.spacing.xxl, marginBottom: tokens.spacing.lg, flexWrap: 'wrap' }}>
          {[
            { color: tokens.colors.success, label: 'Vorhanden' },
            { color: tokens.colors.warning, label: 'Teilweise' },
            { color: tokens.colors.error, label: 'Fehlt (wesentlich)' },
            { color: tokens.colors.borderLight, label: 'Fehlt (nicht wesentlich)' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: `1.5px solid ${color}` }} />
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textSecondary }}>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, marginLeft: 'auto' }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textSecondary, fontStyle: 'italic' }}>
              Rote Zellen anklicken zum Navigieren
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 90px 100px 80px 110px',
            gap: tokens.spacing.md,
            paddingBottom: tokens.spacing.sm,
            borderBottom: `1px solid ${tokens.colors.border}`,
            marginBottom: tokens.spacing.sm,
          }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thema</span>
            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.textSecondary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daten</span>
            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.textSecondary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Richtlinie</span>
            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.textSecondary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ziel</span>
            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.textSecondary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maßnahme</span>
          </div>

          {/* Rows */}
          {ESRS_TOPICS.map((topic) => {
            const isMaterial = materialCodes.includes(topic.code);
            const cov = getTopicCoverage(report, topic.code);

            return (
              <div
                key={topic.code}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 90px 100px 80px 110px',
                  gap: tokens.spacing.md,
                  alignItems: 'center',
                  padding: `${tokens.spacing.sm}px 0`,
                  borderBottom: `1px solid ${tokens.colors.borderLight}`,
                  background: isMaterial ? `${topic.color}08` : 'transparent',
                  borderRadius: tokens.radii.sm,
                  marginBottom: 2,
                }}
              >
                {/* Topic name + material badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, paddingLeft: tokens.spacing.sm }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: topic.color,
                    opacity: isMaterial ? 1 : 0.3,
                  }} />
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: isMaterial ? tokens.colors.text : tokens.colors.textSecondary,
                    fontWeight: isMaterial ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.regular,
                  }}>
                    {topic.name}
                  </span>
                  {isMaterial && (
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: topic.color,
                      background: `${topic.color}18`,
                      padding: '1px 6px',
                      borderRadius: tokens.radii.full,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      flexShrink: 0,
                    }}>
                      wesentlich
                    </span>
                  )}
                </div>

                {/* Daten */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CoverageCell
                    status={cov.data}
                    isBool={false}
                    isMaterial={isMaterial}
                    onClick={() => navigate(DATA_NAV[topic.code])}
                  />
                </div>

                {/* Richtlinie */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CoverageCell
                    count={cov.policy}
                    isMaterial={isMaterial}
                    onClick={() => navigate('/targets')}
                  />
                </div>

                {/* Ziel */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CoverageCell
                    count={cov.target}
                    isMaterial={isMaterial}
                    onClick={() => navigate('/targets')}
                  />
                </div>

                {/* Maßnahme */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CoverageCell
                    count={cov.action}
                    isMaterial={isMaterial}
                    onClick={() => navigate('/targets')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI Lagebericht */}
      <Card padding={tokens.spacing.xxl}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing.lg }}>
          <h2 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text,
            margin: 0,
          }}>
            KI-Lagebericht
          </h2>
          <Button
            variant="ai"
            onClick={handleGenerateLagebericht}
            disabled={generating}
          >
            {generating ? 'Generiere...' : lagebericht ? 'Neu generieren' : 'Lagebericht generieren'}
          </Button>
        </div>

        {lagebericht ? (
          <p style={{
            fontSize: tokens.typography.fontSize.md,
            color: tokens.colors.text,
            lineHeight: tokens.typography.lineHeight.relaxed,
            margin: 0,
            padding: `${tokens.spacing.lg}px ${tokens.spacing.xl}px`,
            background: tokens.colors.background,
            borderRadius: tokens.radii.sm,
            borderLeft: `3px solid ${tokens.colors.primary}`,
          }}>
            {lagebericht}
          </p>
        ) : (
          <p style={{ color: tokens.colors.textSecondary, fontSize: tokens.typography.fontSize.sm, margin: 0 }}>
            Klicken Sie auf "Lagebericht generieren", um eine KI-gestützte Zusammenfassung des aktuellen Berichtsstands zu erhalten.
          </p>
        )}
      </Card>

      {/* Section Progress */}
      <Card padding={tokens.spacing.xxl}>
        <h2 style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text,
          margin: `0 0 ${tokens.spacing.lg}px`,
        }}>
          Abschnittsfortschritt
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
          {SECTION_PROGRESS.map(({ route, label, icon }) => {
            const pct = getSectionCompletion(report, route);
            return (
              <div
                key={route}
                onClick={() => navigate(route)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: tokens.spacing.xs }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text, fontWeight: tokens.typography.fontWeight.medium }}>
                    {label}
                  </span>
                </div>
                <ProgressBar value={pct} max={100} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
