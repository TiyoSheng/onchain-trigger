<template>
  <n-modal
    v-model:show="isShowModal"
    :mask-closable="false"
    :style="{width: '60%', 'border-radius': '10px'}"
    preset="card"
    :title="modalTitle"
    @afterLeave="cancel"
  >
    <div>
      <v-md-editor v-model="text" height="60vh"></v-md-editor>
      <n-form-item style="justify-content: flex-end;display:flex;margin-top: 16px">
        <n-button attr-type="button" @click="cancel">
          取消
        </n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="ok">
          确认
        </n-button>
      </n-form-item>
    </div>
  </n-modal>
</template>
<script>
import { ref } from 'vue'
export default {
  name: 'EditNoteModal',
  setup(props, { emit }) {
    const isShowModal = ref(false)
    const modalTitle = ref('')
    const text = ref('')
    const modalType = ref('')
    const cancel = () => {
      isShowModal.value = false
      text.value = ''
      modalType.value = ''
      modalTitle.value = ''
    }
    const ok = () => {
      emit('setRemark', {data: text.value, type: modalType.value})
      cancel()
    }
    return {
      modalType,
      isShowModal,
      modalTitle,
      text,
      cancel,
      ok
    }
  }
}
</script>
<style lang="scss" scoped>
</style>