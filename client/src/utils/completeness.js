import { getMaterialTopicCodes } from './scoring.js';

/**
 * Returns data-fill status for a single ESRS topic.
 * 'full'    = key metrics are present
 * 'partial' = some data or justification, but not complete
 * 'empty'   = nothing entered yet
 */
export function getTopicDataStatus(report, code) {
  if (!report) return 'empty';
  const env = report.environmental || {};
  const soc = report.social || {};
  const gov = report.governance || {};

  switch (code) {
    case 'E1': {
      const energy = env.e1_climate?.energy || {};
      const emissions = env.e1_climate?.emissions || {};
      if ((energy.total_kwh || 0) > 0 || (emissions.scope1_total || 0) > 0) return 'full';
      const anyEnergy = Object.values(energy).some(v => typeof v === 'number' && v > 0);
      const anyEmission = Object.values(emissions).some(v => typeof v === 'number' && v > 0);
      return anyEnergy || anyEmission ? 'partial' : 'empty';
    }
    case 'E2': {
      const e2 = env.e2_pollution || {};
      if (e2.air_pollutants_tonnes > 0 || e2.water_pollutants_tonnes > 0) return 'full';
      if (e2.relevance_justification?.length > 10) return 'partial';
      return 'empty';
    }
    case 'E3': {
      const e3 = env.e3_water || {};
      if ((e3.total_water_withdrawal_m3 || 0) > 0) return 'full';
      if (e3.relevance_justification?.length > 10) return 'partial';
      return 'empty';
    }
    case 'E4': {
      const e4 = env.e4_biodiversity || {};
      if ((e4.total_land_area_ha || 0) > 0 || e4.biodiversity_measures?.length > 10) return 'full';
      if (e4.relevance_justification?.length > 10) return 'partial';
      return 'empty';
    }
    case 'E5': {
      const e5 = env.e5_circular_economy || {};
      if ((e5.total_waste_tonnes || 0) > 0 || (e5.total_material_input_tonnes || 0) > 0) return 'full';
      if (e5.relevance_justification?.length > 10) return 'partial';
      return 'empty';
    }
    case 'S1': {
      const dem = soc.s1_own_workforce?.demographics || {};
      if ((dem.total_employees || 0) > 0) return 'full';
      const anyDem = Object.values(dem).some(v => typeof v === 'number' && v > 0);
      return anyDem ? 'partial' : 'empty';
    }
    case 'S2': {
      const s2 = soc.s2_supply_chain || {};
      if ((s2.total_suppliers || 0) > 0) return 'full';
      if (s2.relevance_justification?.length > 10 || s2.supplier_code_of_conduct?.length > 10) return 'partial';
      return 'empty';
    }
    case 'S3': {
      const s3 = soc.s3_affected_communities || {};
      if ((s3.community_investment_eur || 0) > 0 || s3.community_engagement_activities?.length > 10) return 'full';
      if (s3.relevance_justification?.length > 10) return 'partial';
      return 'empty';
    }
    case 'S4': {
      const s4 = soc.s4_consumers || {};
      if (s4.security_certifications?.length > 0 || (s4.customer_complaints || 0) > 0) return 'full';
      if (s4.relevance_justification?.length > 10 || s4.data_privacy_policy?.length > 10) return 'partial';
      return 'empty';
    }
    case 'G1': {
      const board = gov.g1_business_conduct?.board || {};
      const compliance = gov.g1_business_conduct?.compliance || {};
      if ((board.board_size || 0) > 0) return 'full';
      if (compliance.code_of_conduct_exists) return 'partial';
      return 'empty';
    }
    default: return 'empty';
  }
}

/**
 * Returns coverage info for a single ESRS topic.
 * { data: 'full'|'partial'|'empty', policy: bool, target: bool, action: bool }
 */
export function getTopicCoverage(report, code) {
  if (!report) return { data: 'empty', policy: 0, target: 0, action: 0 };
  return {
    data: getTopicDataStatus(report, code),
    policy: (report.policies || []).filter(p => p.topic === code).length,
    target: (report.targets || []).filter(t => t.topic === code).length,
    action: (report.actions || []).filter(a => a.topic === code).length,
  };
}

/**
 * Returns completion percentage (0–100) for a given route/section.
 */
export function getSectionCompletion(report, route) {
  if (!report) return 0;

  switch (route) {
    case '/organization': {
      const org = report.organization || {};
      const checks = [
        !!org.name,
        !!org.legal_form,
        !!org.nace_code,
        (org.revenue || 0) > 0,
        (org.employees_total || 0) > 0,
        !!org.business_model,
        !!org.main_products_services,
        (org.locations || []).length > 0,
      ];
      return Math.round(checks.filter(Boolean).length / checks.length * 100);
    }
    case '/iro': {
      const assessments = report.iro_summary?.assessments || [];
      if (assessments.length === 0) return 0;
      const assessed = assessments.filter(a =>
        (a.impacts || []).length > 0 || (a.risks || []).length > 0 || (a.opportunities || []).length > 0
      ).length;
      return Math.round(assessed / assessments.length * 100);
    }
    case '/materiality': {
      const materialCodes = getMaterialTopicCodes(report);
      if (materialCodes.length === 0) return 0;
      const topics = report.materiality?.topics || [];
      const withDescriptions = topics.filter(t => {
        const code = t.topic?.split(' - ')[0]?.trim();
        return materialCodes.includes(code) && t.impact_description && t.financial_description;
      }).length;
      return Math.round(withDescriptions / materialCodes.length * 100);
    }
    case '/environmental': {
      const env = report.environmental || {};
      const e1 = env.e1_climate || {};
      const checks = [
        (e1.energy?.total_kwh || 0) > 0,
        (e1.emissions?.scope1_total || 0) > 0,
        (e1.emissions?.scope2_total || 0) > 0,
        e1.has_transition_plan !== undefined,
        ['E2', 'E3', 'E4', 'E5'].every(c => getTopicDataStatus(report, c) !== 'empty'),
      ];
      return Math.round(checks.filter(Boolean).length / checks.length * 100);
    }
    case '/social': {
      const s1 = report.social?.s1_own_workforce || {};
      const dem = s1.demographics || {};
      const checks = [
        (dem.total_employees || 0) > 0,
        (dem.female_employees || 0) > 0,
        (s1.health_safety?.work_accidents !== undefined),
        (s1.training?.training_hours_per_employee || 0) > 0,
        (s1.compensation?.gender_pay_gap_percentage !== undefined),
        ['S2', 'S3', 'S4'].every(c => getTopicDataStatus(report, c) !== 'empty'),
      ];
      return Math.round(checks.filter(Boolean).length / checks.length * 100);
    }
    case '/governance': {
      const g1 = report.governance?.g1_business_conduct || {};
      const board = g1.board || {};
      const compliance = g1.compliance || {};
      const checks = [
        (board.board_size || 0) > 0,
        (board.female_board_members || 0) >= 0 && (board.board_size || 0) > 0,
        compliance.code_of_conduct_exists !== undefined,
        g1.whistleblower !== undefined,
        g1.data_security !== undefined,
      ];
      return Math.round(checks.filter(Boolean).length / checks.length * 100);
    }
    case '/targets': {
      const materialCodes = getMaterialTopicCodes(report);
      if (materialCodes.length === 0) return 0;
      const covered = materialCodes.filter(code => {
        const cov = getTopicCoverage(report, code);
        return cov.policy > 0 && cov.target > 0 && cov.action > 0;
      }).length;
      return Math.round(covered / materialCodes.length * 100);
    }
    default: return 0;
  }
}

/**
 * Returns how many material topics are fully covered (policy + target + action).
 */
export function getFullyCoveredCount(report) {
  const materialCodes = getMaterialTopicCodes(report);
  return materialCodes.filter(code => {
    const cov = getTopicCoverage(report, code);
    return cov.policy > 0 && cov.target > 0 && cov.action > 0;
  }).length;
}

/**
 * Returns an overall export-readiness percentage (average across all tracked sections).
 */
export function getExportReadiness(report) {
  const routes = ['/organization', '/iro', '/materiality', '/environmental', '/social', '/governance', '/targets'];
  const total = routes.reduce((sum, r) => sum + getSectionCompletion(report, r), 0);
  return Math.round(total / routes.length);
}

/**
 * Builds a compact text summary of coverage gaps (for chat context + LLM prompts).
 */
export function buildGapSummary(report) {
  const materialCodes = getMaterialTopicCodes(report);
  if (materialCodes.length === 0) {
    return 'Noch keine wesentlichen Themen durch IRO-Bewertung identifiziert.';
  }
  const lines = [];
  for (const code of materialCodes) {
    const cov = getTopicCoverage(report, code);
    const missing = [];
    if (cov.data === 'empty') missing.push('keine Daten');
    if (!cov.policy) missing.push('keine Richtlinie');
    if (!cov.target) missing.push('kein Ziel');
    if (!cov.action) missing.push('keine Maßnahme');

    if (missing.length > 0) {
      lines.push(`${code}: ${missing.join(', ')}`);
    }
  }
  if (lines.length === 0) return 'Alle wesentlichen Themen sind vollständig abgedeckt.';
  return `Lücken bei wesentlichen Themen:\n${lines.join('\n')}`;
}
