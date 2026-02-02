import OpenAI from 'openai';
import config from '../config.js';
import { ESRS_SDG_MAPPING, SDG_DEFINITIONS, ESRS_TOPICS } from '../models/esrsTopics.js';
import { calculateImpactScore, calculateRiskScore, IMPACT_THRESHOLD, RISK_OPPORTUNITY_THRESHOLD } from '../models/scoring.js';

function getClient() {
  return new OpenAI({
    baseURL: config.adacorApiBase,
    apiKey: config.adacorApiKey || 'not-set',
  });
}

async function chatCompletion(prompt, maxTokens = 500, temperature = 0.3) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: config.adacorModel,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content.trim();
}

function buildReportSummary(report) {
  const org = report.organization || {};
  const mat = report.materiality || {};
  const iro = report.iro_summary || {};
  const env = report.environmental || {};
  const soc = report.social || {};
  const gov = report.governance || {};

  const lines = [];

  // Organization
  lines.push(`UNTERNEHMEN: ${org.name || 'k.A.'}`);
  lines.push(`Branche: ${org.industry_sector || 'k.A.'}`);
  lines.push(`Rechtsform: ${org.legal_form || 'k.A.'}`);
  lines.push(`Umsatz: ${org.revenue ? (org.revenue / 1e6).toFixed(1) + ' Mio. EUR' : 'k.A.'}`);
  lines.push(`Mitarbeiter: ${org.employees_total || 'k.A.'} (FTE: ${org.employees_fte || 'k.A.'})`);
  lines.push(`Standorte: ${(org.locations || []).map(l => l.name || l.city).join(', ') || 'k.A.'}`);
  lines.push(`Zertifizierungen: ${(org.certifications || []).map(c => c.name).join(', ') || 'keine'}`);
  lines.push(`Geschäftsmodell: ${(org.business_model || '').slice(0, 200)}`);
  lines.push(`Produkte/Services: ${org.main_products_services || 'k.A.'}`);
  lines.push(`Zielmärkte: ${org.target_markets || 'k.A.'}`);
  lines.push('');

  // Material topics
  const materialTopics = (mat.topics || []).filter(t => t.is_material);
  const nonMaterialTopics = (mat.topics || []).filter(t => !t.is_material);
  lines.push(`WESENTLICHE THEMEN (${materialTopics.length}):`);
  materialTopics.forEach(t => {
    const topicLabel = t.topic || t.topic_code || '';
    lines.push(`  - ${topicLabel} (Impact-Score: ${t.impact_score || 0}, Finanz-Score: ${t.financial_score || 0})`);
  });
  lines.push(`Nicht-wesentliche Themen: ${nonMaterialTopics.map(t => t.topic || t.topic_code).join(', ') || 'keine'}`);
  lines.push('');

  // IRO summary
  lines.push('IRO-BEWERTUNG:');
  (iro.assessments || []).forEach(a => {
    const impCount = (a.impacts || []).length;
    const riskCount = (a.risks || []).length;
    const oppCount = (a.opportunities || []).length;
    const matImpacts = (a.impacts || []).filter(i => calculateImpactScore(i.scale, i.scope, i.irreversibility, i.probability) >= IMPACT_THRESHOLD).length;
    const matRisks = (a.risks || []).filter(r => calculateRiskScore(r.financial_impact, r.probability) >= RISK_OPPORTUNITY_THRESHOLD).length;
    const matOpps = (a.opportunities || []).filter(o => calculateRiskScore(o.financial_impact, o.probability) >= RISK_OPPORTUNITY_THRESHOLD).length;
    lines.push(`  ${a.topic_code} ${a.topic}: ${impCount} Auswirkungen (${matImpacts} wesentl.), ${riskCount} Risiken (${matRisks} wesentl.), ${oppCount} Chancen (${matOpps} wesentl.)`);
  });
  lines.push('');

  // Environmental key data
  const e1 = env.e1_climate || {};
  const emissions = e1.emissions || {};
  const energy = e1.energy || {};
  lines.push('UMWELTDATEN (E1):');
  lines.push(`  Gesamtemissionen: ${emissions.total_emissions || 0} t CO2e (Scope1: ${emissions.scope1_total || 0}, Scope2: ${emissions.scope2_total || 0}, Scope3: ${emissions.scope3_total || 0})`);
  lines.push(`  Energieverbrauch: ${energy.total_kwh || 0} kWh, davon erneuerbar: ${energy.renewable_percent || 0}%`);
  if (e1.transition_plan?.has_plan) lines.push(`  Transitionsplan: vorhanden (Zieljahr: ${e1.transition_plan.target_year || 'k.A.'})`);
  lines.push('');

  // Social key data
  const s1 = soc.s1_own_workforce || {};
  const demo = s1.demographics || {};
  const health = s1.health_safety || {};
  lines.push('SOZIALDATEN (S1):');
  lines.push(`  Mitarbeiter: ${demo.total_employees || 0}, davon weiblich: ${demo.female_employees || 0}`);
  lines.push(`  Arbeitsunfälle: ${health.work_accidents || 0}, Krankheitsquote: ${health.sick_days_rate || 0}%`);
  const training = s1.training || {};
  lines.push(`  Weiterbildung: ${training.training_hours_per_employee || 0} Std./MA`);
  lines.push('');

  // Governance
  const g1 = gov.g1_business_conduct || {};
  const compliance = g1.compliance || {};
  const board = g1.board || {};
  lines.push('GOVERNANCE (G1):');
  lines.push(`  Vorstandsgröße: ${board.board_size || 'k.A.'}, Verhaltenskodex: ${compliance.code_of_conduct_exists ? 'Ja' : 'Nein'}`);
  lines.push(`  Compliance-Verstöße: ${compliance.compliance_violations || 0}, Bußgelder: ${compliance.fines_total || 0} EUR`);
  lines.push('');

  // Targets & Actions
  const targets = report.targets || [];
  const actions = report.actions || [];
  const policies = report.policies || [];
  lines.push(`ZIELE: ${targets.length} definiert`);
  targets.slice(0, 5).forEach(t => lines.push(`  - ${t.title} (${t.topic}, Ziel: ${t.target_year || 'k.A.'})`));
  lines.push(`MASSNAHMEN: ${actions.length} definiert`);
  actions.slice(0, 5).forEach(a => lines.push(`  - ${a.title} (${a.topic})`));
  lines.push(`RICHTLINIEN: ${policies.length} definiert`);
  policies.slice(0, 5).forEach(p => lines.push(`  - ${p.title} (${p.topic})`));

  return lines.join('\n');
}

function formatImpactsForPrompt(impacts) {
  if (!impacts || impacts.length === 0) return 'Keine Auswirkungen erfasst.';
  return impacts.map((impact, i) => {
    const score = (impact.scale + impact.scope + impact.irreversibility) * impact.probability;
    return `Auswirkung ${i + 1}:
  - Bezeichnung: ${impact.title || ''}
  - Ausmaß: ${impact.scale}/5
  - Reichweite: ${impact.scope}/5
  - Unumkehrbarkeit: ${impact.irreversibility}/5
  - Wahrscheinlichkeit: ${impact.probability}/5
  - Score: ${score} (Schwelle: 30)
  - Wesentlich: ${score >= 30 ? 'Ja' : 'Nein'}
  ${impact.description ? `- Beschreibung: ${impact.description}` : ''}
  ${impact.justification ? `- Begründung: ${impact.justification}` : ''}`;
  }).join('\n\n');
}

function formatRisksOpportunitiesForPrompt(risks, opportunities) {
  const lines = [];
  if (risks && risks.length > 0) {
    lines.push('RISIKEN:');
    risks.forEach((r, i) => {
      const score = r.financial_impact * r.probability;
      lines.push(`Risiko ${i + 1}:
  - Finanzielle Auswirkung: ${r.financial_impact}/5
  - Wahrscheinlichkeit: ${r.probability}/5
  - Zeithorizont: ${r.time_horizon || ''}
  - Score: ${score} (Schwelle: 12)
  - Wesentlich: ${score >= 12 ? 'Ja' : 'Nein'}
  ${r.description ? `- Beschreibung: ${r.description}` : ''}
  ${r.financial_effects ? `- Finanzielle Effekte: ${r.financial_effects}` : ''}`);
    });
  }
  if (opportunities && opportunities.length > 0) {
    lines.push('CHANCEN:');
    opportunities.forEach((o, i) => {
      const score = o.financial_impact * o.probability;
      lines.push(`Chance ${i + 1}:
  - Finanzielle Auswirkung: ${o.financial_impact}/5
  - Wahrscheinlichkeit: ${o.probability}/5
  - Zeithorizont: ${o.time_horizon || ''}
  - Score: ${score} (Schwelle: 12)
  ${o.description ? `- Beschreibung: ${o.description}` : ''}`);
    });
  }
  return lines.join('\n\n');
}

export async function generateImpactSummary(iro) {
  if (!iro.impacts || iro.impacts.length === 0) return '';
  const impactsText = formatImpactsForPrompt(iro.impacts);
  const prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Basierend auf den folgenden Auswirkungsbewertungen (Inside-Out-Perspektive) für das Thema "${iro.topic}",
erstelle eine prägnante Zusammenfassung der Auswirkungen des Unternehmens auf Umwelt und Gesellschaft.

Die Zusammenfassung soll:
- 2-4 Sätze lang sein
- Die wichtigsten Auswirkungen benennen
- Den Schweregrad (basierend auf den Scores) berücksichtigen
- Sachlich und professionell formuliert sein
- Auf Deutsch sein

IRO-BEWERTUNGEN:
${impactsText}

Antworte NUR mit der Zusammenfassung, ohne Einleitung oder Erklärung.`;

  try {
    return await chatCompletion(prompt);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}

export async function generateFinancialSummary(iro) {
  if (!iro.risks?.length && !iro.opportunities?.length) return '';
  const text = formatRisksOpportunitiesForPrompt(iro.risks, iro.opportunities);
  const prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Basierend auf den folgenden Risiko- und Chancenbewertungen (Outside-In-Perspektive) für das Thema "${iro.topic}",
erstelle eine prägnante Zusammenfassung der finanziellen Relevanz für das Unternehmen.

Die Zusammenfassung soll:
- 2-4 Sätze lang sein
- Die wichtigsten finanziellen Risiken und Chancen benennen
- Die Zeithorizonte berücksichtigen
- Sachlich und professionell formuliert sein
- Auf Deutsch sein

IRO-BEWERTUNGEN:
${text}

Antworte NUR mit der Zusammenfassung, ohne Einleitung oder Erklärung.`;

  try {
    return await chatCompletion(prompt);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}

export async function generateJustification(type, data) {
  const scaleDesc = { 1: 'vernachlässigbar', 2: 'gering', 3: 'moderat', 4: 'erheblich', 5: 'schwerwiegend' };
  const scopeDesc = { 1: 'einzelne Standorte', 2: 'regional', 3: 'national', 4: 'mehrere Länder', 5: 'global' };
  const irreversibilityDesc = { 1: 'leicht umkehrbar', 2: 'überwiegend umkehrbar', 3: 'teilweise umkehrbar', 4: 'schwer umkehrbar', 5: 'irreversibel' };
  const probabilityDesc = { 1: 'sehr unwahrscheinlich', 2: 'unwahrscheinlich', 3: 'möglich', 4: 'wahrscheinlich', 5: 'sehr wahrscheinlich' };
  const financialDesc = { 1: 'vernachlässigbar', 2: 'gering', 3: 'moderat', 4: 'erheblich', 5: 'existenzbedrohend' };

  let prompt;
  if (type === 'impact') {
    const score = (data.scale + data.scope + data.irreversibility) * data.probability;
    prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Erstelle eine prägnante Begründung für die folgende Auswirkungsbewertung:

${data.topic ? `THEMA: ${data.topic}` : ''}
BEZEICHNUNG: ${data.title}
${data.description ? `BESCHREIBUNG: ${data.description}` : ''}

BEWERTUNG:
- Ausmaß: ${data.scale}/5 (${scaleDesc[data.scale] || ''})
- Reichweite: ${data.scope}/5 (${scopeDesc[data.scope] || ''})
- Unumkehrbarkeit: ${data.irreversibility}/5 (${irreversibilityDesc[data.irreversibility] || ''})
- Wahrscheinlichkeit: ${data.probability}/5 (${probabilityDesc[data.probability] || ''})
- Score: ${score} (Schwellenwert: 30)
- Wesentlich: ${score >= 30 ? 'JA' : 'NEIN'}

Die Begründung soll:
- 2-3 Sätze lang sein
- Die gewählten Bewertungen nachvollziehbar erklären
- Konkret auf die Auswirkung eingehen
- Sachlich und professionell formuliert sein
- Auf Deutsch sein

Antworte NUR mit der Begründung, ohne Einleitung.`;
  } else if (type === 'risk') {
    const score = data.financial_impact * data.probability;
    prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Erstelle eine prägnante Begründung für die folgende Risikobewertung:

${data.topic ? `THEMA: ${data.topic}` : ''}
BEZEICHNUNG: ${data.title}
${data.description ? `BESCHREIBUNG: ${data.description}` : ''}
${data.financial_effects ? `FINANZIELLE EFFEKTE: ${data.financial_effects}` : ''}

BEWERTUNG:
- Finanzielle Auswirkung: ${data.financial_impact}/5 (${financialDesc[data.financial_impact] || ''})
- Wahrscheinlichkeit: ${data.probability}/5 (${probabilityDesc[data.probability] || ''})
- Zeithorizont: ${data.time_horizon || ''}
- Score: ${score} (Schwellenwert: 12)
- Wesentlich: ${score >= 12 ? 'JA' : 'NEIN'}

Die Begründung soll:
- 2-3 Sätze lang sein
- Die gewählten Bewertungen nachvollziehbar erklären
- Konkret auf das Risiko und dessen finanzielle Relevanz eingehen
- Sachlich und professionell formuliert sein
- Auf Deutsch sein

Antworte NUR mit der Begründung, ohne Einleitung.`;
  } else if (type === 'opportunity') {
    const score = data.financial_impact * data.probability;
    const oppFinancialDesc = { 1: 'vernachlässigbar', 2: 'gering', 3: 'moderat', 4: 'erheblich', 5: 'transformativ' };
    prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Erstelle eine prägnante Begründung für die folgende Chancenbewertung:

${data.topic ? `THEMA: ${data.topic}` : ''}
BEZEICHNUNG: ${data.title}
${data.description ? `BESCHREIBUNG: ${data.description}` : ''}
${data.financial_effects ? `FINANZIELLE EFFEKTE: ${data.financial_effects}` : ''}

BEWERTUNG:
- Finanzielle Auswirkung: ${data.financial_impact}/5 (${oppFinancialDesc[data.financial_impact] || ''})
- Wahrscheinlichkeit: ${data.probability}/5 (${probabilityDesc[data.probability] || ''})
- Zeithorizont: ${data.time_horizon || ''}
- Score: ${score} (Schwellenwert: 12)
- Wesentlich: ${score >= 12 ? 'JA' : 'NEIN'}

Die Begründung soll:
- 2-3 Sätze lang sein
- Die gewählten Bewertungen nachvollziehbar erklären
- Konkret auf die Chance und deren finanzielle Relevanz eingehen
- Sachlich und professionell formuliert sein
- Auf Deutsch sein

Antworte NUR mit der Begründung, ohne Einleitung.`;
  } else if (type === 'justification_summary') {
    const justifications = [];
    if (data.impacts) {
      data.impacts.forEach((imp, i) => {
        if (imp.justification) justifications.push(`Auswirkung ${i + 1}: ${imp.justification}`);
      });
    }
    if (data.risks) {
      data.risks.forEach((r, i) => {
        if (r.justification) justifications.push(`Risiko ${i + 1}: ${r.justification}`);
      });
    }
    if (data.opportunities) {
      data.opportunities.forEach((o, i) => {
        if (o.justification) justifications.push(`Chance ${i + 1}: ${o.justification}`);
      });
    }
    if (justifications.length === 0) return '';

    prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Basierend auf den folgenden Einzelbegründungen aus der IRO-Bewertung für das Thema "${data.topic}",
erstelle eine zusammenfassende Gesamtbegründung für die Wesentlichkeitseinstufung.

Das Thema ist: ${data.is_material ? 'WESENTLICH' : 'NICHT WESENTLICH'}

Die Zusammenfassung soll:
- 2-4 Sätze lang sein
- Die Kernargumente der Einzelbegründungen zusammenfassen
- Die Wesentlichkeitseinstufung nachvollziehbar machen
- Sachlich und professionell formuliert sein
- Auf Deutsch sein

EINZELBEGRÜNDUNGEN:
${justifications.join('\n')}

Antworte NUR mit der zusammenfassenden Begründung, ohne Einleitung oder Erklärung.`;
  } else {
    return 'Unbekannter Typ';
  }

  try {
    return await chatCompletion(prompt, type === 'justification_summary' ? 500 : 300);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}

export async function generateNonRelevanceJustification(topicCode, topicName, companyName, industrySector) {
  const prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Ein Unternehmen muss begründen, warum ein ESRS-Thema für es NICHT wesentlich ist.

UNTERNEHMEN: ${companyName || 'Nicht angegeben'}
BRANCHE: ${industrySector || 'Nicht angegeben'}
ESRS-THEMA: ${topicCode} - ${topicName}

Erstelle eine sachliche, professionelle Begründung (3-4 Sätze), warum dieses Thema für das Unternehmen nicht wesentlich ist.
Die Begründung soll:
- Auf die spezifische Branche und das Geschäftsmodell eingehen
- Die geringe Relevanz nachvollziehbar erklären
- ESRS-konform formuliert sein
- Auf Deutsch sein

Antworte NUR mit der Begründung, ohne Einleitung oder Erklärung.`;

  try {
    return await chatCompletion(prompt, 300);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}

export async function generateIRODescription(type, title, topicName, topicCode) {
  const typeLabels = { impact: 'Auswirkung', risk: 'Risiko', opportunity: 'Chance' };
  const typeLabel = typeLabels[type] || type;

  const prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Erstelle eine prägnante Beschreibung für folgende ${typeLabel} im Rahmen einer IRO-Bewertung:

ESRS-THEMA: ${topicCode} - ${topicName}
TYP: ${typeLabel}
BEZEICHNUNG: ${title}

Die Beschreibung soll:
- 2-3 Sätze lang sein
- Den konkreten Sachverhalt der ${typeLabel} erläutern
- Auf das ESRS-Thema Bezug nehmen
- Sachlich und professionell formuliert sein
- Auf Deutsch sein

Antworte NUR mit der Beschreibung, ohne Einleitung.`;

  try {
    return await chatCompletion(prompt, 250);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}

export async function generateItemDescription(type, title, topic) {
  const typeLabels = { policy: 'Richtlinie', target: 'Ziel', action: 'Maßnahme' };
  const typeLabel = typeLabels[type] || type;

  const prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Erstelle eine prägnante Beschreibung für folgende ${typeLabel}:

ESRS-THEMA: ${topic}
TYP: ${typeLabel}
TITEL: ${title}

Die Beschreibung soll:
- 2-4 Sätze lang sein
- Konkret beschreiben, was die ${typeLabel} beinhaltet
- Auf das ESRS-Thema Bezug nehmen
- Bei Zielen: messbare Kriterien andeuten
- Bei Maßnahmen: konkrete Schritte skizzieren
- Bei Richtlinien: Geltungsbereich und Kerninhalt beschreiben
- Sachlich und professionell formuliert sein
- Auf Deutsch sein

Antworte NUR mit der Beschreibung, ohne Einleitung.`;

  try {
    return await chatCompletion(prompt, 300);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}

export async function suggestSDG(title, description, topic) {
  const relevantSdgs = ESRS_SDG_MAPPING[topic] || [];
  const typicalStr = relevantSdgs.length > 0
    ? relevantSdgs.map(n => `SDG ${n} (${SDG_DEFINITIONS[n]?.name || ''})`).join(', ')
    : 'keine spezifischen';

  const prompt = `Du bist ein Experte für die UN Sustainable Development Goals (SDGs).

Analysiere die folgende Nachhaltigkeitsmaßnahme und ordne sie den passenden SDGs zu.

MASSNAHME:
Titel: ${title}
Beschreibung: ${description}
ESRS-Thema: ${topic}

Typisch relevante SDGs für dieses ESRS-Thema sind: ${typicalStr}

Bitte wähle 1-3 SDGs aus (aus allen 17), die am besten zu dieser spezifischen Maßnahme passen.
Berücksichtige dabei den konkreten Inhalt der Maßnahme, nicht nur das übergeordnete Thema.

Antworte NUR mit den SDG-Nummern, kommagetrennt (z.B. "7, 13" oder "8, 5, 10").
Keine Erklärung, nur die Nummern.`;

  try {
    const response = await chatCompletion(prompt, 50, 0.2);
    const numbers = response.match(/\d+/g) || [];
    const valid = [...new Set(numbers.map(Number).filter(n => n >= 1 && n <= 17))];
    return valid.slice(0, 3);
  } catch {
    return relevantSdgs.slice(0, 2);
  }
}

// --- High-effort AI helpers (full report context) ---

export async function generateExecutiveSummary(report) {
  const summary = buildReportSummary(report);
  const org = report.organization || {};

  const prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung.

Erstelle eine Executive Summary (Management-Zusammenfassung) für den ESRS-Nachhaltigkeitsbericht des folgenden Unternehmens.

${summary}

Die Executive Summary soll:
- 6-10 Sätze lang sein (ca. 200-300 Wörter)
- Mit einem einleitenden Satz über das Unternehmen beginnen
- Die wesentlichen ESRS-Themen und deren Bedeutung zusammenfassen
- Zentrale Umwelt-Kennzahlen nennen (Emissionen, Energieverbrauch)
- Wesentliche soziale Aspekte hervorheben (Mitarbeiter, Gesundheit)
- Governance-Highlights erwähnen
- Strategische Ziele und wichtigste Maßnahmen benennen
- Mit einem Ausblick schließen
- Sachlich, professionell und ESRS-konform formuliert sein
- Auf Deutsch sein

Antworte NUR mit der Executive Summary, ohne Überschrift, Einleitung oder Erklärung.`;

  try {
    return await chatCompletion(prompt, 800, 0.4);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}

export async function generateManagementReport(report) {
  const summary = buildReportSummary(report);
  const org = report.organization || {};

  const prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung und deutsche Unternehmensberichterstattung.

Erstelle einen Entwurf für den Nachhaltigkeits-Lagebericht (Management Report) des folgenden Unternehmens.
Dieser Bericht ist Teil des ESRS-Nachhaltigkeitsberichts und beschreibt die strategische Nachhaltigkeitsausrichtung.

${summary}

Der Lagebericht soll folgende Abschnitte enthalten:
1. STRATEGISCHE AUSRICHTUNG: Vision und Stellenwert von Nachhaltigkeit im Unternehmen
2. WESENTLICHKEITSANALYSE: Zusammenfassung der identifizierten wesentlichen Themen und des Prozesses
3. UMWELT: Kernaussagen zu Klimaschutz, Energie und Emissionen mit konkreten Zahlen
4. SOZIALES: Kernaussagen zu Mitarbeitern, Arbeitsbedingungen, Gesundheit
5. GOVERNANCE: Kernaussagen zu Unternehmensführung und Compliance
6. ZIELE UND MASSNAHMEN: Wichtigste strategische Ziele und Maßnahmen
7. AUSBLICK: Zukünftige Schwerpunkte und Herausforderungen

Anforderungen:
- Insgesamt ca. 400-600 Wörter
- Konkrete Zahlen und Daten aus dem Bericht verwenden
- Sachlich, professionell, ESRS-konform
- Auf Deutsch
- Abschnitte mit Zeilenumbruch trennen, KEINE Markdown-Überschriften

Antworte NUR mit dem Lagebericht-Text.`;

  try {
    return await chatCompletion(prompt, 1500, 0.4);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}

export async function generateESGManagementSystem(report) {
  const org = report.organization || {};
  const mat = report.materiality || {};
  const gov = report.governance || {};
  const certs = (org.certifications || []).map(c => `${c.name} (${c.issuer}, gültig bis ${c.valid_until})`).join(', ') || 'keine';
  const materialTopics = (mat.topics || []).filter(t => t.is_material).map(t => t.topic || t.topic_code).join(', ') || 'keine';
  const g1 = gov.g1_business_conduct || {};
  const board = g1.board || {};
  const compliance = g1.compliance || {};

  const prompt = `Du bist ein Experte für ESRS-Nachhaltigkeitsberichterstattung und ESG-Managementsysteme.

Erstelle eine Beschreibung des ESG-Managementsystems für folgendes Unternehmen:

UNTERNEHMEN: ${org.name || 'k.A.'}
BRANCHE: ${org.industry_sector || 'k.A.'}
MITARBEITER: ${org.employees_total || 'k.A.'}
ZERTIFIZIERUNGEN: ${certs}
WESENTLICHE THEMEN: ${materialTopics}
VORSTANDSGRÖSSE: ${board.board_size || 'k.A.'}
VERHALTENSKODEX: ${compliance.code_of_conduct_exists ? 'Ja' : 'Nein'}
NACHHALTIGKEITSKONTAKT: ${org.sustainability_contact || 'k.A.'}
BERICHTSRAHMEN: ${org.reporting_framework || 'ESRS'}

Die Beschreibung soll folgende Aspekte abdecken:
1. Organisatorische Verankerung: Wie ist Nachhaltigkeit in der Unternehmensstruktur verankert?
2. Managementsystem: Welche Systeme und Prozesse steuern ESG-Themen?
3. Zertifizierungen: Wie unterstützen die vorhandenen Zertifizierungen das ESG-Management?
4. Monitoring: Wie werden ESG-Kennzahlen überwacht und berichtet?
5. Kontinuierliche Verbesserung: Wie wird das System weiterentwickelt?

Anforderungen:
- Ca. 200-300 Wörter
- Konkret auf das Unternehmen und seine Zertifizierungen eingehen
- Sachlich, professionell, ESRS-konform
- Auf Deutsch
- Fließtext ohne Überschriften

Antworte NUR mit der Beschreibung.`;

  try {
    return await chatCompletion(prompt, 800, 0.4);
  } catch (e) {
    return `Fehler bei der LLM-Generierung: ${e.message}`;
  }
}
