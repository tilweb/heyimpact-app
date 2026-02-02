import React, { useState } from 'react';
import { useReport } from '../hooks/useReport.js';
import { useLLM } from '../hooks/useLLM.js';
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

export default function SocialPage() {
  const { report, updateReport } = useReport();
  const { generating, generateNonRelevanceJustification } = useLLM();
  const [activeTab, setActiveTab] = useState(0);

  if (!report) {
    return (
      <PlaceholderBox
        icon="👥"
        title="Kein Bericht geladen"
        description="Bitte gehen Sie zur Startseite und erstellen oder laden Sie einen Bericht."
      />
    );
  }

  const materialCodes = getMaterialTopicCodes(report);
  const isMaterial = (code) => materialCodes.includes(code);

  const social = report.social || {};
  const s1 = social.s1_own_workforce || {};
  const demographics = s1.demographics || {};
  const healthSafety = s1.health_safety || {};
  const training = s1.training || {};
  const compensation = s1.compensation || {};
  const engagement = s1.engagement || {};
  const s2 = social.s2_supply_chain || {};
  const s3 = social.s3_affected_communities || {};
  const s4 = social.s4_consumers || {};

  // --- Update helpers ---
  const handleS1Change = (section, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.social) updated.social = {};
    if (!updated.social.s1_own_workforce) updated.social.s1_own_workforce = {};
    if (!updated.social.s1_own_workforce[section]) updated.social.s1_own_workforce[section] = {};
    updated.social.s1_own_workforce[section][field] = value;
    updateReport(updated);
  };

  const handleS2Change = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.social) updated.social = {};
    if (!updated.social.s2_supply_chain) updated.social.s2_supply_chain = {};
    updated.social.s2_supply_chain[field] = value;
    updateReport(updated);
  };

  const handleS3Change = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.social) updated.social = {};
    if (!updated.social.s3_affected_communities) updated.social.s3_affected_communities = {};
    updated.social.s3_affected_communities[field] = value;
    updateReport(updated);
  };

  const handleS4Change = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.social) updated.social = {};
    if (!updated.social.s4_consumers) updated.social.s4_consumers = {};
    updated.social.s4_consumers[field] = value;
    updateReport(updated);
  };

  // --- Style helpers ---
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

  const sectionGap = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  };

  const sectionTitle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text,
    margin: 0,
    marginBottom: tokens.spacing.md,
  };

  // --- Sub-tab helper ---
  const renderTopicWithSubTabs = (topicCode, metricsContent) => (
    <TabPanel tabs={[
      { label: 'Metriken', content: metricsContent },
      { label: 'Richtlinien', content: <TopicItemsSection topicCode={topicCode} section="policies" /> },
      { label: 'Ziele', content: <TopicItemsSection topicCode={topicCode} section="targets" /> },
      { label: 'Massnahmen', content: <TopicItemsSection topicCode={topicCode} section="actions" /> },
    ]} />
  );

  // --- Computed metrics ---
  const femalePercentage = demographics.total_employees
    ? ((demographics.female_employees || 0) / demographics.total_employees * 100).toFixed(1)
    : '-';

  const femaleMgmtPercentage = demographics.total_management
    ? ((demographics.female_management || 0) / demographics.total_management * 100).toFixed(1)
    : '-';

  // --- Tab labels ---
  const TAB_LABELS = [
    `S1 - Eigene Belegschaft ${isMaterial('S1') ? '\u2705' : '\u2B1C'}`,
    `S2 - Wertsch\u00F6pfungskette ${isMaterial('S2') ? '\u2705' : '\u2B1C'}`,
    `S3 - Betroffene Gemeinschaften ${isMaterial('S3') ? '\u2705' : '\u2B1C'}`,
    `S4 - Verbraucher und Endnutzer ${isMaterial('S4') ? '\u2705' : '\u2B1C'}`,
  ];

  // --- Tab S1: Eigene Belegschaft ---
  const renderS1Metrics = () => (
    <div style={sectionGap}>
      {/* Belegschaftsstruktur */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Belegschaftsstruktur</h3>
        <div style={gridTwo}>
          <div style={sectionGap}>
            <FormField
              label="Mitarbeiter gesamt"
              type="number"
              value={demographics.total_employees || ''}
              onChange={(v) => handleS1Change('demographics', 'total_employees', v)}
            />
            <FormField
              label="Festangestellte"
              type="number"
              value={demographics.permanent_employees || ''}
              onChange={(v) => handleS1Change('demographics', 'permanent_employees', v)}
            />
            <FormField
              label="Befristete Mitarbeiter"
              type="number"
              value={demographics.temporary_employees || ''}
              onChange={(v) => handleS1Change('demographics', 'temporary_employees', v)}
            />
            <FormField
              label="Vollzeitbesch\u00E4ftigte"
              type="number"
              value={demographics.full_time_employees || ''}
              onChange={(v) => handleS1Change('demographics', 'full_time_employees', v)}
            />
            <FormField
              label="Teilzeitbesch\u00E4ftigte"
              type="number"
              value={demographics.part_time_employees || ''}
              onChange={(v) => handleS1Change('demographics', 'part_time_employees', v)}
            />
            <FormField
              label="FTE (Vollzeit\u00E4quivalente)"
              type="number"
              value={demographics.fte || ''}
              onChange={(v) => handleS1Change('demographics', 'fte', v)}
            />
          </div>
          <div style={sectionGap}>
            <FormField
              label="Mitarbeiter Deutschland"
              type="number"
              value={demographics.employees_germany || ''}
              onChange={(v) => handleS1Change('demographics', 'employees_germany', v)}
            />
            <FormField
              label="Mitarbeiter EU (ohne DE)"
              type="number"
              value={demographics.employees_eu || ''}
              onChange={(v) => handleS1Change('demographics', 'employees_eu', v)}
            />
            <FormField
              label="Mitarbeiter au\u00DFerhalb EU"
              type="number"
              value={demographics.employees_non_eu || ''}
              onChange={(v) => handleS1Change('demographics', 'employees_non_eu', v)}
            />
          </div>
        </div>
      </Card>

      {/* Geschlechtervielfalt */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Geschlechtervielfalt</h3>
        <div style={gridTwo}>
          <div style={sectionGap}>
            <FormField
              label="Weibliche Mitarbeiter"
              type="number"
              value={demographics.female_employees || ''}
              onChange={(v) => handleS1Change('demographics', 'female_employees', v)}
            />
            <FormField
              label="M\u00E4nnliche Mitarbeiter"
              type="number"
              value={demographics.male_employees || ''}
              onChange={(v) => handleS1Change('demographics', 'male_employees', v)}
            />
            <FormField
              label="Diverse Mitarbeiter"
              type="number"
              value={demographics.diverse_employees || ''}
              onChange={(v) => handleS1Change('demographics', 'diverse_employees', v)}
            />
          </div>
          <div style={sectionGap}>
            <MetricCard
              label="Frauenanteil"
              value={femalePercentage}
              unit="%"
              icon="\u2640\uFE0F"
            />
          </div>
        </div>
      </Card>

      {/* Altersstruktur */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Altersstruktur</h3>
        <div style={gridThree}>
          <FormField
            label="Unter 30 Jahre"
            type="number"
            value={demographics.under_30 || ''}
            onChange={(v) => handleS1Change('demographics', 'under_30', v)}
          />
          <FormField
            label="30 - 50 Jahre"
            type="number"
            value={demographics.age_30_50 || ''}
            onChange={(v) => handleS1Change('demographics', 'age_30_50', v)}
          />
          <FormField
            label="\u00DCber 50 Jahre"
            type="number"
            value={demographics.over_50 || ''}
            onChange={(v) => handleS1Change('demographics', 'over_50', v)}
          />
        </div>
      </Card>

      {/* F\u00FChrungskr\u00E4fte */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>F\u00FChrungskr\u00E4fte</h3>
        <div style={gridTwo}>
          <div style={sectionGap}>
            <FormField
              label="F\u00FChrungskr\u00E4fte gesamt"
              type="number"
              value={demographics.total_management || ''}
              onChange={(v) => handleS1Change('demographics', 'total_management', v)}
            />
            <FormField
              label="Weibliche F\u00FChrungskr\u00E4fte"
              type="number"
              value={demographics.female_management || ''}
              onChange={(v) => handleS1Change('demographics', 'female_management', v)}
            />
            <FormField
              label="Vorstandsmitglieder"
              type="number"
              value={demographics.board_members || ''}
              onChange={(v) => handleS1Change('demographics', 'board_members', v)}
            />
            <FormField
              label="Weibliche Vorstandsmitglieder"
              type="number"
              value={demographics.female_board_members || ''}
              onChange={(v) => handleS1Change('demographics', 'female_board_members', v)}
            />
          </div>
          <div style={sectionGap}>
            <MetricCard
              label="Frauenanteil F\u00FChrung"
              value={femaleMgmtPercentage}
              unit="%"
              icon="\u2640\uFE0F"
            />
          </div>
        </div>
      </Card>

      {/* Arbeitssicherheit und Gesundheit */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Arbeitssicherheit und Gesundheit</h3>
        <div style={gridTwo}>
          <div style={sectionGap}>
            <FormField
              label="Arbeitsunf\u00E4lle"
              type="number"
              value={healthSafety.work_accidents || ''}
              onChange={(v) => handleS1Change('health_safety', 'work_accidents', v)}
            />
            <FormField
              label="T\u00F6dliche Unf\u00E4lle"
              type="number"
              value={healthSafety.fatal_accidents || ''}
              onChange={(v) => handleS1Change('health_safety', 'fatal_accidents', v)}
            />
            <FormField
              label="Ausfalltage durch Unf\u00E4lle"
              type="number"
              value={healthSafety.lost_days_accidents || ''}
              onChange={(v) => handleS1Change('health_safety', 'lost_days_accidents', v)}
            />
            <FormField
              label="Krankheitstage gesamt"
              type="number"
              value={healthSafety.sick_days_total || ''}
              onChange={(v) => handleS1Change('health_safety', 'sick_days_total', v)}
            />
            <FormField
              label="Krankheitstage pro Mitarbeiter"
              type="number"
              value={healthSafety.sick_days_per_employee || ''}
              onChange={(v) => handleS1Change('health_safety', 'sick_days_per_employee', v)}
              step={0.1}
            />
            <FormField
              label="Sicherheitsschulungen durchgef\u00FChrt"
              type="number"
              value={healthSafety.safety_trainings_conducted || ''}
              onChange={(v) => handleS1Change('health_safety', 'safety_trainings_conducted', v)}
            />
          </div>
          <div style={sectionGap}>
            <FormField
              label="Gesundheitsprogramme"
              type="textarea"
              value={healthSafety.health_programs || ''}
              onChange={(v) => handleS1Change('health_safety', 'health_programs', v)}
              rows={5}
            />
            <FormField
              label="Psychische Gesundheit / Unterst\u00FCtzung"
              type="textarea"
              value={healthSafety.mental_health_support || ''}
              onChange={(v) => handleS1Change('health_safety', 'mental_health_support', v)}
              rows={5}
            />
          </div>
        </div>
      </Card>

      {/* Aus- und Weiterbildung */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Aus- und Weiterbildung</h3>
        <div style={gridTwo}>
          <div style={sectionGap}>
            <FormField
              label="Schulungsstunden gesamt"
              type="number"
              value={training.total_training_hours || ''}
              onChange={(v) => handleS1Change('training', 'total_training_hours', v)}
            />
            <FormField
              label="Schulungsstunden pro Mitarbeiter"
              type="number"
              value={training.training_hours_per_employee || ''}
              onChange={(v) => handleS1Change('training', 'training_hours_per_employee', v)}
              step={0.1}
            />
            <FormField
              label="Weiterbildungsinvestition (EUR)"
              type="number"
              value={training.training_investment_eur || ''}
              onChange={(v) => handleS1Change('training', 'training_investment_eur', v)}
            />
          </div>
          <div style={sectionGap}>
            <FormField
              label="Aktuelle Auszubildende"
              type="number"
              value={training.apprentices_current || ''}
              onChange={(v) => handleS1Change('training', 'apprentices_current', v)}
            />
            <FormField
              label="Ausbildungspl\u00E4tze"
              type="number"
              value={training.apprenticeship_positions || ''}
              onChange={(v) => handleS1Change('training', 'apprenticeship_positions', v)}
            />
          </div>
        </div>
      </Card>

      {/* Verg\u00FCtung */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Verg\u00FCtung</h3>
        <div style={gridTwo}>
          <FormField
            label="Gender Pay Gap (%)"
            type="number"
            value={compensation.gender_pay_gap_percentage || ''}
            onChange={(v) => handleS1Change('compensation', 'gender_pay_gap_percentage', v)}
            step={0.1}
          />
          <FormField
            label="Betriebliche Altersvorsorge (%)"
            type="number"
            value={compensation.pension_coverage_percentage || ''}
            onChange={(v) => handleS1Change('compensation', 'pension_coverage_percentage', v)}
            step={0.1}
          />
        </div>
      </Card>

      {/* Mitarbeiterengagement */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Mitarbeiterengagement</h3>
        <div style={gridTwo}>
          <div style={sectionGap}>
            <FormField
              label="Freiwillige Fluktuationsrate (%)"
              type="number"
              value={engagement.voluntary_turnover_rate || ''}
              onChange={(v) => handleS1Change('engagement', 'voluntary_turnover_rate', v)}
              step={0.1}
            />
            <FormField
              label="Neueinstellungen"
              type="number"
              value={engagement.new_hires || ''}
              onChange={(v) => handleS1Change('engagement', 'new_hires', v)}
            />
          </div>
          <div style={sectionGap}>
            <FormField
              label="Betriebsrat vorhanden"
              type="checkbox"
              value={engagement.works_council_exists || false}
              onChange={(v) => handleS1Change('engagement', 'works_council_exists', v)}
            />
            <FormField
              label="Mitarbeiterbefragung durchgef\u00FChrt"
              type="checkbox"
              value={engagement.engagement_survey_conducted || false}
              onChange={(v) => handleS1Change('engagement', 'engagement_survey_conducted', v)}
            />
          </div>
        </div>
      </Card>

    </div>
  );

  const renderS1 = () => renderTopicWithSubTabs('S1', renderS1Metrics());

  // --- Tab S2: Wertschoepfungskette ---
  const renderS2Metrics = () => (
    <div style={sectionGap}>
      <div>
        <FormField
          label="S2 ist wesentlich / relevant"
          type="checkbox"
          value={s2.is_relevant || false}
          onChange={(v) => handleS2Change('is_relevant', v)}
        />
        {!s2.is_relevant && (
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textLight, fontStyle: 'italic', marginLeft: tokens.spacing.sm }}>
            Nicht wesentlich — alle Angaben freiwillig
          </span>
        )}
      </div>

      {!s2.is_relevant && (
        <Card padding={tokens.spacing.xl}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
            <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
              Begruendung der Nicht-Wesentlichkeit
            </label>
            <Button variant="ai" size="sm" disabled={generating} onClick={async () => {
              const text = await generateNonRelevanceJustification('S2', 'Arbeitskraefte in der Wertschoepfungskette', report.organization?.name, report.organization?.industry_sector);
              handleS2Change('relevance_justification', text);
            }}>
              {generating ? 'Generiere...' : 'KI-Begruendung'}
            </Button>
          </div>
          <FormField
            type="textarea"
            value={s2.relevance_justification || ''}
            onChange={(v) => handleS2Change('relevance_justification', v)}
            rows={5}
          />
        </Card>
      )}

      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Lieferketten-Kennzahlen</h3>
        <div style={gridTwo}>
          <div style={sectionGap}>
            <FormField
              label="Lieferanten gesamt"
              type="number"
              value={s2.total_suppliers || ''}
              onChange={(v) => handleS2Change('total_suppliers', v)}
            />
            <FormField
              label="Kritische Lieferanten"
              type="number"
              value={s2.critical_suppliers || ''}
              onChange={(v) => handleS2Change('critical_suppliers', v)}
            />
            <FormField
              label="Gepruefte Lieferanten"
              type="number"
              value={s2.suppliers_screened || ''}
              onChange={(v) => handleS2Change('suppliers_screened', v)}
            />
            <FormField
              label="Lieferanten mit CoC"
              type="number"
              value={s2.suppliers_with_coc || ''}
              onChange={(v) => handleS2Change('suppliers_with_coc', v)}
            />
          </div>
          <div style={sectionGap}>
            <FormField
              label="Auditierte Lieferanten"
              type="number"
              value={s2.suppliers_audited || ''}
              onChange={(v) => handleS2Change('suppliers_audited', v)}
            />
            <FormField
              label="Hochrisiko-Lieferanten"
              type="number"
              value={s2.high_risk_suppliers || ''}
              onChange={(v) => handleS2Change('high_risk_suppliers', v)}
            />
            <FormField
              label="Identifizierte Menschenrechtsprobleme"
              type="number"
              value={s2.human_rights_issues_identified || ''}
              onChange={(v) => handleS2Change('human_rights_issues_identified', v)}
            />
            <FormField
              label="Korrekturmassnahmen eingeleitet"
              type="number"
              value={s2.corrective_actions_taken || ''}
              onChange={(v) => handleS2Change('corrective_actions_taken', v)}
            />
          </div>
        </div>
      </Card>

      <Card padding={tokens.spacing.xl}>
        <FormField
          label="Lieferanten-Verhaltenskodex"
          type="textarea"
          value={s2.supplier_code_of_conduct || ''}
          onChange={(v) => handleS2Change('supplier_code_of_conduct', v)}
          rows={6}
        />
      </Card>
    </div>
  );

  const renderS2 = () => renderTopicWithSubTabs('S2', renderS2Metrics());

  // --- Tab S3: Betroffene Gemeinschaften ---
  const renderS3Metrics = () => (
    <div style={sectionGap}>
      <div>
        <FormField
          label="S3 ist wesentlich / relevant"
          type="checkbox"
          value={s3.is_relevant || false}
          onChange={(v) => handleS3Change('is_relevant', v)}
        />
        {!s3.is_relevant && (
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textLight, fontStyle: 'italic', marginLeft: tokens.spacing.sm }}>
            Nicht wesentlich — alle Angaben freiwillig
          </span>
        )}
      </div>

      {!s3.is_relevant && (
        <Card padding={tokens.spacing.xl}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
            <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
              Begruendung der Nicht-Wesentlichkeit
            </label>
            <Button variant="ai" size="sm" disabled={generating} onClick={async () => {
              const text = await generateNonRelevanceJustification('S3', 'Betroffene Gemeinschaften', report.organization?.name, report.organization?.industry_sector);
              handleS3Change('relevance_justification', text);
            }}>
              {generating ? 'Generiere...' : 'KI-Begruendung'}
            </Button>
          </div>
          <FormField
            type="textarea"
            value={s3.relevance_justification || ''}
            onChange={(v) => handleS3Change('relevance_justification', v)}
            rows={5}
          />
        </Card>
      )}

      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Gemeinschaftliches Engagement</h3>
        <div style={sectionGap}>
          <div style={gridTwo}>
            <FormField
              label="Gemeinschaftsinvestitionen (EUR)"
              type="number"
              value={s3.community_investment_eur || ''}
              onChange={(v) => handleS3Change('community_investment_eur', v)}
            />
            <FormField
              label="Spenden (EUR)"
              type="number"
              value={s3.donations_eur || ''}
              onChange={(v) => handleS3Change('donations_eur', v)}
            />
          </div>
          <FormField
            label="Freiwilligenstunden"
            type="number"
            value={s3.volunteering_hours || ''}
            onChange={(v) => handleS3Change('volunteering_hours', v)}
          />
          <FormField
            label="Aktivitaeten im Gemeinschaftsengagement"
            type="textarea"
            value={s3.community_engagement_activities || ''}
            onChange={(v) => handleS3Change('community_engagement_activities', v)}
            rows={5}
          />
        </div>
      </Card>
    </div>
  );

  const renderS3 = () => renderTopicWithSubTabs('S3', renderS3Metrics());

  // --- Tab S4: Verbraucher und Endnutzer ---
  const renderS4Metrics = () => (
    <div style={sectionGap}>
      <div>
        <FormField
          label="S4 ist wesentlich / relevant"
          type="checkbox"
          value={s4.is_relevant || false}
          onChange={(v) => handleS4Change('is_relevant', v)}
        />
        {!s4.is_relevant && (
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textLight, fontStyle: 'italic', marginLeft: tokens.spacing.sm }}>
            Nicht wesentlich — alle Angaben freiwillig
          </span>
        )}
      </div>

      {!s4.is_relevant && (
        <Card padding={tokens.spacing.xl}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
            <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
              Begruendung der Nicht-Wesentlichkeit
            </label>
            <Button variant="ai" size="sm" disabled={generating} onClick={async () => {
              const text = await generateNonRelevanceJustification('S4', 'Verbraucher und Endnutzer', report.organization?.name, report.organization?.industry_sector);
              handleS4Change('relevance_justification', text);
            }}>
              {generating ? 'Generiere...' : 'KI-Begruendung'}
            </Button>
          </div>
          <FormField
            type="textarea"
            value={s4.relevance_justification || ''}
            onChange={(v) => handleS4Change('relevance_justification', v)}
            rows={5}
          />
        </Card>
      )}

      {/* Datenschutz */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Datenschutz und Informationssicherheit</h3>
        <div style={gridTwo}>
          <div style={sectionGap}>
            <FormField
              label="Datenschutzverletzungen"
              type="number"
              value={s4.data_breaches || ''}
              onChange={(v) => handleS4Change('data_breaches', v)}
            />
            <FormField
              label="Betroffene Personen"
              type="number"
              value={s4.data_subjects_affected || ''}
              onChange={(v) => handleS4Change('data_subjects_affected', v)}
            />
            <FormField
              label="DSGVO-Beschwerden"
              type="number"
              value={s4.gdpr_complaints || ''}
              onChange={(v) => handleS4Change('gdpr_complaints', v)}
            />
          </div>
          <div style={sectionGap}>
            <FormField
              label="Sicherheitsvorfaelle"
              type="number"
              value={s4.security_incidents || ''}
              onChange={(v) => handleS4Change('security_incidents', v)}
            />
            <FormField
              label="Penetrationstests durchgefuehrt"
              type="number"
              value={s4.penetration_tests_conducted || ''}
              onChange={(v) => handleS4Change('penetration_tests_conducted', v)}
            />
          </div>
        </div>
      </Card>

      {/* Kundenzufriedenheit */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Kundenzufriedenheit</h3>
        <div style={gridTwo}>
          <FormField
            label="Kundenbeschwerden"
            type="number"
            value={s4.customer_complaints || ''}
            onChange={(v) => handleS4Change('customer_complaints', v)}
          />
          <FormField
            label="Geloeste Beschwerden"
            type="number"
            value={s4.complaints_resolved || ''}
            onChange={(v) => handleS4Change('complaints_resolved', v)}
          />
        </div>
      </Card>

      {/* KI */}
      <Card padding={tokens.spacing.xl}>
        <h3 style={sectionTitle}>Kuenstliche Intelligenz</h3>
        <div style={sectionGap}>
          <FormField
            label="KI-Systeme im Einsatz"
            type="checkbox"
            value={s4.ai_systems_deployed || false}
            onChange={(v) => handleS4Change('ai_systems_deployed', v)}
          />
          <FormField
            label="KI-Ethik-Richtlinie"
            type="textarea"
            value={s4.ai_ethics_policy || ''}
            onChange={(v) => handleS4Change('ai_ethics_policy', v)}
            rows={4}
          />
          <FormField
            label="KI-Transparenzmassnahmen"
            type="textarea"
            value={s4.ai_transparency_measures || ''}
            onChange={(v) => handleS4Change('ai_transparency_measures', v)}
            rows={4}
          />
        </div>
      </Card>
    </div>
  );

  const renderS4 = () => renderTopicWithSubTabs('S4', renderS4Metrics());

  const tabContent = [renderS1, renderS2, renderS3, renderS4];

  return (
    <div>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxl,
      }}>
        Soziales
      </h1>

      <SectionStatusBar route="/social" />

      <InfoBox variant="info" style={{ marginBottom: tokens.spacing.xxl }}>
        Erfassen Sie hier die sozialen Kennzahlen gem\u00E4\u00DF ESRS S1\u2013S4. Die Tabs zeigen den Wesentlichkeitsstatus aus der IRO-Bewertung an.
      </InfoBox>

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
