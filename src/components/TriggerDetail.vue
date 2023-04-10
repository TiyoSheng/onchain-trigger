<script setup>
import { ref, watch } from 'vue'
import { useGlobalStore } from '../hooks/globalStore'
import Wallet from './Wallet.vue'
import Tabs from './Tabs.vue'
import Share from './form/Share.vue'

const emit = defineEmits(['createTrigger'])

const { store, setTriggrts } = useGlobalStore()

const triggerData = ref({
  name: '',
  note: '',
  id: '',
  functions: [],
  triggers: [],
  globalParams: [],
  flows: [],
  remark: {},
  wallet: {}
})
const shareRef = ref(null)

const createTrigger = () => {
  emit('createTrigger')
}

const setTrigger = async (item) => {
  let triggers = store.state.triggers
  let index = triggers.findIndex(i => i.id === item.id)
  if (index > -1) {
    triggers[index] = item
  } else {
    triggers.push(item)
  }
  await setTriggrts(triggers)
}

const getContract = (id) => {
  return store.state.contracts.find(item => item.id === id)
}

const showShare = () => {
  console.log('showShare', triggerData.value)
  shareRef.value.showModal = true
  if (triggerData.value.trigger_id) {
    shareRef.value.info.triggerId = triggerData.value.trigger_id
  }
}

watch(() => store.state.activatedId, (activatedId) => {
  if (activatedId) {
    let trigger = store.state.triggers.find(item => item.id === activatedId)
    if (trigger) {
      triggerData.value = trigger
    }
  } else {
    triggerData.value = {
      name: '',
      note: '',
      id: '',
      functions: [],
      triggers: [],
      globalParams: [],
      flows: [],
      remark: {},
      wallet: {}
    }
  }
}, {immediate: true})

watch(() => store.state.triggers, (val) => {
  if (val && store.state.activatedId) {
    const trigger = store.state.triggers.find(item => item.id === store.state.activatedId)
    if (trigger) {
      triggerData.value = trigger
    }
  }
}, {immediate: true, deep: true})

</script>
<template>
  <div class="trigger-detail">
    <div v-if="triggerData.id" class="content">
      <div>
        <Wallet :trigger="triggerData" @setTrigger="setTrigger" />
        <Tabs :trigger="triggerData" @setTrigger="setTrigger" />
      </div>
      <div class="share flex-center-center" @click="showShare">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.2083 5.66667C12.0137 5.66667 12.6667 5.01374 12.6667 4.20833C12.6667 3.40292 12.0137 2.75 11.2083 2.75C10.4029 2.75 9.75 3.40292 9.75 4.20833C9.75 5.01374 10.4029 5.66667 11.2083 5.66667Z" stroke="#4C4F53" stroke-linejoin="round"/>
          <path d="M4.79171 9.45817C5.59712 9.45817 6.25004 8.80525 6.25004 7.99984C6.25004 7.19443 5.59712 6.5415 4.79171 6.5415C3.9863 6.5415 3.33337 7.19443 3.33337 7.99984C3.33337 8.80525 3.9863 9.45817 4.79171 9.45817Z" stroke="#4C4F53" stroke-linejoin="round"/>
          <path d="M9.75019 4.95898L6.05737 7.19633" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.05713 8.74805L9.94808 11.0473" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11.2083 10.3335C12.0137 10.3335 12.6667 10.9864 12.6667 11.7918C12.6667 12.5972 12.0137 13.2502 11.2083 13.2502C10.4029 13.2502 9.75 12.5972 9.75 11.7918C9.75 10.9864 10.4029 10.3335 11.2083 10.3335Z" stroke="#4C4F53" stroke-linejoin="round"/>
        </svg>
        <span>分享Trigger</span>
      </div>
    </div>
    <div v-else class="flex-center-center">
      <n-empty description="暂无项目,请先添加">
        <template #extra>
          <div class="btn" style="width: 200px;height: 40px" @click="createTrigger">添加项目</div>
        </template>
      </n-empty>
    </div>
  </div>
  <Share ref="shareRef" />
</template>

<style lang="scss" scoped>
.trigger-detail {
  flex: 0 0 648px;
  width: 648px;
  padding: 24px;
  box-sizing: border-box;
  height: calc(100vh - 64px);
  overflow: hidden;
  position: relative;
}
.content {
  height: 100%;
  padding-bottom: 50px;
  box-sizing: border-box;
  overflow-y: auto;
}
.share {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  background: #FFFFFF;
  border-top: 1px solid #EEEFF0;
  cursor: pointer;
  span {
    margin-left: 8px;
    font-size: 13px;
    line-height: 16px;
    color: #262C33;
  }
}
</style>