export const IMPACT_THRESHOLD = 30.0;
export const RISK_OPPORTUNITY_THRESHOLD = 12.0;

export const calculateImpactScore = (scale, scope, irreversibility, probability) =>
  (scale + scope + irreversibility) * probability;

export const calculateRiskScore = (financialImpact, probability) =>
  financialImpact * probability;

export const isImpactMaterial = (score) => score >= IMPACT_THRESHOLD;
export const isRiskMaterial = (score) => score >= RISK_OPPORTUNITY_THRESHOLD;

export function getScoreColor(score, threshold, nearMargin = 0.2) {
  if (score >= threshold) return 'red';
  if (score >= threshold * (1 - nearMargin)) return 'yellow';
  return 'green';
}

export function getOverallMateriality(impactScore, riskScore, opportunityScore) {
  const impactMaterial = isImpactMaterial(impactScore);
  const riskMaterial = isRiskMaterial(riskScore);
  const opportunityMaterial = isRiskMaterial(opportunityScore);
  const isMaterial = impactMaterial || riskMaterial || opportunityMaterial;

  const reasons = [];
  if (impactMaterial) reasons.push(`Auswirkungswesentlichkeit (Score: ${impactScore})`);
  if (riskMaterial) reasons.push(`Risiko-Wesentlichkeit (Score: ${riskScore})`);
  if (opportunityMaterial) reasons.push(`Chancen-Wesentlichkeit (Score: ${opportunityScore})`);

  const explanation = isMaterial
    ? 'Wesentlich aufgrund: ' + reasons.join(', ')
    : 'Nicht wesentlich (alle Scores unter Schwellenwerten)';

  return { isMaterial, explanation };
}

export function getMaxScores(assessment) {
  const maxImpact = Math.max(0, ...(assessment.impacts || []).map(i =>
    calculateImpactScore(i.scale, i.scope, i.irreversibility, i.probability)));
  const maxRisk = Math.max(0, ...(assessment.risks || []).map(r =>
    calculateRiskScore(r.financial_impact, r.probability)));
  const maxOpp = Math.max(0, ...(assessment.opportunities || []).map(o =>
    calculateRiskScore(o.financial_impact, o.probability)));
  return { maxImpact, maxRisk, maxOpp };
}

export function isAssessmentMaterial(assessment) {
  const { maxImpact, maxRisk, maxOpp } = getMaxScores(assessment);
  return maxImpact >= IMPACT_THRESHOLD || maxRisk >= RISK_OPPORTUNITY_THRESHOLD || maxOpp >= RISK_OPPORTUNITY_THRESHOLD;
}

export function getMaterialTopicCodes(report) {
  return (report?.iro_summary?.assessments || [])
    .filter(a => isAssessmentMaterial(a))
    .map(a => a.topic_code);
}

export const SCALE_DESCRIPTIONS = {
  scale: {
    1: 'Minimal - Sehr geringe Auswirkung',
    2: 'Gering - Begrenzte Auswirkung',
    3: 'Moderat - Spürbare Auswirkung',
    4: 'Erheblich - Signifikante Auswirkung',
    5: 'Schwerwiegend - Sehr hohe Auswirkung',
  },
  scope: {
    1: 'Lokal - Einzelne Standorte/Personen',
    2: 'Regional - Mehrere Standorte/Gruppen',
    3: 'National - Landesweit',
    4: 'Europäisch - EU-weit',
    5: 'Global - Weltweit',
  },
  irreversibility: {
    1: 'Vollständig reversibel - Leicht umkehrbar',
    2: 'Größtenteils reversibel - Mit Aufwand umkehrbar',
    3: 'Teilweise reversibel - Nur teilweise umkehrbar',
    4: 'Schwer reversibel - Kaum umkehrbar',
    5: 'Irreversibel - Nicht umkehrbar',
  },
  probability: {
    1: 'Sehr unwahrscheinlich (< 10%)',
    2: 'Unwahrscheinlich (10-30%)',
    3: 'Möglich (30-60%)',
    4: 'Wahrscheinlich (60-90%)',
    5: 'Sehr wahrscheinlich (> 90%)',
  },
  financial_impact: {
    1: 'Minimal (< 1% Umsatz)',
    2: 'Gering (1-5% Umsatz)',
    3: 'Moderat (5-10% Umsatz)',
    4: 'Erheblich (10-25% Umsatz)',
    5: 'Kritisch (> 25% Umsatz)',
  },
};
