import { Section } from '../../../../section-paths';

export const sections: Section[] = [
  {
    name: 'Store',
    items: ['adapt', 'watch', 'useStore', 'useAdapt'],
  },
  {
    name: 'Configuration',
    items: ['defaultStateAdapt', 'AdaptContext'],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/react/index/${symbol}.md`,
      link: `/api/react/index/${symbol}`,
      section: name,
    },
  })),
}));
