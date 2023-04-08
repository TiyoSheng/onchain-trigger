<script setup>
import { ref } from 'vue'
import { useMessage } from "naive-ui"

const message = useMessage()

const emit = defineEmits(['submit'])

const password = ref('')
const showAddModal = ref(false)

const handleCreated = async () => {
  if (!password.value) {
    message.error('请输入密码')
    return
  }
  emit('submit', password.value)
  cancel()
}

const cancel = () => {
  showAddModal.value = false
  password.value = ''
}

defineExpose({
  showAddModal
});
</script>

<template>
  <n-modal
    v-model:show="showAddModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    title="请输入密码"
    @afterLeave="cancel"
  >
    <div>
      <n-form-item label="输入密码" >
        <n-input v-model:value="password" placeholder="请输入密码" />
      </n-form-item>
      <n-form-item style="display: flex;justify-content: flex-end;">
        <n-button attr-type="button" @click="cancel">取消</n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleCreated">确认</n-button>
      </n-form-item>
    </div>
  </n-modal>
</template>
