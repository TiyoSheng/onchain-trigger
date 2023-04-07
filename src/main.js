import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/reset.css'
import './assets/css/index.css'
import 'vfonts/FiraCode.css'
import { create, NButton, NLayout, NLayoutHeader, NLayoutFooter, NH2, NLayoutSider,
  NAnchor, NAnchorLink, NMessageProvider, NConfigProvider, NDialogProvider, NInput,
  NFormItem, NModal, NPopconfirm, NPopover, NSelect, NSpin, NDivider,
  NRadioGroup, NRadioButton, NAffix } from 'naive-ui'
const naive = create({
  components: [NButton, NLayout, NLayoutHeader, NLayoutFooter, NH2, NLayoutSider,
    NAnchor, NAnchorLink, NMessageProvider, NConfigProvider, NDialogProvider, NInput,
    NFormItem, NModal, NPopconfirm, NPopover, NSelect, NSpin, NDivider,
    NRadioGroup, NRadioButton, NAffix]
})
createApp(App).use(naive).use(router).mount('#app')
