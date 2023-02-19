<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    title="当前信息"
  >
    <JsonViewer :value="triggerData" boxed sort expanded expand-depth="2" />
    <n-form-item style="display: flex;justify-content: flex-end;">
      <n-button attr-type="button" @click="copy(triggerData)">复制</n-button>
    </n-form-item>
  </n-modal>
</template>
<script>
import { ref } from 'vue'
import {JsonViewer} from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"
import { useUtils } from '../hooks/useUtils'
export default {
  components: {
    JsonViewer
  },
  setup() {
    const {copy} = useUtils()
    const showModal = ref(false)
    const triggerData = ref({})
    return {
      showModal,
      triggerData,
      copy
    }
  }
}
</script>
<style lang="scss" scoped>

</style>