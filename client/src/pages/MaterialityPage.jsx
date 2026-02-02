import React, { useState } from 'react';
import { useReport } from '../hooks/useReport.js';
import { useLLM } from '../hooks/useLLM.js';
import tokens from '../theme/tokens.js';
import TabPanel from '../components/ui/TabPanel.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/ui/FormField.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import ScoreIndicator from '../components/ui/ScoreIndicator.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';
import SectionStatusBar from '../components/ui/SectionStatusBar.jsx';
import { getMaxScores, isAssessmentMaterial, IMPACT_THRESHOLD, RISK_OPPORTUNITY_THRESHOLD } from '../utils/scoring.js';
import { ESRS_TOPICS } from '../utils/esrsConstants.js';

const TAB_LABELS = [
  'Ergebnisse',
  'Wesentlichkeitsmatrix',
  'Stakeholder',
  'Prozessdokumentation',
];

const DEFAULT_METHODOLOGY = `Die Wesentlichkeitsanalyse wurde nach dem Konzept der doppelten Wesentlichkeit gemäß ESRS durchgeführt. Dabei wurden sowohl die Auswirkungswesentlichkeit (Inside-Out-Perspektive) als auch die finanzielle Wesentlichkeit (Outside-In-Perspektive) bewertet.

Auswirkungswesentlichkeit: Bewertung anhand von Ausmaß (1-5), Reichweite (1-5) und Unumkehrbarkeit (1-5), multipliziert mit der Eintrittswahrscheinlichkeit (1-5). Schwellenwert: >= 30 von maximal 75 Punkten.

Finanzielle Wesentlichkeit: Bewertung anhand der finanziellen Auswirkung (1-5) multipliziert mit der Eintrittswahrscheinlichkeit (1-5). Schwellenwert: >= 12 von maximal 25 Punkten.

Ein Thema gilt als wesentlich, wenn es mindestens einen der Schwellenwerte überschreitet (MAX-Ansatz).`;

const DEFAULT_PROCESS = `1. Vorbereitung: Zusammenstellung des Bewertungsteams, Sichtung der ESRS-Anforderungen
2. Stakeholder-Identifikation: Identifikation und Priorisierung der relevanten Stakeholder-Gruppen
3. Vorläufige Themenbewertung: Erste Analyse aller ESRS-Themen auf Relevanz
4. Detaillierte IRO-Bewertung: Systematische Bewertung von Auswirkungen, Risiken und Chancen für alle Themen
5. Validierung und Freigabe: Prüfung und Genehmigung durch Entscheidungsgremium
6. Dokumentation: Vollständige Dokumentation im Berichtstool`;

const STAKEHOLDER_CATEGORIES = ['Intern', 'Extern', 'Wertschöpfungskette'];

function MaterialityMatrix({ topics, assessments }) {
  const width = 500, height = 400;
  const padding = { top: 20, right: 30, bottom: 50, left: 60 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const maxX = 25, maxY = 75;

  const toX = (v) => padding.left + (v / maxX) * plotW;
  const toY = (v) => padding.top + plotH - (v / maxY) * plotH;

  const categoryColors = { E: '#059669', S: '#7C3AED', G: '#2563EB' };

  const points = (assessments || []).map(a => {
    const { maxImpact, maxRisk, maxOpp } = getMaxScores(a);
    return {
      code: a.topic_code,
      impactScore: maxImpact,
      financialScore: Math.max(maxRisk, maxOpp),
      color: categoryColors[a.topic_code[0]] || '#666',
      isMaterial: isAssessmentMaterial(a),
    };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: 600, background: tokens.colors.surface, borderRadius: tokens.radii.md, border: `1px solid ${tokens.colors.border}` }}>
      {/* Threshold lines (dashed) */}
      <line x1={toX(12)} y1={padding.top} x2={toX(12)} y2={padding.top + plotH} stroke={tokens.colors.error} strokeDasharray="4,4" strokeWidth={1} />
      <line x1={padding.left} y1={toY(30)} x2={padding.left + plotW} y2={toY(30)} stroke={tokens.colors.error} strokeDasharray="4,4" strokeWidth={1} />
      {/* Axes */}
      <line x1={padding.left} y1={padding.top + plotH} x2={padding.left + plotW} y2={padding.top + plotH} stroke={tokens.colors.border} />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} stroke={tokens.colors.border} />
      {/* Axis labels */}
      <text x={width / 2} y={height - 5} textAnchor="middle" fontSize={12} fill={tokens.colors.textSecondary}>Finanzielle Wesentlichkeit (max. 25)</text>
      <text x={15} y={height / 2} textAnchor="middle" fontSize={12} fill={tokens.colors.textSecondary} transform={`rotate(-90, 15, ${height / 2})`}>Auswirkungswesentlichkeit (max. 75)</text>
      {/* Points */}
      {points.map(p => (
        <g key={p.code}>
          <circle cx={toX(p.financialScore)} cy={toY(p.impactScore)} r={p.isMaterial ? 8 : 6} fill={p.color} opacity={0.8} stroke={tokens.colors.white} strokeWidth={1.5} />
          <text x={toX(p.financialScore) + 12} y={toY(p.impactScore) + 4} fontSize={11} fill={tokens.colors.text} fontWeight={p.isMaterial ? 600 : 400}>{p.code}</text>
        </g>
      ))}
      {/* Quadrant labels */}
      <text x={padding.left + 5} y={padding.top + 15} fontSize={10} fill={tokens.colors.textLight}>Wesentlich (Auswirkung)</text>
      <text x={padding.left + plotW - 5} y={padding.top + 15} textAnchor="end" fontSize={10} fill={tokens.colors.error} fontWeight={600}>Wesentlich (beides)</text>
    </svg>
  );
}

export default function MaterialityPage() {
  const { report, updateReport } = useReport();
  const { generating, generateImpactSummary, generateFinancialSummary, generateJustification } = useLLM();
  const [activeTab, setActiveTab] = useState(0);
  const [expandedTopics, setExpandedTopics] = useState({});

  if (!report) {
    return (
      <PlaceholderBox
        icon="📊"
        title="Kein Bericht geladen"
        description="Bitte gehen Sie zur Startseite und erstellen oder laden Sie einen Bericht."
      />
    );
  }

  const materiality = report.materiality || {};
  const assessments = report.iro_summary?.assessments || [];
  const topics = materiality.topics || [];

  const toggleExpand = (topicName) => {
    setExpandedTopics(prev => ({ ...prev, [topicName]: !prev[topicName] }));
  };

  const handleTopicFieldChange = (topicIndex, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.materiality) updated.materiality = {};
    if (!updated.materiality.topics) updated.materiality.topics = [];
    updated.materiality.topics[topicIndex][field] = value;
    updateReport(updated);
  };

  const handleMaterialityChange = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.materiality) updated.materiality = {};
    updated.materiality[field] = value;
    updateReport(updated);
  };

  const handleStakeholderChange = (index, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.materiality) updated.materiality = {};
    if (!updated.materiality.stakeholders) updated.materiality.stakeholders = [];
    updated.materiality.stakeholders[index][field] = value;
    updateReport(updated);
  };

  const addStakeholder = () => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.materiality) updated.materiality = {};
    if (!updated.materiality.stakeholders) updated.materiality.stakeholders = [];
    updated.materiality.stakeholders.push({
      name: '',
      category: 'Extern',
      relevance: '',
      engagement_method: '',
      key_concerns: [],
    });
    updateReport(updated);
  };

  const deleteStakeholder = (index) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.materiality.stakeholders.splice(index, 1);
    updateReport(updated);
  };

  const getAssessmentForTopic = (topicName) => {
    const code = topicName.split(' - ')[0].trim();
    return assessments.find(a => a.topic_code === code);
  };

  const handleGenerateImpact = async (topicIndex) => {
    const topic = topics[topicIndex];
    const assessment = getAssessmentForTopic(topic.topic);
    if (!assessment) return;
    const text = await generateImpactSummary(assessment);
    if (text) handleTopicFieldChange(topicIndex, 'impact_description', text);
  };

  const handleGenerateFinancial = async (topicIndex) => {
    const topic = topics[topicIndex];
    const assessment = getAssessmentForTopic(topic.topic);
    if (!assessment) return;
    const text = await generateFinancialSummary(assessment);
    if (text) handleTopicFieldChange(topicIndex, 'financial_description', text);
  };

  const handleGenerateJustification = async (topicIndex) => {
    const topic = topics[topicIndex];
    const assessment = getAssessmentForTopic(topic.topic);
    if (!assessment) return;
    const { maxImpact, maxRisk, maxOpp } = getMaxScores(assessment);
    const text = await generateJustification('justification_summary', {
      topic: topic.topic,
      impact_score: maxImpact,
      financial_score: Math.max(maxRisk, maxOpp),
      is_material: topic.is_material,
      impact_description: topic.impact_description,
      financial_description: topic.financial_description,
    });
    if (text) handleTopicFieldChange(topicIndex, 'justification', text);
  };

  const handleGenerateAll = async (topicIndex) => {
    await handleGenerateImpact(topicIndex);
    await handleGenerateFinancial(topicIndex);
    await handleGenerateJustification(topicIndex);
  };

  // Compute material/non-material topics
  const topicsWithScores = topics.map((t, i) => {
    const assessment = getAssessmentForTopic(t.topic);
    const scores = assessment ? getMaxScores(assessment) : { maxImpact: 0, maxRisk: 0, maxOpp: 0 };
    const isMaterial = assessment ? isAssessmentMaterial(assessment) : false;
    return { ...t, index: i, scores, isMaterial };
  });

  const materialTopics = topicsWithScores.filter(t => t.isMaterial);
  const nonMaterialTopics = topicsWithScores.filter(t => !t.isMaterial);
  const totalTopics = ESRS_TOPICS.length;

  // --- Style helpers ---
  const sectionGap = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  };

  const gridTwo = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacing.lg,
  };

  const gridThree = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: tokens.spacing.lg,
  };

  const sectionTitle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text,
    margin: 0,
    marginBottom: tokens.spacing.md,
  };

  const materialBadge = {
    display: 'inline-block',
    padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
    borderRadius: tokens.radii.sm,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.white,
    background: tokens.colors.success,
  };

  const nonMaterialBadge = {
    ...materialBadge,
    background: tokens.colors.textLight,
  };

  // --- Topic card renderer ---
  const renderTopicCard = (t) => {
    const expanded = expandedTopics[t.topic];
    return (
      <Card key={t.topic} padding={tokens.spacing.xl}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => toggleExpand(t.topic)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
            <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
              {t.topic}
            </span>
            <span style={t.isMaterial ? materialBadge : nonMaterialBadge}>
              {t.isMaterial ? 'Wesentlich' : 'Nicht wesentlich'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg }}>
            <ScoreIndicator score={t.scores.maxImpact} threshold={IMPACT_THRESHOLD} label="Impact" />
            <ScoreIndicator score={Math.max(t.scores.maxRisk, t.scores.maxOpp)} threshold={RISK_OPPORTUNITY_THRESHOLD} label="Finanziell" />
            <span style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.textSecondary }}>
              {expanded ? '\u25B2' : '\u25BC'}
            </span>
          </div>
        </div>

        {expanded && (
          <div style={{ marginTop: tokens.spacing.xl, display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
            <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
              <ScoreIndicator score={t.scores.maxImpact} threshold={IMPACT_THRESHOLD} label="Impact" />
              <ScoreIndicator score={t.scores.maxRisk} threshold={RISK_OPPORTUNITY_THRESHOLD} label="Risiko" />
              <ScoreIndicator score={t.scores.maxOpp} threshold={RISK_OPPORTUNITY_THRESHOLD} label="Chance" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                  Beschreibung der Auswirkungen
                </label>
                <Button variant="ai" size="sm" onClick={() => handleGenerateImpact(t.index)} disabled={generating}>
                  {generating ? 'Generiert...' : 'KI generieren'}
                </Button>
              </div>
              <FormField
                type="textarea"
                value={t.impact_description || ''}
                onChange={(v) => handleTopicFieldChange(t.index, 'impact_description', v)}
                rows={4}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                  Beschreibung der finanziellen Auswirkungen
                </label>
                <Button variant="ai" size="sm" onClick={() => handleGenerateFinancial(t.index)} disabled={generating}>
                  {generating ? 'Generiert...' : 'KI generieren'}
                </Button>
              </div>
              <FormField
                type="textarea"
                value={t.financial_description || ''}
                onChange={(v) => handleTopicFieldChange(t.index, 'financial_description', v)}
                rows={4}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                  Begründung
                </label>
                <Button variant="ai" size="sm" onClick={() => handleGenerateJustification(t.index)} disabled={generating}>
                  {generating ? 'Generiert...' : 'KI generieren'}
                </Button>
              </div>
              <FormField
                type="textarea"
                value={t.justification || ''}
                onChange={(v) => handleTopicFieldChange(t.index, 'justification', v)}
                rows={4}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="ai" onClick={() => handleGenerateAll(t.index)} disabled={generating}>
                {generating ? 'Generiert...' : 'Alle KI-Texte generieren'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  // --- Tab 1: Ergebnisse ---
  const renderErgebnisse = () => (
    <div style={sectionGap}>
      <InfoBox type="info">
        Die Wesentlichkeit wird automatisch aus den IRO-Bewertungen abgeleitet. Ein Thema gilt als wesentlich,
        wenn der Auswirkungs-Score &ge; {IMPACT_THRESHOLD} oder der Risiko-/Chancen-Score &ge; {RISK_OPPORTUNITY_THRESHOLD} ist.
      </InfoBox>

      <div style={gridThree}>
        <MetricCard label="Themen gesamt" value={totalTopics} icon="📋" />
        <MetricCard label="Wesentliche Themen" value={materialTopics.length} icon="✅" />
        <MetricCard label="Nicht-wesentliche Themen" value={nonMaterialTopics.length} icon="➖" />
      </div>

      <div>
        <h2 style={sectionTitle}>Wesentliche Themen</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          {materialTopics.length === 0 && (
            <InfoBox type="warning">Keine wesentlichen Themen ermittelt. Bitte führen Sie die IRO-Bewertung durch.</InfoBox>
          )}
          {materialTopics.map(t => renderTopicCard(t))}
        </div>
      </div>

      <div>
        <h2 style={sectionTitle}>Nicht-wesentliche Themen</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          {nonMaterialTopics.length === 0 && (
            <InfoBox type="info">Alle Themen sind wesentlich.</InfoBox>
          )}
          {nonMaterialTopics.map(t => renderTopicCard(t))}
        </div>
      </div>
    </div>
  );

  // --- Tab 2: Wesentlichkeitsmatrix ---
  const renderMatrix = () => (
    <div style={sectionGap}>
      <h2 style={sectionTitle}>Wesentlichkeitsmatrix</h2>
      <MaterialityMatrix topics={topics} assessments={assessments} />

      <h3 style={{ ...sectionTitle, fontSize: tokens.typography.fontSize.lg, marginTop: tokens.spacing.xl }}>
        Übersichtstabelle
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: tokens.typography.fontSize.sm }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${tokens.colors.border}` }}>
              <th style={{ textAlign: 'left', padding: tokens.spacing.sm, color: tokens.colors.textSecondary, fontWeight: tokens.typography.fontWeight.semibold }}>Thema</th>
              <th style={{ textAlign: 'right', padding: tokens.spacing.sm, color: tokens.colors.textSecondary, fontWeight: tokens.typography.fontWeight.semibold }}>Impact</th>
              <th style={{ textAlign: 'right', padding: tokens.spacing.sm, color: tokens.colors.textSecondary, fontWeight: tokens.typography.fontWeight.semibold }}>Risiko</th>
              <th style={{ textAlign: 'right', padding: tokens.spacing.sm, color: tokens.colors.textSecondary, fontWeight: tokens.typography.fontWeight.semibold }}>Chance</th>
              <th style={{ textAlign: 'center', padding: tokens.spacing.sm, color: tokens.colors.textSecondary, fontWeight: tokens.typography.fontWeight.semibold }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {topicsWithScores.map(t => (
              <tr key={t.topic} style={{ borderBottom: `1px solid ${tokens.colors.borderLight}` }}>
                <td style={{ padding: tokens.spacing.sm, color: tokens.colors.text }}>{t.topic}</td>
                <td style={{ textAlign: 'right', padding: tokens.spacing.sm }}>
                  <ScoreIndicator score={t.scores.maxImpact} threshold={IMPACT_THRESHOLD} />
                </td>
                <td style={{ textAlign: 'right', padding: tokens.spacing.sm }}>
                  <ScoreIndicator score={t.scores.maxRisk} threshold={RISK_OPPORTUNITY_THRESHOLD} />
                </td>
                <td style={{ textAlign: 'right', padding: tokens.spacing.sm }}>
                  <ScoreIndicator score={t.scores.maxOpp} threshold={RISK_OPPORTUNITY_THRESHOLD} />
                </td>
                <td style={{ textAlign: 'center', padding: tokens.spacing.sm }}>
                  <span style={t.isMaterial ? materialBadge : nonMaterialBadge}>
                    {t.isMaterial ? 'Wesentlich' : 'Nicht wesentlich'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- Tab 3: Stakeholder ---
  const stakeholders = materiality.stakeholders || [];

  const renderStakeholder = () => (
    <div style={sectionGap}>
      {stakeholders.map((sh, i) => (
        <Card key={i} padding={tokens.spacing.xl}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.lg }}>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, margin: 0 }}>
              Stakeholder {i + 1}
            </h3>
            <Button variant="danger" onClick={() => deleteStakeholder(i)} icon="🗑️">
              Löschen
            </Button>
          </div>
          <div style={gridTwo}>
            <FormField
              label="Name"
              value={sh.name || ''}
              onChange={(v) => handleStakeholderChange(i, 'name', v)}
            />
            <FormField
              label="Kategorie"
              type="select"
              value={sh.category || 'Extern'}
              onChange={(v) => handleStakeholderChange(i, 'category', v)}
              options={STAKEHOLDER_CATEGORIES}
            />
          </div>
          <div style={{ marginTop: tokens.spacing.lg }}>
            <FormField
              label="Relevanz"
              type="textarea"
              value={sh.relevance || ''}
              onChange={(v) => handleStakeholderChange(i, 'relevance', v)}
              rows={3}
            />
          </div>
          <div style={{ marginTop: tokens.spacing.lg }}>
            <FormField
              label="Einbindungsmethode"
              value={sh.engagement_method || ''}
              onChange={(v) => handleStakeholderChange(i, 'engagement_method', v)}
            />
          </div>
          <div style={{ marginTop: tokens.spacing.lg }}>
            <FormField
              label="Wesentliche Anliegen (eine pro Zeile)"
              type="textarea"
              value={(sh.key_concerns || []).join('\n')}
              onChange={(v) => handleStakeholderChange(i, 'key_concerns', v.split('\n'))}
              rows={4}
            />
          </div>
        </Card>
      ))}

      <Button onClick={addStakeholder} variant="secondary" icon="➕">
        Stakeholder hinzufügen
      </Button>
    </div>
  );

  // --- Tab 4: Prozessdokumentation ---
  const renderProzess = () => (
    <div style={sectionGap}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
            Methodik
          </label>
          <Button variant="secondary" onClick={() => handleMaterialityChange('methodology', DEFAULT_METHODOLOGY)}>
            Standard-Text laden
          </Button>
        </div>
        <FormField
          type="textarea"
          value={materiality.methodology || ''}
          onChange={(v) => handleMaterialityChange('methodology', v)}
          rows={8}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
            Prozessbeschreibung
          </label>
          <Button variant="secondary" onClick={() => handleMaterialityChange('process_description', DEFAULT_PROCESS)}>
            Standard-Text laden
          </Button>
        </div>
        <FormField
          type="textarea"
          value={materiality.process_description || ''}
          onChange={(v) => handleMaterialityChange('process_description', v)}
          rows={8}
        />
      </div>

      <div style={gridTwo}>
        <FormField
          label="Genehmigungsgremium"
          value={materiality.approval_body || ''}
          onChange={(v) => handleMaterialityChange('approval_body', v)}
        />
        <FormField
          label="Genehmigungsdatum"
          value={materiality.approval_date || ''}
          onChange={(v) => handleMaterialityChange('approval_date', v)}
        />
      </div>

      <InfoBox type="info">
        <strong>Aktuelle Schwellenwerte:</strong><br />
        Auswirkungswesentlichkeit: &ge; {materiality.impact_threshold ?? IMPACT_THRESHOLD} von 75 Punkten<br />
        Finanzielle Wesentlichkeit: &ge; {materiality.financial_threshold ?? RISK_OPPORTUNITY_THRESHOLD} von 25 Punkten
      </InfoBox>
    </div>
  );

  const tabContent = [
    renderErgebnisse,
    renderMatrix,
    renderStakeholder,
    renderProzess,
  ];

  return (
    <div>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxl,
      }}>
        Wesentlichkeitsanalyse
      </h1>

      <SectionStatusBar route="/materiality" />

      <TabPanel
        tabs={TAB_LABELS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {tabContent[activeTab]()}
      </TabPanel>
    </div>
  );
}
