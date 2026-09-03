import { ApiCommandPattern } from '@state-adapt/spaghetti-core';

export const frameworkApiPatterns: readonly ApiCommandPattern[] = [
  frameworkFunction('Angular.enableProdMode', '@angular/core', ['enableProdMode']),
  frameworkFunction('Angular.bootstrapApplication', '@angular/platform-browser', [
    'bootstrapApplication',
  ]),
  frameworkFunction(
    'Angular.platformBrowserDynamic',
    '@angular/platform-browser-dynamic',
    ['platformBrowserDynamic'],
  ),
  frameworkFunction('React.createRoot', 'react-dom/client', ['createRoot']),
  frameworkFunction('React.hydrateRoot', 'react-dom/client', ['hydrateRoot']),
  frameworkFunction('Vue.createApp', 'vue', ['createApp', 'createSSRApp']),
  frameworkFunction('Svelte.mount', 'svelte', ['mount', 'hydrate']),
  frameworkFunction('Solid.render', 'solid-js/web', ['render', 'hydrate']),
  frameworkFunction('Preact.render', 'preact', ['render', 'hydrate']),
];

export const defaultAllowedApis = frameworkApiPatterns.map(pattern => pattern.name);

function frameworkFunction(
  name: string,
  importSource: string,
  functions: string[],
): ApiCommandPattern {
  return {
    name,
    functions,
    importSources: [importSource],
    resource: 'callee',
  };
}
