import React from 'react';
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
import { formatNumber, formatPercent } from '../utils/formatting.js';
import TopicItemsSection from '../components/TopicItemsSection.jsx';

export default function EnvironmentalPage() {
  const { report, updateReport } = useReport();
  const { generating, generateNonRelevanceJustification } = useLLM();

  if (!report) {
    return (
      <PlaceholderBox
        icon="🌍"
        title="Kein Bericht geladen"
        description="Bitte gehen Sie zur Startseite und erstellen oder laden Sie einen Bericht."
      />
    );
  }

  const env = report.environmental || {};
  const e1 = env.e1_climate || {};
  const e2 = env.e2_pollution || {};
  const e3 = env.e3_water || {};
  const e4 = env.e4_biodiversity || {};
  const e5 = env.e5_circular_economy || {};

  const materialCodes = getMaterialTopicCodes(report);
  const isMaterial = (code) => materialCodes.includes(code);

  // --- Update handlers ---
  const handleE1Change = (section, field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.environmental) updated.environmental = {};
    if (!updated.environmental.e1_climate) updated.environmental.e1_climate = {};
    if (section) {
      if (!updated.environmental.e1_climate[section]) updated.environmental.e1_climate[section] = {};
      updated.environmental.e1_climate[section][field] = value;
    } else {
      updated.environmental.e1_climate[field] = value;
    }
    updateReport(updated);
  };

  const handleE2Change = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.environmental) updated.environmental = {};
    if (!updated.environmental.e2_pollution) updated.environmental.e2_pollution = {};
    updated.environmental.e2_pollution[field] = value;
    updateReport(updated);
  };

  const handleE3Change = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.environmental) updated.environmental = {};
    if (!updated.environmental.e3_water) updated.environmental.e3_water = {};
    updated.environmental.e3_water[field] = value;
    updateReport(updated);
  };

  const handleE4Change = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.environmental) updated.environmental = {};
    if (!updated.environmental.e4_biodiversity) updated.environmental.e4_biodiversity = {};
    updated.environmental.e4_biodiversity[field] = value;
    updateReport(updated);
  };

  const handleE5Change = (field, value) => {
    const updated = JSON.parse(JSON.stringify(report));
    if (!updated.environmental) updated.environmental = {};
    if (!updated.environmental.e5_circular_economy) updated.environmental.e5_circular_economy = {};
    updated.environmental.e5_circular_economy[field] = value;
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

  const sectionHeader = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text,
    margin: 0,
    paddingBottom: tokens.spacing.sm,
    borderBottom: `2px solid ${tokens.colors.border}`,
    marginBottom: tokens.spacing.md,
  };

  const metricsRow = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spacing.lg,
  };

  // --- E1 Data ---
  const energy = e1.energy || {};
  const emissions = e1.emissions || {};

  const scope1Total = emissions.scope1_total || 0;
  const scope2Total = emissions.scope2_total || 0;
  const scope3Total = emissions.scope3_total || 0;
  const totalEmissions = scope1Total + scope2Total + scope3Total;

  const renewablePercent = energy.total_kwh
    ? (energy.renewable_kwh || 0) / energy.total_kwh * 100
    : null;

  // --- Sub-tab helper ---
  const renderTopicWithSubTabs = (topicCode, metricsContent) => (
    <TabPanel tabs={[
      { label: 'Metriken', content: metricsContent },
      { label: 'Richtlinien', content: <TopicItemsSection topicCode={topicCode} section="policies" /> },
      { label: 'Ziele', content: <TopicItemsSection topicCode={topicCode} section="targets" /> },
      { label: 'Massnahmen', content: <TopicItemsSection topicCode={topicCode} section="actions" /> },
    ]} />
  );

  // --- E1 Metrics ---
  const renderE1Metrics = () => (
    <div style={sectionGap}>
      <InfoBox type="info">
        ESRS E1 - Klimawandel: Erfassen Sie hier Energieverbrauch, Treibhausgasemissionen und Ihren Transitionsplan.
      </InfoBox>

      {/* Energieverbrauch */}
      <h3 style={sectionHeader}>Energieverbrauch</h3>
      <div style={gridTwo}>
        <FormField
          label="Gesamtenergieverbrauch (kWh)"
          type="number"
          value={energy.total_kwh || 0}
          onChange={(v) => handleE1Change('energy', 'total_kwh', v)}
        />
        <FormField
          label="Erneuerbare Energie (kWh)"
          type="number"
          value={energy.renewable_kwh || 0}
          onChange={(v) => handleE1Change('energy', 'renewable_kwh', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Strom (kWh)"
          type="number"
          value={energy.electricity_kwh || 0}
          onChange={(v) => handleE1Change('energy', 'electricity_kwh', v)}
        />
        <FormField
          label="Erdgas (kWh)"
          type="number"
          value={energy.natural_gas_kwh || 0}
          onChange={(v) => handleE1Change('energy', 'natural_gas_kwh', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Heizöl (kWh)"
          type="number"
          value={energy.heating_oil_kwh || 0}
          onChange={(v) => handleE1Change('energy', 'heating_oil_kwh', v)}
        />
        <FormField
          label="Fernwärme (kWh)"
          type="number"
          value={energy.district_heating_kwh || 0}
          onChange={(v) => handleE1Change('energy', 'district_heating_kwh', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Solar (kWh)"
          type="number"
          value={energy.solar_kwh || 0}
          onChange={(v) => handleE1Change('energy', 'solar_kwh', v)}
        />
        <FormField
          label="Sonstige (kWh)"
          type="number"
          value={energy.other_kwh || 0}
          onChange={(v) => handleE1Change('energy', 'other_kwh', v)}
        />
      </div>
      <MetricCard
        label="Anteil erneuerbarer Energie"
        value={renewablePercent != null ? formatPercent(renewablePercent) : '-'}
        icon="♻️"
      />

      {/* Scope 1 */}
      <h3 style={sectionHeader}>Scope 1 - Direkte Emissionen</h3>
      <div style={gridTwo}>
        <FormField
          label="Scope 1 Gesamt (t CO2e)"
          type="number"
          value={emissions.scope1_total || 0}
          onChange={(v) => handleE1Change('emissions', 'scope1_total', v)}
        />
        <FormField
          label="Stationäre Verbrennung (t CO2e)"
          type="number"
          value={emissions.scope1_stationary || 0}
          onChange={(v) => handleE1Change('emissions', 'scope1_stationary', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Mobile Verbrennung (t CO2e)"
          type="number"
          value={emissions.scope1_mobile || 0}
          onChange={(v) => handleE1Change('emissions', 'scope1_mobile', v)}
        />
        <FormField
          label="Flüchtige Emissionen (t CO2e)"
          type="number"
          value={emissions.scope1_fugitive || 0}
          onChange={(v) => handleE1Change('emissions', 'scope1_fugitive', v)}
        />
      </div>

      {/* Scope 2 */}
      <h3 style={sectionHeader}>Scope 2 - Indirekte Emissionen (Energie)</h3>
      <div style={gridTwo}>
        <FormField
          label="Scope 2 Gesamt (t CO2e)"
          type="number"
          value={emissions.scope2_total || 0}
          onChange={(v) => handleE1Change('emissions', 'scope2_total', v)}
        />
        <FormField
          label="Standortbasiert (t CO2e)"
          type="number"
          value={emissions.scope2_location_based || 0}
          onChange={(v) => handleE1Change('emissions', 'scope2_location_based', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Marktbasiert (t CO2e)"
          type="number"
          value={emissions.scope2_market_based || 0}
          onChange={(v) => handleE1Change('emissions', 'scope2_market_based', v)}
        />
        <div />
      </div>

      {/* Scope 3 */}
      <h3 style={sectionHeader}>Scope 3 - Sonstige indirekte Emissionen</h3>
      <div style={gridTwo}>
        <FormField
          label="Scope 3 Gesamt (t CO2e)"
          type="number"
          value={emissions.scope3_total || 0}
          onChange={(v) => handleE1Change('emissions', 'scope3_total', v)}
        />
        <FormField
          label="Kat. 1 - Eingekaufte Güter (t CO2e)"
          type="number"
          value={emissions.scope3_purchased_goods || 0}
          onChange={(v) => handleE1Change('emissions', 'scope3_purchased_goods', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Kat. 2 - Kapitalgüter (t CO2e)"
          type="number"
          value={emissions.scope3_capital_goods || 0}
          onChange={(v) => handleE1Change('emissions', 'scope3_capital_goods', v)}
        />
        <FormField
          label="Kat. 3 - Brennstoff-/Energie (t CO2e)"
          type="number"
          value={emissions.scope3_fuel_energy || 0}
          onChange={(v) => handleE1Change('emissions', 'scope3_fuel_energy', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Kat. 4 - Vorgelagerter Transport (t CO2e)"
          type="number"
          value={emissions.scope3_upstream_transport || 0}
          onChange={(v) => handleE1Change('emissions', 'scope3_upstream_transport', v)}
        />
        <FormField
          label="Kat. 5 - Abfall (t CO2e)"
          type="number"
          value={emissions.scope3_waste || 0}
          onChange={(v) => handleE1Change('emissions', 'scope3_waste', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Kat. 6 - Geschäftsreisen (t CO2e)"
          type="number"
          value={emissions.scope3_business_travel || 0}
          onChange={(v) => handleE1Change('emissions', 'scope3_business_travel', v)}
        />
        <FormField
          label="Kat. 7 - Pendeln der Mitarbeiter (t CO2e)"
          type="number"
          value={emissions.scope3_commuting || 0}
          onChange={(v) => handleE1Change('emissions', 'scope3_commuting', v)}
        />
      </div>

      {/* Zusammenfassung */}
      <h3 style={sectionHeader}>Zusammenfassung</h3>
      <div style={metricsRow}>
        <MetricCard
          label="Scope 1"
          value={formatNumber(scope1Total)}
          unit="t CO2e"
          icon="🏭"
        />
        <MetricCard
          label="Scope 2"
          value={formatNumber(scope2Total)}
          unit="t CO2e"
          icon="⚡"
        />
        <MetricCard
          label="Scope 3"
          value={formatNumber(scope3Total)}
          unit="t CO2e"
          icon="🔗"
        />
        <MetricCard
          label="Gesamt"
          value={formatNumber(totalEmissions)}
          unit="t CO2e"
          icon="🌍"
        />
      </div>

      {/* Intensitätskennzahlen */}
      <h3 style={sectionHeader}>Intensitätskennzahlen</h3>
      <div style={gridTwo}>
        <FormField
          label="Emissionen pro Umsatz (t CO2e / Mio. EUR)"
          type="number"
          value={e1.emissions_per_revenue || 0}
          onChange={(v) => handleE1Change(null, 'emissions_per_revenue', v)}
        />
        <FormField
          label="Emissionen pro Mitarbeiter (t CO2e / MA)"
          type="number"
          value={e1.emissions_per_employee || 0}
          onChange={(v) => handleE1Change(null, 'emissions_per_employee', v)}
        />
      </div>
      <div style={gridTwo}>
        <FormField
          label="Energieverbrauch pro Umsatz (kWh / Mio. EUR)"
          type="number"
          value={e1.energy_per_revenue || 0}
          onChange={(v) => handleE1Change(null, 'energy_per_revenue', v)}
        />
        <div />
      </div>

      {/* Transitionsplan */}
      <h3 style={sectionHeader}>Transitionsplan</h3>
      <FormField
        label="Transitionsplan vorhanden"
        type="checkbox"
        value={e1.has_transition_plan || false}
        onChange={(v) => handleE1Change(null, 'has_transition_plan', v)}
      />
      {e1.has_transition_plan && (
        <div style={sectionGap}>
          <FormField
            label="Beschreibung des Transitionsplans"
            type="textarea"
            value={e1.transition_plan_description || ''}
            onChange={(v) => handleE1Change(null, 'transition_plan_description', v)}
            rows={5}
          />
          <FormField
            label="Netto-Null-Zieljahr"
            type="number"
            value={e1.net_zero_target_year || 2050}
            onChange={(v) => handleE1Change(null, 'net_zero_target_year', v)}
            min={2025}
            max={2100}
          />
        </div>
      )}

      {/* Methodik */}
      <h3 style={sectionHeader}>Methodik</h3>
      <FormField
        label="Berechnungsmethodik"
        type="textarea"
        value={e1.methodology || ''}
        onChange={(v) => handleE1Change(null, 'methodology', v)}
        rows={4}
      />
      <FormField
        label="Basisjahr"
        type="number"
        value={e1.base_year || 2020}
        onChange={(v) => handleE1Change(null, 'base_year', v)}
        min={2015}
        max={2025}
      />
    </div>
  );

  const renderE1 = () => renderTopicWithSubTabs('E1', renderE1Metrics());

  // --- E2-E5 helper ---
  const renderRelevanceSection = (data, handleChange, label, renderFields, topicCode, topicName) => (
    <div style={sectionGap}>
      <div>
        <FormField
          label="Thema ist wesentlich / relevant"
          type="checkbox"
          value={data.is_relevant || false}
          onChange={(v) => handleChange('is_relevant', v)}
        />
        {!data.is_relevant && (
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.textLight, fontStyle: 'italic', marginLeft: tokens.spacing.sm }}>
            Nicht wesentlich — alle Angaben freiwillig
          </span>
        )}
      </div>
      {!data.is_relevant && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.xs }}>
            <label style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.textSecondary }}>
              Begruendung der Nicht-Wesentlichkeit
            </label>
            <Button variant="ai" size="sm" disabled={generating} onClick={async () => {
              const text = await generateNonRelevanceJustification(topicCode, topicName, report.organization?.name, report.organization?.industry_sector);
              handleChange('relevance_justification', text);
            }}>
              {generating ? 'Generiere...' : 'KI-Begruendung'}
            </Button>
          </div>
          <FormField
            type="textarea"
            value={data.relevance_justification || ''}
            onChange={(v) => handleChange('relevance_justification', v)}
            rows={4}
          />
        </div>
      )}
      {renderFields()}
    </div>
  );

  // --- E2 Metrics ---
  const renderE2Metrics = () =>
    renderRelevanceSection(e2, handleE2Change, 'ESRS E2 - Umweltverschmutzung', () => (
      <div style={sectionGap}>
        <div style={gridTwo}>
          <FormField
            label="Luftschadstoffe (Tonnen)"
            type="number"
            value={e2.air_pollutants_tonnes || 0}
            onChange={(v) => handleE2Change('air_pollutants_tonnes', v)}
          />
          <FormField
            label="Wasserschadstoffe (Tonnen)"
            type="number"
            value={e2.water_pollutants_tonnes || 0}
            onChange={(v) => handleE2Change('water_pollutants_tonnes', v)}
          />
        </div>
        <div style={gridTwo}>
          <FormField
            label="Bodenkontaminationsvorfälle"
            type="number"
            value={e2.soil_contamination_incidents || 0}
            onChange={(v) => handleE2Change('soil_contamination_incidents', v)}
          />
          <div />
        </div>
        <FormField
          label="Maßnahmen zur Vermeidung von Umweltverschmutzung"
          type="textarea"
          value={e2.pollution_prevention_measures || ''}
          onChange={(v) => handleE2Change('pollution_prevention_measures', v)}
          rows={4}
        />
      </div>
    ), 'E2', 'Umweltverschmutzung');

  const renderE2 = () => renderTopicWithSubTabs('E2', renderE2Metrics());

  // --- E3 Metrics ---
  const renderE3Metrics = () =>
    renderRelevanceSection(e3, handleE3Change, 'ESRS E3 - Wasser- und Meeresressourcen', () => (
      <div style={sectionGap}>
        <div style={gridTwo}>
          <FormField
            label="Gesamtwasserentnahme (m³)"
            type="number"
            value={e3.total_water_withdrawal_m3 || 0}
            onChange={(v) => handleE3Change('total_water_withdrawal_m3', v)}
          />
          <FormField
            label="Wasser aus kommunaler Versorgung (m³)"
            type="number"
            value={e3.water_from_municipal || 0}
            onChange={(v) => handleE3Change('water_from_municipal', v)}
          />
        </div>
        <div style={gridTwo}>
          <FormField
            label="Gesamtwassereinleitung (m³)"
            type="number"
            value={e3.total_water_discharge_m3 || 0}
            onChange={(v) => handleE3Change('total_water_discharge_m3', v)}
          />
          <FormField
            label="Recyceltes Wasser (m³)"
            type="number"
            value={e3.water_recycled_m3 || 0}
            onChange={(v) => handleE3Change('water_recycled_m3', v)}
          />
        </div>
        <FormField
          label="Betriebe in Wasserstressgebieten"
          type="number"
          value={e3.operations_in_water_stress_areas || 0}
          onChange={(v) => handleE3Change('operations_in_water_stress_areas', v)}
        />
      </div>
    ), 'E3', 'Wasser- und Meeresressourcen');

  const renderE3 = () => renderTopicWithSubTabs('E3', renderE3Metrics());

  // --- E4 Metrics ---
  const renderE4Metrics = () =>
    renderRelevanceSection(e4, handleE4Change, 'ESRS E4 - Biologische Vielfalt und Ökosysteme', () => (
      <div style={sectionGap}>
        <div style={gridTwo}>
          <FormField
            label="Gesamtfläche (ha)"
            type="number"
            value={e4.total_land_area_ha || 0}
            onChange={(v) => handleE4Change('total_land_area_ha', v)}
          />
          <FormField
            label="Versiegelte Fläche (ha)"
            type="number"
            value={e4.sealed_land_area_ha || 0}
            onChange={(v) => handleE4Change('sealed_land_area_ha', v)}
          />
        </div>
        <FormField
          label="Betriebe in der Nähe von Schutzgebieten"
          type="number"
          value={e4.operations_near_protected_areas || 0}
          onChange={(v) => handleE4Change('operations_near_protected_areas', v)}
        />
        <FormField
          label="Maßnahmen zum Schutz der Biodiversität"
          type="textarea"
          value={e4.biodiversity_measures || ''}
          onChange={(v) => handleE4Change('biodiversity_measures', v)}
          rows={4}
        />
      </div>
    ), 'E4', 'Biodiversität und Ökosysteme');

  const renderE4 = () => renderTopicWithSubTabs('E4', renderE4Metrics());

  // --- E5 Metrics ---
  const renderE5Metrics = () =>
    renderRelevanceSection(e5, handleE5Change, 'ESRS E5 - Kreislaufwirtschaft', () => (
      <div style={sectionGap}>
        <div style={gridTwo}>
          <FormField
            label="Gesamtabfall (Tonnen)"
            type="number"
            value={e5.total_waste_tonnes || 0}
            onChange={(v) => handleE5Change('total_waste_tonnes', v)}
          />
          <FormField
            label="Gefährlicher Abfall (Tonnen)"
            type="number"
            value={e5.hazardous_waste_tonnes || 0}
            onChange={(v) => handleE5Change('hazardous_waste_tonnes', v)}
          />
        </div>
        <div style={gridTwo}>
          <FormField
            label="Recycelter Abfall (Tonnen)"
            type="number"
            value={e5.waste_recycled_tonnes || 0}
            onChange={(v) => handleE5Change('waste_recycled_tonnes', v)}
          />
          <FormField
            label="Deponie-Abfall (Tonnen)"
            type="number"
            value={e5.waste_landfill_tonnes || 0}
            onChange={(v) => handleE5Change('waste_landfill_tonnes', v)}
          />
        </div>
        <FormField
          label="Hardware-Recycling-Programm vorhanden"
          type="checkbox"
          value={e5.hardware_recycling_program || false}
          onChange={(v) => handleE5Change('hardware_recycling_program', v)}
        />
        <div style={gridTwo}>
          <FormField
            label="Recycelte Hardware (Einheiten)"
            type="number"
            value={e5.hardware_recycled_units || 0}
            onChange={(v) => handleE5Change('hardware_recycled_units', v)}
          />
          <FormField
            label="Aufbereitete Hardware (Einheiten)"
            type="number"
            value={e5.hardware_refurbished_units || 0}
            onChange={(v) => handleE5Change('hardware_refurbished_units', v)}
          />
        </div>
        <FormField
          label="Elektroschrott (Tonnen)"
          type="number"
          value={e5.e_waste_tonnes || 0}
          onChange={(v) => handleE5Change('e_waste_tonnes', v)}
        />
      </div>
    ), 'E5', 'Kreislaufwirtschaft');

  const renderE5 = () => renderTopicWithSubTabs('E5', renderE5Metrics());

  // --- Tab configuration ---
  const tabLabel = (code, name) => {
    const material = isMaterial(code);
    return `${code} - ${name} ${material ? '\u2705' : '\u2B1C'}`;
  };

  const tabs = [
    { label: tabLabel('E1', 'Klimawandel'), content: renderE1() },
    { label: tabLabel('E2', 'Umweltverschmutzung'), content: renderE2() },
    { label: tabLabel('E3', 'Wasser'), content: renderE3() },
    { label: tabLabel('E4', 'Biodiversität'), content: renderE4() },
    { label: tabLabel('E5', 'Kreislaufwirtschaft'), content: renderE5() },
  ];

  return (
    <div>
      <h1 style={{
        fontSize: tokens.typography.fontSize.xxxl,
        fontWeight: tokens.typography.fontWeight.bold,
        color: tokens.colors.text,
        marginBottom: tokens.spacing.xxl,
      }}>
        Umwelt (Environmental)
      </h1>

      <SectionStatusBar route="/environmental" />

      <InfoBox type="info" style={{ marginBottom: tokens.spacing.xxl }}>
        Erfassen Sie hier die Umweltkennzahlen Ihres Unternehmens gemäß ESRS E1-E5. Wesentliche Themen sind mit einem Häkchen markiert.
      </InfoBox>

      <TabPanel tabs={tabs} />
    </div>
  );
}
