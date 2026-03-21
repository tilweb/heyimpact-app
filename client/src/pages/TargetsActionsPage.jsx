import React, { useState, useRef } from 'react';
import { useReport } from '../hooks/useReport.js';
import { useLLM } from '../hooks/useLLM.js';
import tokens from '../theme/tokens.js';
import TabPanel from '../components/ui/TabPanel.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/ui/FormField.jsx';
import Modal from '../components/ui/Modal.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';
import SectionStatusBar from '../components/ui/SectionStatusBar.jsx';
import { ESRS_TOPICS } from '../utils/esrsConstants.js';
import { SDG_DEFINITIONS, ESRS_SDG_MAPPING, getSDGDisplay, getRelevantSDGs } from '../utils/sdg.js';
import { getMaterialTopicCodes } from '../utils/scoring.js';
import { buildReportContext } from '../utils/llmContext.js';

const TAB_LABELS = ['Richtlinien', 'Ziele', 'Massnahmen', 'SDG-Uebersicht'];

const POLICY_TYPES = ['Richtlinie', 'Strategie', 'Leitlinie', 'Verhaltenskodex', 'Verpflichtung', 'Standard'];
const POLICY_STATUSES = ['Entwurf', 'Genehmigt', 'Umgesetzt', 'In Pruefung', 'Archiviert'];
const TARGET_TYPES = ['Absolut', 'Relativ', 'Qualitativ'];
const TARGET_STATUSES = ['Auf Kurs', 'Verzoegert', 'Erreicht', 'Nicht begonnen'];
const TARGET_HORIZONS = ['Kurzfristig (< 1 Jahr)', 'Mittelfristig (1-5 Jahre)', 'Langfristig (> 5 Jahre)'];
const ACTION_STATUSES = ['Geplant', 'In Umsetzung', 'Abgeschlossen', 'Laufend', 'Abgebrochen'];

const TOPIC_OPTIONS = [{ value: '', label: '-- Thema waehlen --' }, ...ESRS_TOPICS.map(t => ({ value: t.code, label: t.name }))];

function getTopicColor(code) {
  const topic = ESRS_TOPICS.find(t => t.code === code);
  return topic ? topic.color : tokens.colors.textSecondary;
}

export default function TargetsActionsPage() {
  const { report, updateReport } = useReport();
  const { generating, suggestSDG, generateItemDescription, extractPolicyFromDocument } = useLLM();
  const policyFileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Expanded states
  const [expandedPolicies, setExpandedPolicies] = useState({});
  const [expandedTargets, setExpandedTargets] = useState({});

  // Modal states
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  // AI suggestion preview (shared — only one modal open at a time)
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const generateAndPreview = async (type, title, topic, existingDescription) => {
    const text = await generateItemDescription(type, title, topic, buildReportContext(report, topic), existingDescription || null);
    if (text) setAiSuggestion({ text, type });
  };

  const applyAiSuggestion = (setter, currentDescription, mode) => {
    if (mode === 'replace') {
      setter(p => ({ ...p, description: aiSuggestion.text }));
    } else if (mode === 'append') {
      setter(p => ({ ...p, description: [currentDescription, aiSuggestion.text].filter(Boolean).join('\n\n') }));
    }
    setAiSuggestion(null);
  };

  const renderAiSuggestion = (setter, currentDescription) => {
    if (!aiSuggestion) return null;
    return (
      <div style={{
        background: `${tokens.colors.primary}08`,
        border: `1px solid ${tokens.colors.primary}33`,
        borderRadius: tokens.radii.md,
        padding: tokens.spacing.lg,
      }}>
        <div style={{
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: tokens.spacing.sm,
        }}>
          KI-Vorschlag
        </div>
        <p style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.text,
          lineHeight: 1.6,
          margin: `0 0 ${tokens.spacing.md}px`,
          whiteSpace: 'pre-wrap',
        }}>
          {aiSuggestion.text}
        </p>
        <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
          <Button size="sm" onClick={() => applyAiSuggestion(setter, currentDescription, 'replace')}>Übernehmen</Button>
          <Button size="sm" variant="secondary" onClick={() => applyAiSuggestion(setter, currentDescription, 'append')}>Anhängen</Button>
          <Button size="sm" variant="secondary" onClick={() => setAiSuggestion(null)}>Verwerfen</Button>
        </div>
      </div>
    );
  };

  const aiButtonLabel = (title, description) => {
    if (generating) return 'Generiere...';
    return description?.trim() ? 'KI verbessern' : 'KI-Beschreibung';
  };

  // New item forms
  const [newPolicy, setNewPolicy] = useState({
    topic: '', title: '', description: '', policy_type: 'Richtlinie',
    is_mandatory: false, status: 'Entwurf', responsible_person: '', responsible_department: '',
  });
  const [newTarget, setNewTarget] = useState({
    topic: '', title: '', description: '', target_type: 'Absolut',
    baseline_year: 2024, baseline_value: 0, target_year: 2030, target_value: 0,
    unit: '', current_value: 0, status: 'Nicht begonnen',
    time_horizon: 'Mittelfristig (1-5 Jahre)', responsible_person: '',
  });
  const [newAction, setNewAction] = useState({
    topic: '', title: '', description: '', status: 'Geplant',
    start_date: '', end_date: '', responsible_person: '', responsible_department: '',
    budget: 0, sdg_goals: [],
  });

  if (!report) {
    return (
      <PlaceholderBox
        icon="🎯"
        title="Kein Bericht geladen"
        description="Bitte gehen Sie zur Startseite und erstellen oder laden Sie einen Bericht."
      />
    );
  }

  const policies = report.policies || [];
  const targets = report.targets || [];
  const actions = report.actions || [];
  const materialCodes = getMaterialTopicCodes(report);

  // --- Helpers ---
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const topicBadgeStyle = (code) => ({
    display: 'inline-block',
    padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
    borderRadius: tokens.radii.sm,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.white,
    background: getTopicColor(code),
  });

  const mandatoryBadgeStyle = (isMandatory) => ({
    display: 'inline-block',
    padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
    borderRadius: tokens.radii.sm,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: isMandatory ? tokens.colors.info : tokens.colors.textSecondary,
    background: isMandatory ? tokens.colors.infoLight : tokens.colors.borderLight,
  });

  const sectionGap = { display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg };
  const gridFour = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing.lg };
  const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.lg };
  const gridThree = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing.lg };
  const sectionTitle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text,
    margin: 0,
    marginBottom: tokens.spacing.md,
  };
  const detailLabel = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.textSecondary,
  };
  const detailValue = {
    fontSize: tokens.typography.fontSize.md,
    color: tokens.colors.text,
  };

  // --- Delete handlers ---
  const deletePolicy = (id) => {
    const updated = deepClone(report);
    updated.policies = (updated.policies || []).filter(p => p.id !== id);
    updateReport(updated);
  };

  const deleteTarget = (id) => {
    const updated = deepClone(report);
    updated.targets = (updated.targets || []).filter(t => t.id !== id);
    updateReport(updated);
  };

  const deleteAction = (id) => {
    const updated = deepClone(report);
    updated.actions = (updated.actions || []).filter(a => a.id !== id);
    updateReport(updated);
  };

  // --- Save handlers ---
  const savePolicy = () => {
    if (!newPolicy.topic || !newPolicy.title) return;
    const updated = deepClone(report);
    if (!updated.policies) updated.policies = [];
    updated.policies.push({
      ...newPolicy,
      id: `pol_${Date.now()}`,
      voluntary_reason: '',
      approval_date: '',
      effective_date: '',
      review_date: '',
      review_cycle: '',
      responsible_person: newPolicy.responsible_person,
      responsible_department: newPolicy.responsible_department,
      approval_body: '',
      scope: '',
      key_commitments: [],
      stakeholder_groups: [],
      communication_channels: [],
      training_provided: false,
      training_description: '',
      document_reference: '',
      external_standards: [],
      linked_action_ids: [],
      linked_target_ids: [],
    });
    updateReport(updated);
    setPolicyModalOpen(false);
    setNewPolicy({
      topic: '', title: '', description: '', policy_type: 'Richtlinie',
      is_mandatory: false, status: 'Entwurf', responsible_person: '', responsible_department: '',
    });
  };

  const saveTarget = () => {
    if (!newTarget.topic || !newTarget.title) return;
    const updated = deepClone(report);
    if (!updated.targets) updated.targets = [];
    const progress = newTarget.target_value > 0
      ? Math.round(((newTarget.current_value - newTarget.baseline_value) / (newTarget.target_value - newTarget.baseline_value)) * 100)
      : 0;
    updated.targets.push({
      ...newTarget,
      id: `tgt_${Date.now()}`,
      is_mandatory: false,
      voluntary_reason: '',
      progress_percentage: Math.max(0, Math.min(100, progress || 0)),
      kpis: [],
      variance_explanation: '',
      programs: [],
    });
    updateReport(updated);
    setTargetModalOpen(false);
    setNewTarget({
      topic: '', title: '', description: '', target_type: 'Absolut',
      baseline_year: 2024, baseline_value: 0, target_year: 2030, target_value: 0,
      unit: '', current_value: 0, status: 'Nicht begonnen',
      time_horizon: 'Mittelfristig (1-5 Jahre)', responsible_person: '',
    });
  };

  const saveAction = () => {
    if (!newAction.topic || !newAction.title) return;
    const updated = deepClone(report);
    if (!updated.actions) updated.actions = [];
    updated.actions.push({
      ...newAction,
      id: `act_${Date.now()}`,
      is_mandatory: false,
      voluntary_reason: '',
      progress_description: '',
      milestones: [],
      budget_spent: 0,
      linked_target_ids: [],
    });
    updateReport(updated);
    setActionModalOpen(false);
    setNewAction({
      topic: '', title: '', description: '', status: 'Geplant',
      start_date: '', end_date: '', responsible_person: '', responsible_department: '',
      budget: 0, sdg_goals: [],
    });
  };

  // --- Policy import from document ---
  const handlePolicyImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    try {
      const result = await extractPolicyFromDocument(file);
      if (result?.extracted) {
        setNewPolicy(prev => ({
          ...prev,
          ...result.extracted,
        }));
        setPolicyModalOpen(true);
      }
    } catch (err) {
      alert(`Import fehlgeschlagen: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // --- SDG suggestion ---
  const handleSuggestSDG = async (action) => {
    const result = await suggestSDG(action.title, action.description, action.topic);
    if (result && Array.isArray(result)) {
      const updated = deepClone(report);
      const idx = (updated.actions || []).findIndex(a => a.id === action.id);
      if (idx >= 0) {
        updated.actions[idx].sdg_goals = result;
        updateReport(updated);
      }
    }
  };

  // --- Toggle SDG for new action ---
  const toggleNewActionSDG = (num) => {
    setNewAction(prev => {
      const goals = prev.sdg_goals || [];
      return {
        ...prev,
        sdg_goals: goals.includes(num) ? goals.filter(g => g !== num) : [...goals, num],
      };
    });
  };

  // --- Missing topics warnings ---
  const topicsWithPolicy = [...new Set(policies.map(p => p.topic))];
  const topicsWithTarget = [...new Set(targets.map(t => t.topic))];
  const missingPolicyTopics = materialCodes.filter(c => !topicsWithPolicy.includes(c));
  const missingTargetTopics = materialCodes.filter(c => !topicsWithTarget.includes(c));

  // =============================================
  // TAB 1: RICHTLINIEN (Policies)
  // =============================================
  const renderPolicies = () => {
    const total = policies.length;
    const mandatory = policies.filter(p => p.is_mandatory).length;
    const voluntary = total - mandatory;
    const implemented = policies.filter(p => p.status === 'Umgesetzt').length;

    return (
      <div style={sectionGap}>
        <div style={gridFour}>
          <MetricCard label="Richtlinien gesamt" value={total} icon="📋" />
          <MetricCard label="ESRS-pflichtig" value={mandatory} icon="📌" />
          <MetricCard label="Freiwillig" value={voluntary} icon="📝" />
          <MetricCard label="Umgesetzt" value={implemented} icon="✅" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={sectionTitle}>Richtlinien</h2>
          <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
            <input
              type="file"
              ref={policyFileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.txt,.md"
              onChange={handlePolicyImport}
            />
            <Button
              variant="ai"
              onClick={() => policyFileInputRef.current?.click()}
              disabled={importing || generating}
            >
              {importing ? 'Importiere...' : 'Aus Dokument importieren'}
            </Button>
            <Button onClick={() => setPolicyModalOpen(true)} icon="➕">Neue Richtlinie</Button>
          </div>
        </div>

        {missingPolicyTopics.length > 0 && (
          <InfoBox type="warning">
            Folgende wesentliche Themen haben noch keine Richtlinie:{' '}
            <strong>{missingPolicyTopics.join(', ')}</strong>
          </InfoBox>
        )}

        {policies.length === 0 && (
          <InfoBox type="info">Noch keine Richtlinien erfasst. Erstellen Sie Ihre erste Richtlinie.</InfoBox>
        )}

        {policies.map(pol => {
          const expanded = expandedPolicies[pol.id];
          return (
            <Card key={pol.id} padding={tokens.spacing.xl}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpandedPolicies(prev => ({ ...prev, [pol.id]: !prev[pol.id] }))}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
                  <span style={topicBadgeStyle(pol.topic)}>{pol.topic}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                    {pol.title}
                  </span>
                  <StatusBadge status={pol.status} />
                  <span style={mandatoryBadgeStyle(pol.is_mandatory)}>
                    {pol.is_mandatory ? 'ESRS-pflichtig' : 'Freiwillig'}
                  </span>
                </div>
                <span style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.textSecondary }}>
                  {expanded ? '\u25B2' : '\u25BC'}
                </span>
              </div>

              {expanded && (
                <div style={{ marginTop: tokens.spacing.xl, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
                  {pol.description && (
                    <div>
                      <span style={detailLabel}>Beschreibung</span>
                      <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{pol.description}</p>
                    </div>
                  )}
                  <div style={gridTwo}>
                    <div>
                      <span style={detailLabel}>Verantwortliche Person</span>
                      <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{pol.responsible_person || '-'}</p>
                    </div>
                    <div>
                      <span style={detailLabel}>Abteilung</span>
                      <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{pol.responsible_department || '-'}</p>
                    </div>
                  </div>
                  <div style={gridThree}>
                    <div>
                      <span style={detailLabel}>Genehmigungsdatum</span>
                      <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{pol.approval_date || '-'}</p>
                    </div>
                    <div>
                      <span style={detailLabel}>Inkrafttreten</span>
                      <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{pol.effective_date || '-'}</p>
                    </div>
                    <div>
                      <span style={detailLabel}>Naechste Pruefung</span>
                      <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{pol.review_date || '-'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: tokens.spacing.sm }}>
                    <Button variant="danger" onClick={() => deletePolicy(pol.id)} icon="🗑️" size="sm">Loeschen</Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Policy Modal */}
        <Modal open={policyModalOpen} onClose={() => setPolicyModalOpen(false)} title="Neue Richtlinie" width={700}>
          <div style={sectionGap}>
            <FormField
              label="ESRS-Thema"
              type="select"
              value={newPolicy.topic}
              onChange={(v) => setNewPolicy(p => ({ ...p, topic: v, is_mandatory: materialCodes.includes(v) }))}
              options={TOPIC_OPTIONS}
              required
            />
            <FormField
              label="Titel"
              value={newPolicy.title}
              onChange={(v) => setNewPolicy(p => ({ ...p, title: v }))}
              required
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                  Beschreibung
                </label>
                <Button variant="ai" size="sm" disabled={generating || !newPolicy.title} onClick={() => generateAndPreview('policy', newPolicy.title, newPolicy.topic, newPolicy.description)}>
                  {aiButtonLabel(newPolicy.title, newPolicy.description)}
                </Button>
              </div>
              <FormField
                type="textarea"
                value={newPolicy.description}
                onChange={(v) => { setNewPolicy(p => ({ ...p, description: v })); setAiSuggestion(null); }}
                rows={4}
              />
              {renderAiSuggestion(setNewPolicy, newPolicy.description)}
            </div>
            <div style={gridTwo}>
              <FormField
                label="Art der Richtlinie"
                type="select"
                value={newPolicy.policy_type}
                onChange={(v) => setNewPolicy(p => ({ ...p, policy_type: v }))}
                options={POLICY_TYPES}
              />
              <FormField
                label="Status"
                type="select"
                value={newPolicy.status}
                onChange={(v) => setNewPolicy(p => ({ ...p, status: v }))}
                options={POLICY_STATUSES}
              />
            </div>
            {newPolicy.topic && (
              <div style={{
                padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                background: newPolicy.is_mandatory ? `${tokens.colors.info}10` : tokens.colors.background,
                border: `1px solid ${newPolicy.is_mandatory ? tokens.colors.info : tokens.colors.border}`,
                borderRadius: tokens.radii.sm,
                fontSize: tokens.typography.fontSize.sm,
                color: newPolicy.is_mandatory ? tokens.colors.info : tokens.colors.textSecondary,
              }}>
                {newPolicy.is_mandatory
                  ? '📋 ESRS-Offenlegungspflicht — dieses Thema ist wesentlich, eine Richtlinie muss im Bericht ausgewiesen werden.'
                  : '○ Freiwillig — dieses Thema ist nicht als wesentlich eingestuft, die Richtlinie ist optional.'}
              </div>
            )}
            <div style={gridTwo}>
              <FormField
                label="Verantwortliche Person"
                value={newPolicy.responsible_person}
                onChange={(v) => setNewPolicy(p => ({ ...p, responsible_person: v }))}
              />
              <FormField
                label="Abteilung"
                value={newPolicy.responsible_department}
                onChange={(v) => setNewPolicy(p => ({ ...p, responsible_department: v }))}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing.md, marginTop: tokens.spacing.md }}>
              <Button variant="secondary" onClick={() => setPolicyModalOpen(false)}>Abbrechen</Button>
              <Button onClick={savePolicy}>Speichern</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  // =============================================
  // TAB 2: ZIELE (Targets)
  // =============================================
  const renderTargets = () => {
    const total = targets.length;
    const mandatory = targets.filter(t => t.is_mandatory).length;
    const voluntary = total - mandatory;
    const onTrack = targets.filter(t => t.status === 'Auf Kurs').length;
    const achieved = targets.filter(t => t.status === 'Erreicht').length;

    // Group by time_horizon
    const groups = {};
    TARGET_HORIZONS.forEach(h => { groups[h] = []; });
    targets.forEach(t => {
      const horizon = t.time_horizon || 'Mittelfristig (1-5 Jahre)';
      if (!groups[horizon]) groups[horizon] = [];
      groups[horizon].push(t);
    });

    return (
      <div style={sectionGap}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing.lg }}>
          <MetricCard label="Ziele gesamt" value={total} icon="🎯" />
          <MetricCard label="Pflichtig" value={mandatory} icon="📌" />
          <MetricCard label="Freiwillig" value={voluntary} icon="📝" />
          <MetricCard label="Auf Kurs" value={onTrack} icon="✅" />
          <MetricCard label="Erreicht" value={achieved} icon="🏆" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={sectionTitle}>Ziele</h2>
          <Button onClick={() => setTargetModalOpen(true)} icon="➕">Neues Ziel</Button>
        </div>

        {missingTargetTopics.length > 0 && (
          <InfoBox type="warning">
            Folgende wesentliche Themen haben noch keine Ziele:{' '}
            <strong>{missingTargetTopics.join(', ')}</strong>
          </InfoBox>
        )}

        {targets.length === 0 && (
          <InfoBox type="info">Noch keine Ziele erfasst. Erstellen Sie Ihr erstes Ziel.</InfoBox>
        )}

        {Object.keys(groups).map(horizon => {
          const items = groups[horizon] || [];
          if (items.length === 0) return null;
          return (
            <div key={horizon}>
              <h3 style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.textSecondary,
                margin: `${tokens.spacing.lg}px 0 ${tokens.spacing.md}px`,
              }}>
                {horizon} ({items.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
                {items.map(tgt => {
                  const expanded = expandedTargets[tgt.id];
                  return (
                    <Card key={tgt.id} padding={tokens.spacing.xl}>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setExpandedTargets(prev => ({ ...prev, [tgt.id]: !prev[tgt.id] }))}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
                          <span style={topicBadgeStyle(tgt.topic)}>{tgt.topic}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                            {tgt.title}
                          </span>
                          <StatusBadge status={tgt.status} />
                          <span style={mandatoryBadgeStyle(tgt.is_mandatory)}>
                            {tgt.is_mandatory ? 'ESRS-pflichtig' : 'Freiwillig'}
                          </span>
                        </div>
                        <span style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.textSecondary }}>
                          {expanded ? '\u25B2' : '\u25BC'}
                        </span>
                      </div>

                      <div style={{ marginTop: tokens.spacing.md }}>
                        <ProgressBar value={tgt.progress_percentage || 0} label="Fortschritt" />
                      </div>

                      {expanded && (
                        <div style={{ marginTop: tokens.spacing.lg, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
                          {tgt.description && (
                            <div>
                              <span style={detailLabel}>Beschreibung</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{tgt.description}</p>
                            </div>
                          )}
                          <div style={gridThree}>
                            <div>
                              <span style={detailLabel}>Basisjahr</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{tgt.baseline_year || '-'}</p>
                            </div>
                            <div>
                              <span style={detailLabel}>Basiswert</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>
                                {tgt.baseline_value != null ? tgt.baseline_value : '-'} {tgt.unit || ''}
                              </p>
                            </div>
                            <div>
                              <span style={detailLabel}>Zieltyp</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{tgt.target_type || '-'}</p>
                            </div>
                          </div>
                          <div style={gridThree}>
                            <div>
                              <span style={detailLabel}>Zieljahr</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{tgt.target_year || '-'}</p>
                            </div>
                            <div>
                              <span style={detailLabel}>Zielwert</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>
                                {tgt.target_value != null ? tgt.target_value : '-'} {tgt.unit || ''}
                              </p>
                            </div>
                            <div>
                              <span style={detailLabel}>Aktueller Wert</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>
                                {tgt.current_value != null ? tgt.current_value : '-'} {tgt.unit || ''}
                              </p>
                            </div>
                          </div>
                          {tgt.responsible_person && (
                            <div>
                              <span style={detailLabel}>Verantwortlich</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{tgt.responsible_person}</p>
                            </div>
                          )}
                          {tgt.variance_explanation && (
                            <div>
                              <span style={detailLabel}>Abweichungserklaerung</span>
                              <p style={{ ...detailValue, margin: `${tokens.spacing.xs}px 0 0` }}>{tgt.variance_explanation}</p>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: tokens.spacing.sm }}>
                            <Button variant="danger" onClick={() => deleteTarget(tgt.id)} icon="🗑️" size="sm">Loeschen</Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Target Modal */}
        <Modal open={targetModalOpen} onClose={() => setTargetModalOpen(false)} title="Neues Ziel" width={700}>
          <div style={sectionGap}>
            <FormField
              label="ESRS-Thema"
              type="select"
              value={newTarget.topic}
              onChange={(v) => setNewTarget(p => ({ ...p, topic: v }))}
              options={TOPIC_OPTIONS}
              required
            />
            <FormField
              label="Titel"
              value={newTarget.title}
              onChange={(v) => setNewTarget(p => ({ ...p, title: v }))}
              required
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                  Beschreibung
                </label>
                <Button variant="ai" size="sm" disabled={generating || !newTarget.title} onClick={() => generateAndPreview('target', newTarget.title, newTarget.topic, newTarget.description)}>
                  {aiButtonLabel(newTarget.title, newTarget.description)}
                </Button>
              </div>
              <FormField
                type="textarea"
                value={newTarget.description}
                onChange={(v) => { setNewTarget(p => ({ ...p, description: v })); setAiSuggestion(null); }}
                rows={4}
              />
              {renderAiSuggestion(setNewTarget, newTarget.description)}
            </div>
            <div style={gridTwo}>
              <FormField
                label="Zieltyp"
                type="select"
                value={newTarget.target_type}
                onChange={(v) => setNewTarget(p => ({ ...p, target_type: v }))}
                options={TARGET_TYPES}
              />
              <FormField
                label="Status"
                type="select"
                value={newTarget.status}
                onChange={(v) => setNewTarget(p => ({ ...p, status: v }))}
                options={TARGET_STATUSES}
              />
            </div>
            <div style={gridTwo}>
              <FormField
                label="Basisjahr"
                type="number"
                value={newTarget.baseline_year}
                onChange={(v) => setNewTarget(p => ({ ...p, baseline_year: v }))}
              />
              <FormField
                label="Basiswert"
                type="number"
                value={newTarget.baseline_value}
                onChange={(v) => setNewTarget(p => ({ ...p, baseline_value: v }))}
              />
            </div>
            <div style={gridTwo}>
              <FormField
                label="Zieljahr"
                type="number"
                value={newTarget.target_year}
                onChange={(v) => setNewTarget(p => ({ ...p, target_year: v }))}
              />
              <FormField
                label="Zielwert"
                type="number"
                value={newTarget.target_value}
                onChange={(v) => setNewTarget(p => ({ ...p, target_value: v }))}
              />
            </div>
            <div style={gridTwo}>
              <FormField
                label="Einheit"
                value={newTarget.unit}
                onChange={(v) => setNewTarget(p => ({ ...p, unit: v }))}
                placeholder="z.B. tCO2e, %, EUR"
              />
              <FormField
                label="Aktueller Wert"
                type="number"
                value={newTarget.current_value}
                onChange={(v) => setNewTarget(p => ({ ...p, current_value: v }))}
              />
            </div>
            <div style={gridTwo}>
              <FormField
                label="Zeithorizont"
                type="select"
                value={newTarget.time_horizon}
                onChange={(v) => setNewTarget(p => ({ ...p, time_horizon: v }))}
                options={TARGET_HORIZONS}
              />
              <FormField
                label="Verantwortliche Person"
                value={newTarget.responsible_person}
                onChange={(v) => setNewTarget(p => ({ ...p, responsible_person: v }))}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing.md, marginTop: tokens.spacing.md }}>
              <Button variant="secondary" onClick={() => setTargetModalOpen(false)}>Abbrechen</Button>
              <Button onClick={saveTarget}>Speichern</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  // =============================================
  // TAB 3: MASSNAHMEN (Actions)
  // =============================================
  const renderActions = () => {
    const total = actions.length;
    const mandatory = actions.filter(a => a.is_mandatory).length;
    const voluntary = total - mandatory;
    const completed = actions.filter(a => a.status === 'Abgeschlossen').length;

    const relevantSDGsForTopic = newAction.topic ? getRelevantSDGs(newAction.topic) : [];

    return (
      <div style={sectionGap}>
        <div style={gridFour}>
          <MetricCard label="Massnahmen gesamt" value={total} icon="⚡" />
          <MetricCard label="Pflichtig" value={mandatory} icon="📌" />
          <MetricCard label="Freiwillig" value={voluntary} icon="📝" />
          <MetricCard label="Abgeschlossen" value={completed} icon="✅" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={sectionTitle}>Massnahmen</h2>
          <Button onClick={() => setActionModalOpen(true)} icon="➕">Neue Massnahme</Button>
        </div>

        {actions.length === 0 && (
          <InfoBox type="info">Noch keine Massnahmen erfasst. Erstellen Sie Ihre erste Massnahme.</InfoBox>
        )}

        {actions.map(act => {
          const statusEmoji = act.status === 'Abgeschlossen' ? '✅' :
            act.status === 'In Umsetzung' ? '🔄' :
            act.status === 'Geplant' ? '📋' :
            act.status === 'Laufend' ? '🔄' :
            act.status === 'Abgebrochen' ? '❌' : '';

          return (
            <Card key={act.id} padding={tokens.spacing.xl}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
                    <span style={topicBadgeStyle(act.topic)}>{act.topic}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
                      {act.title}
                    </span>
                    {statusEmoji && <span>{statusEmoji}</span>}
                    <StatusBadge status={act.status} />
                    <span style={mandatoryBadgeStyle(act.is_mandatory)}>
                      {act.is_mandatory ? 'ESRS-pflichtig' : 'Freiwillig'}
                    </span>
                  </div>
                  {act.description && (
                    <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.textSecondary, margin: 0 }}>
                      {act.description}
                    </p>
                  )}
                  {(act.sdg_goals || []).length > 0 && (
                    <div style={{ display: 'flex', gap: tokens.spacing.xs, flexWrap: 'wrap', marginTop: tokens.spacing.xs }}>
                      {act.sdg_goals.map(num => {
                        const sdg = SDG_DEFINITIONS[num];
                        return sdg ? (
                          <span key={num} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing.xs,
                            padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
                            borderRadius: tokens.radii.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.white,
                            background: sdg.color,
                          }}>
                            {sdg.icon} SDG {num}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  {(act.responsible_person || act.responsible_department) && (
                    <div style={{ display: 'flex', gap: tokens.spacing.lg, marginTop: tokens.spacing.xs }}>
                      {act.responsible_person && (
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>
                          Verantwortlich: {act.responsible_person}
                        </span>
                      )}
                      {act.responsible_department && (
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>
                          Abteilung: {act.responsible_department}
                        </span>
                      )}
                    </div>
                  )}
                  {(act.start_date || act.end_date) && (
                    <div style={{ display: 'flex', gap: tokens.spacing.lg }}>
                      {act.start_date && (
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>
                          Start: {act.start_date}
                        </span>
                      )}
                      {act.end_date && (
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>
                          Ende: {act.end_date}
                        </span>
                      )}
                    </div>
                  )}
                  {act.budget > 0 && (
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textSecondary }}>
                      Budget: {act.budget.toLocaleString('de-DE')} EUR
                      {act.budget_spent > 0 && ` (ausgegeben: ${act.budget_spent.toLocaleString('de-DE')} EUR)`}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing.sm, flexShrink: 0, marginLeft: tokens.spacing.md }}>
                  <Button variant="ai" onClick={() => handleSuggestSDG(act)} disabled={generating} size="sm">
                    {generating ? '...' : 'KI SDG-Vorschlag'}
                  </Button>
                  <Button variant="danger" onClick={() => deleteAction(act.id)} icon="🗑️" size="sm">Loeschen</Button>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Action Modal */}
        <Modal open={actionModalOpen} onClose={() => setActionModalOpen(false)} title="Neue Massnahme" width={750}>
          <div style={sectionGap}>
            <FormField
              label="ESRS-Thema"
              type="select"
              value={newAction.topic}
              onChange={(v) => setNewAction(p => ({ ...p, topic: v }))}
              options={TOPIC_OPTIONS}
              required
            />
            <FormField
              label="Titel"
              value={newAction.title}
              onChange={(v) => setNewAction(p => ({ ...p, title: v }))}
              required
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
                  Beschreibung
                </label>
                <Button variant="ai" size="sm" disabled={generating || !newAction.title} onClick={() => generateAndPreview('action', newAction.title, newAction.topic, newAction.description)}>
                  {aiButtonLabel(newAction.title, newAction.description)}
                </Button>
              </div>
              <FormField
                type="textarea"
                value={newAction.description}
                onChange={(v) => { setNewAction(p => ({ ...p, description: v })); setAiSuggestion(null); }}
                rows={4}
              />
              {renderAiSuggestion(setNewAction, newAction.description)}
            </div>
            <div style={gridTwo}>
              <FormField
                label="Status"
                type="select"
                value={newAction.status}
                onChange={(v) => setNewAction(p => ({ ...p, status: v }))}
                options={ACTION_STATUSES}
              />
              <FormField
                label="Budget (EUR)"
                type="number"
                value={newAction.budget}
                onChange={(v) => setNewAction(p => ({ ...p, budget: v }))}
              />
            </div>
            <div style={gridTwo}>
              <FormField
                label="Startdatum"
                type="date"
                value={newAction.start_date}
                onChange={(v) => setNewAction(p => ({ ...p, start_date: v }))}
              />
              <FormField
                label="Enddatum"
                type="date"
                value={newAction.end_date}
                onChange={(v) => setNewAction(p => ({ ...p, end_date: v }))}
              />
            </div>
            <div style={gridTwo}>
              <FormField
                label="Verantwortliche Person"
                value={newAction.responsible_person}
                onChange={(v) => setNewAction(p => ({ ...p, responsible_person: v }))}
              />
              <FormField
                label="Abteilung"
                value={newAction.responsible_department}
                onChange={(v) => setNewAction(p => ({ ...p, responsible_department: v }))}
              />
            </div>

            {/* SDG Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.textSecondary,
                marginBottom: tokens.spacing.sm,
              }}>
                SDG-Zuordnung
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: tokens.spacing.sm,
              }}>
                {Object.entries(SDG_DEFINITIONS).map(([num, sdg]) => {
                  const n = parseInt(num);
                  const selected = (newAction.sdg_goals || []).includes(n);
                  const isRelevant = relevantSDGsForTopic.includes(n);
                  return (
                    <label
                      key={n}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing.sm,
                        padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
                        borderRadius: tokens.radii.sm,
                        cursor: 'pointer',
                        background: selected ? sdg.color + '22' : 'transparent',
                        border: `1px solid ${selected ? sdg.color : tokens.colors.border}`,
                        fontSize: tokens.typography.fontSize.sm,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleNewActionSDG(n)}
                        style={{ accentColor: sdg.color, width: 14, height: 14 }}
                      />
                      <span>{sdg.icon}</span>
                      <span style={{ flex: 1, color: tokens.colors.text }}>
                        SDG {num}
                      </span>
                      {isRelevant && <span title="Relevant fuer gewaehltes Thema" style={{ fontSize: tokens.typography.fontSize.xs }}>⭐</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing.md, marginTop: tokens.spacing.md }}>
              <Button variant="secondary" onClick={() => setActionModalOpen(false)}>Abbrechen</Button>
              <Button onClick={saveAction}>Speichern</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  // =============================================
  // TAB 4: SDG-UEBERSICHT
  // =============================================
  const renderSDGOverview = () => {
    const totalActions = actions.length;
    const actionsWithSDG = actions.filter(a => (a.sdg_goals || []).length > 0).length;

    // Count actions per SDG
    const sdgCounts = {};
    for (let i = 1; i <= 17; i++) sdgCounts[i] = 0;
    actions.forEach(a => {
      (a.sdg_goals || []).forEach(num => {
        if (sdgCounts[num] !== undefined) sdgCounts[num]++;
      });
    });

    const activeSDGs = Object.values(sdgCounts).filter(c => c > 0).length;

    // Actions grouped by SDG
    const sdgActions = {};
    for (let i = 1; i <= 17; i++) {
      sdgActions[i] = actions.filter(a => (a.sdg_goals || []).includes(i));
    }

    return (
      <div style={sectionGap}>
        <div style={gridThree}>
          <MetricCard label="Massnahmen gesamt" value={totalActions} icon="⚡" />
          <MetricCard label="Mit SDG-Zuordnung" value={actionsWithSDG} icon="🎯" />
          <MetricCard label="Aktive SDGs" value={activeSDGs} icon="🌍" />
        </div>

        <h2 style={sectionTitle}>SDG-Uebersicht</h2>

        <div style={gridThree}>
          {Object.entries(SDG_DEFINITIONS).map(([num, sdg]) => {
            const n = parseInt(num);
            const count = sdgCounts[n] || 0;
            const bgColor = count === 0
              ? tokens.colors.borderLight
              : count <= 2
                ? tokens.colors.warningLight
                : tokens.colors.successLight;
            const borderColor = count === 0
              ? tokens.colors.border
              : count <= 2
                ? tokens.colors.warning
                : tokens.colors.success;

            return (
              <div key={n} style={{
                background: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: tokens.radii.md,
                padding: tokens.spacing.lg,
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing.xs,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: tokens.radii.sm,
                    background: sdg.color,
                    color: tokens.colors.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                  }}>
                    {num}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.xl }}>{sdg.icon}</span>
                </div>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                }}>
                  {sdg.name}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.textSecondary,
                }}>
                  {count} {count === 1 ? 'Massnahme' : 'Massnahmen'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active SDGs with contributing actions */}
        {Object.entries(sdgActions).map(([num, sdgActs]) => {
          if (sdgActs.length === 0) return null;
          const n = parseInt(num);
          const sdg = SDG_DEFINITIONS[n];
          return (
            <div key={n}>
              <h3 style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.text,
                margin: `${tokens.spacing.lg}px 0 ${tokens.spacing.md}px`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.sm,
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: tokens.radii.sm,
                  background: sdg.color,
                  color: tokens.colors.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.bold,
                }}>
                  {num}
                </span>
                {sdg.icon} {sdg.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
                {sdgActs.map(act => (
                  <div key={act.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing.sm,
                    padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                    background: tokens.colors.surface,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: tokens.radii.sm,
                  }}>
                    <span style={topicBadgeStyle(act.topic)}>{act.topic}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.text, flex: 1 }}>
                      {act.title}
                    </span>
                    <StatusBadge status={act.status} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {activeSDGs === 0 && (
          <InfoBox type="info">
            Noch keine SDG-Zuordnungen vorhanden. Ordnen Sie Ihren Massnahmen SDGs zu, um die Uebersicht zu sehen.
          </InfoBox>
        )}
      </div>
    );
  };

  // =============================================
  // RENDER
  // =============================================
  const tabContent = [renderPolicies, renderTargets, renderActions, renderSDGOverview];

  return (
    <div>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxl,
      }}>
        Ziele, Massnahmen & Richtlinien
      </h1>

      <SectionStatusBar route="/targets" />

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
