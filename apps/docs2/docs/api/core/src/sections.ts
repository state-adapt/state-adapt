import { Section } from '../../../../section-paths';

// Read apps/docs2/curated-api-docs.md before editing this file.
export const sections: Section[] = [
  {
    name: 'Adapters',
    items: ['Adapter', 'createAdapter', 'buildAdapter', 'joinAdapters'],
  },
  {
    name: 'Actions',
    items: ['Action', 'getAction'],
  },
  {
    name: 'Misc',
    items: ['getId'],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/core/src/${symbol}.md`,
      link: `/api/core/src/${symbol}`,
      section: name,
    },
  })),
}));
