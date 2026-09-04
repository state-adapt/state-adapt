import { Section } from '../../../../section-paths';

// Read apps/docs2/curated-api-docs.md before editing this file.
export const sections: Section[] = [
  {
    name: 'API recognition',
    items: [
      'ApiDefinition',
      'MethodApiDefinition',
      'FunctionApiDefinition',
      'CallApiDefinition',
      'RecognizedApiDefinition',
    ],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/spaghetti-core/index/${symbol}.md`,
      link: `/api/spaghetti-core/index/${symbol}`,
      section: name,
    },
  })),
}));
