/**
 * Builds a compact context string from the report for LLM item description generation.
 * Only includes org basics + directly relevant topic metrics.
 */
export function buildReportContext(report, topicCode) {
  const org = report.organization || {};
  const lines = [];

  if (org.name) lines.push(`Organisation: ${org.name}`);
  if (org.industry_sector) lines.push(`Branche: ${org.industry_sector}`);
  if (org.employees_total) lines.push(`Mitarbeitende: ${org.employees_total}`);

  const env = report.environmental || {};
  const soc = report.social || {};
  const gov = report.governance || {};

  if (topicCode === 'E1') {
    const em = env.e1_climate?.emissions || {};
    const en = env.e1_climate?.energy || {};
    if (em.scope1_total) lines.push(`Scope 1: ${em.scope1_total} tCO2e`);
    if (em.scope2_total) lines.push(`Scope 2: ${em.scope2_total} tCO2e`);
    if (em.scope3_total) lines.push(`Scope 3: ${em.scope3_total} tCO2e`);
    if (en.total_kwh) lines.push(`Gesamtenergie: ${en.total_kwh} kWh`);
    if (en.renewable_kwh) lines.push(`Erneuerbar: ${en.renewable_kwh} kWh`);
  } else if (topicCode === 'E2') {
    const e2 = env.e2_pollution || {};
    if (e2.air_pollutants_tonnes) lines.push(`Luftschadstoffe: ${e2.air_pollutants_tonnes} t`);
    if (e2.water_pollutants_tonnes) lines.push(`Wasserschadstoffe: ${e2.water_pollutants_tonnes} t`);
  } else if (topicCode === 'E3') {
    const e3 = env.e3_water || {};
    if (e3.total_water_withdrawal_m3) lines.push(`Wasserentnahme: ${e3.total_water_withdrawal_m3} m³`);
  } else if (topicCode === 'E5') {
    const e5 = env.e5_circular_economy || {};
    if (e5.total_waste_tonnes) lines.push(`Abfall: ${e5.total_waste_tonnes} t`);
    if (e5.recycling_rate_percentage) lines.push(`Recyclingquote: ${e5.recycling_rate_percentage}%`);
  } else if (topicCode === 'S1') {
    const dem = soc.s1_own_workforce?.demographics || {};
    if (dem.total_employees) lines.push(`Belegschaft: ${dem.total_employees} MA`);
  } else if (topicCode === 'S2') {
    const s2 = soc.s2_supply_chain || {};
    if (s2.total_suppliers) lines.push(`Lieferanten: ${s2.total_suppliers}`);
  } else if (topicCode === 'G1') {
    const board = gov.g1_business_conduct?.board || {};
    if (board.board_size) lines.push(`Vorstand: ${board.board_size} Mitglieder`);
  }

  return lines.length > 0 ? lines.join('\n') : null;
}
