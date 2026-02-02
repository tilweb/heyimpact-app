import React from 'react';
import { useReport } from '../hooks/useReport.js';
import tokens from '../theme/tokens.js';
import TabPanel from '../components/ui/TabPanel.jsx';
import FormField from '../components/ui/FormField.jsx';
import Card from '../components/ui/Card.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import Button from '../components/ui/Button.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';
import SectionStatusBar from '../components/ui/SectionStatusBar.jsx';
import { getMaterialTopicCodes } from '../utils/scoring.js';
import TopicItemsSection from '../components/TopicItemsSection.jsx';

const REPORTING_FREQUENCY_OPTIONS = [
  '',
  'Monatlich',
  'Quartalsweise',
  'Halbjährlich',
  'Jährlich',
  'Ad-hoc',
];

const EU_AI_ACT_OPTIONS = [
  '',
  'Nicht anwendbar',
  'In Vorbereitung',
  'Teilweise konform',
  'Vollständig konform',
];

export default function GovernancePage() {
  const { report, updateReport } = useReport();

  if (!report) {
    return (
      <PlaceholderBox
        icon="🏛️"
        title="Kein Bericht geladen"
        description="Bitte gehen Sie zur Startseite und erstellen oder laden Sie einen Bericht."
      />
    );
  }

  const g1 = (report.governance && report.governance.g1_business_conduct) || {};
  const board = g1.board || {};
  const compliance = g1.compliance || {};
  const whistleblower = g1.whistleblower || {};
  const dataSecurity = g1.data_security || {};
  const aiGovernance = g1.ai_governance || {};
  const controversialSectors = g1.controversial_sectors || {};

  const handleG1Change = (section, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.governance) updated.governance = {};
    if (!updated.governance.g1_business_conduct) updated.governance.g1_business_conduct = {};
    if (section) {
      if (!updated.governance.g1_business_conduct[section]) updated.governance.g1_business_conduct[section] = {};
      updated.governance.g1_business_conduct[section][field] = value;
    } else {
      updated.governance.g1_business_conduct[field] = value;
    }
    updateReport(updated);
  };

  // --- Style helpers ---
  const gridTwo = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacing.lg,
  };

  const sectionGap = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  };

  const sectionTitle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text,
    margin: 0,
    marginBottom: tokens.spacing.md,
  };

  // --- Computed values ---
  const femalePercentage = board.board_size > 0
    ? Math.round((board.female_board_members || 0) / board.board_size * 100)
    : 0;

  // --- Sub-tab 1: Governance-Struktur ---
  const renderGovernanceStruktur = () => (
    <div style={sectionGap}>
      <Card>
        <h3 style={sectionTitle}>Leitungsgremium</h3>
        <div style={gridTwo}>
          <FormField
            label="Gremiumsgröße"
            type="number"
            value={board.board_size || 0}
            onChange={(v) => handleG1Change('board', 'board_size', v)}
            min={0}
          />
          <FormField
            label="Geschäftsführende Mitglieder"
            type="number"
            value={board.executive_directors || 0}
            onChange={(v) => handleG1Change('board', 'executive_directors', v)}
            min={0}
          />
          <FormField
            label="Nicht-geschäftsführende Mitglieder"
            type="number"
            value={board.non_executive_directors || 0}
            onChange={(v) => handleG1Change('board', 'non_executive_directors', v)}
            min={0}
          />
          <FormField
            label="Weibliche Mitglieder"
            type="number"
            value={board.female_board_members || 0}
            onChange={(v) => handleG1Change('board', 'female_board_members', v)}
            min={0}
          />
          <FormField
            label="Unabhängige Mitglieder"
            type="number"
            value={board.independent_directors || 0}
            onChange={(v) => handleG1Change('board', 'independent_directors', v)}
            min={0}
          />
        </div>
        <div style={{ marginTop: tokens.spacing.lg }}>
          <MetricCard
            label="Frauenanteil im Leitungsgremium"
            value={femalePercentage}
            unit="%"
          />
        </div>
      </Card>

      <Card>
        <h3 style={sectionTitle}>Ausschüsse</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          <FormField
            label="Prüfungsausschuss (Audit Committee)"
            type="checkbox"
            value={board.audit_committee || false}
            onChange={(v) => handleG1Change('board', 'audit_committee', v)}
          />
          <FormField
            label="Risikoausschuss"
            type="checkbox"
            value={board.risk_committee || false}
            onChange={(v) => handleG1Change('board', 'risk_committee', v)}
          />
          <FormField
            label="Nachhaltigkeitsausschuss"
            type="checkbox"
            value={board.sustainability_committee || false}
            onChange={(v) => handleG1Change('board', 'sustainability_committee', v)}
          />
          <FormField
            label="Nominierungsausschuss"
            type="checkbox"
            value={board.nomination_committee || false}
            onChange={(v) => handleG1Change('board', 'nomination_committee', v)}
          />
          <FormField
            label="Vergütungsausschuss"
            type="checkbox"
            value={board.remuneration_committee || false}
            onChange={(v) => handleG1Change('board', 'remuneration_committee', v)}
          />
        </div>
      </Card>

      <Card>
        <h3 style={sectionTitle}>Nachhaltigkeit-Governance</h3>
        <div style={sectionGap}>
          <FormField
            label="Verantwortlichkeit für Nachhaltigkeit"
            type="textarea"
            value={board.sustainability_responsibility || ''}
            onChange={(v) => handleG1Change('board', 'sustainability_responsibility', v)}
            rows={3}
          />
          <FormField
            label="Nachhaltigkeitsexpertise"
            type="textarea"
            value={board.sustainability_expertise || ''}
            onChange={(v) => handleG1Change('board', 'sustainability_expertise', v)}
            rows={3}
          />
          <FormField
            label="Häufigkeit der Nachhaltigkeitsberichterstattung"
            type="select"
            value={board.sustainability_reporting_frequency || ''}
            onChange={(v) => handleG1Change('board', 'sustainability_reporting_frequency', v)}
            options={REPORTING_FREQUENCY_OPTIONS}
          />
        </div>
      </Card>
    </div>
  );

  // --- Sub-tab 2: Compliance-Framework ---
  const renderComplianceFramework = () => (
    <div style={sectionGap}>
      <Card>
        <h3 style={sectionTitle}>Verhaltenskodex</h3>
        <div style={sectionGap}>
          <FormField
            label="Verhaltenskodex vorhanden"
            type="checkbox"
            value={compliance.code_of_conduct_exists || false}
            onChange={(v) => handleG1Change('compliance', 'code_of_conduct_exists', v)}
          />
          <div style={gridTwo}>
            <FormField
              label="Abdeckung Verhaltenskodex"
              type="number"
              value={compliance.code_of_conduct_coverage || 0}
              onChange={(v) => handleG1Change('compliance', 'code_of_conduct_coverage', v)}
              min={0}
              max={100}
              suffix="%"
            />
            <FormField
              label="Schulungsabdeckung Verhaltenskodex"
              type="number"
              value={compliance.code_of_conduct_training_coverage || 0}
              onChange={(v) => handleG1Change('compliance', 'code_of_conduct_training_coverage', v)}
              min={0}
              max={100}
              suffix="%"
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 style={sectionTitle}>Anti-Korruption</h3>
        <div style={sectionGap}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
            <FormField
              label="Anti-Korruptionsrichtlinie vorhanden"
              type="checkbox"
              value={compliance.anti_corruption_policy || false}
              onChange={(v) => handleG1Change('compliance', 'anti_corruption_policy', v)}
            />
            <FormField
              label="Korruptionsrisikobewertung durchgeführt"
              type="checkbox"
              value={compliance.corruption_risk_assessment || false}
              onChange={(v) => handleG1Change('compliance', 'corruption_risk_assessment', v)}
            />
          </div>
          <div style={gridTwo}>
            <FormField
              label="Schulungsabdeckung Anti-Korruption"
              type="number"
              value={compliance.anti_corruption_training_coverage || 0}
              onChange={(v) => handleG1Change('compliance', 'anti_corruption_training_coverage', v)}
              min={0}
              max={100}
              suffix="%"
            />
            <FormField
              label="Korruptionsvorfälle"
              type="number"
              value={compliance.corruption_incidents || 0}
              onChange={(v) => handleG1Change('compliance', 'corruption_incidents', v)}
              min={0}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 style={sectionTitle}>Compliance-Verstöße</h3>
        <div style={sectionGap}>
          <div style={gridTwo}>
            <FormField
              label="Compliance-Verstöße"
              type="number"
              value={compliance.compliance_violations || 0}
              onChange={(v) => handleG1Change('compliance', 'compliance_violations', v)}
              min={0}
            />
            <FormField
              label="Gezahlte Bußgelder (EUR)"
              type="number"
              value={compliance.fines_paid_eur || 0}
              onChange={(v) => handleG1Change('compliance', 'fines_paid_eur', v)}
              min={0}
            />
          </div>
          <FormField
            label="Laufende Rechtsverfahren"
            type="number"
            value={compliance.legal_proceedings || 0}
            onChange={(v) => handleG1Change('compliance', 'legal_proceedings', v)}
            min={0}
          />
        </div>
      </Card>

      <Card>
        <h3 style={sectionTitle}>Politische Aktivitäten</h3>
        <div style={sectionGap}>
          <div style={gridTwo}>
            <FormField
              label="Politische Spenden (EUR)"
              type="number"
              value={compliance.political_contributions_eur || 0}
              onChange={(v) => handleG1Change('compliance', 'political_contributions_eur', v)}
              min={0}
            />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FormField
                label="Eintrag im Transparenzregister"
                type="checkbox"
                value={compliance.transparency_register || false}
                onChange={(v) => handleG1Change('compliance', 'transparency_register', v)}
              />
            </div>
          </div>
          <FormField
            label="Lobbying-Aktivitäten"
            type="textarea"
            value={compliance.lobbying_activities || ''}
            onChange={(v) => handleG1Change('compliance', 'lobbying_activities', v)}
            rows={3}
          />
        </div>
      </Card>
    </div>
  );

  // --- Sub-tab 3: Hinweisgebersystem ---
  const renderHinweisgebersystem = () => (
    <div style={sectionGap}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          <FormField
            label="Hinweisgebersystem vorhanden"
            type="checkbox"
            value={whistleblower.whistleblower_system_exists || false}
            onChange={(v) => handleG1Change('whistleblower', 'whistleblower_system_exists', v)}
          />
          <FormField
            label="Anonyme Meldung möglich"
            type="checkbox"
            value={whistleblower.anonymous_reporting_possible || false}
            onChange={(v) => handleG1Change('whistleblower', 'anonymous_reporting_possible', v)}
          />
          <FormField
            label="Externer Meldekanal verfügbar"
            type="checkbox"
            value={whistleblower.external_channel_available || false}
            onChange={(v) => handleG1Change('whistleblower', 'external_channel_available', v)}
          />
          <FormField
            label="Hinweisgeberschutzrichtlinie vorhanden"
            type="checkbox"
            value={whistleblower.whistleblower_protection_policy || false}
            onChange={(v) => handleG1Change('whistleblower', 'whistleblower_protection_policy', v)}
          />
        </div>
        <div style={{ marginTop: tokens.spacing.lg }}>
          <FormField
            label="Beschreibung des Systems"
            type="textarea"
            value={whistleblower.system_description || ''}
            onChange={(v) => handleG1Change('whistleblower', 'system_description', v)}
            rows={4}
          />
        </div>
      </Card>

      <Card>
        <h3 style={sectionTitle}>Statistik</h3>
        <div style={gridTwo}>
          <FormField
            label="Eingegangene Meldungen"
            type="number"
            value={whistleblower.reports_received || 0}
            onChange={(v) => handleG1Change('whistleblower', 'reports_received', v)}
            min={0}
          />
          <FormField
            label="Untersuchte Meldungen"
            type="number"
            value={whistleblower.reports_investigated || 0}
            onChange={(v) => handleG1Change('whistleblower', 'reports_investigated', v)}
            min={0}
          />
          <FormField
            label="Bestätigte Meldungen"
            type="number"
            value={whistleblower.reports_substantiated || 0}
            onChange={(v) => handleG1Change('whistleblower', 'reports_substantiated', v)}
            min={0}
          />
          <FormField
            label="Abgeschlossene Meldungen"
            type="number"
            value={whistleblower.reports_resolved || 0}
            onChange={(v) => handleG1Change('whistleblower', 'reports_resolved', v)}
            min={0}
          />
          <FormField
            label="Vergeltungsfälle"
            type="number"
            value={whistleblower.retaliation_cases || 0}
            onChange={(v) => handleG1Change('whistleblower', 'retaliation_cases', v)}
            min={0}
          />
        </div>
      </Card>
    </div>
  );

  // --- Sub-tab 4: Datensicherheit ---
  const renderDatensicherheit = () => (
    <div style={sectionGap}>
      <Card>
        <h3 style={sectionTitle}>Zertifizierungen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          <FormField
            label="ISO 27001 zertifiziert"
            type="checkbox"
            value={dataSecurity.iso_27001_certified || false}
            onChange={(v) => handleG1Change('data_security', 'iso_27001_certified', v)}
          />
          <FormField
            label="TISAX zertifiziert"
            type="checkbox"
            value={dataSecurity.tisax_certified || false}
            onChange={(v) => handleG1Change('data_security', 'tisax_certified', v)}
          />
          <FormField
            label="SOC 2 zertifiziert"
            type="checkbox"
            value={dataSecurity.soc2_certified || false}
            onChange={(v) => handleG1Change('data_security', 'soc2_certified', v)}
          />
        </div>
        <div style={{ marginTop: tokens.spacing.lg }}>
          <FormField
            label="Weitere Zertifizierungen (eine pro Zeile)"
            type="textarea"
            value={(dataSecurity.other_certifications || []).join('\n')}
            onChange={(v) => handleG1Change('data_security', 'other_certifications', v.split('\n').filter((line) => line.trim() !== ''))}
            rows={3}
          />
        </div>
      </Card>

      <Card>
        <h3 style={sectionTitle}>Sicherheitsvorfälle</h3>
        <div style={gridTwo}>
          <FormField
            label="Sicherheitsvorfälle gesamt"
            type="number"
            value={dataSecurity.security_incidents_total || 0}
            onChange={(v) => handleG1Change('data_security', 'security_incidents_total', v)}
            min={0}
          />
          <FormField
            label="Kritische Sicherheitsvorfälle"
            type="number"
            value={dataSecurity.security_incidents_critical || 0}
            onChange={(v) => handleG1Change('data_security', 'security_incidents_critical', v)}
            min={0}
          />
          <FormField
            label="Datenschutzverletzungen"
            type="number"
            value={dataSecurity.data_breaches || 0}
            onChange={(v) => handleG1Change('data_security', 'data_breaches', v)}
            min={0}
          />
          <FormField
            label="Betroffene personenbezogene Daten"
            type="number"
            value={dataSecurity.personal_data_affected || 0}
            onChange={(v) => handleG1Change('data_security', 'personal_data_affected', v)}
            min={0}
          />
          <FormField
            label="An Behörden gemeldete Vorfälle"
            type="number"
            value={dataSecurity.incidents_reported_to_authorities || 0}
            onChange={(v) => handleG1Change('data_security', 'incidents_reported_to_authorities', v)}
            min={0}
          />
          <FormField
            label="Finanzielle Auswirkungen (EUR)"
            type="number"
            value={dataSecurity.financial_impact_eur || 0}
            onChange={(v) => handleG1Change('data_security', 'financial_impact_eur', v)}
            min={0}
          />
        </div>
      </Card>

      <Card>
        <h3 style={sectionTitle}>Sicherheitsmaßnahmen</h3>
        <div style={gridTwo}>
          <FormField
            label="Schulungsabdeckung Sicherheit"
            type="number"
            value={dataSecurity.security_training_coverage || 0}
            onChange={(v) => handleG1Change('data_security', 'security_training_coverage', v)}
            min={0}
            max={100}
            suffix="%"
          />
          <FormField
            label="Penetrationstests pro Jahr"
            type="number"
            value={dataSecurity.penetration_tests_per_year || 0}
            onChange={(v) => handleG1Change('data_security', 'penetration_tests_per_year', v)}
            min={0}
          />
          <FormField
            label="Schwachstellenanalysen pro Jahr"
            type="number"
            value={dataSecurity.vulnerability_assessments_per_year || 0}
            onChange={(v) => handleG1Change('data_security', 'vulnerability_assessments_per_year', v)}
            min={0}
          />
          <FormField
            label="Sicherheitsaudits"
            type="number"
            value={dataSecurity.security_audits || 0}
            onChange={(v) => handleG1Change('data_security', 'security_audits', v)}
            min={0}
          />
        </div>
      </Card>
    </div>
  );

  // --- Sub-tab 5: KI-Governance ---
  const renderKIGovernance = () => (
    <div style={sectionGap}>
      <Card>
        <FormField
          label="KI-Systeme im Einsatz"
          type="checkbox"
          value={aiGovernance.ai_systems_in_use || false}
          onChange={(v) => handleG1Change('ai_governance', 'ai_systems_in_use', v)}
        />
      </Card>

      {aiGovernance.ai_systems_in_use ? (
        <>
          <Card>
            <div style={sectionGap}>
              <FormField
                label="Beschreibung der KI-Systeme"
                type="textarea"
                value={aiGovernance.ai_systems_description || ''}
                onChange={(v) => handleG1Change('ai_governance', 'ai_systems_description', v)}
                rows={4}
              />
              <FormField
                label="Hochrisiko-KI-Systeme"
                type="number"
                value={aiGovernance.high_risk_ai_systems || 0}
                onChange={(v) => handleG1Change('ai_governance', 'high_risk_ai_systems', v)}
                min={0}
              />
            </div>
          </Card>

          <Card>
            <h3 style={sectionTitle}>KI-Governance-Maßnahmen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
              <FormField
                label="KI-Ethikrichtlinie vorhanden"
                type="checkbox"
                value={aiGovernance.ai_ethics_policy || false}
                onChange={(v) => handleG1Change('ai_governance', 'ai_ethics_policy', v)}
              />
              <FormField
                label="KI-Risikobewertung durchgeführt"
                type="checkbox"
                value={aiGovernance.ai_risk_assessment_conducted || false}
                onChange={(v) => handleG1Change('ai_governance', 'ai_risk_assessment_conducted', v)}
              />
              <FormField
                label="KI-Offenlegung gegenüber Nutzern"
                type="checkbox"
                value={aiGovernance.ai_disclosure_to_users || false}
                onChange={(v) => handleG1Change('ai_governance', 'ai_disclosure_to_users', v)}
              />
              <FormField
                label="KI-Schulungen für Mitarbeiter"
                type="checkbox"
                value={aiGovernance.ai_training_for_employees || false}
                onChange={(v) => handleG1Change('ai_governance', 'ai_training_for_employees', v)}
              />
            </div>
          </Card>

          <Card>
            <div style={sectionGap}>
              <FormField
                label="Menschliche Aufsichtsmaßnahmen"
                type="textarea"
                value={aiGovernance.human_oversight_measures || ''}
                onChange={(v) => handleG1Change('ai_governance', 'human_oversight_measures', v)}
                rows={3}
              />
              <FormField
                label="EU AI Act Konformitätsstatus"
                type="select"
                value={aiGovernance.eu_ai_act_compliance_status || ''}
                onChange={(v) => handleG1Change('ai_governance', 'eu_ai_act_compliance_status', v)}
                options={EU_AI_ACT_OPTIONS}
              />
            </div>
          </Card>
        </>
      ) : (
        <InfoBox variant="info">
          Keine KI-Systeme im Einsatz. Aktivieren Sie die Checkbox oben, um KI-Governance-Daten zu erfassen.
        </InfoBox>
      )}
    </div>
  );

  // --- Sub-tab 6: Kontroverse Sektoren ---
  const renderKontroverseSektoren = () => (
    <div style={sectionGap}>
      <InfoBox variant="info">
        Zur VSME-Kompatibilität (C8): Offenlegung von Umsätzen aus kontroversen Sektoren gemäß EU-Benchmark-Verordnung.
      </InfoBox>

      <Card>
        <FormField
          label="Tätigkeiten in kontroversen Sektoren"
          type="checkbox"
          value={controversialSectors.is_relevant || false}
          onChange={(v) => handleG1Change('controversial_sectors', 'is_relevant', v)}
        />
      </Card>

      {controversialSectors.is_relevant ? (
        <>
          <Card>
            <h3 style={sectionTitle}>Fossile Brennstoffe</h3>
            <FormField
              label="Tätigkeiten im Bereich fossile Brennstoffe"
              type="checkbox"
              value={controversialSectors.fossil_fuels || false}
              onChange={(v) => handleG1Change('controversial_sectors', 'fossil_fuels', v)}
            />
            {controversialSectors.fossil_fuels && (
              <div style={{ marginTop: tokens.spacing.md }}>
                <FormField
                  label="Umsatzanteil fossile Brennstoffe"
                  type="number"
                  value={controversialSectors.fossil_fuels_revenue_pct || 0}
                  onChange={(v) => handleG1Change('controversial_sectors', 'fossil_fuels_revenue_pct', v)}
                  min={0}
                  max={100}
                  suffix="%"
                />
              </div>
            )}
          </Card>

          <Card>
            <h3 style={sectionTitle}>Tabak</h3>
            <FormField
              label="Tätigkeiten im Bereich Tabak"
              type="checkbox"
              value={controversialSectors.tobacco || false}
              onChange={(v) => handleG1Change('controversial_sectors', 'tobacco', v)}
            />
            {controversialSectors.tobacco && (
              <div style={{ marginTop: tokens.spacing.md }}>
                <FormField
                  label="Umsatzanteil Tabak"
                  type="number"
                  value={controversialSectors.tobacco_revenue_pct || 0}
                  onChange={(v) => handleG1Change('controversial_sectors', 'tobacco_revenue_pct', v)}
                  min={0}
                  max={100}
                  suffix="%"
                />
              </div>
            )}
          </Card>

          <Card>
            <h3 style={sectionTitle}>Waffen</h3>
            <FormField
              label="Tätigkeiten im Bereich Waffen"
              type="checkbox"
              value={controversialSectors.weapons || false}
              onChange={(v) => handleG1Change('controversial_sectors', 'weapons', v)}
            />
            {controversialSectors.weapons && (
              <div style={{ marginTop: tokens.spacing.md }}>
                <FormField
                  label="Umsatzanteil Waffen"
                  type="number"
                  value={controversialSectors.weapons_revenue_pct || 0}
                  onChange={(v) => handleG1Change('controversial_sectors', 'weapons_revenue_pct', v)}
                  min={0}
                  max={100}
                  suffix="%"
                />
              </div>
            )}
            <div style={{ marginTop: tokens.spacing.md }}>
              <FormField
                label="Kontroverse Waffen (Antipersonenminen, Streumunition, etc.)"
                type="checkbox"
                value={controversialSectors.controversial_weapons || false}
                onChange={(v) => handleG1Change('controversial_sectors', 'controversial_weapons', v)}
              />
            </div>
          </Card>

          <Card>
            <h3 style={sectionTitle}>Weitere Sektoren</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
              <FormField
                label="Glücksspiel"
                type="checkbox"
                value={controversialSectors.gambling || false}
                onChange={(v) => handleG1Change('controversial_sectors', 'gambling', v)}
              />
              <FormField
                label="Kernenergie"
                type="checkbox"
                value={controversialSectors.nuclear || false}
                onChange={(v) => handleG1Change('controversial_sectors', 'nuclear', v)}
              />
            </div>
          </Card>

          <Card>
            <FormField
              label="Erläuterung / Begründung"
              type="textarea"
              value={controversialSectors.justification || ''}
              onChange={(v) => handleG1Change('controversial_sectors', 'justification', v)}
              rows={4}
            />
          </Card>
        </>
      ) : (
        <InfoBox variant="info">
          Keine Tätigkeiten in kontroversen Sektoren. Aktivieren Sie die Checkbox oben, um Details zu erfassen.
        </InfoBox>
      )}
    </div>
  );

  // --- Main tabs ---
  const tabs = [
    { label: 'Governance-Struktur', content: renderGovernanceStruktur() },
    { label: 'Compliance-Framework', content: renderComplianceFramework() },
    { label: 'Hinweisgebersystem', content: renderHinweisgebersystem() },
    { label: 'Datensicherheit', content: renderDatensicherheit() },
    { label: 'KI-Governance', content: renderKIGovernance() },
    { label: 'Kontroverse Sektoren', content: renderKontroverseSektoren() },
    { label: 'Richtlinien', content: <TopicItemsSection topicCode="G1" section="policies" /> },
    { label: 'Ziele', content: <TopicItemsSection topicCode="G1" section="targets" /> },
    { label: 'Massnahmen', content: <TopicItemsSection topicCode="G1" section="actions" /> },
  ];

  return (
    <div>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxl,
      }}>
        Governance
      </h1>

      <SectionStatusBar route="/governance" />

      <InfoBox variant="info" style={{ marginBottom: tokens.spacing.xxl }}>
        G1 Business Conduct: Erfassen Sie hier Informationen zur Unternehmensführung, Compliance, Hinweisgebersystem, Datensicherheit und KI-Governance gemäß ESRS G1.
      </InfoBox>

      <TabPanel tabs={tabs} />
    </div>
  );
}
