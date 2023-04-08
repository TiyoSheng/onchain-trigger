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
      <n-spin size="small" :show="isSpin">
        <n-form-item label="分享类型：">
          <n-select
            v-model:value="info.type"
            placeholder="选择分享类型"
            :options="options"
            label-field="label"
            value-field="value"
          />
        </n-form-item>
        <n-form-item v-if="info.type == 'password'" label="输入密码：">
          <n-input v-model:value="info.password" placeholder="输入密码" />
        </n-form-item>
        <n-form-item style="display: flex;justify-content: flex-end;">
          <n-button attr-type="button" @click="afterLeave">取消</n-button>
          <n-button style="margin-left: 20px" attr-type="button" @click="share">分享</n-button>
        </n-form-item>
      </n-spin>
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
import { shareTrigger } from '../../http/api'
import { useUtils } from '../../hooks/utils'
import { useGlobalStore } from '../../hooks/globalStore'
import { setLs } from '../../libs/storage'

export default {
  setup(props, { emit }) {
    const { store, setTriggrts } = useGlobalStore()
    const message = useMessage()
    const { copy } = useUtils()
    const showModal = ref(false)
    const isSpin = ref(false)
    const link = ref('')
    const info = ref({
      type: 'playground'
    })
    const rule = {
      trigger: ["input", "blur"],
      validator() {
        if (!info.value.password) {
          return new Error('请输入密码')
        }
      }
    }
    const options = [{label: 'playground', value: 'playground'}, {label: 'password', value: 'password'}]

    const afterLeave = () => {
      showModal.value = false
      info.value = {type: 'playground'}
    }

    const getContract = (id) => {
      return store.state.contracts.find(item => item.id === id)
    }
    const shareFun = () => {
      isSpin.value = true
      const trigger = store.state.triggers.find(item => item.id === store.state.activatedId)
      let contractIds = []
      let contracts = []
      trigger.flows.forEach(flow => {
        flow.handdleList.forEach(handdle => {
          if (handdle.type == 'contract') {
            contractIds.push(handdle.contractId)
          }
        })
      })
      trigger.functions.forEach(fun => {
        contractIds.push(fun.contractId)
      })

      trigger.triggers.forEach(e => {
        if (e.contractId) {
          contractIds.push(e.contractId)
        }
        if (e.handdleList) {
          e.handdleList.forEach(handdle => {
            contractIds.push(handdle.contractId)
          })
        }
      })
      contractIds = [...new Set(contractIds)]
      contractIds.forEach(e => {
        contracts.push(getContract(e))
      })
      const data = {
        contracts,
        name: trigger.name,
        note: trigger.note,
        functions: trigger.functions,
        triggers: trigger.triggers,
        globalParams: trigger.globalParams,
        flow: trigger.flows,
        remark: trigger.remark,
        share_type: info.value.type,
        password: info.value.password || ''
      }
      shareTrigger(data).then(async res => {
        console.log(res)
        if (res.code == 0 && res.trigger_id) {
          // emit('share', res.trigger_id)
          let triggerData = JSON.parse(JSON.stringify(trigger))
          console.log(triggerData)
          triggerData.trigger_id = res.trigger_id
          let triggers = store.state.triggers
          let index = triggers.findIndex(i => i.id === triggerData.id)
          if (index > -1) {
            triggers[index] = triggerData
          }
          console.log(triggers)
          setTriggrts(triggers)
          await setLs('triggers', JSON.parse(JSON.stringify(triggers)))
          info.value.triggerId = res.trigger_id
        }
        isSpin.value = false
      }).catch(err => {
        console.error(err)
        isSpin.value = false
      })
      // console.log(data)
    }
    const share = () => {
      if (info.value.type == 'password' && !info.value.password) {
        message.info('请先输入密码')
      } else {
        shareFun()
      }
    }
    watch(() => info.value.triggerId, () => {
      let origin = window.location.origin
      link.value = `${origin}/${info.value.triggerId}`
    })
    return {
      isSpin,
      options,
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
    background: #2152Ec;
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    margin-left: 10px;
  }
}
</style>