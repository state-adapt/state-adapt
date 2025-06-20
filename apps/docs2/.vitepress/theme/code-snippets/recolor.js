// recolor-houston.js
import fs from 'fs';
const map = {
  // Gray/white
  '#BBBBBB': '#FFFFFF',

  // Blue
  '#54B9FF': 'var(--vp-c-brand-1)',

  // Purple
  '#ACAFFF': 'var(--vp-c-brand-3-light-5)',

  // Yellow
  '#FFD493': 'var(--vp-c-brand-2-light-4)',
};

const theme = JSON.parse(fs.readFileSync('houston.json', 'utf8'));

theme.tokenColors.unshift({
  scope: '',
  settings: {
    foreground: '#eef0f9',
  },
});

theme.tokenColors.forEach((rule, i) => {
  const c = rule.settings?.foreground?.toUpperCase();
  if (i < 20) console.log(c, map[c]);
  if (map[c]) {
    rule.settings.foreground = map[c];
  }
});

fs.writeFileSync('sa-dark.json', JSON.stringify(theme, null, 2));
console.log('✅ All colours remapped; scopes untouched.');
