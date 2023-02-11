export function setColorScheme(theme: 'light' | 'dark' | 'reset' | '' = '') {
  const themeToSave = theme === 'reset' ? '' : theme;
  theme && localStorage.setItem('theme', themeToSave);

  const browserTheme = window.matchMedia?.('(prefers-color-scheme: dark)')
    .matches
    ? 'dark'
    : 'light';
  const storedTheme = localStorage.getItem('theme');
  const themeToSet = themeToSave || storedTheme || browserTheme || 'dark';
  document.querySelector('html')!.className = `${themeToSet}-theme`;
}

export function getColorScheme() {
  return localStorage.getItem('theme') || 'reset';
}
