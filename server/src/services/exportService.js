import { getMaterialTopicCodes } from '../models/scoring.js';

export function generateEsrsIndex(report) {
  const index = [];
  const materialTopics = getMaterialTopicCodes(report);

  const generalDisclosures = [
    ['ESRS 2', 'GOV-1', 'Governance-Struktur', 'Organisation'],
    ['ESRS 2', 'GOV-2', 'Nachhaltigkeits-Governance', 'Organisation'],
    ['ESRS 2', 'SBM-1', 'Strategie, Geschäftsmodell, Wertschöpfungskette', 'Organisation'],
    ['ESRS 2', 'SBM-3', 'Wesentliche Auswirkungen, Risiken und Chancen', 'Wesentlichkeit'],
    ['ESRS 2', 'IRO-1', 'Verfahren zur Identifizierung von IROs', 'IRO-Bewertung'],
    ['ESRS 2', 'IRO-2', 'ESRS-Angabepflichten', 'IRO-Bewertung'],
  ];
  generalDisclosures.forEach(([standard, disclosure, description, section]) => {
    index.push({ standard, disclosure, description, page_reference: section, status: 'Ausstehend', notes: '' });
  });

  if (materialTopics.includes('E1')) {
    const e1 = [
      ['ESRS E1', 'E1-1', 'Übergangsplan Klimawandel'],
      ['ESRS E1', 'E1-2', 'Strategien Klimawandel'],
      ['ESRS E1', 'E1-3', 'Maßnahmen Klimawandel'],
      ['ESRS E1', 'E1-4', 'Ziele Klimawandel'],
      ['ESRS E1', 'E1-5', 'Energieverbrauch'],
      ['ESRS E1', 'E1-6', 'Treibhausgasemissionen'],
      ['ESRS E1', 'E1-7', 'THG-Abbau und -Minderungsprojekte'],
      ['ESRS E1', 'E1-8', 'Interne CO2-Bepreisung'],
      ['ESRS E1', 'E1-9', 'Finanzielle Auswirkungen'],
    ];
    e1.forEach(([standard, disclosure, description]) => {
      index.push({ standard, disclosure, description, page_reference: 'Umwelt', status: 'Ausstehend', notes: '' });
    });
  }
  if (materialTopics.includes('E2')) {
    index.push({ standard: 'ESRS E2', disclosure: 'E2-1 bis E2-6', description: 'Umweltverschmutzung', page_reference: 'Umwelt', status: 'Ausstehend', notes: '' });
  }
  if (materialTopics.includes('E3')) {
    index.push({ standard: 'ESRS E3', disclosure: 'E3-1 bis E3-5', description: 'Wasser und Meeresressourcen', page_reference: 'Umwelt', status: 'Ausstehend', notes: '' });
  }
  if (materialTopics.includes('E4')) {
    index.push({ standard: 'ESRS E4', disclosure: 'E4-1 bis E4-6', description: 'Biodiversität und Ökosysteme', page_reference: 'Umwelt', status: 'Ausstehend', notes: '' });
  }
  if (materialTopics.includes('E5')) {
    index.push({ standard: 'ESRS E5', disclosure: 'E5-1 bis E5-6', description: 'Kreislaufwirtschaft', page_reference: 'Umwelt', status: 'Ausstehend', notes: '' });
  }

  if (materialTopics.includes('S1')) {
    const s1 = [
      ['ESRS S1', 'S1-1', 'Strategien eigene Belegschaft'],
      ['ESRS S1', 'S1-2', 'Einbeziehung Arbeitskräfte'],
      ['ESRS S1', 'S1-3', 'Abhilfemaßnahmen'],
      ['ESRS S1', 'S1-4', 'Maßnahmen eigene Belegschaft'],
      ['ESRS S1', 'S1-5', 'Ziele eigene Belegschaft'],
      ['ESRS S1', 'S1-6', 'Merkmale der Beschäftigten'],
      ['ESRS S1', 'S1-7', 'Merkmale nicht-angestellte Arbeitskräfte'],
      ['ESRS S1', 'S1-8', 'Tarifbindung'],
      ['ESRS S1', 'S1-9', 'Diversitätskennzahlen'],
      ['ESRS S1', 'S1-10', 'Angemessene Entlohnung'],
      ['ESRS S1', 'S1-11', 'Sozialschutz'],
      ['ESRS S1', 'S1-12', 'Menschen mit Behinderungen'],
      ['ESRS S1', 'S1-13', 'Aus- und Weiterbildung'],
      ['ESRS S1', 'S1-14', 'Gesundheit und Sicherheit'],
      ['ESRS S1', 'S1-15', 'Work-Life-Balance'],
      ['ESRS S1', 'S1-16', 'Vergütungskennzahlen'],
      ['ESRS S1', 'S1-17', 'Vorfälle, Beschwerden, Auswirkungen'],
    ];
    s1.forEach(([standard, disclosure, description]) => {
      index.push({ standard, disclosure, description, page_reference: 'Soziales', status: 'Ausstehend', notes: '' });
    });
  }
  if (materialTopics.includes('S2')) {
    index.push({ standard: 'ESRS S2', disclosure: 'S2-1 bis S2-5', description: 'Arbeitskräfte in der Wertschöpfungskette', page_reference: 'Soziales', status: 'Ausstehend', notes: '' });
  }
  if (materialTopics.includes('S3')) {
    index.push({ standard: 'ESRS S3', disclosure: 'S3-1 bis S3-5', description: 'Betroffene Gemeinschaften', page_reference: 'Soziales', status: 'Ausstehend', notes: '' });
  }
  if (materialTopics.includes('S4')) {
    index.push({ standard: 'ESRS S4', disclosure: 'S4-1 bis S4-5', description: 'Verbraucher und Endnutzer', page_reference: 'Soziales', status: 'Ausstehend', notes: '' });
  }

  if (materialTopics.includes('G1')) {
    const g1 = [
      ['ESRS G1', 'G1-1', 'Unternehmenspolitik und -kultur'],
      ['ESRS G1', 'G1-2', 'Management Geschäftsbeziehungen'],
      ['ESRS G1', 'G1-3', 'Korruptionsprävention'],
      ['ESRS G1', 'G1-4', 'Korruptionsvorfälle'],
      ['ESRS G1', 'G1-5', 'Politische Einflussnahme'],
      ['ESRS G1', 'G1-6', 'Zahlungspraktiken'],
    ];
    g1.forEach(([standard, disclosure, description]) => {
      index.push({ standard, disclosure, description, page_reference: 'Governance', status: 'Ausstehend', notes: '' });
    });
  }

  return index;
}
