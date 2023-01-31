<template>
  <div class="add-trigger">
    <n-modal 
      v-model:show="showModal"
      :mask-closable="false"
      :style="{width: '600px', 'border-radius': '10px'}"
      preset="card"
      title="新增触发器">
      <Form ref="form" />
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
import Form from '@/components/Form.vue'
import { getLs, setLs } from '@/service/service'
import { useStore } from 'vuex'
export default {
  components: {
    Form
  },
  setup() {
    const store = useStore()
    const showModal = ref(false)
    const form = ref(null)
    const handleAddClick = async () => {
      let formValue = form.value.formValue
      formValue.funInputs = form.value.funInputs
      formValue.filterFun = form.value.filterFun
      formValue.filterValue = form.value.filterValue
      formValue.abi = form.value.abi
      formValue.applyAbi = form.value.applyAbi
      formValue.applyInputs = form.value.applyInputs
      formValue.inputFun = form.value.inputFun
      formValue.inputValue = form.value.inputValue
      formValue.msgList = []
      formValue.id = new Date().getTime()
      let triggers = await getLs('triggers') || []
      triggers.push(formValue)
      console.log(triggers)
      setLs('triggers', JSON.parse(JSON.stringify(triggers))).then(res => {
        console.log(res)
        store.commit('setTriggers', res)
        cancel()
      })
    }
    const cancel = () => {
      form.value.cancel()
      showModal.value = false
    }
    return {
      form,
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