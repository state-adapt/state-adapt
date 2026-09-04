import { Section } from '../../../../section-paths';

// Read apps/docs2/curated-api-docs.md before editing this file.
export const sections: Section[] = [
  {
    name: 'Configuration',
    items: ['NoSpaghettiOptions'],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/eslint-plugin-spaghetti/index/${symbol}.md`,
      link: `/api/eslint-plugin-spaghetti/index/${symbol}`,
      section: name,
    },
  })),
}));
