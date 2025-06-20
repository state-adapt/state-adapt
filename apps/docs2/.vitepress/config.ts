import { DefaultTheme, defineConfig } from 'vitepress';

import myCodeTheme from './theme/code-snippets/sa-dark.json';
import { version } from '../../../package.json';

const frameworks = {
  angular: 'Angular',
  react: 'React',
  solid: 'Solid',
  svelte: 'Svelte',
  vue: 'Vue',
};

type FrameworkKey = keyof typeof frameworks;
const frameworkKeys = Object.keys(frameworks) as FrameworkKey[];

export default defineConfig({
  lang: 'en-US',
  head: [
    [
      'link',
      { rel: 'icon', href: '/assets/sa3-3.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    ['link', { rel: 'mask-icon', href: '/assets/sa3-3.svg', color: '#ffffff' }],
  ],
  title: 'StateAdapt',
  description: 'Vite & Vue powered static site generator.',
  srcDir: 'docs',
  rewrites: {
    'guide/:framework/examples/index.md':
      'guide/:framework/examples/incremental-complexity.md',
  },
  themeConfig: {
    logo: {
      src: '/assets/sa3-3.svg',
      alt: 'StateAdapt Logo',
    },
    editLink: {
      pattern: 'https://github.com/state-adapt/state-adapt/tree/main/apps/docs/:path',
      text: 'Suggest changes to this page',
    },
    nav: [
      {
        text: 'Guide',
        activeMatch: '^/guide',
        link: '/guide/',
      },
      {
        text: 'API',
        activeMatch: '^/api',
        link: '/api/',
      },

      {
        text: `v${version}`,
        items: [
          {
            items: [
              {
                text: `v${version}`,
                link: `https://github.com/state-adapt/state-adapt/releases/tag/v${version}`,
              },
            ],
          },
          {
            items: [
              {
                text: 'v2.0.8',
                link: '/2-0-8/',
              },
              {
                text: 'v1.2.1',
                link: '/1-2-1/',
              },
            ],
          },
        ],
      },
    ],

    sidebar: {
      api: getSidebar(),
      guide: getSidebar(),
    },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/state-adapt/state-adapt' }],
  },

  markdown: {
    theme: {
      // dark: 'dark-plus',
      dark: {
        name: 'sa-dark',
        settings: myCodeTheme.tokenColors,
      },
      light: 'light-plus',
    },
  },
});

function getSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Guide',
      collapsed: false,
      items: getGuideSidebar(),
    },
    {
      text: 'API Reference',
      collapsed: false,
      items: getApiSidebar(),
    },
  ];
}

function getGuideSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Overview',
      link: '/guide/overview',
    },
    {
      text: 'Getting Started',
      link: `/guide/getting-started/`,
    },
    {
      text: 'Examples',
      link: '/guide/examples/',
    },
    ...getFrameworkSidebar('angular', []),
    ...getFrameworkSidebar('react', []),
    ...getFrameworkSidebar('solid', []),
    ...getFrameworkSidebar('svelte', []),
    // ...getFrameworkSidebar('vue', []),
  ];
}

function getFrameworkSidebar(
  framework: FrameworkKey,
  examples: DefaultTheme.SidebarItem[],
): DefaultTheme.SidebarItem[] {
  return [
    {
      text: frameworks[framework],
      collapsed: true,
      base: `/guide/${framework}/`,
      items: [
        {
          text: 'Getting Started',
          link: `getting-started`,
        },
        {
          text: 'Examples',
          base: `/guide/${framework}/examples/`,
          link: 'incremental-complexity',
          collapsed: true,
          items: [
            {
              text: 'Incremental Complexity',
              link: `incremental-complexity`,
            },
            // {
            //   text: 'Counter',
            //   link: `counter`,
            // },
          ],
        },
      ],
    },
  ];
}

function getApiSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '@state-adapt/core',
      base: '/api/core/',
      link: `/index`,
      collapsed: false,
      items: [
        // {
        //   text: '&nbsp;',
        //   link: `index`,
        // },
        {
          text: '/adapters',
          base: `/api/core/adapters/`,
          collapsed: true,
          items: [
            { text: 'base', link: `base` },
            { text: 'boolean', link: `boolean` },
            { text: 'number', link: `number` },
            { text: 'string', link: `string` },
            { text: 'array', link: `array` },
            { text: 'entity', link: `entity` },
            // { text: 'object', link: `object/` },
            // { text: 'array', link: `array/` },
            // { text: 'function', link: `function/` },
            // { text: 'date', link: `date/` },
          ],
        },
      ],
    },
    { text: '@state-adapt/rxjs', link: `api/rxjs` },
    { text: '@state-adapt/angular', link: `api/angular` },
    { text: '@state-adapt/react', link: `api/react` },
    { text: '@state-adapt/solid', link: `api/solid` },
    { text: '@state-adapt/svelte', link: `api/svelte` },
    { text: '@state-adapt/vue', link: `api/vue` },
  ];
}
