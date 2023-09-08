import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/reset.css'
import './assets/css/index.css'
import 'vfonts/FiraCode.css'

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

import hljs from 'highlight.js';
// Prism
import Prism from 'prismjs';
// highlight code
import 'prismjs/components/prism-json';

VMdEditor.use(vuepressTheme, {
  Prism,
});
VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

import {
  create, NButton, NLayout, NLayoutHeader, NLayoutFooter, NH2, NLayoutSider,
  NAnchor, NAnchorLink, NMessageProvider, NConfigProvider, NDialogProvider, NInput,
  NFormItem, NModal, NPopconfirm, NPopover, NSelect, NSpin, NDivider, NDatePicker,
  NRadioGroup, NRadioButton, NAffix, NEmpty, NCard, NGrid, NGridItem, NResult, NInputNumber,
  NCountdown, NCollapse, NCollapseItem
} from 'naive-ui'
const naive = create({
  components: [NButton, NLayout, NLayoutHeader, NLayoutFooter, NH2, NLayoutSider,
    NAnchor, NAnchorLink, NMessageProvider, NConfigProvider, NDialogProvider, NInput,
    NFormItem, NModal, NPopconfirm, NPopover, NSelect, NSpin, NDivider, NDatePicker,
    NRadioGroup, NRadioButton, NAffix, NEmpty, NCard, NGrid, NGridItem, NResult, NInputNumber,
    NCountdown, NCollapseItem, NCollapse]
})
createApp(App).use(naive).use(VMdEditor).use(VMdPreview).use(router).mount('#app')
