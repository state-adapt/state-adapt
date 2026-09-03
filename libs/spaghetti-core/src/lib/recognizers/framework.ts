import * as ts from 'typescript';

import { CommandRecognitionContext, CommandRecognizer } from './types';

interface FrameworkFunction {
  api: string;
  importSource: string;
  functions: readonly string[];
}

const frameworkFunctions: readonly FrameworkFunction[] = [
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

export const frameworkApiNames = frameworkFunctions.map(entry => entry.api);

export const frameworkRecognizer: CommandRecognizer = {
  name: 'framework',
  recognize(call, context) {
    const imported = importedFunction(call.expression, context);
    if (!imported) return undefined;
    const match = frameworkFunctions.find(
      entry =>
        entry.importSource === imported.source && entry.functions.includes(imported.name),
    );
    return match ? { api: match.api, resource: call.expression } : undefined;
  },
};

function frameworkFunction(
  api: string,
  importSource: string,
  functions: readonly string[],
): FrameworkFunction {
  return { api, importSource, functions };
}

function importedFunction(
  expression: ts.LeftHandSideExpression,
  context: CommandRecognitionContext,
): { name: string; source: string } | undefined {
  if (ts.isIdentifier(expression)) {
    const source = context.importSource(expression.text);
    if (!source) return undefined;
    return {
      name: context.importedName(expression.text) ?? expression.text,
      source,
    };
  }
  if (
    ts.isPropertyAccessExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    context.importedName(expression.expression.text) === '*'
  ) {
    const source = context.importSource(expression.expression.text);
    return source ? { name: expression.name.text, source } : undefined;
  }
  return undefined;
}
