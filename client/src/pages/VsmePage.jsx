import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReport } from '../hooks/useReport.js';
import tokens from '../theme/tokens.js';
import TabPanel from '../components/ui/TabPanel.jsx';
import Card from '../components/ui/Card.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';

// --- Helpers ---

function fmt(val, unit) {
  if (val === undefined || val === null || val === '' || val === 0) return '\u2014';
  const num = typeof val === 'number' ? val.toLocaleString('de-DE') : val;
  return unit ? `${num} ${unit}` : num;
}

function pct(part, total) {
  if (!total || !part) return null;
  return `${Math.round((part / total) * 100)} %`;
}

// Row inside a disclosure card
function DataRow({ label, value, unit }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${tokens.spacing.xs}px 0`, borderBottom: `1px solid ${tokens.colors.borderLight}` }}>
      <span style={{ color: tokens.colors.textSecondary, fontSize: tokens.typography.fontSize.md }}>{label}</span>
      <span style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.md, color: tokens.colors.text }}>{fmt(value, unit)}</span>
    </div>
  );
}

// Card wrapper for one VSME disclosure
function DisclosureCard({ code, title, sourceLabel, sourcePath, children }) {
  const navigate = useNavigate();
  return (
    <Card style={{ marginBottom: tokens.spacing.lg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: tokens.spacing.md }}>
        <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
          {code} — {title}
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>{children}</div>
      {sourceLabel && (
        <div
          onClick={() => sourcePath && navigate(sourcePath)}
          style={{ marginTop: tokens.spacing.md, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.primary, cursor: sourcePath ? 'pointer' : 'default' }}
        >
          Datenquelle: {sourceLabel}
        </div>
      )}
    </Card>
  );
}

// --- Coverage helpers ---
const STATUS_GREEN = { bg: tokens.colors.successLight, color: tokens.colors.success, label: 'Ausgefuellt' };
const STATUS_YELLOW = { bg: tokens.colors.warningLight, color: tokens.colors.warning, label: 'Teilweise' };
const STATUS_RED = { bg: tokens.colors.errorLight, color: tokens.colors.error, label: 'Leer' };

function coverageDot(status) {
  return (
    <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: status.color, marginRight: tokens.spacing.sm }} />
  );
}

function evaluateCoverage(fields) {
  const filled = fields.filter((v) => v !== undefined && v !== null && v !== '' && v !== 0 && v !== false).length;
  if (filled === 0) return STATUS_RED;
  if (filled === fields.length) return STATUS_GREEN;
  return STATUS_YELLOW;
}

// ===========================================================================
// Main Component
// ===========================================================================

export default function VsmePage() {
  const { report } = useReport();
  const navigate = useNavigate();

  if (!report) {
    return (
      <PlaceholderBox
        icon="📋"
        title="Kein Bericht geladen"
        description="Bitte gehen Sie zur Startseite und erstellen oder laden Sie einen Bericht."
      />
    );
  }

  const org = report.organization || {};
  const env = report.environmental || {};
  const e1 = env.e1_climate || {};
  const energy = e1.energy || {};
  const emissions = e1.emissions || {};
  const e2 = env.e2_pollution || {};
  const e3 = env.e3_water || {};
  const e4 = env.e4_biodiversity || {};
  const e5 = env.e5_circular_economy || {};
  const soc = report.social || {};
  const s1 = soc.s1_own_workforce || {};
  const demo = s1.demographics || {};
  const hs = s1.health_safety || {};
  const comp = s1.compensation || {};
  const training = s1.training || {};
  const s2 = soc.s2_supply_chain || {};
  const gov = report.governance || {};
  const g1 = gov.g1_business_conduct || {};
  const board = g1.board || {};
  const compliance = g1.compliance || {};
  const controversial = g1.controversial_sectors || {};
  const policies = report.policies || [];
  const actions = report.actions || [];
  const targets = report.targets || [];
  const iroAssessments = (report.iro_summary && report.iro_summary.assessments) || [];

  // ---- Tab 1: Basic Module ----
  const renderBasicModule = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
      <DisclosureCard code="B1" title="Basis for Preparation" sourceLabel="Unternehmensdaten" sourcePath="/organization">
        <DataRow label="Firma" value={org.name} />
        <DataRow label="Rechtsform" value={org.legal_form} />
        <DataRow label="NACE-Code" value={org.nace_code} />
        <DataRow label="FTE" value={org.employees_fte} />
        <DataRow label="Umsatz" value={org.revenue} unit="EUR" />
        <DataRow label="Standorte" value={(org.locations || []).length || undefined} />
        <DataRow label="Zertifizierungen" value={(org.certifications || []).join(', ') || undefined} />
      </DisclosureCard>

      <DisclosureCard code="B2" title="Practices & Policies" sourceLabel="Governance > Richtlinien" sourcePath="/governance?tab=6">
        <DataRow label="Erfasste Richtlinien" value={policies.length || undefined} />
        {policies.slice(0, 5).map((p, i) => (
          <DataRow key={i} label={`Richtlinie ${i + 1}`} value={p.title || p.name || '(ohne Titel)'} />
        ))}
        {policies.length > 5 && <DataRow label="..." value={`${policies.length - 5} weitere`} />}
      </DisclosureCard>

      <DisclosureCard code="B3" title="Energie & Treibhausgasemissionen" sourceLabel="Umwelt > E1 Klimawandel" sourcePath="/environmental?tab=0">
        <DataRow label="Gesamtenergieverbrauch" value={energy.total_kwh} unit="kWh" />
        <DataRow label="davon erneuerbar" value={energy.renewable_kwh} unit={energy.renewable_kwh && energy.total_kwh ? `kWh (${pct(energy.renewable_kwh, energy.total_kwh)})` : 'kWh'} />
        <DataRow label="Scope 1" value={emissions.scope1_total} unit="t CO2e" />
        <DataRow label="Scope 2 (location-based)" value={emissions.scope2_location_based} unit="t CO2e" />
        <DataRow label="THG-Intensitaet" value={e1.emissions_per_revenue} unit="t CO2e / Mio EUR" />
      </DisclosureCard>

      <DisclosureCard code="B4" title="Umweltverschmutzung" sourceLabel="Umwelt > E2 Umweltverschmutzung" sourcePath="/environmental?tab=1">
        <DataRow label="Luftschadstoffe" value={e2.air_pollutants_tonnes} unit="t" />
        <DataRow label="Wasserschadstoffe" value={e2.water_pollutants_tonnes} unit="t" />
        <DataRow label="Bodenkontaminationsvorfaelle" value={e2.soil_contamination_incidents} />
      </DisclosureCard>

      <DisclosureCard code="B5" title="Biodiversitaet" sourceLabel="Umwelt > E4 Biodiversitaet" sourcePath="/environmental?tab=3">
        <DataRow label="Gesamtflaeche" value={e4.total_land_area_ha} unit="ha" />
        <DataRow label="Versiegelte Flaeche" value={e4.sealed_land_area_ha} unit="ha" />
        <DataRow label="Standorte nahe Schutzgebieten" value={e4.operations_near_protected_areas ? 'Ja' : 'Nein'} />
      </DisclosureCard>

      <DisclosureCard code="B6" title="Wasser" sourceLabel="Umwelt > E3 Wasser" sourcePath="/environmental?tab=2">
        <DataRow label="Wasserentnahme gesamt" value={e3.total_water_withdrawal_m3} unit="m3" />
        <DataRow label="Wassereinleitung gesamt" value={e3.total_water_discharge_m3} unit="m3" />
        <DataRow label="Recyceltes Wasser" value={e3.water_recycled_m3} unit="m3" />
      </DisclosureCard>

      <DisclosureCard code="B7" title="Kreislaufwirtschaft" sourceLabel="Umwelt > E5 Kreislaufwirtschaft" sourcePath="/environmental?tab=4">
        <DataRow label="Abfall gesamt" value={e5.total_waste_tonnes} unit="t" />
        <DataRow label="Recycelter Abfall" value={e5.waste_recycled_tonnes} unit="t" />
        <DataRow label="Gefaehrlicher Abfall" value={e5.hazardous_waste_tonnes} unit="t" />
      </DisclosureCard>

      <DisclosureCard code="B8" title="Belegschaft" sourceLabel="Soziales > S1 Eigene Belegschaft" sourcePath="/social?tab=0">
        <DataRow label="FTE" value={demo.fte} />
        <DataRow label="Festangestellte" value={demo.permanent_employees} />
        <DataRow label="Befristete" value={demo.temporary_employees} />
        <DataRow label="Weibliche Mitarbeiter" value={demo.female_employees} />
        <DataRow label="Maennliche Mitarbeiter" value={demo.male_employees} />
      </DisclosureCard>

      <DisclosureCard code="B9" title="Gesundheit & Sicherheit" sourceLabel="Soziales > S1 Eigene Belegschaft" sourcePath="/social?tab=0">
        <DataRow label="Arbeitsunfaelle" value={hs.work_accidents} />
        <DataRow label="Toedliche Unfaelle" value={hs.fatal_accidents} />
        <DataRow label="Ausfalltage" value={hs.lost_days_accidents} />
      </DisclosureCard>

      <DisclosureCard code="B10" title="Verguetung & Weiterbildung" sourceLabel="Soziales > S1 Eigene Belegschaft" sourcePath="/social?tab=0">
        <DataRow label="Ueber Mindestlohn" value={comp.above_minimum_wage_percentage} unit="%" />
        <DataRow label="Tarifbindung" value={s1.engagement ? s1.engagement.collective_agreement_coverage : undefined} unit="%" />
        <DataRow label="Weiterbildungsstunden / MA" value={training.training_hours_per_employee} unit="h" />
      </DisclosureCard>

      <DisclosureCard code="B11" title="Korruption & Bestechung" sourceLabel="Governance > Compliance" sourcePath="/governance?tab=1">
        <DataRow label="Compliance-Verstoesse" value={compliance.compliance_violations} />
        <DataRow label="Bussgelder" value={compliance.fines_paid_eur} unit="EUR" />
        <DataRow label="Korruptionsvorfaelle" value={compliance.corruption_incidents} />
      </DisclosureCard>
    </div>
  );

  // ---- Tab 2: Comprehensive Module ----
  const e1Targets = targets.filter((t) => t.topicCode === 'E1' || (t.topic && t.topic.includes('E1')));
  const e1Risks = iroAssessments.find((a) => a.topic_code === 'E1') || {};
  const s1s2Policies = policies.filter((p) => p.topicCode === 'S1' || p.topicCode === 'S2' || (p.topic && (p.topic.includes('S1') || p.topic.includes('S2'))));

  const renderComprehensiveModule = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
      <DisclosureCard code="C1" title="Geschaeftsmodell" sourceLabel="Unternehmensdaten" sourcePath="/organization">
        <DataRow label="Geschaeftsmodell" value={org.business_model} />
        <DataRow label="Hauptprodukte / Dienstleistungen" value={org.main_products_services} />
        <DataRow label="Zielmaerkte" value={org.target_markets} />
      </DisclosureCard>

      <DisclosureCard code="C2" title="Practices & Initiatives" sourceLabel="Ziele & Massnahmen" sourcePath="/targets">
        <DataRow label="Erfasste Massnahmen" value={actions.length || undefined} />
        <DataRow label="Erfasste Ziele" value={targets.length || undefined} />
      </DisclosureCard>

      <DisclosureCard code="C3" title="THG-Reduktionsziele" sourceLabel="Umwelt > E1 Klimawandel" sourcePath="/environmental?tab=0">
        <DataRow label="Net-Zero-Zieljahr" value={e1.net_zero_target_year} />
        <DataRow label="Klimabezogene Ziele" value={e1Targets.length || undefined} />
        {e1Targets.slice(0, 3).map((t, i) => (
          <DataRow key={i} label={t.title || t.name || `Ziel ${i + 1}`} value={t.target_value || t.description || '—'} />
        ))}
      </DisclosureCard>

      <DisclosureCard code="C4" title="Klimarisiken" sourceLabel="IRO-Bewertung > E1" sourcePath="/iro">
        <DataRow label="Identifizierte Risiken" value={(e1Risks.risks || []).length || undefined} />
        {(e1Risks.risks || []).slice(0, 3).map((r, i) => (
          <DataRow key={i} label={r.name || r.title || `Risiko ${i + 1}`} value={r.description || r.category || '—'} />
        ))}
      </DisclosureCard>

      <DisclosureCard code="C5" title="Zusaetzliche Belegschaftsdaten" sourceLabel="Soziales > S1 Eigene Belegschaft" sourcePath="/social?tab=0">
        <DataRow label="Frauen im Management" value={demo.female_management} />
        <DataRow label="Frauenanteil Management" value={demo.female_management_percentage} unit="%" />
      </DisclosureCard>

      <DisclosureCard code="C6" title="Menschenrechte" sourceLabel="Governance > Compliance" sourcePath="/governance?tab=1">
        <DataRow label="Verhaltenskodex vorhanden" value={compliance.code_of_conduct_exists ? 'Ja' : 'Nein'} />
        <DataRow label="Abdeckung Verhaltenskodex" value={compliance.code_of_conduct_coverage} unit="%" />
        <DataRow label="HR-bezogene Richtlinien" value={s1s2Policies.length || undefined} />
      </DisclosureCard>

      <DisclosureCard code="C7" title="Menschenrechtsvorfaelle" sourceLabel="Soziales > S2 Lieferkette" sourcePath="/social?tab=1">
        <DataRow label="Identifizierte Menschenrechtsprobleme" value={s2.human_rights_issues_identified} />
        <DataRow label="Ergriffene Korrekturmassnahmen" value={s2.corrective_actions_taken} />
      </DisclosureCard>

      <DisclosureCard code="C8" title="Kontroverse Sektoren" sourceLabel="Governance > Kontroverse Sektoren" sourcePath="/governance?tab=5">
        <DataRow label="Relevant" value={controversial.is_relevant ? 'Ja' : 'Nein'} />
        {controversial.is_relevant && (
          <>
            <DataRow label="Fossile Brennstoffe" value={controversial.fossil_fuels ? `Ja (${controversial.fossil_fuels_revenue_pct || 0} %)` : 'Nein'} />
            <DataRow label="Tabak" value={controversial.tobacco ? `Ja (${controversial.tobacco_revenue_pct || 0} %)` : 'Nein'} />
            <DataRow label="Waffen" value={controversial.weapons ? `Ja (${controversial.weapons_revenue_pct || 0} %)` : 'Nein'} />
            <DataRow label="Kontroverse Waffen" value={controversial.controversial_weapons ? 'Ja' : 'Nein'} />
            <DataRow label="Gluecksspiel" value={controversial.gambling ? 'Ja' : 'Nein'} />
            <DataRow label="Kernenergie" value={controversial.nuclear ? 'Ja' : 'Nein'} />
          </>
        )}
      </DisclosureCard>

      <DisclosureCard code="C9" title="Geschlechterquote Gremium" sourceLabel="Governance > Governance-Struktur" sourcePath="/governance?tab=0">
        <DataRow label="Gremiumsgroesse" value={board.board_size} />
        <DataRow label="Weibliche Mitglieder" value={board.female_board_members} />
        <DataRow label="Frauenanteil" value={board.board_size > 0 ? `${Math.round((board.female_board_members || 0) / board.board_size * 100)} %` : undefined} />
      </DisclosureCard>
    </div>
  );

  // ---- Tab 3: Abdeckungsstatus ----
  const coverageItems = [
    { code: 'B1', title: 'Basis for Preparation', fields: [org.name, org.legal_form, org.nace_code, org.employees_fte, org.revenue], path: '/organization' },
    { code: 'B2', title: 'Practices & Policies', fields: [policies.length], path: '/governance?tab=6' },
    { code: 'B3', title: 'Energie & THG', fields: [energy.total_kwh, emissions.scope1_total, emissions.scope2_location_based], path: '/environmental?tab=0' },
    { code: 'B4', title: 'Umweltverschmutzung', fields: [e2.air_pollutants_tonnes, e2.water_pollutants_tonnes], path: '/environmental?tab=1' },
    { code: 'B5', title: 'Biodiversitaet', fields: [e4.total_land_area_ha, e4.operations_near_protected_areas], path: '/environmental?tab=3' },
    { code: 'B6', title: 'Wasser', fields: [e3.total_water_withdrawal_m3, e3.total_water_discharge_m3], path: '/environmental?tab=2' },
    { code: 'B7', title: 'Kreislaufwirtschaft', fields: [e5.total_waste_tonnes, e5.waste_recycled_tonnes], path: '/environmental?tab=4' },
    { code: 'B8', title: 'Belegschaft', fields: [demo.fte, demo.female_employees, demo.male_employees], path: '/social?tab=0' },
    { code: 'B9', title: 'Gesundheit & Sicherheit', fields: [hs.work_accidents, hs.fatal_accidents], path: '/social?tab=0' },
    { code: 'B10', title: 'Verguetung & Weiterbildung', fields: [comp.above_minimum_wage_percentage, training.training_hours_per_employee], path: '/social?tab=0' },
    { code: 'B11', title: 'Korruption & Bestechung', fields: [compliance.compliance_violations, compliance.fines_paid_eur], path: '/governance?tab=1' },
    { code: 'C1', title: 'Geschaeftsmodell', fields: [org.business_model, org.main_products_services, org.target_markets], path: '/organization' },
    { code: 'C2', title: 'Practices & Initiatives', fields: [actions.length, targets.length], path: '/targets' },
    { code: 'C3', title: 'THG-Reduktionsziele', fields: [e1.net_zero_target_year, e1Targets.length], path: '/environmental?tab=0' },
    { code: 'C4', title: 'Klimarisiken', fields: [(e1Risks.risks || []).length], path: '/iro' },
    { code: 'C5', title: 'Zusaetzliche Belegschaftsdaten', fields: [demo.female_management, demo.female_management_percentage], path: '/social?tab=0' },
    { code: 'C6', title: 'Menschenrechte', fields: [compliance.code_of_conduct_exists, compliance.code_of_conduct_coverage], path: '/governance?tab=1' },
    { code: 'C7', title: 'Menschenrechtsvorfaelle', fields: [s2.human_rights_issues_identified, s2.corrective_actions_taken], path: '/social?tab=1' },
    { code: 'C8', title: 'Kontroverse Sektoren', fields: [controversial.is_relevant], path: '/governance?tab=5' },
    { code: 'C9', title: 'Geschlechterquote Gremium', fields: [board.board_size, board.female_board_members], path: '/governance?tab=0' },
  ];

  const renderAbdeckungsstatus = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
      <InfoBox variant="info">
        Diese Uebersicht zeigt den Befuellungsgrad der VSME-Disclosures. Klicken Sie auf eine Zeile, um zur entsprechenden Eingabeseite zu navigieren.
      </InfoBox>
      {coverageItems.map((item) => {
        const status = evaluateCoverage(item.fields);
        return (
          <Card
            key={item.code}
            onClick={() => navigate(item.path)}
            style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
              {coverageDot(status)}
              <span style={{ fontWeight: tokens.typography.fontWeight.semibold, minWidth: 40, color: tokens.colors.text }}>{item.code}</span>
              <span style={{ flex: 1, color: tokens.colors.text }}>{item.title}</span>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: status.color, fontWeight: tokens.typography.fontWeight.semibold }}>{status.label}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );

  // ---- Main ----
  const tabs = [
    { label: 'Basic Module (B1-B11)', content: renderBasicModule() },
    { label: 'Comprehensive (C1-C9)', content: renderComprehensiveModule() },
    { label: 'Abdeckungsstatus', content: renderAbdeckungsstatus() },
  ];

  return (
    <div>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxl,
      }}>
        VSME-Uebersicht
      </h1>

      <InfoBox variant="info" style={{ marginBottom: tokens.spacing.xxl }}>
        Read-only Uebersicht aller erhobenen Daten im VSME-Schema (Voluntary SME Standard). Daten werden auf den jeweiligen Fachseiten erfasst und hier aggregiert dargestellt.
      </InfoBox>

      <TabPanel tabs={tabs} />
    </div>
  );
}
