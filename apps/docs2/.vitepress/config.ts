import { DefaultTheme, defineConfig } from 'vitepress';

import myCodeTheme from './theme/code-snippets/sa-dark.json';
import { version } from '../../../package.json';
import typedocSidebar from '../docs/api/typedoc/typedoc-sidebar.json';
import corePaths from '../docs/api/core/src/symbol.paths';
import rxjsPaths from '../docs/api/rxjs/index/symbol.paths';
import angularPaths from '../docs/api/angular/index/symbol.paths';
import reactPaths from '../docs/api/react/index/symbol.paths';
import { Section } from 'section-paths';
import { resolve } from 'path';

function getLibSectionItems(sections: Section[]): DefaultTheme.SidebarItem[] {
  return sections.map(({ name, items }) => ({
    text: name,
    collapsed: true,
    items: items.map(item => ({
      text: item.def.symbol.split('-')[0], // Source and source too similar, so source-1 is used
      link: item.def.link,
    })),
  }));
}

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
    ['link', { rel: 'icon', href: '/sa3-3.svg', sizes: 'any', type: 'image/svg+xml' }],
    ['link', { rel: 'mask-icon', href: '/sa3-3.svg', color: '#ffffff' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // basic OG
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'StateAdapt' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'State Management that adapts with complexity.',
      },
    ],
    ['meta', { property: 'og:url', content: 'https://state-adapt.github.io/' }],
    [
      'meta',
      { property: 'og:image', content: 'https://state-adapt.github.io/sa-cover2.png' },
    ],
  ],
  title: 'StateAdapt',
  description: 'Vite & Vue powered static site generator.',
  srcDir: 'docs',
  srcExclude: ['**/api/typedoc/**'],
  rewrites: {
    // 'api/typedoc/:lib/src/:kind/:symbol': '/api/:lib/:symbol',
  },
  themeConfig: {
    logo: {
      src: '/sa3-3.svg',
      alt: 'StateAdapt Logo',
    },
    editLink: {
      pattern:
        'https://github.com/state-adapt/state-adapt/tree/main/apps/docs2/docs/:path',
      text: 'Suggest changes to this page',
    },
    nav: [
      {
        text: 'Guide',
        activeMatch: '^/guide',
        link: '/guide/overview/',
      },
      {
        text: 'API',
        activeMatch: '^/api',
        link: `/api/core/src/`,
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
              // Next:
              // {
              //   text: 'v4.1.4',
              //   link: 'https://state-adapt.github.io/v/4/',
              // },
              // Can make the link whatever. Just has to match the Nx command base.
              // {
              //   text: 'v3.2.0',
              //   link: 'https://state-adapt.github.io/v/3-2-0/',
              // },
              //
              {
                text: 'v3.0.0',
                link: 'https://state-adapt.github.io/versions/3-0-0/',
              },
              {
                text: 'v2.0.8',
                link: 'https://state-adapt.github.io/versions/2-0-8/',
              },
              {
                text: 'v1.2.1',
                link: 'https://state-adapt.github.io/versions/1-2-1/',
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
      text: 'Thinking Reactively',
      base: '/guide/thinking-reactively/',
      collapsed: false,
      items: [
        {
          text: 'The Imperative Trap',
          link: 'imperative-trap',
        },
        {
          text: 'Imperative Conditioning',
          link: 'imperative-conditioning',
        },
        {
          text: 'The Reactivity Rule',
          link: 'the-reactivity-rule',
        },
        {
          text: 'Practice',
          link: 'practice',
        },
      ],
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
    ...getFrameworkSidebar('react', [
      {
        text: 'Counter',
        link: 'counter',
      },
    ]),
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
            ...examples,
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
      link: `/api/core/src/`,
      collapsed: true,
      items: [
        ...getLibSectionItems(corePaths.sections()),
        {
          text: 'Core Adapters',
          // base: `/api/core/core-adapters/`,
          link: `/api/core/adapters/`,
          // collapsed: true,
          // items: [
          //   { text: 'base', link: `base` },
          //   { text: 'boolean', link: `boolean` },
          //   { text: 'number', link: `number` },
          //   { text: 'string', link: `string` },
          //   { text: 'array', link: `array` },
          //   { text: 'entity', link: `entity` },
          //   // { text: 'object', link: `object/` },
          //   // { text: 'date', link: `date/` },
          // ],
        },
      ],
    },
    {
      text: '@state-adapt/rxjs',
      link: `/api/rxjs/index/`,
      collapsed: true,
      items: [...getLibSectionItems(rxjsPaths.sections())],
    },
    {
      text: '@state-adapt/angular',
      link: `/api/angular/index/`,
      collapsed: true,
      items: [...getLibSectionItems(angularPaths.sections())],
    },
    {
      text: '@state-adapt/react',
      link: `/api/react/index/`,
      collapsed: true,
      items: [...getLibSectionItems(reactPaths.sections())],
    },
    // { text: '@state-adapt/solid', link: `/api/solid` },
    // { text: '@state-adapt/svelte', link: `/api/svelte` },
    // { text: '@state-adapt/vue', link: `/api/vue` },
    process.env.NODE_ENV === 'development'
      ? {
          text: 'TypeDoc',
          link: '/api/typedoc/',
          items: typedocSidebar,
        }
      : {},
  ];
}
