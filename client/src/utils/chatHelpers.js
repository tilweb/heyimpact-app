/**
 * Converts JSON report data to a compact YAML-like format
 * to reduce token count while preserving all information
 */
export const convertToCompactYAML = (data, indent = 0) => {
  const spaces = '  '.repeat(indent);

  if (data === null || data === undefined) {
    return 'null';
  }

  if (typeof data === 'string') {
    if (data.includes('\n') || data.includes(':') || data.includes('#')) {
      return `"${data.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
    }
    return data;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return String(data);
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return '[]';

    const isSimpleArray = data.every(item =>
      typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
    );

    if (isSimpleArray && data.length <= 5) {
      return `[${data.map(item => convertToCompactYAML(item, 0)).join(', ')}]`;
    }

    return data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const content = convertToCompactYAML(item, indent + 1);
        return `\n${spaces}- ${content.trim()}`;
      }
      return `\n${spaces}- ${convertToCompactYAML(item, 0)}`;
    }).join('');
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) return '{}';

    return entries.map(([key, value]) => {
      const valueStr = convertToCompactYAML(value, indent + 1);

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return `\n${spaces}${key}:${valueStr}`;
      }

      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        return `\n${spaces}${key}:${valueStr}`;
      }

      return `\n${spaces}${key}: ${valueStr}`;
    }).join('');
  }

  return String(data);
};

/**
 * Creates a compact version of the report for the system prompt
 * Removes unnecessary fields and simplifies structure
 */
export const createCompactReport = (reportData) => {
  const compact = {
    metadata: {
      berichtsjahr: reportData.metadata?.reporting_period || reportData.organization?.fiscal_year,
      framework: reportData.metadata?.reporting_framework || 'ESRS',
      status: reportData.metadata?.status,
    },
    organisation: {
      name: reportData.organization?.name,
      mitarbeitende: reportData.organization?.employees_total,
      fte: reportData.organization?.employees_fte,
      umsatz: reportData.organization?.revenue,
      standorte: reportData.organization?.locations?.map(l => ({
        name: l.name,
        stadt: l.city,
        mitarbeiter: l.employees,
      })),
      zertifizierungen: reportData.organization?.certifications?.map(c => c.name),
      geschaeftsmodell: reportData.organization?.business_model,
    },
    wesentlichkeit: {
      stakeholder: reportData.materiality?.stakeholders?.map(s => ({
        name: s.name,
        kategorie: s.category,
        themen: s.key_concerns,
      })),
      themen: reportData.materiality?.topics?.map(t => ({
        thema: t.topic,
        wesentlich: t.is_material,
        impact_score: t.impact_score,
        finanz_score: t.financial_score,
        begruendung: t.justification,
      })),
    },
    iro_bewertungen: reportData.iro_summary?.assessments?.map(a => ({
      code: a.topic_code,
      thema: a.topic_name,
      impacts: a.impacts,
      risiken: a.risks,
      chancen: a.opportunities,
    })),
    ziele: reportData.targets?.map(t => ({
      thema: t.topic,
      name: t.name,
      beschreibung: t.description,
      basisjahr: t.baseline_year,
      basiswert: t.baseline_value,
      zieljahr: t.target_year,
      zielwert: t.target_value,
      aktueller_wert: t.current_value,
      fortschritt: t.progress_percentage,
      status: t.status,
    })),
    massnahmen: reportData.actions?.map(a => ({
      thema: a.topic,
      name: a.name,
      beschreibung: a.description,
      status: a.status,
      sdg_ziele: a.sdg_goals,
    })),
    policies: reportData.policies?.map(p => ({
      thema: p.topic,
      name: p.name,
      beschreibung: p.description,
      genehmigt_von: p.approved_by,
    })),
    umwelt: {
      klima: reportData.environmental?.e1_climate ? {
        emissionen: {
          scope1_tco2e: reportData.environmental.e1_climate.emissions?.scope1_total,
          scope2_tco2e: reportData.environmental.e1_climate.emissions?.scope2_total,
          scope3_tco2e: reportData.environmental.e1_climate.emissions?.scope3_total,
          gesamt_tco2e: (reportData.environmental.e1_climate.emissions?.scope1_total || 0) +
                        (reportData.environmental.e1_climate.emissions?.scope2_total || 0) +
                        (reportData.environmental.e1_climate.emissions?.scope3_total || 0),
        },
        energie: {
          gesamt_kwh: reportData.environmental.e1_climate.energy?.total_kwh,
          erneuerbar_kwh: reportData.environmental.e1_climate.energy?.renewable_kwh,
          solar_kwh: reportData.environmental.e1_climate.energy?.solar_kwh,
        },
      } : null,
      kreislaufwirtschaft: reportData.environmental?.e5_circular_economy,
    },
    soziales: {
      belegschaft: reportData.social?.s1_own_workforce ? {
        demografie: {
          gesamt: reportData.social.s1_own_workforce.demographics?.total_employees,
          fte: reportData.social.s1_own_workforce.demographics?.fte,
          frauen_prozent: reportData.social.s1_own_workforce.demographics?.female_percentage,
          frauen_fuehrung_prozent: reportData.social.s1_own_workforce.demographics?.female_management_percentage,
        },
        gesundheit_sicherheit: {
          arbeitsunfaelle: reportData.social.s1_own_workforce.health_safety?.work_accidents,
          krankheitstage_pro_ma: reportData.social.s1_own_workforce.health_safety?.sick_days_per_employee,
        },
        weiterbildung: {
          stunden_pro_ma: reportData.social.s1_own_workforce.training?.training_hours_per_employee,
          investition_pro_ma_eur: reportData.social.s1_own_workforce.training?.training_investment_per_employee,
        },
        verguetung: {
          gender_pay_gap_prozent: reportData.social.s1_own_workforce.compensation?.gender_pay_gap_percentage,
        },
      } : null,
    },
    governance: reportData.governance ? {
      unternehmensethik: reportData.governance.business_ethics,
      compliance: reportData.governance.compliance,
    } : null,
  };

  return compact;
};

/**
 * Generates the system prompt with the report data
 * Adapted for HeyImpact: assists users while they are editing/creating the report
 */
export const generateSystemPrompt = (reportData) => {
  if (!reportData) {
    return 'Es ist kein Bericht geladen. Bitte den Benutzer informieren, dass zuerst ein Bericht erstellt oder geladen werden muss.';
  }

  const compactReport = createCompactReport(reportData);
  const yamlData = convertToCompactYAML(compactReport);

  const orgName = reportData.organization?.name || 'Unbekannt';
  const year = reportData.organization?.fiscal_year || reportData.metadata?.reporting_period || '';
  const employees = reportData.organization?.employees_total || '';

  return `Du bist ein KI-Assistent im Tool "HeyImpact", das Unternehmen bei der Erstellung ihres ESRS-Nachhaltigkeitsberichts unterstützt.

## Deine Rolle
- Du hilfst den Bearbeitern beim Erstellen und Vervollständigen des Nachhaltigkeitsberichts
- Du beantwortest Fragen zu den bereits erfassten Daten im Bericht
- Du kannst auf Lücken und fehlende Angaben hinweisen
- Du gibst Hinweise zu ESRS-Anforderungen und was in welchem Abschnitt erwartet wird
- Du kannst Formulierungsvorschläge für Textfelder machen

## Grenzen
- Du kannst KEINE Daten im Bericht ändern - nur der Benutzer kann Felder bearbeiten
- Du hast keinen Zugriff auf externe Systeme oder das Internet
- Jede Konversation beginnt ohne Erinnerung an frühere Gespräche

## Kontext
- Organisation: ${orgName}
- Berichtsjahr: ${year}
- Mitarbeitende: ${employees}
- Framework: ESRS

## Aktuelle Berichtsdaten (YAML)
${yamlData}

## Berichtsbereiche
- **Organisation**: Unternehmensdaten, Standorte, Zertifizierungen, Geschäftsmodell
- **Wesentlichkeit**: Stakeholder, wesentliche Themen, Materialitätsanalyse
- **IRO-Bewertungen**: Impacts, Risiken, Chancen pro Thema
- **Ziele**: Nachhaltigkeitsziele mit Basis- und Zielwerten
- **Massnahmen**: Konkrete Aktionen und deren Status
- **Policies**: Richtlinien und Leitlinien
- **E1 Klimawandel**: Emissionen (Scope 1/2/3), Energie, Klimaziele
- **E5 Kreislaufwirtschaft**: Hardware, Ressourcenverbrauch
- **S1 Eigene Belegschaft**: Demografie, Gesundheit, Weiterbildung, Vergütung
- **G1 Governance**: Unternehmensethik, Compliance

## Anweisungen
- Antworte auf Deutsch, präzise und faktenbasiert
- Verweise auf konkrete Zahlen und Daten aus dem Bericht
- Sage klar, wenn etwas noch nicht im Bericht erfasst ist
- Halte Antworten unter 300 Wörter
- Formatiere Antworten übersichtlich mit Aufzählungen wo sinnvoll
- Wenn der Benutzer nach Themen fragt, die nicht zum Nachhaltigkeitsbericht gehören, weise freundlich darauf hin

## Quellenangabe
Füge am Ende jeder Antwort einen kurzen Hinweis hinzu, aus welchem Berichtsbereich die Informationen stammen.
Beispiel: **Quelle:** Organisation, E1 Klimawandel`;
};
