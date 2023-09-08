<script setup>
import { ref, watch } from 'vue'
import { useGlobalStore } from '../hooks/globalStore'
import { updateTrigger, getTrigger, getTriggerInfo } from '../http/api'
import Wallet from './Wallet.vue'
import Tabs from './Tabs.vue'
import Share from './form/Share.vue'
import { useDialog, useMessage } from 'naive-ui'
import { set } from 'date-fns'

const emit = defineEmits(['createTrigger'])

const { store, setTriggrts, setContracts } = useGlobalStore()
const message = useMessage()
const dialog = useDialog()

const triggerData = ref({
  name: '',
  note: '',
  id: '',
  functions: [],
  triggers: [],
  globalParams: [],
  flows: [],
  remark: {},
  wallet: {}
})
const shareRef = ref(null)
const showSpin = ref(false)

const createTrigger = () => {
  emit('createTrigger')
}

const setTrigger = async (item) => {
  let triggers = store.state.triggers
  let index = triggers.findIndex(i => i.id === item.id)
  if (index > -1) {
    triggers[index] = item
  } else {
    triggers.push(item)
  }
  await setTriggrts(triggers)
}

const getContract = (id) => {
  return store.state.contracts.find(item => item.id === id)
}

const showShare = () => {
  console.log('showShare', triggerData.value)
  shareRef.value.showModal = true
  if (triggerData.value.trigger_id) {
    shareRef.value.info.triggerId = triggerData.value.trigger_id
  }
}

const getTriggerInfoFun = async (trigger_id) => {
  let res = await getTriggerInfo({ trigger_id })
  if (res.code == 0) {
    return res.trigger
  }
}

const updateFun = async () => {
  showSpin.value = true
  let trigger = JSON.parse(JSON.stringify(triggerData.value))
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
    trigger_id: trigger.trigger_id
  }
  updateTrigger(data).then(res => {
    console.log(res)
    showSpin.value = false
    if (res.code == 0) {
      message.success('更新成功')
    } else {
      message.error(res.msg)
    }
  }).catch(err => {
    showSpin.value = false
    message.error(err)
  })
}

const getTriggerFun = async (data, id) => {
  let res = await getTrigger(data)
  if (res.code == 0) {
    let contracts = store.state.contracts
    let newContracts = JSON.parse(JSON.stringify(res.trigger.contracts))
    let trigger = JSON.parse(JSON.stringify(res.trigger))
    trigger.id = id
    trigger.flows = trigger.flow
    trigger.password = data.password
    trigger.isImport = true
    delete trigger.flow
    delete trigger.contracts
    contracts.push(...newContracts)
    let newContractsArr = []
    let obj = {}
    for (let i = 0; i < contracts.length; i++) {
      if (!obj[contracts[i].id]) {
        newContractsArr.push(contracts[i])
        obj[contracts[i].id] = 1
      }
    }
    setTrigger(trigger)
    await setContracts(newContractsArr)
    message.success('同步成功')
  } else {
    message.error(res.msg)
  }
}

const asyncFun = () => {
  let tg = JSON.parse(JSON.stringify(triggerData.value))
  const d = dialog.warning({
    title: '同步版本',
    content: '同步版本后，将会覆盖当前版本，是否继续？',
    negativeText: '取消',
    positiveText: '确认',
    onPositiveClick: async () => {
      d.loading = true
      let data = {
        trigger_id: tg.trigger_id
      }
      if (tg.password) {
        data.password = tg.password
        data.share_type = 'password'
      } else {
        data.share_type = 'playground'
      }
      try {
        await getTriggerFun(data, tg.id)
      } catch (error) {
        message.error(error)
      }
    }
  })
  // let trigger = JSON.parse(JSON.stringify(triggerData.value))

}

watch(() => store.state.activatedId, async (activatedId) => {
  if (activatedId) {
    let trigger = store.state.triggers.find(item => item.id === activatedId)
    if (trigger) {
      triggerData.value = trigger
      if (!trigger.trigger_id || !trigger.isImport) return
      let res = await getTriggerInfoFun(trigger.trigger_id, trigger.id)
      console.log(res)
      if (res && res.version != trigger.version) {
        const d = dialog.warning({
          title: '检测到新版本',
          content: '监测到新版本是否同步，同步后将会覆盖当前版本，是否继续？',
          negativeText: '取消',
          positiveText: '确认',
          onNegativeClick: () => {
            triggerData.value.hasNewVersion = true
          },
          onPositiveClick: async () => {
            d.loading = true
            let data = {
              trigger_id: trigger.trigger_id
            }
            if (trigger.password) {
              data.password = trigger.password
              data.share_type = 'password'
            } else {
              data.share_type = 'playground'
            }
            try {
              await getTriggerFun(data, trigger.id)
            } catch (error) {
              message.error(error)
            }
          }
        })
      }
    }
  } else {
    triggerData.value = {
      name: '',
      note: '',
      id: '',
      functions: [],
      triggers: [],
      globalParams: [],
      flows: [],
      remark: {},
      wallet: {}
    }
  }
}, { immediate: true })

watch(() => store.state.triggers, (val) => {
  if (val && store.state.activatedId) {
    const trigger = store.state.triggers.find(item => item.id === store.state.activatedId)
    if (trigger) {
      triggerData.value = trigger
    }
  }
}, { immediate: true, deep: true })

</script>
<template>
  <div class="trigger-detail">
    <div v-if="triggerData.id" class="content">
      <div>
        <Wallet :trigger="triggerData" @setTrigger="setTrigger" />
        <Tabs :trigger="triggerData" @setTrigger="setTrigger" />
      </div>
      <div class="share flex-center-center">
        <n-spin v-if="triggerData.trigger_id && (!triggerData.isImport || triggerData.hasNewVersion)"
          style="height: 100%" :show="showSpin">
          <div v-if="!triggerData.isImport" class="flex-center-center update update-btn" @click="updateFun">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2.49991C14.1421 2.49991 17.5 5.85777 17.5 9.99991C17.5 14.142 14.1421 17.4999 10 17.4999C5.85786 17.4999 2.5 14.142 2.5 9.99991C2.5 7.64385 3.58639 5.54154 5.28555 4.16658"
                stroke="#262C33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2.5 3.74991H5.83333V7.08324" stroke="#262C33" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>更新Trigger</span>
          </div>
          <div v-if="triggerData.hasNewVersion" class="flex-center-center update" @click="asyncFun">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2.49991C14.1421 2.49991 17.5 5.85777 17.5 9.99991C17.5 14.142 14.1421 17.4999 10 17.4999C5.85786 17.4999 2.5 14.142 2.5 9.99991C2.5 7.64385 3.58639 5.54154 5.28555 4.16658"
                stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2.5 3.74991H5.83333V7.08324" stroke="white" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>同步Trigger</span>
          </div>
        </n-spin>
        <div v-if="!store.state.isIframe" @click="showShare" class="flex-center-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.2083 5.66667C12.0137 5.66667 12.6667 5.01374 12.6667 4.20833C12.6667 3.40292 12.0137 2.75 11.2083 2.75C10.4029 2.75 9.75 3.40292 9.75 4.20833C9.75 5.01374 10.4029 5.66667 11.2083 5.66667Z"
              stroke="#4C4F53" stroke-linejoin="round" />
            <path
              d="M4.79171 9.45817C5.59712 9.45817 6.25004 8.80525 6.25004 7.99984C6.25004 7.19443 5.59712 6.5415 4.79171 6.5415C3.9863 6.5415 3.33337 7.19443 3.33337 7.99984C3.33337 8.80525 3.9863 9.45817 4.79171 9.45817Z"
              stroke="#4C4F53" stroke-linejoin="round" />
            <path d="M9.75019 4.95898L6.05737 7.19633" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6.05713 8.74805L9.94808 11.0473" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M11.2083 10.3335C12.0137 10.3335 12.6667 10.9864 12.6667 11.7918C12.6667 12.5972 12.0137 13.2502 11.2083 13.2502C10.4029 13.2502 9.75 12.5972 9.75 11.7918C9.75 10.9864 10.4029 10.3335 11.2083 10.3335Z"
              stroke="#4C4F53" stroke-linejoin="round" />
          </svg>
          <span>分享Trigger</span>
        </div>
      </div>
    </div>
    <div v-else class="flex-center-center">
      <n-empty description="暂无项目,请先添加">
        <template #extra>
          <div class="btn" style="width: 200px;height: 40px" @click="createTrigger">添加项目</div>
        </template>
      </n-empty>
    </div>
  </div>
  <Share ref="shareRef" />
</template>

<style lang="scss" scoped>
.trigger-detail {
  flex: 0 0 648px;
  width: 648px;
  padding: 24px;
  box-sizing: border-box;
  height: calc(100vh - 64px);
  overflow: hidden;
  position: relative;
}

.content {
  height: 100%;
  padding-bottom: 50px;
  box-sizing: border-box;
  overflow-y: auto;
}

.share {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  background: #FFFFFF;
  border-top: 1px solid #EEEFF0;
  cursor: pointer;

  span {
    margin-left: 8px;
    font-size: 13px;
    line-height: 16px;
    color: #262C33;
  }

  &>div {
    flex: 1;
    height: 50px;
  }

  .update {
    flex: 1;
    background: #F43658;
    height: 50px;
    color: #FFFFFF;

    span {
      color: #FFFFFF;
    }

    &.update-btn {
      background: #fff;
      border-right: 1px solid #EEEFF0;

      span {
        color: #262C33;
      }
    }
  }
}</style>