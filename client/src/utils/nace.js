export const NACE_CODES = [
  ['A', 'A - Land- und Forstwirtschaft, Fischerei'],
  ['01', '01 - Landwirtschaft, Jagd und damit verbundene Tätigkeiten'],
  ['02', '02 - Forstwirtschaft und Holzeinschlag'],
  ['03', '03 - Fischerei und Aquakultur'],
  ['B', 'B - Bergbau und Gewinnung von Steinen und Erden'],
  ['05', '05 - Kohlenbergbau'],
  ['06', '06 - Gewinnung von Erdöl und Erdgas'],
  ['07', '07 - Erzbergbau'],
  ['08', '08 - Gewinnung von Steinen und Erden, sonstiger Bergbau'],
  ['09', '09 - Erbringung von Dienstleistungen für den Bergbau'],
  ['C', 'C - Verarbeitendes Gewerbe'],
  ['10', '10 - Herstellung von Nahrungs- und Futtermitteln'],
  ['11', '11 - Getränkeherstellung'],
  ['13', '13 - Herstellung von Textilien'],
  ['14', '14 - Herstellung von Bekleidung'],
  ['20', '20 - Herstellung von chemischen Erzeugnissen'],
  ['21', '21 - Herstellung von pharmazeutischen Erzeugnissen'],
  ['26', '26 - Herstellung von DV-Geräten, elektronischen und optischen Erzeugnissen'],
  ['28', '28 - Maschinenbau'],
  ['29', '29 - Herstellung von Kraftwagen und Kraftwagenteilen'],
  ['D', 'D - Energieversorgung'],
  ['35', '35 - Energieversorgung'],
  ['F', 'F - Baugewerbe/Bau'],
  ['G', 'G - Handel; Instandhaltung und Reparatur von Kfz'],
  ['46', '46 - Großhandel (ohne Handel mit Kraftfahrzeugen)'],
  ['47', '47 - Einzelhandel (ohne Handel mit Kraftfahrzeugen)'],
  ['H', 'H - Verkehr und Lagerei'],
  ['J', 'J - Information und Kommunikation'],
  ['58', '58 - Verlagswesen'],
  ['61', '61 - Telekommunikation'],
  ['62', '62 - IT-Dienstleistungen'],
  ['62.01', '62.01 - Programmierung'],
  ['62.02', '62.02 - IT-Beratung'],
  ['62.03', '62.03 - Betrieb von Datenverarbeitungseinrichtungen'],
  ['62.09', '62.09 - Sonstige IT-Dienstleistungen'],
  ['63', '63 - Informationsdienstleistungen'],
  ['63.1', '63.1 - Datenverarbeitung, Hosting und Webportale'],
  ['63.11', '63.11 - Datenverarbeitung, Hosting und damit verbundene Tätigkeiten'],
  ['63.12', '63.12 - Webportale'],
  ['K', 'K - Finanz- und Versicherungsdienstleistungen'],
  ['64', '64 - Erbringung von Finanzdienstleistungen'],
  ['65', '65 - Versicherungen, Rückversicherungen und Pensionskassen'],
  ['L', 'L - Grundstücks- und Wohnungswesen'],
  ['M', 'M - Freiberufliche, wissenschaftliche und technische DL'],
  ['69', '69 - Rechts- und Steuerberatung, Wirtschaftsprüfung'],
  ['70', '70 - Unternehmensberatung'],
  ['72', '72 - Forschung und Entwicklung'],
  ['N', 'N - Sonstige wirtschaftliche Dienstleistungen'],
  ['Q', 'Q - Gesundheits- und Sozialwesen'],
  ['86', '86 - Gesundheitswesen'],
];

export const NACE_OPTIONS = ['', ...NACE_CODES.map(([, desc]) => desc)];

export function getNaceCodeFromSelection(selection) {
  if (!selection) return '';
  const parts = selection.split(' - ');
  return parts[0]?.trim() || '';
}

export function findNaceOptionByCode(code) {
  if (!code) return '';
  const found = NACE_CODES.find(([c]) => c === code);
  return found ? found[1] : '';
}
