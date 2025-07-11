import { Section } from '../../../../section-paths';

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
