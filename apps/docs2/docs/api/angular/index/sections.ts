import { Section } from '../../../../section-paths';

export const sections: Section[] = [
  {
    name: 'Global Configuration',
    items: ['defaultStoreProvider', 'provideStore'],
  },
  {
    name: 'Store',
    items: ['adapt', 'watch'],
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
