export const ESRS_TOPICS = [
  { code: 'E1', name: 'E1 - Klimawandel', category: 'environmental', color: '#059669' },
  { code: 'E2', name: 'E2 - Umweltverschmutzung', category: 'environmental', color: '#059669' },
  { code: 'E3', name: 'E3 - Wasser- und Meeresressourcen', category: 'environmental', color: '#059669' },
  { code: 'E4', name: 'E4 - Biodiversität und Ökosysteme', category: 'environmental', color: '#059669' },
  { code: 'E5', name: 'E5 - Kreislaufwirtschaft', category: 'environmental', color: '#059669' },
  { code: 'S1', name: 'S1 - Eigene Belegschaft', category: 'social', color: '#7C3AED' },
  { code: 'S2', name: 'S2 - Arbeitskräfte in der Wertschöpfungskette', category: 'social', color: '#7C3AED' },
  { code: 'S3', name: 'S3 - Betroffene Gemeinschaften', category: 'social', color: '#7C3AED' },
  { code: 'S4', name: 'S4 - Verbraucher und Endnutzer', category: 'social', color: '#7C3AED' },
  { code: 'G1', name: 'G1 - Unternehmenspolitik', category: 'governance', color: '#2563EB' },
];

export const TOPIC_CATEGORIES = {
  environmental: { label: 'Umwelt', color: '#059669', icon: '🌿' },
  social: { label: 'Soziales', color: '#7C3AED', icon: '👥' },
  governance: { label: 'Governance', color: '#2563EB', icon: '⚖️' },
};

export function getTopicByCode(code) {
  return ESRS_TOPICS.find(t => t.code === code);
}

export function getTopicCategory(code) {
  const topic = getTopicByCode(code);
  return topic ? TOPIC_CATEGORIES[topic.category] : null;
}
