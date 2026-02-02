import { getMaterialTopicCodes } from '../models/scoring.js';

export function validateReport(report) {
  const messages = [];
  const materialTopics = getMaterialTopicCodes(report);

  // Organization
  if (!report.organization?.name) {
    messages.push({ level: 'error', section: 'Organisation', field: 'name', message: 'Unternehmensname ist erforderlich' });
  }
  if ((report.organization?.employees_total || 0) <= 0) {
    messages.push({ level: 'warning', section: 'Organisation', field: 'employees_total', message: 'Mitarbeiteranzahl sollte angegeben werden' });
  }
  if ((report.organization?.revenue || 0) <= 0) {
    messages.push({ level: 'warning', section: 'Organisation', field: 'revenue', message: 'Umsatz sollte angegeben werden' });
  }
  if (!report.organization?.fiscal_year) {
    messages.push({ level: 'error', section: 'Organisation', field: 'fiscal_year', message: 'Geschäftsjahr ist erforderlich' });
  }

  // Materiality
  const materialTopicsList = (report.materiality?.topics || []).filter(t => t.is_material);
  if (materialTopicsList.length === 0) {
    messages.push({ level: 'warning', section: 'Wesentlichkeit', field: 'topics', message: 'Keine Themen als wesentlich markiert' });
  }
  materialTopicsList.forEach(topic => {
    if (!topic.justification) {
      messages.push({ level: 'warning', section: 'Wesentlichkeit', field: `topic_${topic.topic}`, message: `Begründung für ${topic.topic} fehlt` });
    }
  });

  // IRO
  (report.iro_summary?.assessments || []).forEach(assessment => {
    const isMaterial = getAssessmentIsMaterial(assessment);
    if (isMaterial && !assessment.responsible_person) {
      messages.push({ level: 'warning', section: 'IRO-Bewertung', field: `${assessment.topic_code}_responsible`, message: `Verantwortliche Person für ${assessment.topic} fehlt` });
    }
    (assessment.impacts || []).forEach((imp, i) => {
      const score = (imp.scale + imp.scope + imp.irreversibility) * imp.probability;
      if (score >= 30 && !imp.justification) {
        messages.push({ level: 'warning', section: 'IRO-Bewertung', field: `${assessment.topic_code}_impact_${i}`, message: `Begründung für '${imp.title || `Auswirkung ${i + 1}`}' bei ${assessment.topic} fehlt` });
      }
    });
    (assessment.risks || []).forEach((r, i) => {
      const score = r.financial_impact * r.probability;
      if (score >= 12 && !r.justification) {
        messages.push({ level: 'warning', section: 'IRO-Bewertung', field: `${assessment.topic_code}_risk_${i}`, message: `Begründung für '${r.title || `Risiko ${i + 1}`}' bei ${assessment.topic} fehlt` });
      }
    });
    (assessment.opportunities || []).forEach((o, i) => {
      const score = o.financial_impact * o.probability;
      if (score >= 12 && !o.justification) {
        messages.push({ level: 'warning', section: 'IRO-Bewertung', field: `${assessment.topic_code}_opp_${i}`, message: `Begründung für '${o.title || `Chance ${i + 1}`}' bei ${assessment.topic} fehlt` });
      }
    });
  });

  // Environmental
  if (materialTopics.includes('E1')) {
    const e1 = report.environmental?.e1_climate;
    if (e1) {
      const total = (e1.emissions?.scope1_total || 0) + (e1.emissions?.scope2_total || 0) + (e1.emissions?.scope3_total || 0);
      if (total === 0) {
        messages.push({ level: 'warning', section: 'Umwelt - E1', field: 'emissions', message: 'Keine Emissionsdaten eingetragen' });
      }
      if ((e1.energy?.total_kwh || 0) === 0) {
        messages.push({ level: 'warning', section: 'Umwelt - E1', field: 'energy', message: 'Keine Energieverbrauchsdaten eingetragen' });
      }
    }
  }

  // Social
  if (materialTopics.includes('S1')) {
    if ((report.social?.s1_own_workforce?.demographics?.total_employees || 0) === 0) {
      messages.push({ level: 'warning', section: 'Soziales - S1', field: 'employees', message: 'Keine Mitarbeiterdaten eingetragen' });
    }
  }

  // Governance
  if (materialTopics.includes('G1')) {
    if (!report.governance?.g1_business_conduct?.compliance?.code_of_conduct_exists) {
      messages.push({ level: 'info', section: 'Governance - G1', field: 'code_of_conduct', message: 'Kein Verhaltenskodex vorhanden' });
    }
  }

  // Targets
  const topicsWithTargets = new Set((report.targets || []).map(t => t.topic).filter(Boolean));
  materialTopics.forEach(topic => {
    if (!topicsWithTargets.has(topic)) {
      messages.push({ level: 'info', section: 'Ziele', field: `target_${topic}`, message: `Kein Ziel für wesentliches Thema ${topic} definiert` });
    }
  });
  (report.targets || []).forEach(target => {
    if (!target.target_year) {
      messages.push({ level: 'warning', section: 'Ziele', field: `target_${target.id}_year`, message: `Zieljahr für '${target.title}' fehlt` });
    }
  });

  const hasErrors = messages.some(m => m.level === 'error');

  return {
    is_valid: !hasErrors,
    messages,
    completion_percentage: getCompletionPercentage(report),
  };
}

function getAssessmentIsMaterial(assessment) {
  const maxImpact = Math.max(0, ...(assessment.impacts || []).map(i => (i.scale + i.scope + i.irreversibility) * i.probability));
  const maxRisk = Math.max(0, ...(assessment.risks || []).map(r => r.financial_impact * r.probability));
  const maxOpp = Math.max(0, ...(assessment.opportunities || []).map(o => o.financial_impact * o.probability));
  return maxImpact >= 30 || maxRisk >= 12 || maxOpp >= 12;
}

function getCompletionPercentage(report) {
  let total = 0, passed = 0;
  const org = report.organization || {};
  total += 5;
  if (org.name) passed++;
  if ((org.revenue || 0) > 0) passed++;
  if ((org.employees_total || 0) > 0) passed++;
  if (org.fiscal_year) passed++;
  if (org.business_model) passed++;

  total += 2;
  if ((report.materiality?.topics || []).some(t => t.is_material)) passed++;
  if ((report.materiality?.stakeholders || []).length > 0) passed++;

  total += 1;
  if ((report.iro_summary?.assessments || []).length > 0) passed++;

  total += 3;
  const e1 = report.environmental?.e1_climate?.emissions;
  if (e1 && (e1.scope1_total || 0) + (e1.scope2_total || 0) + (e1.scope3_total || 0) > 0) passed++;
  if ((report.social?.s1_own_workforce?.demographics?.total_employees || 0) > 0) passed++;
  if (report.governance?.g1_business_conduct?.compliance?.code_of_conduct_exists) passed++;

  total += 1;
  if ((report.targets || []).length > 0) passed++;

  return total > 0 ? (passed / total) * 100 : 0;
}
