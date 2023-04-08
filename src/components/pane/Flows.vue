<script setup>
import { ref, watch } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'
import { ethers } from 'ethers'
import { useMessage } from 'naive-ui'
import AddFlow from '../form/AddFlow.vue'

const { store } = useGlobalStore()
const message = useMessage()

const emit = defineEmits(['setFlows', 'setMessage'])
const props = defineProps({
  triggerData: Object
})

const trigger = ref({})
const flows = ref([])
const params = ref([])
const addFlowRef = ref(null)
const loading = ref('')

const showModal = (item) => {
  addFlowRef.value.showAddModal = true
  addFlowRef.value.params = JSON.parse(JSON.stringify(params.value))
  if (item && item.id) {
    addFlowRef.value.flowItem = JSON.parse(JSON.stringify(item))
  }
}

const handleOk = (val) => {
  if (val.id) {
    let index = flows.value.findIndex(item => item.id === val.id)
    flows.value[index] = val
  } else {
    val.id = crypto.randomUUID()
    flows.value.push(val)
  }
  setFlows()
}

const setFlows = () => {
  emit('setFlows', flows.value)
}

const del = (index) => {
  flows.value.splice(index, 1)
  setFlows()
}

const getContract = (id, type, funName) => {
  let contract = store.state.contracts.find(item => item.id === id)
  if (type == 'type') {
    let abi = JSON.parse(contract.abi)
    let type = abi.find(item => item.name === funName).stateMutability
    return type
  } else if (type == 'name') {
    return contract.name
  }
}

const setContract = async (contractId) => {
  if (!trigger.value.wallet?.address) {
    message.error("请先设置钱包")
    return
  }
  let contracts = store.state.contracts
  let cd = {}
  let wallet = null
  contracts.forEach(e => {
    if (e.id == contractId) {
      cd = e
    }
  })
  let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
  wallet = new ethers.Wallet(trigger.value.wallet?.privateKey, provider)
  let C = await new ethers.Contract(cd.address, cd.abi, wallet)
  return C
}

const getInputs = (contractId, funName) => {
  let contracts = store.state.contracts
  let inputs = []
  contracts.forEach(e => {
    if (e.id == contractId) {
      let abi = JSON.parse(e.abi)
      abi.forEach(el => {
        if (el.name == funName) {
          inputs = el.inputs
        }
      })
    }
  })
  return inputs
}

const runFunction = async (funList, paramList) => {
  if (funList.length == 0) {
    loading.value = ''
    return
  }
  let item = funList.shift()
  if (item.type == 'contract') {
    if (!trigger.value.wallet?.address) {
      message.error("请先设置钱包")
      loading.value = ''
      return
    }
    let inputs = getInputs(item.contractId, item.functionName)
    let C = await setContract(item.contractId)
    let p = []
    let res = null
    if (inputs) {
      inputs.forEach(e => {
        if (item.args[e.name]) {
          let val = item.args[e.name].value
          if (item.args[e.name].type == 'param') {
            for (let i = 0; i < paramList.length; i++) {
              let param = paramList[i]
              if (param.key == item.args[e.name].value && param.type == 'param') {
                val = param.value
              }
            }
          } else if (item.args[e.name].type == 'http') {
            for (let i = 0; i < paramList.length; i++) {
              let param = paramList[i]
              if (param.key == item.args[e.name].value && param.type == 'http') {
                val = param.value[item.args[e.name].var]
              }
            }
          } else if (item.args[e.name].type == 'contract') {
            for (let i = 0; i < paramList.length; i++) {
              let param = paramList[i]
              if (param.key == item.args[e.name].value && param.type == 'contract') {
                val = param.value
              }
            }
          }
          p.push(val)
        } else {
          p.push('')
        }
      })
    }
    try {
      console.log(p)
      res = await C[item.functionName](...p)
        if (res._isBigNumber) {
          res = ethers.utils.formatUnits(res, 0)
        }
      if (res.hash) {
        let tx = await res.wait()
        res = tx
        message.success('confirmed transaction')
      }
    } catch (error) {
      res = error?.error?.message || error?.message || error
    }
    let msg = {
      type: 'flow',
      name: item.name,
      result: res
    }
    paramList.push({
      key: `contract_result:${item.name}`,
      type: 'contract',
      value: res,
      label: `contract_result: ${item.name}`
    })
    emit('setMessage', msg)
  } else if (item.type == 'http') {
    let body = {}
    let headers = {}
    let res = null
    item.params = item.params || []
    item.params.forEach(e => {
      let val = e.value
      if (!val) return
      if (e.type == 'param') {
        for (let i = 0; i < paramList.length; i++) {
          let param = paramList[i]
          if (param.key == e.value && param.type == 'param') {
            val = param.value
          }
        }
      } else if (e.type == 'http') {
        for (let i = 0; i < paramList.length; i++) {
          let param = paramList[i]
          if (param.key == e.value && param.type == 'http') {
            val = param.value[e.var]
          }
        }
      } else if (e.type == 'contract') {
        for (let i = 0; i < paramList.length; i++) {
          let param = paramList[i]
          if (param.key == e.value && param.type == 'contract') {
            val = param.value
          }
        }
      }
      body[e.key] = val
    })
    item.headers.forEach(e => {
      let val = e.value
      if (!val) return
      if (e.type == 'param') {
        for (let i = 0; i < paramList.length; i++) {
          let param = paramList[i]
          if (param.key == e.value && param.type == 'param') {
            val = param.value
          }
        }
      } else if (e.type == 'http') {
        for (let i = 0; i < paramList.length; i++) {
          let param = paramList[i]
          if (param.key == e.value && param.type == 'http') {
            val = param.value[e.var]
          }
        }
      } else if (e.type == 'contract') {
        for (let i = 0; i < paramList.length; i++) {
          let param = paramList[i]
          if (param.key == e.value && param.type == 'contract') {
            val = param.value
          }
        }
      }
      headers[e.key] = val
    })
    console.log(body, headers)
    if (item.method.toLocaleLowerCase() == 'get') {
      let dataStr = '';
      Object.keys(body).forEach(key => {
        dataStr += key + '=' + body[key] + '&';
      })
      if (dataStr !== '') {
        dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
        item.url = item.url + '?' + dataStr;
      }
      const response = await fetch(item.url, {headers});
      res = await response.json()
      console.log(res, response)
    } else {
      const response = await fetch(item.url, {
        method: item.method,
        headers: Object.assign({'Content-Type': 'application/json'}, headers),
        body: JSON.stringify(body)
      })
      res = await response.json()
    }
    let msg = {
      type: 'flow',
      name: item.name,
      result: res
    }
    paramList.push({
      key: `http_result:${item.name}`,
      type: 'http',
      value: res,
      label: `http_result: ${item.name}`
    })
    console.log(msg)
    emit('setMessage', msg)
  }
  runFunction(funList, paramList)
}

const apply = (item) => {
  loading.value = item.id
  let paramList = JSON.parse(JSON.stringify(params.value))
  let handdleList = JSON.parse(JSON.stringify(item.handdleList))
  runFunction(handdleList, paramList)
}

const init = (val) => {
  let triggerData = store.state.triggers.find(item => item.id === val)
  trigger.value = JSON.parse(JSON.stringify(triggerData))
  flows.value = trigger.value.flows
  let globalParams = trigger.value.globalParams
  let address = trigger.value.wallet?.address
  if (address && !globalParams.find(item => item.key === 'currentWalletAddress')) {
    globalParams.push({key: 'currentWalletAddress', value: address})
  }
  globalParams = globalParams.map(e => {
    let value = e.value
    if (value.length > 24) {
      value = `${value.slice(0, 6)}...${value.slice(-4)}`
    }
    return {
      key: e.key,
      value: e.value,
      label: `${e.key == 'currentWalletAddress' ? '当前钱包地址' : e.key} (${value})`,
      type: 'param'
    }
  })
  params.value = globalParams || []
}

watch(() => props.triggerData, (val) => {
  if (val) {
    console.log('val', val)
    init(val.id)
  }
}, {immediate: true, deep: true})

</script>
<template>
  <div class="flows">
    <div class="card" v-for="(item, index) in flows" :key="item.id">
      <n-spin :show="loading == item.id">
        <div class="flex-center-sb">
          <div class="name">流程名称 - {{item.name}}</div>
          <div class="flex-center">
            <div class="edit-btn" @click="showModal(item)">编辑</div>
            <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del(index)">
              <template #trigger>
                <div class="edit-btn">删除</div>
              </template>
              <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
            </n-popconfirm>
          </div>
        </div>
        <div v-for="handdle in item.handdleList" :key="handdle.id" class="step mt16">
          <div class="sub-title">{{handdle.name}} ({{handdle.type}})</div>
          <div v-if="handdle.type == 'contract'" class="mt12 flex-center">
            <div class="fun flex-center">
              <div class="name flex-center">{{getContract(handdle.contractId, 'name')}}</div>
              <div class="function-name flex-center">{{handdle.functionName}}</div>
            </div>
            <div class="type">（{{getContract(handdle.contractId, 'type', handdle.functionName)}}）</div>
          </div>
          <div v-else-if="handdle.type == 'http'" class="mt12 flex-center">
            <div class="fun flex-center">
              <div class="name flex-center">http</div>
              <div class="function-name flex-center">{{handdle.url}}</div>
            </div>
            <div class="type">（{{handdle.method}}）</div>
          </div>
        </div>
        <div class="btn-primary mt16" @click="apply(item)">执行</div>
      </n-spin>
    </div>
    <div class="btn" @click="showModal">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8H13" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 13L8 3" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      新增流程
    </div>
  </div>
  <AddFlow ref="addFlowRef" @handleOk="handleOk" />
</template>

<style lang="scss" scoped>
.flows {
  padding: 16px;
  box-sizing: border-box;
  min-height: 72px;
  .card {
    margin-bottom: 16px;
    & ~ .card {
      margin-top: 24px;
    }
  }
  .name {
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    color: #262C33;
  }
  .edit-btn {
    font-size: 12px;
    line-height: 16px;
    color: #4C4F53;
    margin-left: 8px;
    cursor: pointer;
  }
  .sub-title {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: #4C4F53;
    .k {
      flex: 0 0 130px;
    }
    .v {
      flex: 1;
    }
  }
  .fun {
    height: 40px;
    background: #F8F9FA;
    border-radius: 5px;
    width: 500px;
    flex: 0 0 500px;
    padding: 0 4px;
    box-sizing: border-box;
    .name {
      font-size: 12px;
      line-height: 16px;
      color: #5C636B;
      padding: 8px;
      box-sizing: border-box;
      width: 130px;
      flex: 0 0 130px;
    }
    .function-name {
      background: #FFFFFF;
      border-radius: 4px;
      font-size: 12px;
      line-height: 16px;
      color: #262C33;
      height: 32px;
      padding: 0 8px;
      box-sizing: border-box;
      overflow-x: auto;
      white-space: nowrap;
      flex: 0 0 362px;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  .type {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: #9BA0A8;
  }
}
.mt16 {
  margin-top: 16px;
}

.mt12 {
  margin-top: 12px;
}
</style>