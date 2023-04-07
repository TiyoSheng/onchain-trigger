<script setup>
import { ref, watch } from 'vue'
import { setLs } from '../libs/storage'
import { useGlobalStore } from '../hooks/globalStore'
import Wallet from './Wallet.vue'
import Tabs from './Tabs.vue'

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
  await setLs('triggers', JSON.parse(JSON.stringify(triggers)))
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

</script>
<template>
  <div class="trigger-detail">
    <div v-if="triggerData.id">
      <Wallet :trigger="triggerData" @setTrigger="setTrigger" />
      <Tabs :trigger="triggerData" @setTrigger="setTrigger" />
    </div>
    <div v-else class="flex-center-center">
      <n-empty description="暂无内容哦，请先添加触发器">
        <template #extra>
          <div class="btn" style="width: 200px;height: 40px" @click="createTrigger">添加触发器</div>
        </template>
      </n-empty>
    </div>
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