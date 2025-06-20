// import StarterLayout from './components/starter-layout.vue';
import DefaultTheme from 'vitepress/theme';

import { h } from 'vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  // override the Layout with a wrapper component that injects the slots
  // Layout: StarterLayout,
  enhanceApp({ app }: any) {},
};
