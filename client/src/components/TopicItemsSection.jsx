import React, { useState } from 'react';
import { useReport } from '../hooks/useReport.js';
import { useLLM } from '../hooks/useLLM.js';
import { getMaterialTopicCodes } from '../utils/scoring.js';
import { buildReportContext } from '../utils/llmContext.js';
import tokens from '../theme/tokens.js';
import Button from './ui/Button.jsx';
import FormField from './ui/FormField.jsx';
import Modal from './ui/Modal.jsx';
import StatusBadge from './ui/StatusBadge.jsx';
import InfoBox from './ui/InfoBox.jsx';

const POLICY_TYPES = ['Richtlinie', 'Strategie', 'Leitlinie', 'Verhaltenskodex', 'Verpflichtung', 'Standard'];
const POLICY_STATUSES = ['Entwurf', 'Genehmigt', 'Umgesetzt', 'In Pruefung', 'Archiviert'];
const TARGET_TYPES = ['Absolut', 'Relativ', 'Qualitativ'];
const TARGET_STATUSES = ['Auf Kurs', 'Verzoegert', 'Erreicht', 'Nicht begonnen'];
const TARGET_HORIZONS = ['Kurzfristig (< 1 Jahr)', 'Mittelfristig (1-5 Jahre)', 'Langfristig (> 5 Jahre)'];
const ACTION_STATUSES = ['Geplant', 'In Umsetzung', 'Abgeschlossen', 'Laufend', 'Abgebrochen'];

const sectionGap = { display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg };
const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.lg };

const emptyPolicy = (topic, isMaterial) => ({
  topic, title: '', description: '', policy_type: 'Richtlinie',
  is_mandatory: isMaterial, status: 'Entwurf', responsible_person: '', responsible_department: '',
});

const emptyTarget = (topic) => ({
  topic, title: '', description: '', target_type: 'Absolut',
  baseline_year: 2024, baseline_value: 0, target_year: 2030, target_value: 0,
  unit: '', current_value: 0, status: 'Nicht begonnen',
  time_horizon: 'Mittelfristig (1-5 Jahre)', responsible_person: '',
});

const emptyAction = (topic) => ({
  topic, title: '', description: '', status: 'Geplant',
  start_date: '', end_date: '', responsible_person: '', responsible_department: '',
  budget: 0,
});


// section: "policies" | "targets" | "actions"
export default function TopicItemsSection({ topicCode, section }) {
  const { report, updateReport } = useReport();
  const { generating, generateItemDescription } = useLLM();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});
  const [aiSuggestion, setAiSuggestion] = useState(null);

  if (!report) return null;

  const materialCodes = getMaterialTopicCodes(report);
  const isMaterial = materialCodes.includes(topicCode);

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const policies = (report.policies || []).filter(p => p.topic === topicCode);
  const targets = (report.targets || []).filter(t => t.topic === topicCode);
  const actions = (report.actions || []).filter(a => a.topic === topicCode);

  // --- AI suggestion helpers ---
  const generateAndPreview = async (type) => {
    const existingDescription = formData.description?.trim() || null;
    const text = await generateItemDescription(type, formData.title, topicCode, buildReportContext(report, topicCode), existingDescription);
    if (text) setAiSuggestion(text);
  };

  const aiButtonLabel = (baseLabel) => {
    if (generating) return 'Generiere...';
    return formData.description?.trim() ? 'KI verbessern' : baseLabel;
  };

  const applyAiSuggestion = (mode) => {
    if (mode === 'replace') {
      setFormData(p => ({ ...p, description: aiSuggestion }));
    } else if (mode === 'append') {
      setFormData(p => ({ ...p, description: [p.description, aiSuggestion].filter(Boolean).join('\n\n') }));
    }
    setAiSuggestion(null);
  };

  const renderAiSuggestion = () => {
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
          {aiSuggestion}
        </p>
        <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
          <Button size="sm" onClick={() => applyAiSuggestion('replace')}>Übernehmen</Button>
          <Button size="sm" variant="secondary" onClick={() => applyAiSuggestion('append')}>Anhängen</Button>
          <Button size="sm" variant="secondary" onClick={() => setAiSuggestion(null)}>Verwerfen</Button>
        </div>
      </div>
    );
  };

  // --- Generic helpers ---
  const openCreate = (defaults) => {
    setEditId(null);
    setFormData(defaults);
    setAiSuggestion(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setFormData({ ...item });
    setAiSuggestion(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setFormData({});
    setAiSuggestion(null);
  };

  const deleteItem = (arrayKey, id) => {
    const updated = deepClone(report);
    updated[arrayKey] = (updated[arrayKey] || []).filter(x => x.id !== id);
    updateReport(updated);
  };

  // --- Save (create or update) ---
  const savePolicy = () => {
    if (!formData.title) return;
    const updated = deepClone(report);
    if (!updated.policies) updated.policies = [];
    if (editId) {
      const idx = updated.policies.findIndex(p => p.id === editId);
      if (idx >= 0) {
        updated.policies[idx] = { ...updated.policies[idx], ...formData };
      }
    } else {
      updated.policies.push({
        ...formData,
        id: `pol_${Date.now()}`,
        voluntary_reason: '', approval_date: '', effective_date: '', review_date: '',
        review_cycle: '', approval_body: '', scope: '',
        key_commitments: [], stakeholder_groups: [], communication_channels: [],
        training_provided: false, training_description: '', document_reference: '',
        external_standards: [], linked_action_ids: [], linked_target_ids: [],
      });
    }
    updateReport(updated);
    closeModal();
  };

  const saveTarget = () => {
    if (!formData.title) return;
    const updated = deepClone(report);
    if (!updated.targets) updated.targets = [];
    if (editId) {
      const idx = updated.targets.findIndex(t => t.id === editId);
      if (idx >= 0) {
        const progress = formData.target_value > 0
          ? Math.round(((formData.current_value - formData.baseline_value) / (formData.target_value - formData.baseline_value)) * 100)
          : 0;
        updated.targets[idx] = { ...updated.targets[idx], ...formData, progress_percentage: Math.max(0, Math.min(100, progress || 0)) };
      }
    } else {
      const progress = formData.target_value > 0
        ? Math.round(((formData.current_value - formData.baseline_value) / (formData.target_value - formData.baseline_value)) * 100)
        : 0;
      updated.targets.push({
        ...formData,
        id: `tgt_${Date.now()}`,
        is_mandatory: false, voluntary_reason: '',
        progress_percentage: Math.max(0, Math.min(100, progress || 0)),
        kpis: [], variance_explanation: '', programs: [],
      });
    }
    updateReport(updated);
    closeModal();
  };

  const saveAction = () => {
    if (!formData.title) return;
    const updated = deepClone(report);
    if (!updated.actions) updated.actions = [];
    if (editId) {
      const idx = updated.actions.findIndex(a => a.id === editId);
      if (idx >= 0) {
        updated.actions[idx] = { ...updated.actions[idx], ...formData };
      }
    } else {
      updated.actions.push({
        ...formData,
        id: `act_${Date.now()}`,
        is_mandatory: false, voluntary_reason: '',
        progress_description: '', milestones: [],
        budget_spent: 0, linked_target_ids: [], sdg_goals: [],
      });
    }
    updateReport(updated);
    closeModal();
  };

  // --- Styles ---
  const itemCard = {
    padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
    background: tokens.colors.surface,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.radii.md,
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
  };

  const itemTitle = {
    fontSize: tokens.typography.fontSize.md,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text,
  };

  const itemMeta = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.textSecondary,
  };

  const itemDesc = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.textSecondary,
    margin: `${tokens.spacing.xs}px 0 0`,
    lineHeight: 1.4,
  };

  // =========================================================
  // POLICIES
  // =========================================================
  if (section === 'policies') {
    return (
      <div style={sectionGap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={itemMeta}>{policies.length} Richtlinie{policies.length !== 1 ? 'n' : ''} erfasst</span>
          <Button size="sm" onClick={() => openCreate(emptyPolicy(topicCode, isMaterial))} icon="➕">Neue Richtlinie</Button>
        </div>

        {policies.length === 0 && (
          <InfoBox type="info">Noch keine Richtlinien fuer dieses Thema erfasst.</InfoBox>
        )}

        {policies.map(pol => (
          <div key={pol.id} style={itemCard} onClick={() => openEdit(pol)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
                <span style={itemTitle}>{pol.title}</span>
                <StatusBadge status={pol.status} />
                <span style={itemMeta}>{pol.policy_type}</span>
                {pol.is_mandatory && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.info, fontWeight: tokens.typography.fontWeight.semibold }}>ESRS-pflichtig</span>}
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing.sm, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <Button variant="danger" size="sm" onClick={() => deleteItem('policies', pol.id)}>Loeschen</Button>
              </div>
            </div>
            {pol.description && <p style={itemDesc}>{pol.description.length > 150 ? pol.description.slice(0, 150) + '...' : pol.description}</p>}
            {(pol.responsible_person || pol.responsible_department) && (
              <p style={{ ...itemMeta, marginTop: tokens.spacing.xs }}>
                {[pol.responsible_person, pol.responsible_department].filter(Boolean).join(' | ')}
              </p>
            )}
          </div>
        ))}

        <Modal open={modalOpen} onClose={closeModal} title={editId ? `Richtlinie bearbeiten (${topicCode})` : `Neue Richtlinie (${topicCode})`} width={700}>
          <div style={sectionGap}>
            <FormField label="Titel" value={formData.title || ''} onChange={(v) => setFormData(p => ({ ...p, title: v }))} required />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>Beschreibung</label>
                <Button variant="ai" size="sm" disabled={generating || !formData.title} onClick={() => generateAndPreview('policy')}>{aiButtonLabel('KI-Beschreibung')}</Button>
              </div>
              <FormField type="textarea" value={formData.description || ''} onChange={(v) => setFormData(p => ({ ...p, description: v }))} rows={4} />
              {renderAiSuggestion()}
            </div>
            <div style={gridTwo}>
              <FormField label="Art der Richtlinie" type="select" value={formData.policy_type || 'Richtlinie'} onChange={(v) => setFormData(p => ({ ...p, policy_type: v }))} options={POLICY_TYPES} />
              <FormField label="Status" type="select" value={formData.status || 'Entwurf'} onChange={(v) => setFormData(p => ({ ...p, status: v }))} options={POLICY_STATUSES} />
            </div>
            <div style={{
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              background: formData.is_mandatory ? `${tokens.colors.info}10` : tokens.colors.background,
              border: `1px solid ${formData.is_mandatory ? tokens.colors.info : tokens.colors.border}`,
              borderRadius: tokens.radii.sm,
              fontSize: tokens.typography.fontSize.sm,
              color: formData.is_mandatory ? tokens.colors.info : tokens.colors.textSecondary,
            }}>
              {formData.is_mandatory
                ? '📋 ESRS-Offenlegungspflicht — dieses Thema ist wesentlich, eine Richtlinie muss im Bericht ausgewiesen werden.'
                : '○ Freiwillig — dieses Thema ist nicht als wesentlich eingestuft, die Richtlinie ist optional.'}
            </div>
            <div style={gridTwo}>
              <FormField label="Verantwortliche Person" value={formData.responsible_person || ''} onChange={(v) => setFormData(p => ({ ...p, responsible_person: v }))} />
              <FormField label="Abteilung" value={formData.responsible_department || ''} onChange={(v) => setFormData(p => ({ ...p, responsible_department: v }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing.md, marginTop: tokens.spacing.md }}>
              <Button variant="secondary" onClick={closeModal}>Abbrechen</Button>
              <Button onClick={savePolicy}>{editId ? 'Aktualisieren' : 'Speichern'}</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // =========================================================
  // TARGETS
  // =========================================================
  if (section === 'targets') {
    return (
      <div style={sectionGap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={itemMeta}>{targets.length} Ziel{targets.length !== 1 ? 'e' : ''} erfasst</span>
          <Button size="sm" onClick={() => openCreate(emptyTarget(topicCode))} icon="➕">Neues Ziel</Button>
        </div>

        {targets.length === 0 && (
          <InfoBox type="info">Noch keine Ziele fuer dieses Thema erfasst.</InfoBox>
        )}

        {targets.map(tgt => (
          <div key={tgt.id} style={itemCard} onClick={() => openEdit(tgt)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
                <span style={itemTitle}>{tgt.title}</span>
                <StatusBadge status={tgt.status} />
                <span style={itemMeta}>{tgt.target_type}</span>
                <span style={itemMeta}>{tgt.time_horizon}</span>
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing.sm, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <Button variant="danger" size="sm" onClick={() => deleteItem('targets', tgt.id)}>Loeschen</Button>
              </div>
            </div>
            {tgt.description && <p style={itemDesc}>{tgt.description.length > 150 ? tgt.description.slice(0, 150) + '...' : tgt.description}</p>}
            <div style={{ display: 'flex', gap: tokens.spacing.lg, marginTop: tokens.spacing.xs }}>
              {tgt.baseline_value != null && <span style={itemMeta}>Basis: {tgt.baseline_value} {tgt.unit || ''} ({tgt.baseline_year})</span>}
              {tgt.target_value != null && <span style={itemMeta}>Ziel: {tgt.target_value} {tgt.unit || ''} ({tgt.target_year})</span>}
              {tgt.responsible_person && <span style={itemMeta}>{tgt.responsible_person}</span>}
            </div>
          </div>
        ))}

        <Modal open={modalOpen} onClose={closeModal} title={editId ? `Ziel bearbeiten (${topicCode})` : `Neues Ziel (${topicCode})`} width={700}>
          <div style={sectionGap}>
            <FormField label="Titel" value={formData.title || ''} onChange={(v) => setFormData(p => ({ ...p, title: v }))} required />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>Beschreibung</label>
                <Button variant="ai" size="sm" disabled={generating || !formData.title} onClick={() => generateAndPreview('target')}>{aiButtonLabel('KI-Beschreibung')}</Button>
              </div>
              <FormField type="textarea" value={formData.description || ''} onChange={(v) => setFormData(p => ({ ...p, description: v }))} rows={4} />
              {renderAiSuggestion()}
            </div>
            <div style={gridTwo}>
              <FormField label="Zieltyp" type="select" value={formData.target_type || 'Absolut'} onChange={(v) => setFormData(p => ({ ...p, target_type: v }))} options={TARGET_TYPES} />
              <FormField label="Status" type="select" value={formData.status || 'Nicht begonnen'} onChange={(v) => setFormData(p => ({ ...p, status: v }))} options={TARGET_STATUSES} />
            </div>
            <div style={gridTwo}>
              <FormField label="Basisjahr" type="number" value={formData.baseline_year || 2024} onChange={(v) => setFormData(p => ({ ...p, baseline_year: v }))} />
              <FormField label="Basiswert" type="number" value={formData.baseline_value || 0} onChange={(v) => setFormData(p => ({ ...p, baseline_value: v }))} />
            </div>
            <div style={gridTwo}>
              <FormField label="Zieljahr" type="number" value={formData.target_year || 2030} onChange={(v) => setFormData(p => ({ ...p, target_year: v }))} />
              <FormField label="Zielwert" type="number" value={formData.target_value || 0} onChange={(v) => setFormData(p => ({ ...p, target_value: v }))} />
            </div>
            <div style={gridTwo}>
              <FormField label="Einheit" value={formData.unit || ''} onChange={(v) => setFormData(p => ({ ...p, unit: v }))} placeholder="z.B. tCO2e, %, EUR" />
              <FormField label="Aktueller Wert" type="number" value={formData.current_value || 0} onChange={(v) => setFormData(p => ({ ...p, current_value: v }))} />
            </div>
            <div style={gridTwo}>
              <FormField label="Zeithorizont" type="select" value={formData.time_horizon || 'Mittelfristig (1-5 Jahre)'} onChange={(v) => setFormData(p => ({ ...p, time_horizon: v }))} options={TARGET_HORIZONS} />
              <FormField label="Verantwortliche Person" value={formData.responsible_person || ''} onChange={(v) => setFormData(p => ({ ...p, responsible_person: v }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing.md, marginTop: tokens.spacing.md }}>
              <Button variant="secondary" onClick={closeModal}>Abbrechen</Button>
              <Button onClick={saveTarget}>{editId ? 'Aktualisieren' : 'Speichern'}</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // =========================================================
  // ACTIONS
  // =========================================================
  if (section === 'actions') {
    return (
      <div style={sectionGap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={itemMeta}>{actions.length} Massnahme{actions.length !== 1 ? 'n' : ''} erfasst</span>
          <Button size="sm" onClick={() => openCreate(emptyAction(topicCode))} icon="➕">Neue Massnahme</Button>
        </div>

        {actions.length === 0 && (
          <InfoBox type="info">Noch keine Massnahmen fuer dieses Thema erfasst.</InfoBox>
        )}

        {actions.map(act => (
          <div key={act.id} style={itemCard} onClick={() => openEdit(act)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
                <span style={itemTitle}>{act.title}</span>
                <StatusBadge status={act.status} />
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing.sm, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <Button variant="danger" size="sm" onClick={() => deleteItem('actions', act.id)}>Loeschen</Button>
              </div>
            </div>
            {act.description && <p style={itemDesc}>{act.description.length > 150 ? act.description.slice(0, 150) + '...' : act.description}</p>}
            <div style={{ display: 'flex', gap: tokens.spacing.lg, marginTop: tokens.spacing.xs, flexWrap: 'wrap' }}>
              {act.responsible_person && <span style={itemMeta}>Verantwortlich: {act.responsible_person}</span>}
              {act.responsible_department && <span style={itemMeta}>Abteilung: {act.responsible_department}</span>}
              {act.budget > 0 && <span style={itemMeta}>Budget: {act.budget.toLocaleString('de-DE')} EUR</span>}
              {act.start_date && <span style={itemMeta}>Start: {act.start_date}</span>}
              {act.end_date && <span style={itemMeta}>Ende: {act.end_date}</span>}
            </div>
          </div>
        ))}

        <Modal open={modalOpen} onClose={closeModal} title={editId ? `Massnahme bearbeiten (${topicCode})` : `Neue Massnahme (${topicCode})`} width={700}>
          <div style={sectionGap}>
            <FormField label="Titel" value={formData.title || ''} onChange={(v) => setFormData(p => ({ ...p, title: v }))} required />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
                <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>Beschreibung</label>
                <Button variant="ai" size="sm" disabled={generating || !formData.title} onClick={() => generateAndPreview('action')}>{aiButtonLabel('KI-Beschreibung')}</Button>
              </div>
              <FormField type="textarea" value={formData.description || ''} onChange={(v) => setFormData(p => ({ ...p, description: v }))} rows={4} />
              {renderAiSuggestion()}
            </div>
            <div style={gridTwo}>
              <FormField label="Status" type="select" value={formData.status || 'Geplant'} onChange={(v) => setFormData(p => ({ ...p, status: v }))} options={ACTION_STATUSES} />
              <FormField label="Budget (EUR)" type="number" value={formData.budget || 0} onChange={(v) => setFormData(p => ({ ...p, budget: v }))} />
            </div>
            <div style={gridTwo}>
              <FormField label="Startdatum" type="date" value={formData.start_date || ''} onChange={(v) => setFormData(p => ({ ...p, start_date: v }))} />
              <FormField label="Enddatum" type="date" value={formData.end_date || ''} onChange={(v) => setFormData(p => ({ ...p, end_date: v }))} />
            </div>
            <div style={gridTwo}>
              <FormField label="Verantwortliche Person" value={formData.responsible_person || ''} onChange={(v) => setFormData(p => ({ ...p, responsible_person: v }))} />
              <FormField label="Abteilung" value={formData.responsible_department || ''} onChange={(v) => setFormData(p => ({ ...p, responsible_department: v }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing.md, marginTop: tokens.spacing.md }}>
              <Button variant="secondary" onClick={closeModal}>Abbrechen</Button>
              <Button onClick={saveAction}>{editId ? 'Aktualisieren' : 'Speichern'}</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return null;
}
