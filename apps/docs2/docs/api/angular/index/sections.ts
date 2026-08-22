import { Section } from '../../../../section-paths';

// Read apps/docs2/curated-api-docs.md before editing this file.
export const sections: Section[] = [
  {
    name: 'Global Configuration',
    items: ['provideStore', 'defaultStoreProvider', 'IS_STORE_LOCAL'],
  },
  {
    name: 'Store',
    items: ['adapt', 'watch'],
  },
  {
    name: 'Signals',
    items: ['toSignal'],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/angular/index/${symbol}.md`,
      link: `/api/angular/index/${symbol}`,
      section: name,
    },
  })),
}));
