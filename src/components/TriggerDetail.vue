<script setup>
import { ref, watch } from 'vue'
import { setLs } from '../libs/storage'
import { useGlobalStore } from '../hooks/globalStore'
import Wallet from './Wallet.vue'
import Tabs from './Tabs.vue'

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

const setTrigger = async (item) => {
  let triggers = store.state.triggers
  let index = triggers.findIndex(i => i.id === item.id)
  if (index > -1) {
    triggers[index] = item
  } else {
    triggers.push(item)
  }
  await setTriggrts(triggers)
  await setLs('triggers', JSON.parse(JSON.stringify(triggers)))
}

watch(() => store.state.activatedId, (activatedId) => {
  if (activatedId) {
    let trigger = store.state.triggers.find(item => item.id === activatedId)
    if (trigger) {
      triggerData.value = trigger
    }
  }
}, {immediate: true})

</script>
<template>
  <div class="trigger-detail">
    <Wallet :trigger="triggerData" @setTrigger="setTrigger" />
    <Tabs :trigger="triggerData" @setTrigger="setTrigger" />
  </div>
</template>

<style lang="scss" scoped>
.trigger-detail {
  flex: 0 0 648px;
  width: 648px;
  padding: 24px;
  box-sizing: border-box;
  height: calc(100vh - 64px);
  overflow-y: auto;
}
</style>