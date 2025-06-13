import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'Nx VitePress',
  description: 'Vite & Vue powered static site generator.',

  srcDir: 'docs',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '^/$|^/guide/' },
      {
        text: 'API',
        link: '/guide/',
      },
    ],

    sidebar: {
      '/guide/': getGuideSidebar(),
    },
  },
});

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Configuration', link: '/guide/configuration' },
      ],
    },
  ];
}
