export const SectionColors = [
  { key: 'red', color: '#EF5350', label: 'Red' },
  { key: 'pink', color: '#EC407A', label: 'Pink' },
  { key: 'purple', color: '#AB47BC', label: 'Purple' },
  { key: 'indigo', color: '#5C6BC0', label: 'Indigo' },
  { key: 'blue', color: '#42A5F5', label: 'Blue' },
  { key: 'teal', color: '#26A69A', label: 'Teal' },
  { key: 'green', color: '#66BB6A', label: 'Green' },
  { key: 'orange', color: '#FFA726', label: 'Orange' },
  { key: 'brown', color: '#8D6E63', label: 'Brown' },
  { key: 'gray', color: '#78909C', label: 'Gray' },
];

export const getColorByKey = (key) => {
  return SectionColors.find((c) => c.key === key) || SectionColors[3];
};
