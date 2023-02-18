<template>
  <div class="add-trigger">
    <n-modal 
      v-model:show="showModal"
      :mask-closable="false"
      :style="{width: '600px', 'border-radius': '10px'}"
      preset="card"
      title="新增触发器">
      <n-form-item label="触发器名称：">
        <n-input v-model:value="triggerName" placeholder="输入触发器名称" />
      </n-form-item>
      <n-form-item label="备注：">
        <n-input v-model:value="triggerNote" type="textarea" placeholder="输入备注" />
      </n-form-item>
      <n-form-item style="justify-content: flex-end;display:flex">
        <n-button attr-type="button" @click="cancel">
          取消
        </n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleAddClick">
          添加
        </n-button>
      </n-form-item>
    </n-modal>
  </div>
</template>
<script>
import { ref } from 'vue'
import { getLs, setLs } from '@/service/service'
import { useStore } from 'vuex'
export default {
  setup() {
    const store = useStore()
    const showModal = ref(false)
    const triggerName = ref('')
    const triggerNote = ref('')
    const handleAddClick = async () => {
      let triggerData = {
        name: triggerName.value,
        note: triggerNote.value,
        id: crypto.randomUUID(),
        functions: [],
        triggers: [],
        globalParams: []
      }

      // triggers: [{
      //     contractId: '',
      //     filterArgs: [],
      //     functionName: '',
      //     methodType: '',
      //     handleList: [],
      //   }]
      let triggers = await getLs('triggers') || []
      triggers.push(triggerData)
      console.log(triggers)
      setLs('triggers', JSON.parse(JSON.stringify(triggers))).then(res => {
        store.commit('setTriggers', res)
        setLs('activatedId', triggerData.id).then(() => {
          store.commit('setActivatedId', triggerData.id)
        })
        cancel()
      })
    }
    const cancel = () => {
      triggerName.value = ''
      triggerNote.value = ''
      showModal.value = false
    }
    return {
      triggerName,
      triggerNote,
      showModal,
      cancel,
      handleAddClick
    }
  },
}
</script>
<style lang="scss" scoped>
.input-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;
}
</style>
<style>
  .n-form-item .n-form-item-blank {
    display: block;
  }
</style>