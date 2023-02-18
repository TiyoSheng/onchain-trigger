<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    title="当前信息"
  >
    <JsonViewer :value="triggerData" boxed sort expanded expand-depth="3" />
  </n-modal>
</template>
<script>
import { ref } from 'vue'
import {JsonViewer} from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"

export default {
  components: {
    JsonViewer
  },
  setup() {
    const showModal = ref(false)
    const triggerData = ref({})
    return {
      showModal,
      triggerData
    }
  }
}
</script>
<style lang="scss" scoped>

</style>