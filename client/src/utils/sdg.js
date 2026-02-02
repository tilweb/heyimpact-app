export const SDG_DEFINITIONS = {
  1: { name: 'Keine Armut', icon: '🏠', color: '#E5243B' },
  2: { name: 'Kein Hunger', icon: '🍽️', color: '#DDA63A' },
  3: { name: 'Gesundheit und Wohlergehen', icon: '❤️', color: '#4C9F38' },
  4: { name: 'Hochwertige Bildung', icon: '📚', color: '#C5192D' },
  5: { name: 'Geschlechtergleichheit', icon: '⚧️', color: '#FF3A21' },
  6: { name: 'Sauberes Wasser und Sanitäreinrichtungen', icon: '💧', color: '#26BDE2' },
  7: { name: 'Bezahlbare und saubere Energie', icon: '⚡', color: '#FCC30B' },
  8: { name: 'Menschenwürdige Arbeit und Wirtschaftswachstum', icon: '💼', color: '#A21942' },
  9: { name: 'Industrie, Innovation und Infrastruktur', icon: '🏭', color: '#FD6925' },
  10: { name: 'Weniger Ungleichheiten', icon: '⚖️', color: '#DD1367' },
  11: { name: 'Nachhaltige Städte und Gemeinden', icon: '🏙️', color: '#FD9D24' },
  12: { name: 'Nachhaltiger Konsum und Produktion', icon: '♻️', color: '#BF8B2E' },
  13: { name: 'Maßnahmen zum Klimaschutz', icon: '🌍', color: '#3F7E44' },
  14: { name: 'Leben unter Wasser', icon: '🐟', color: '#0A97D9' },
  15: { name: 'Leben an Land', icon: '🌲', color: '#56C02B' },
  16: { name: 'Frieden, Gerechtigkeit und starke Institutionen', icon: '⚖️', color: '#00689D' },
  17: { name: 'Partnerschaften zur Erreichung der Ziele', icon: '🤝', color: '#19486A' },
};

export const ESRS_SDG_MAPPING = {
  E1: [7, 9, 13],
  E2: [3, 6, 12, 14, 15],
  E3: [6, 14],
  E4: [14, 15],
  E5: [9, 12],
  S1: [3, 4, 5, 8, 10],
  S2: [1, 8, 10, 12],
  S3: [1, 2, 3, 6, 11],
  S4: [3, 12, 16],
  G1: [8, 12, 16, 17],
};

export function getSDGDisplay(num) {
  const sdg = SDG_DEFINITIONS[num];
  return sdg ? `${num} ${sdg.icon} ${sdg.name}` : `SDG ${num}`;
}

export function getRelevantSDGs(topicCode) {
  return ESRS_SDG_MAPPING[topicCode] || [];
}
