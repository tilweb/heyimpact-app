import React, { useState } from 'react';
import { useReport } from '../hooks/useReport.js';
import { useLLM } from '../hooks/useLLM.js';
import tokens from '../theme/tokens.js';
import TabPanel from '../components/ui/TabPanel.jsx';
import FormField from '../components/ui/FormField.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import InfoBox from '../components/ui/InfoBox.jsx';
import PlaceholderBox from '../components/ui/PlaceholderBox.jsx';
import SectionStatusBar from '../components/ui/SectionStatusBar.jsx';
import { NACE_OPTIONS, findNaceOptionByCode, getNaceCodeFromSelection } from '../utils/nace.js';

const TAB_LABELS = [
  'Basisdaten',
  'Standorte',
  'Zertifizierungen',
  'Geschäftsmodell',
  'Berichte',
  'Kontakt',
  'Berichtsrahmen',
];

const REPORTING_FRAMEWORK_OPTIONS = [
  '',
  'ESRS (freiwillig)',
  'ESRS (verpflichtend)',
  'GRI',
  'DNK',
  'Sonstige',
];

const EXTERNAL_ASSURANCE_OPTIONS = [
  'Keine',
  'Limited Assurance',
  'Reasonable Assurance',
];

export default function OrganizationPage() {
  const { report, updateReport } = useReport();
  const { generating, generateManagementReport, generateESGManagementSystem } = useLLM();
  const [activeTab, setActiveTab] = useState(0);

  if (!report) {
    return (
      <PlaceholderBox
        icon="🏢"
        title="Kein Bericht geladen"
        description="Bitte gehen Sie zur Startseite und erstellen oder laden Sie einen Bericht."
      />
    );
  }

  const org = report.organization || {};

  const handleChange = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.organization) updated.organization = {};
    updated.organization[field] = value;
    updateReport(updated);
  };

  // --- Locations ---
  const locations = org.locations || [];

  const handleLocationChange = (index, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.organization.locations[index][field] = value;
    updateReport(updated);
  };

  const addLocation = () => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.organization.locations) updated.organization.locations = [];
    updated.organization.locations.push({
      name: '',
      city: '',
      country: 'Deutschland',
      employees: 0,
      description: '',
    });
    updateReport(updated);
  };

  const deleteLocation = (index) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.organization.locations.splice(index, 1);
    updateReport(updated);
  };

  // --- Certifications ---
  const certifications = org.certifications || [];

  const handleCertificationChange = (index, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.organization.certifications[index][field] = value;
    updateReport(updated);
  };

  const addCertification = () => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.organization.certifications) updated.organization.certifications = [];
    updated.organization.certifications.push({
      name: '',
      issuer: '',
      valid_until: '',
      scope: '',
    });
    updateReport(updated);
  };

  const deleteCertification = (index) => {
    const updated = JSON.parse(JSON.stringify(report));
    updated.organization.certifications.splice(index, 1);
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

  // --- Tab renderers ---
  const renderBasisdaten = () => (
    <div style={sectionGap}>
      <div style={gridTwo}>
        <FormField
          label="Unternehmensname"
          value={org.name || ''}
          onChange={(v) => handleChange('name', v)}
          required
        />
        <FormField
          label="Rechtsform"
          value={org.legal_form || ''}
          onChange={(v) => handleChange('legal_form', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Branche"
          value={org.industry_sector || ''}
          onChange={(v) => handleChange('industry_sector', v)}
        />
        <FormField
          label="Registernummer"
          value={org.registration_number || ''}
          onChange={(v) => handleChange('registration_number', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="NACE-Code"
          type="select"
          value={findNaceOptionByCode(org.nace_code)}
          onChange={(v) => handleChange('nace_code', getNaceCodeFromSelection(v))}
          options={NACE_OPTIONS}
        />
        <FormField
          label="Geschäftsjahr"
          type="number"
          value={org.fiscal_year || 2025}
          onChange={(v) => handleChange('fiscal_year', v)}
          min={2020}
          max={2030}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Berichtszeitraum Beginn"
          value={org.reporting_period_start || ''}
          onChange={(v) => handleChange('reporting_period_start', v)}
        />
        <FormField
          label="Berichtszeitraum Ende"
          value={org.reporting_period_end || ''}
          onChange={(v) => handleChange('reporting_period_end', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Umsatz in Mio. EUR"
          type="number"
          value={org.revenue || ''}
          onChange={(v) => handleChange('revenue', v)}
        />
        <div />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Mitarbeiter gesamt"
          type="number"
          value={org.employees_total || ''}
          onChange={(v) => handleChange('employees_total', v)}
        />
        <FormField
          label="Mitarbeiter FTE"
          type="number"
          value={org.employees_fte || ''}
          onChange={(v) => handleChange('employees_fte', v)}
        />
      </div>
    </div>
  );

  const renderStandorte = () => (
    <div style={sectionGap}>
      <FormField
        label="Hauptsitz"
        value={org.headquarters || ''}
        onChange={(v) => handleChange('headquarters', v)}
      />

      {locations.map((loc, i) => (
        <Card key={i} padding={tokens.spacing.xl}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.lg }}>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, margin: 0 }}>
              Standort {i + 1}
            </h3>
            <Button variant="danger" onClick={() => deleteLocation(i)} icon="🗑️">
              Löschen
            </Button>
          </div>
          <div style={gridTwo}>
            <FormField
              label="Name"
              value={loc.name || ''}
              onChange={(v) => handleLocationChange(i, 'name', v)}
            />
            <FormField
              label="Stadt"
              value={loc.city || ''}
              onChange={(v) => handleLocationChange(i, 'city', v)}
            />
          </div>
          <div style={{ ...gridTwo, marginTop: tokens.spacing.lg }}>
            <FormField
              label="Land"
              value={loc.country || ''}
              onChange={(v) => handleLocationChange(i, 'country', v)}
            />
            <FormField
              label="Mitarbeiter"
              type="number"
              value={loc.employees || 0}
              onChange={(v) => handleLocationChange(i, 'employees', v)}
            />
          </div>
          <div style={{ marginTop: tokens.spacing.lg }}>
            <FormField
              label="Beschreibung"
              type="textarea"
              value={loc.description || ''}
              onChange={(v) => handleLocationChange(i, 'description', v)}
              rows={3}
            />
          </div>
        </Card>
      ))}

      <Button onClick={addLocation} variant="secondary" icon="➕">
        Standort hinzufügen
      </Button>
    </div>
  );

  const renderZertifizierungen = () => (
    <div style={sectionGap}>
      {certifications.map((cert, i) => (
        <Card key={i} padding={tokens.spacing.xl}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.lg }}>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text, margin: 0 }}>
              Zertifizierung {i + 1}
            </h3>
            <Button variant="danger" onClick={() => deleteCertification(i)} icon="🗑️">
              Löschen
            </Button>
          </div>
          <div style={gridTwo}>
            <FormField
              label="Name"
              value={cert.name || ''}
              onChange={(v) => handleCertificationChange(i, 'name', v)}
            />
            <FormField
              label="Aussteller"
              value={cert.issuer || ''}
              onChange={(v) => handleCertificationChange(i, 'issuer', v)}
            />
          </div>
          <div style={{ ...gridTwo, marginTop: tokens.spacing.lg }}>
            <FormField
              label="Gültig bis"
              value={cert.valid_until || ''}
              onChange={(v) => handleCertificationChange(i, 'valid_until', v)}
            />
            <FormField
              label="Geltungsbereich"
              value={cert.scope || ''}
              onChange={(v) => handleCertificationChange(i, 'scope', v)}
            />
          </div>
        </Card>
      ))}

      <Button onClick={addCertification} variant="secondary" icon="➕">
        Zertifizierung hinzufügen
      </Button>
    </div>
  );

  const renderGeschaeftsmodell = () => (
    <div style={sectionGap}>
      <FormField
        label="Geschäftsmodell"
        type="textarea"
        value={org.business_model || ''}
        onChange={(v) => handleChange('business_model', v)}
        rows={5}
      />
      <FormField
        label="Hauptprodukte / Dienstleistungen"
        type="textarea"
        value={org.main_products_services || ''}
        onChange={(v) => handleChange('main_products_services', v)}
        rows={3}
      />
      <FormField
        label="Zielmärkte"
        type="textarea"
        value={org.target_markets || ''}
        onChange={(v) => handleChange('target_markets', v)}
        rows={3}
      />
      <FormField
        label="Beschreibung der Wertschöpfungskette"
        type="textarea"
        value={org.value_chain_description || ''}
        onChange={(v) => handleChange('value_chain_description', v)}
        rows={4}
      />
    </div>
  );

  const renderBerichte = () => (
    <div style={sectionGap}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
          <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
            Lagebericht Nachhaltigkeit
          </label>
          <Button variant="ai" size="sm" disabled={generating} onClick={async () => {
            const text = await generateManagementReport(report);
            handleChange('management_report', text);
          }}>
            {generating ? 'Generiere...' : 'KI-Entwurf erstellen'}
          </Button>
        </div>
        <FormField
          type="textarea"
          value={org.management_report || ''}
          onChange={(v) => handleChange('management_report', v)}
          rows={8}
          placeholder="Lagebericht zur Nachhaltigkeit..."
        />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
          <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
            ESG-Managementsystem
          </label>
          <Button variant="ai" size="sm" disabled={generating} onClick={async () => {
            const text = await generateESGManagementSystem(report);
            handleChange('esg_management_system', text);
          }}>
            {generating ? 'Generiere...' : 'KI-Entwurf erstellen'}
          </Button>
        </div>
        <FormField
          type="textarea"
          value={org.esg_management_system || ''}
          onChange={(v) => handleChange('esg_management_system', v)}
          rows={8}
          placeholder="Beschreibung des ESG-Managementsystems..."
        />
      </div>
    </div>
  );

  const renderKontakt = () => (
    <div style={sectionGap}>
      <FormField
        label="Nachhaltigkeitsbeauftragte/r"
        value={org.sustainability_contact || ''}
        onChange={(v) => handleChange('sustainability_contact', v)}
      />
      <FormField
        label="E-Mail Nachhaltigkeit"
        value={org.sustainability_email || ''}
        onChange={(v) => handleChange('sustainability_email', v)}
      />
    </div>
  );

  const renderBerichtsrahmen = () => (
    <div style={sectionGap}>
      <div style={gridTwo}>
        <FormField
          label="Berichtsrahmen"
          type="select"
          value={org.reporting_framework || ''}
          onChange={(v) => handleChange('reporting_framework', v)}
          options={REPORTING_FRAMEWORK_OPTIONS}
        />
        <div />
      </div>
      <FormField
        label="Berichtsumfang"
        type="textarea"
        value={org.reporting_scope || ''}
        onChange={(v) => handleChange('reporting_scope', v)}
        rows={3}
      />
      <FormField
        label="Tochtergesellschaften einbezogen"
        type="checkbox"
        value={org.subsidiaries_included || false}
        onChange={(v) => handleChange('subsidiaries_included', v)}
      />
      <FormField
        label="Konsolidierungskreis"
        type="textarea"
        value={org.consolidation_scope || ''}
        onChange={(v) => handleChange('consolidation_scope', v)}
        rows={3}
      />
      {org.subsidiaries_included && (
        <FormField
          label="Beschreibung der Tochtergesellschaften"
          type="textarea"
          value={org.subsidiaries_description || ''}
          onChange={(v) => handleChange('subsidiaries_description', v)}
          rows={3}
        />
      )}
      <FormField
        label="Wesentliche Auslassungen"
        type="textarea"
        value={org.material_omissions || ''}
        onChange={(v) => handleChange('material_omissions', v)}
        rows={3}
      />
      <FormField
        label="Schätzungen & Unsicherheiten"
        type="textarea"
        value={org.estimates_uncertainties || ''}
        onChange={(v) => handleChange('estimates_uncertainties', v)}
        rows={3}
      />
      <FormField
        label="Übergangsregelungen"
        type="textarea"
        value={org.transition_provisions || ''}
        onChange={(v) => handleChange('transition_provisions', v)}
        rows={3}
      />
      <div style={gridTwo}>
        <FormField
          label="Externe Prüfung"
          type="select"
          value={org.external_assurance || 'Keine'}
          onChange={(v) => handleChange('external_assurance', v)}
          options={EXTERNAL_ASSURANCE_OPTIONS}
        />
        {org.external_assurance && org.external_assurance !== 'Keine' && (
          <FormField
            label="Prüfungsanbieter"
            value={org.assurance_provider || ''}
            onChange={(v) => handleChange('assurance_provider', v)}
          />
        )}
      </div>
    </div>
  );

  const tabContent = [
    renderBasisdaten,
    renderStandorte,
    renderZertifizierungen,
    renderGeschaeftsmodell,
    renderBerichte,
    renderKontakt,
    renderBerichtsrahmen,
  ];

  return (
    <div>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxl,
      }}>
        Organisation
      </h1>

      <SectionStatusBar route="/organization" />

      <InfoBox type="info" style={{ marginBottom: tokens.spacing.xxl }}>
        Erfassen Sie hier die grundlegenden Informationen zu Ihrem Unternehmen. Diese Daten bilden die Basis für den ESRS-Bericht.
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
