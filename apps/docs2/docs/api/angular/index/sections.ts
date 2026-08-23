import { Section } from '../../../../section-paths';

// Read apps/docs2/README.md before editing this file.
export const sections: Section[] = [
  {
    name: 'Store',
    items: ['adapt', 'watch'],
  },
  {
    name: 'Signals',
    items: ['toSignal'],
  },
  {
    name: 'Global Configuration',
    items: ['provideStore', 'defaultStoreProvider', 'IS_STORE_LOCAL'],
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
