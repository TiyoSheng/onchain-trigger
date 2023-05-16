<script setup>
import { ref } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'
import { useMessage } from "naive-ui"
import { defaultChains } from '../../libs/chains'

const { store, setTriggrts, setActivatedId } = useGlobalStore()
const message = useMessage()

const showAddModal = ref(false)
const isEdit = ref(false)
const triggerData = ref({
  name: '',
  note: '',
  id: '',
  functions: [],
  triggers: [],
  globalParams: [],
  flows: [],
  remark: {}
})

const handleAddClick = async () => {
  if (!triggerData.value.name) {
    message.error('请输入触发器名称')
    return
  } else if (!triggerData.value.chainId) {
    message.error('请选择网络')
    return
  }
  let triggers = store.state.triggers
  if (!triggerData.value.id) {
    triggerData.value.id = crypto.randomUUID()
    triggers.push(triggerData.value)
  } else {
    let index = triggers.findIndex(item => item.id === triggerData.value.id)
    triggers.splice(index, 1, triggerData.value)
  }
  await setTriggrts(triggers)
  await setActivatedId(triggerData.value.id)
  cancel()
}
const cancel = () => {
  showAddModal.value = false
  triggerData.value = {
    name: '',
    note: '',
    id: '',
    functions: [],
    triggers: [],
    globalParams: [],
    flows: [],
    remark: {}
  }
}

defineExpose({
  showAddModal,
  triggerData,
  isEdit
});

</script>
<template>
  <div class="add-trigger">
    <n-modal 
      v-model:show="showAddModal"
      :mask-closable="false"
      :style="{width: '600px', 'border-radius': '10px'}"
      preset="card"
      @afterLeave="cancel"
      title="新增触发器">
      <n-form-item label="触发器名称：">
        <n-input v-model:value="triggerData.name" placeholder="输入触发器名称" />
      </n-form-item>
      <n-form-item label="选择网络：">
        <n-select 
          v-model:value="triggerData.chainId"
          :options="defaultChains"
          label-field="name"
          value-field="chainId"
          placeholder="请选择网络"
        />
      </n-form-item>
      <n-form-item label="备注：">
        <n-input v-model:value="triggerData.note" type="textarea" placeholder="输入备注" />
      </n-form-item>
      <n-form-item style="justify-content: flex-end;display:flex">
        <n-button attr-type="button" @click="cancel">
          取消
        </n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleAddClick">
          确认
        </n-button>
      </n-form-item>
    </n-modal>
  </div>
</template>