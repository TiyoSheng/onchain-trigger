import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/reset.scss'
import './assets/css/main.scss'
import { create, NSelect, NConfigProvider, NMessageProvider, NModal, NCard,
  NFormItem, NInput, NPopconfirm, NTabs, NTabPane, NCollapse, NDivider,
  NCollapseItem, NPopover, NSpin, NDialogProvider, NInputGroup, NButton, NImage, NTooltip, NForm, NLayout } from 'naive-ui'
const naive = create({
  components: [ NSelect, NConfigProvider, NMessageProvider, NLayout, NCard,
    NModal, NFormItem, NInput, NPopconfirm, NTabs, NTabPane, NButton, NDivider,
    NCollapse, NCollapseItem, NPopover, NSpin, NDialogProvider, NInputGroup, NImage, NTooltip, NForm ]
})
createApp(App).use(naive).use(store).use(router).mount('#app')
