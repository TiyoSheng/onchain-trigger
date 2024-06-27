<script setup>
import { ref } from 'vue'
import { useUtils } from '../../hooks/utils'

const { copy } = useUtils()

const privateKey = ref('')

defineExpose({
  privateKey
});

</script>
<template>
  <div v-if="privateKey" class="private-key flex-center-center" @click="() => privateKey = 0">
    <div class="private-key-content" @click.stop>
      <p>当前钱包私钥：</p>
      <p class="value" @click="copy(privateKey)">{{ privateKey }}</p>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.private-key {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 999;
  .private-key-content {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    padding: 16px;
    font-size: 14px;
    line-height: 20px;
    .value {
      color: #262C33;
      margin-bottom: 8px;
      background: #F8F9FA;
      border-radius: 8px;
      padding: 8px 12px;
      margin-top: 8px;
      cursor: pointer;
    }
  }
}
</style>