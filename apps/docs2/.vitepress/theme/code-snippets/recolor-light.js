// recolor-houston.js
import fs from 'fs';
const map = {
  // Dark
  // '#EEF0F9': '#131313',
  // '#BBBBBB': '#141414',
  // '#EEF0F98F': '#13131360',
  '#001080': 'var(--vp-c-brand-1-dark-6)',

  // Gold
  '#795E26': 'var(--vp-c-brand-1);font-weight:var(--vp-c-brand-1-code-weight)',

  // Red
  '#E50000': 'var(--vp-c-brand-2-dark-2)',
  '#A31515': 'var(--vp-c-brand-2-dark-3)',
  '#800000': 'var(--vp-c-brand-2-dark-5)',

  // Blue
  '#0000FF': 'var(--vp-c-brand-1-dark-3)',
  // '#4BF3C8': '#249080', // A little darker
  // '#00DAEF': '#00A3B5', // A little darker
  // Purple
  '#AF00DB': 'var(--vp-c-brand-3-light-2)',
  // Yellow
  // '#FFD493': 'var(--vp-c-brand-2)',
};

const theme = JSON.parse(fs.readFileSync('light-plus.json', 'utf8'));

theme.tokenColors.unshift({
  scope: '',
  settings: {
    foreground: '#010101',
  },
});

theme.tokenColors.forEach((rule, i) => {
  const c = rule.settings?.foreground?.toUpperCase();
  if (i < 20) console.log(c, map[c]);
  if (map[c]) {
    rule.settings.foreground = map[c];
  }
});

fs.writeFileSync('sa-light.json', JSON.stringify(theme, null, 2));
console.log('✅ All colours remapped; scopes untouched.');
