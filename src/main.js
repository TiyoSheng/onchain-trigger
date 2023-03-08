import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/reset.scss'
import './assets/css/main.scss'

import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

// Prism
import Prism from 'prismjs';
// highlight code
import 'prismjs/components/prism-json';

VMdEditor.use(vuepressTheme, {
  Prism,
});
import { create, NSelect, NConfigProvider, NMessageProvider, NModal, NCard,
  NFormItem, NInput, NPopconfirm, NTabs, NTabPane, NCollapse, NDivider, NResult,
  NCollapseItem, NPopover, NSpin, NDialogProvider, NInputGroup, NButton, NImage, NTooltip, NForm, NLayout } from 'naive-ui'
const naive = create({
  components: [ NSelect, NConfigProvider, NMessageProvider, NLayout, NCard, NResult,
    NModal, NFormItem, NInput, NPopconfirm, NTabs, NTabPane, NButton, NDivider,
    NCollapse, NCollapseItem, NPopover, NSpin, NDialogProvider, NInputGroup, NImage, NTooltip, NForm ]
})
createApp(App).use(naive).use(VMdEditor).use(store).use(router).mount('#app')
