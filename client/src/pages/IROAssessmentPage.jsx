import React, { useState } from 'react';
import tokens from '../theme/tokens.js';
import { useReport } from '../hooks/useReport.js';
import { useLLM } from '../hooks/useLLM.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/ui/FormField.jsx';
import TabPanel from '../components/ui/TabPanel.jsx';
import Modal from '../components/ui/Modal.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import ScoreIndicator from '../components/ui/ScoreIndicator.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';
import SectionStatusBar from '../components/ui/SectionStatusBar.jsx';
import {
  calculateImpactScore,
  calculateRiskScore,
  isImpactMaterial,
  isRiskMaterial,
  getScoreColor,
  getMaxScores,
  isAssessmentMaterial,
  IMPACT_THRESHOLD,
  RISK_OPPORTUNITY_THRESHOLD,
  SCALE_DESCRIPTIONS,
} from '../utils/scoring.js';
import { ESRS_TOPICS } from '../utils/esrsConstants.js';

const TIME_HORIZONS = [
  'Kurzfristig (< 1 Jahr)',
  'Mittelfristig (1-5 Jahre)',
  'Langfristig (> 5 Jahre)',
];

const scaleOptions = (dimension) =>
  [1, 2, 3, 4, 5].map((v) => ({
    value: v,
    label: `${v} - ${SCALE_DESCRIPTIONS[dimension]?.[v] || ''}`,
  }));

const categoryColors = {
  environmental: tokens.colors.environmental,
  social: tokens.colors.social,
  governance: tokens.colors.governance,
};

function getCategoryForCode(code) {
  if (code.startsWith('E')) return 'environmental';
  if (code.startsWith('S')) return 'social';
  return 'governance';
}

function syncMateriality(updatedReport) {
  const assessments = updatedReport.iro_summary.assessments;
  assessments.forEach((a) => {
    const { maxImpact, maxRisk, maxOpp } = getMaxScores(a);
    const isMaterial = isAssessmentMaterial(a);
    const matTopic = updatedReport.materiality?.topics?.find((t) =>
      t.topic.startsWith(a.topic_code)
    );
    if (matTopic) {
      matTopic.is_material = isMaterial;
      matTopic.impact_score = maxImpact;
      matTopic.financial_score = Math.max(maxRisk, maxOpp);
    }
  });
  return updatedReport;
}

export default function IROAssessmentPage() {
  const { report, updateReport } = useReport();
  const { generateJustification, generateIRODescription, generating } = useLLM();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!report) {
    return (
      <PlaceholderBox
        icon="📊"
        title="Kein Bericht geladen"
        description="Bitte laden oder erstellen Sie zuerst einen Bericht im Dashboard."
      />
    );
  }

  const assessments = report.iro_summary?.assessments || [];

  // --- Metrics ---
  const totalTopics = assessments.length;
  const totalImpacts = assessments.reduce((s, a) => s + (a.impacts?.length || 0), 0);
  const totalRisks = assessments.reduce((s, a) => s + (a.risks?.length || 0), 0);
  const totalOpps = assessments.reduce((s, a) => s + (a.opportunities?.length || 0), 0);
  const totalIROs = totalImpacts + totalRisks + totalOpps;
  const assessedTopics = assessments.filter((a) =>
    (a.impacts?.length || 0) + (a.risks?.length || 0) + (a.opportunities?.length || 0) > 0
  ).length;

  // --- Group assessments by category ---
  const categories = [
    { key: 'environmental', label: 'Umwelt', prefix: 'E', color: categoryColors.environmental },
    { key: 'social', label: 'Soziales', prefix: 'S', color: categoryColors.social },
    { key: 'governance', label: 'Governance', prefix: 'G', color: categoryColors.governance },
  ];
  const groupedAssessments = categories.map((cat) => ({
    ...cat,
    items: assessments
      .map((a, idx) => ({ ...a, _originalIndex: idx }))
      .filter((a) => a.topic_code.startsWith(cat.prefix)),
  }));

  // --- Update helpers ---
  const handleAssessmentChange = (assessmentIndex, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex][field] = value;
    updateReport(syncMateriality(updated));
  };

  const handleImpactChange = (assessmentIndex, impactIndex, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].impacts[impactIndex][field] = value;
    updateReport(syncMateriality(updated));
  };

  const handleRiskChange = (assessmentIndex, riskIndex, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].risks[riskIndex][field] = value;
    updateReport(syncMateriality(updated));
  };

  const handleOpportunityChange = (assessmentIndex, oppIndex, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].opportunities[oppIndex][field] = value;
    updateReport(syncMateriality(updated));
  };

  const addImpact = (assessmentIndex) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].impacts.push({
      title: '',
      scale: 1,
      scope: 1,
      irreversibility: 1,
      probability: 1,
      description: '',
      affected_stakeholders: [],
      justification: '',
    });
    updateReport(syncMateriality(updated));
  };

  const addRisk = (assessmentIndex) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].risks.push({
      title: '',
      assessment_type: 'Risiko',
      financial_impact: 1,
      probability: 1,
      time_horizon: TIME_HORIZONS[0],
      description: '',
      financial_effects: '',
      justification: '',
    });
    updateReport(syncMateriality(updated));
  };

  const addOpportunity = (assessmentIndex) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].opportunities.push({
      title: '',
      assessment_type: 'Chance',
      financial_impact: 1,
      probability: 1,
      time_horizon: TIME_HORIZONS[0],
      description: '',
      financial_effects: '',
      justification: '',
    });
    updateReport(syncMateriality(updated));
  };

  const deleteImpact = (assessmentIndex, impactIndex) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].impacts.splice(impactIndex, 1);
    updateReport(syncMateriality(updated));
  };

  const deleteRisk = (assessmentIndex, riskIndex) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].risks.splice(riskIndex, 1);
    updateReport(syncMateriality(updated));
  };

  const deleteOpportunity = (assessmentIndex, oppIndex) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.iro_summary.assessments[assessmentIndex].opportunities.splice(oppIndex, 1);
    updateReport(syncMateriality(updated));
  };

  // --- LLM justification ---
  const handleGenerateImpactJustification = async (assessmentIdx, impactIdx) => {
    const assessment = report.iro_summary.assessments[assessmentIdx];
    const impact = assessment.impacts[impactIdx];
    const text = await generateJustification('impact', {
      title: impact.title,
      description: impact.description,
      scale: impact.scale,
      scope: impact.scope,
      irreversibility: impact.irreversibility,
      probability: impact.probability,
      topic: assessment.topic,
    });
    handleImpactChange(assessmentIdx, impactIdx, 'justification', text);
  };

  const handleGenerateRiskJustification = async (assessmentIdx, riskIdx) => {
    const assessment = report.iro_summary.assessments[assessmentIdx];
    const risk = assessment.risks[riskIdx];
    const text = await generateJustification('risk', {
      title: risk.title,
      description: risk.description,
      financial_impact: risk.financial_impact,
      probability: risk.probability,
      time_horizon: risk.time_horizon,
      topic: assessment.topic,
    });
    handleRiskChange(assessmentIdx, riskIdx, 'justification', text);
  };

  const handleGenerateOppJustification = async (assessmentIdx, oppIdx) => {
    const assessment = report.iro_summary.assessments[assessmentIdx];
    const opp = assessment.opportunities[oppIdx];
    const text = await generateJustification('opportunity', {
      title: opp.title,
      description: opp.description,
      financial_impact: opp.financial_impact,
      probability: opp.probability,
      time_horizon: opp.time_horizon,
      topic: assessment.topic,
    });
    handleOpportunityChange(assessmentIdx, oppIdx, 'justification', text);
  };

  // --- Selected assessment ---
  const selectedAssessment = assessments[selectedIndex];

  // --- Render helpers ---
  const renderImpactsTab = () => {
    if (!selectedAssessment) return null;
    const impacts = selectedAssessment.impacts || [];
    return (
      <div>
        {impacts.length === 0 && (
          <InfoBox variant="info" style={{ marginBottom: tokens.spacing.lg }}>
            Keine Auswirkungen erfasst. Klicken Sie auf "Auswirkung hinzufuegen", um eine neue Auswirkung anzulegen.
          </InfoBox>
        )}
        {impacts.map((impact, idx) => {
          const score = calculateImpactScore(impact.scale, impact.scope, impact.irreversibility, impact.probability);
          return (
            <Card key={idx} style={{ marginBottom: tokens.spacing.lg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing.lg }}>
                <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                  Auswirkung {idx + 1}
                </div>
                <Button variant="danger" size="sm" onClick={() => deleteImpact(selectedIndex, idx)}>
                  Entfernen
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
                <FormField
                  label="Titel"
                  value={impact.title}
                  onChange={(v) => handleImpactChange(selectedIndex, idx, 'title', v)}
                  placeholder="Bezeichnung der Auswirkung"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.md }}>
                  <FormField
                    label="Ausmaß (Scale)"
                    type="select"
                    value={impact.scale}
                    onChange={(v) => handleImpactChange(selectedIndex, idx, 'scale', Number(v))}
                    options={scaleOptions('scale')}
                  />
                  <FormField
                    label="Umfang (Scope)"
                    type="select"
                    value={impact.scope}
                    onChange={(v) => handleImpactChange(selectedIndex, idx, 'scope', Number(v))}
                    options={scaleOptions('scope')}
                  />
                  <FormField
                    label="Unumkehrbarkeit"
                    type="select"
                    value={impact.irreversibility}
                    onChange={(v) => handleImpactChange(selectedIndex, idx, 'irreversibility', Number(v))}
                    options={scaleOptions('irreversibility')}
                  />
                  <FormField
                    label="Wahrscheinlichkeit"
                    type="select"
                    value={impact.probability}
                    onChange={(v) => handleImpactChange(selectedIndex, idx, 'probability', Number(v))}
                    options={scaleOptions('probability')}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg, padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`, background: tokens.colors.borderLight, borderRadius: tokens.radii.sm }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>Score:</span>
                  <ScoreIndicator score={score} threshold={IMPACT_THRESHOLD} label="Schwelle" />
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: isImpactMaterial(score) ? tokens.colors.scoreRed : tokens.colors.scoreGreen,
                  }}>
                    {isImpactMaterial(score) ? 'Wesentlich' : 'Nicht wesentlich'}
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
                    <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                      Beschreibung
                    </label>
                    <Button variant="ai" size="sm" disabled={generating || !impact.title} onClick={async () => {
                      const text = await generateIRODescription('impact', impact.title, selectedAssessment.topic, selectedAssessment.topic_code);
                      handleImpactChange(selectedIndex, idx, 'description', text);
                    }}>
                      {generating ? 'Generiere...' : 'KI-Beschreibung'}
                    </Button>
                  </div>
                  <FormField
                    type="textarea"
                    value={impact.description}
                    onChange={(v) => handleImpactChange(selectedIndex, idx, 'description', v)}
                    rows={3}
                    placeholder="Beschreibung der Auswirkung..."
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
                    <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                      Begruendung
                    </label>
                    <Button
                      variant="ai"
                      size="sm"
                      onClick={() => handleGenerateImpactJustification(selectedIndex, idx)}
                      disabled={generating}
                    >
                      {generating ? 'Generiere...' : 'KI-Begruendung'}
                    </Button>
                  </div>
                  <FormField
                    type="textarea"
                    value={impact.justification}
                    onChange={(v) => handleImpactChange(selectedIndex, idx, 'justification', v)}
                    rows={4}
                    placeholder="Begruendung fuer die Bewertung..."
                  />
                </div>
              </div>
            </Card>
          );
        })}
        <Button variant="secondary" onClick={() => addImpact(selectedIndex)} icon="+">
          Auswirkung hinzufuegen
        </Button>
      </div>
    );
  };

  const renderRiskOrOppItem = (item, idx, type) => {
    const isRisk = type === 'risk';
    const score = calculateRiskScore(item.financial_impact, item.probability);
    const handleChange = isRisk ? handleRiskChange : handleOpportunityChange;
    const handleDelete = isRisk ? deleteRisk : deleteOpportunity;
    const handleGenerate = isRisk ? handleGenerateRiskJustification : handleGenerateOppJustification;
    const label = isRisk ? 'Risiko' : 'Chance';

    return (
      <Card key={idx} style={{ marginBottom: tokens.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing.lg }}>
          <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
            {label} {idx + 1}
          </div>
          <Button variant="danger" size="sm" onClick={() => handleDelete(selectedIndex, idx)}>
            Entfernen
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
          <FormField
            label="Titel"
            value={item.title}
            onChange={(v) => handleChange(selectedIndex, idx, 'title', v)}
            placeholder={`Bezeichnung ${isRisk ? 'des Risikos' : 'der Chance'}`}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing.md }}>
            <FormField
              label="Finanzielle Auswirkung"
              type="select"
              value={item.financial_impact}
              onChange={(v) => handleChange(selectedIndex, idx, 'financial_impact', Number(v))}
              options={scaleOptions('financial_impact')}
            />
            <FormField
              label="Wahrscheinlichkeit"
              type="select"
              value={item.probability}
              onChange={(v) => handleChange(selectedIndex, idx, 'probability', Number(v))}
              options={scaleOptions('probability')}
            />
            <FormField
              label="Zeithorizont"
              type="select"
              value={item.time_horizon}
              onChange={(v) => handleChange(selectedIndex, idx, 'time_horizon', v)}
              options={TIME_HORIZONS}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg, padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`, background: tokens.colors.borderLight, borderRadius: tokens.radii.sm }}>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>Score:</span>
            <ScoreIndicator score={score} threshold={RISK_OPPORTUNITY_THRESHOLD} label="Schwelle" />
            <span style={{
              marginLeft: 'auto',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: isRiskMaterial(score) ? tokens.colors.scoreRed : tokens.colors.scoreGreen,
            }}>
              {isRiskMaterial(score) ? 'Wesentlich' : 'Nicht wesentlich'}
            </span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
              <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                Beschreibung
              </label>
              <Button variant="ai" size="sm" disabled={generating || !item.title} onClick={async () => {
                const text = await generateIRODescription(type, item.title, selectedAssessment.topic, selectedAssessment.topic_code);
                handleChange(selectedIndex, idx, 'description', text);
              }}>
                {generating ? 'Generiere...' : 'KI-Beschreibung'}
              </Button>
            </div>
            <FormField
              type="textarea"
              value={item.description}
              onChange={(v) => handleChange(selectedIndex, idx, 'description', v)}
              rows={3}
              placeholder="Beschreibung..."
            />
          </div>
          <FormField
            label="Finanzielle Effekte"
            type="textarea"
            value={item.financial_effects}
            onChange={(v) => handleChange(selectedIndex, idx, 'financial_effects', v)}
            rows={3}
            placeholder="Erwartete finanzielle Effekte..."
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
              <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                Begruendung
              </label>
              <Button
                variant="ai"
                size="sm"
                onClick={() => handleGenerate(selectedIndex, idx)}
                disabled={generating}
              >
                {generating ? 'Generiere...' : 'KI-Begruendung'}
              </Button>
            </div>
            <FormField
              type="textarea"
              value={item.justification}
              onChange={(v) => handleChange(selectedIndex, idx, 'justification', v)}
              rows={4}
              placeholder="Begruendung fuer die Bewertung..."
            />
          </div>
        </div>
      </Card>
    );
  };

  const renderRisksTab = () => {
    if (!selectedAssessment) return null;
    const risks = selectedAssessment.risks || [];
    return (
      <div>
        {risks.length === 0 && (
          <InfoBox variant="info" style={{ marginBottom: tokens.spacing.lg }}>
            Keine Risiken erfasst. Klicken Sie auf "Risiko hinzufuegen", um ein neues Risiko anzulegen.
          </InfoBox>
        )}
        {risks.map((risk, idx) => renderRiskOrOppItem(risk, idx, 'risk'))}
        <Button variant="secondary" onClick={() => addRisk(selectedIndex)} icon="+">
          Risiko hinzufuegen
        </Button>
      </div>
    );
  };

  const renderOpportunitiesTab = () => {
    if (!selectedAssessment) return null;
    const opportunities = selectedAssessment.opportunities || [];
    return (
      <div>
        {opportunities.length === 0 && (
          <InfoBox variant="info" style={{ marginBottom: tokens.spacing.lg }}>
            Keine Chancen erfasst. Klicken Sie auf "Chance hinzufuegen", um eine neue Chance anzulegen.
          </InfoBox>
        )}
        {opportunities.map((opp, idx) => renderRiskOrOppItem(opp, idx, 'opportunity'))}
        <Button variant="secondary" onClick={() => addOpportunity(selectedIndex)} icon="+">
          Chance hinzufuegen
        </Button>
      </div>
    );
  };

  const renderMetadataTab = () => {
    if (!selectedAssessment) return null;
    const a = selectedAssessment;
    const dataSources = (a.data_sources || []).join('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.md }}>
          <FormField
            label="Verantwortliche Person"
            value={a.responsible_person}
            onChange={(v) => handleAssessmentChange(selectedIndex, 'responsible_person', v)}
            placeholder="Name der verantwortlichen Person"
          />
          <FormField
            label="Bewertungsdatum"
            value={a.assessment_date}
            onChange={(v) => handleAssessmentChange(selectedIndex, 'assessment_date', v)}
            placeholder="TT.MM.JJJJ"
          />
          <FormField
            label="Entscheidungsgremium"
            value={a.decision_body}
            onChange={(v) => handleAssessmentChange(selectedIndex, 'decision_body', v)}
            placeholder="z.B. Vorstand, Nachhaltigkeitsausschuss"
          />
          <FormField
            label="Freigabedatum"
            value={a.approval_date}
            onChange={(v) => handleAssessmentChange(selectedIndex, 'approval_date', v)}
            placeholder="TT.MM.JJJJ"
          />
          <FormField
            label="Ueberpruefungszyklus"
            value={a.review_cycle || 'Jaehrlich'}
            onChange={(v) => handleAssessmentChange(selectedIndex, 'review_cycle', v)}
            placeholder="z.B. Jaehrlich"
          />
        </div>
        <FormField
          label="Datenquellen (eine pro Zeile)"
          type="textarea"
          value={dataSources}
          onChange={(v) => handleAssessmentChange(selectedIndex, 'data_sources', v.split('\n'))}
          rows={4}
          placeholder="Eine Datenquelle pro Zeile..."
        />
        <FormField
          label="Annahmen"
          type="textarea"
          value={a.assumptions}
          onChange={(v) => handleAssessmentChange(selectedIndex, 'assumptions', v)}
          rows={3}
          placeholder="Getroffene Annahmen..."
        />
        <FormField
          label="Einschraenkungen"
          type="textarea"
          value={a.limitations}
          onChange={(v) => handleAssessmentChange(selectedIndex, 'limitations', v)}
          rows={3}
          placeholder="Bekannte Einschraenkungen..."
        />
      </div>
    );
  };

  return (
    <div>
      {/* Page title */}
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxl,
      }}>
        IRO-Bewertung
      </h1>

      <SectionStatusBar route="/iro" />

      <p style={{
        fontSize: tokens.typography.fontSize.md,
        color: tokens.colors.textSecondary,
        marginBottom: tokens.spacing.xxxl,
      }}>
        Erfassen und bewerten Sie fuer jedes ESRS-Thema die Auswirkungen, Risiken und Chancen, um die Wesentlichkeit zu bestimmen.
      </p>

      {/* Overview metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: tokens.spacing.lg,
        marginBottom: tokens.spacing.xxxl,
      }}>
        <MetricCard label="ESRS-Themen" value={totalTopics} />
        <MetricCard label="Bewertet" value={`${assessedTopics} / ${totalTopics}`} />
        <MetricCard label="Auswirkungen" value={totalImpacts} />
        <MetricCard label="Risiken" value={totalRisks} />
        <MetricCard label="Chancen" value={totalOpps} />
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'flex', gap: tokens.spacing.xxl }}>
        {/* Left column - topic cards grouped by category */}
        <div style={{ width: 360, flexShrink: 0 }}>
          {groupedAssessments.map((group) => (
            <div key={group.key} style={{ marginBottom: tokens.spacing.xl }}>
              {/* Category header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.sm,
                marginBottom: tokens.spacing.md,
                paddingBottom: tokens.spacing.sm,
                borderBottom: `2px solid ${group.color}`,
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: group.color,
                }} />
                <span style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                }}>
                  {group.label}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.textSecondary,
                  marginLeft: 'auto',
                }}>
                  {group.items.length} {group.items.length === 1 ? 'Thema' : 'Themen'}
                </span>
              </div>
              {/* Topic cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
                {group.items.map((assessment) => {
                  const iroCount = (assessment.impacts?.length || 0) + (assessment.risks?.length || 0) + (assessment.opportunities?.length || 0);
                  return (
                    <Card
                      key={assessment.topic_code}
                      onClick={() => setSelectedIndex(assessment._originalIndex)}
                      selected={selectedIndex === assessment._originalIndex}
                      padding={tokens.spacing.lg}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
                        {/* Topic code badge */}
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: tokens.radii.sm,
                          background: group.color + '18',
                          color: group.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.bold,
                          flexShrink: 0,
                        }}>
                          {assessment.topic_code}
                        </div>
                        {/* Topic name + IRO count */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: tokens.typography.fontSize.md,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {assessment.topic.replace(/^[A-Z]\d+\s*[-–]\s*/, '')}
                          </div>
                          <div style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.textSecondary,
                            marginTop: 2,
                          }}>
                            {iroCount === 0
                              ? 'Noch nicht bewertet'
                              : `${(assessment.impacts?.length || 0)} A · ${(assessment.risks?.length || 0)} R · ${(assessment.opportunities?.length || 0)} C`}
                          </div>
                        </div>
                        {/* Progress indicator */}
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: iroCount > 0 ? tokens.colors.success : tokens.colors.border,
                          flexShrink: 0,
                        }} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right column - detail panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedAssessment ? (
            <Card padding={tokens.spacing.xxl}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.md,
                marginBottom: tokens.spacing.xl,
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: categoryColors[getCategoryForCode(selectedAssessment.topic_code)],
                }} />
                <h2 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.text,
                  margin: 0,
                }}>
                  {selectedAssessment.topic}
                </h2>
              </div>

              {/* Score summary row */}
              {(() => {
                const { maxImpact, maxRisk, maxOpp } = getMaxScores(selectedAssessment);
                const isMaterial = isAssessmentMaterial(selectedAssessment);
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing.xxl,
                    marginBottom: tokens.spacing.xl,
                    padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
                    background: tokens.colors.borderLight,
                    borderRadius: tokens.radii.sm,
                  }}>
                    <div>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary, marginRight: tokens.spacing.sm }}>Auswirkung:</span>
                      <ScoreIndicator score={maxImpact} threshold={IMPACT_THRESHOLD} />
                    </div>
                    <div>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary, marginRight: tokens.spacing.sm }}>Risiko:</span>
                      <ScoreIndicator score={maxRisk} threshold={RISK_OPPORTUNITY_THRESHOLD} />
                    </div>
                    <div>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary, marginRight: tokens.spacing.sm }}>Chance:</span>
                      <ScoreIndicator score={maxOpp} threshold={RISK_OPPORTUNITY_THRESHOLD} />
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>Ergebnis:</span>
                      <span style={{
                        padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
                        borderRadius: tokens.radii.sm,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        background: isMaterial ? tokens.colors.successLight : tokens.colors.borderLight,
                        color: isMaterial ? tokens.colors.success : tokens.colors.textLight,
                        border: `1px solid ${isMaterial ? tokens.colors.success + '30' : tokens.colors.border}`,
                      }}>
                        {isMaterial ? 'Wesentlich' : 'Nicht wesentlich'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <TabPanel
                tabs={[
                  {
                    label: `Auswirkungen (${(selectedAssessment.impacts || []).length})`,
                    content: renderImpactsTab(),
                  },
                  {
                    label: `Risiken (${(selectedAssessment.risks || []).length})`,
                    content: renderRisksTab(),
                  },
                  {
                    label: `Chancen (${(selectedAssessment.opportunities || []).length})`,
                    content: renderOpportunitiesTab(),
                  },
                  {
                    label: 'Metadaten',
                    content: renderMetadataTab(),
                  },
                ]}
              />
            </Card>
          ) : (
            <PlaceholderBox
              icon="📋"
              title="Kein Thema ausgewaehlt"
              description="Waehlen Sie ein ESRS-Thema aus der Liste links aus, um die Bewertung zu bearbeiten."
            />
          )}
        </div>
      </div>

      {/* Summary table */}
      <div style={{ marginTop: tokens.spacing.xxxxl }}>
        <h2 style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text,
          marginBottom: tokens.spacing.lg,
        }}>
          Uebersicht aller Themen
        </h2>
        <Card padding={0}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: tokens.typography.fontSize.md,
            fontFamily: tokens.typography.fontFamily,
          }}>
            <thead>
              <tr style={{ background: tokens.colors.borderLight }}>
                {['Thema', 'Auswirkungen', 'Risiken', 'Chancen', 'Max Impact', 'Max Risiko', 'Max Chance', 'Ergebnis'].map((h) => (
                  <th key={h} style={{
                    padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
                    textAlign: 'left',
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.textSecondary,
                    fontSize: tokens.typography.fontSize.sm,
                    borderBottom: `1px solid ${tokens.colors.border}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, idx) => {
                const { maxImpact, maxRisk, maxOpp } = getMaxScores(a);
                const isMaterial = isAssessmentMaterial(a);
                const catColor = categoryColors[getCategoryForCode(a.topic_code)];
                return (
                  <tr
                    key={a.topic_code}
                    onClick={() => setSelectedIndex(idx)}
                    style={{
                      cursor: 'pointer',
                      background: selectedIndex === idx ? tokens.colors.surfaceHover : 'transparent',
                      borderBottom: `1px solid ${tokens.colors.borderLight}`,
                    }}
                  >
                    <td style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: catColor }} />
                        <span style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.text }}>
                          {a.topic}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`, color: tokens.colors.textSecondary }}>
                      {(a.impacts || []).length}
                    </td>
                    <td style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`, color: tokens.colors.textSecondary }}>
                      {(a.risks || []).length}
                    </td>
                    <td style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`, color: tokens.colors.textSecondary }}>
                      {(a.opportunities || []).length}
                    </td>
                    <td style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px` }}>
                      <ScoreIndicator score={maxImpact} threshold={IMPACT_THRESHOLD} />
                    </td>
                    <td style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px` }}>
                      <ScoreIndicator score={maxRisk} threshold={RISK_OPPORTUNITY_THRESHOLD} />
                    </td>
                    <td style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px` }}>
                      <ScoreIndicator score={maxOpp} threshold={RISK_OPPORTUNITY_THRESHOLD} />
                    </td>
                    <td style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px` }}>
                      <span style={{
                        padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
                        borderRadius: tokens.radii.sm,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        background: isMaterial ? tokens.colors.successLight : tokens.colors.borderLight,
                        color: isMaterial ? tokens.colors.success : tokens.colors.textLight,
                      }}>
                        {isMaterial ? 'Wesentlich' : 'Nicht wesentlich'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
