<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    class="custom-card"
    preset="card"
    :style="{width: '600px', 'border-radius': '10px'}"
    title="分享Trigger"
    :on-after-leave="afterLeave"
  >
    <div v-if="!info.triggerId">
      <n-form-item label="输入密码：" :rule="rule">
        <n-input v-model:value="info.password" placeholder="输入密码" />
      </n-form-item>
      <n-form-item style="display: flex;justify-content: flex-end;">
        <n-button attr-type="button" @click="afterLeave">取消</n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="share">分享</n-button>
      </n-form-item>
    </div>
    <div v-else>
      <n-result status="success" title="Share success" description="Share your link">
        <template #footer>
          <div class="input flex-center" @click="copy(link)">
            <div class="link flex-center" >{{link}}</div>
            <div class="copy-btn flex-center-center">Copy link</div>
          </div>
        </template>
      </n-result>
    </div>
  </n-modal>
</template>
<script>
import { ref, watch } from 'vue'
import { useMessage } from "naive-ui"
import { shareTrigger } from '../http/api'
import { useUtils } from '../hooks/useUtils'
export default {
  setup(props, { emit }) {
    const message = useMessage()
    const { copy } = useUtils()
    const showModal = ref(false)
    const link = ref('')
    const info = ref({})
    const rule = {
      trigger: ["input", "blur"],
      validator() {
        if (!info.value.password) {
          return new Error('请输入密码')
        }
      }
    }
    const afterLeave = () => {
      showModal.value = false
      info.value = {}
    }
    const share = () => {
      if (info.value.password) {
        shareTrigger(info.value).then(res => {
          console.log(res)
          if (res.code == 0 && res.trigger_id) {
            emit('share', res.trigger_id)
            info.value.triggerId = res.trigger_id
          }
        })
      } else {
        message.info('请先输入密码')
      }
    }
    watch(() => info.value.triggerId, () => {
      let origin = window.location.origin
      link.value = `${origin}/${info.value.triggerId}`
    })
    return {
      link,
      rule,
      info,
      showModal,
      copy,
      share,
      afterLeave
    }
  }
}
</script>
<style lang="scss" scoped>
.input {
  margin-top: 32px;
  padding: 5px 5px 5px 16px;
  height: 50px;
  background: #fff;
  box-sizing: border-box;
  border: 1px solid rgba(47, 52, 61, 0.4);
  border-radius: 5px;
  cursor: pointer;
  .link {
    flex: 1;
    font-weight: 400;
    font-size: 15px;
    line-height: 20px;
    color: rgb(31, 34, 37);
    background: none;
    border: none;
    outline: none;
  }
  .copy-btn {
    width: 98px;
    height: 40px;
    background: #70c0e8;
    border-radius: 4px;
    margin-left: 10px;
  }
}
</style>