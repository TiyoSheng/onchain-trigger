<script setup>
import { ref } from 'vue'

const emit = defineEmits(['handleOk'])

const showAddModal = ref(false)
const modalTitle = ref('设置全局变量')
const params = ref([])

const addParams = () => {
  params.value.push({key: '', value: ''})
}

const delParams = (index) => {
  params.value.splice(index, 1)
}

const handleOk = () => {
  params.value = params.value.filter(item => item.key && item.value).map(e => {
    return {
      key: e.key.trim(),
      value: e.value.trim()
    }
  })
  emit('handleOk', params.value)
  cancel()
}

const cancel = () => {
  showAddModal.value = false
  params.value = []
}

defineExpose({
  showAddModal,
  modalTitle,
  params
});
</script>
<template>
  <n-modal
    v-model:show="showAddModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px', maxHeight: '80vh', overflow: 'auto'}"
    preset="card"
    :title="modalTitle"
    @afterLeave="cancel"
  >
    <div v-for="(item, index) in params" :key="index" class="input-item flex-center"  >
      <n-input v-model:value="item.key" placeholder="输入变量名" autocomplete="off" />
      <div style="margin: 8px">=</div>
      <n-input v-model:value="item.value" placeholder="输入变量" autocomplete="off" />
      <div class="del" @click="delParams(index)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    <div class="btn" @click="addParams">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8H13" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 13L8 3" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      添加全局变量
    </div>
    <n-form-item style="display: flex;justify-content: flex-end;">
      <n-button attr-type="button" @click="cancel">取消</n-button>
      <n-button style="margin-left: 20px" attr-type="button" @click="handleOk">确定</n-button>
    </n-form-item>
  </n-modal>
</template>
<style lang="scss" scoped>
.input-item {
  margin-bottom: 8px;
  .del {
    margin-left: 8px;
    font-size: 0;
    cursor: pointer;
    &:hover {
      background: rgba(201, 209, 220, 0.35);
      border-radius: 2px;
    }
  }
}
.btn {
  margin-bottom: 16px;
}
</style>