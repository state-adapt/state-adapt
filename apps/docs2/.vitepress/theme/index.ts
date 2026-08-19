// import StarterLayout from './components/starter-layout.vue';
import DefaultTheme from 'vitepress/theme';

import VersionLinks from './components/version-links.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: any) {
    app.component('VersionLinks', VersionLinks);
  },
};
