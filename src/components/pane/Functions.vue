<script setup>
import { ref, watch } from 'vue'
import AddFunction from '../form/AddFunction.vue'
import { useGlobalStore } from '../../hooks/globalStore'
import { ethers } from 'ethers'
import { useMessage } from 'naive-ui'

const { store } = useGlobalStore()
const message = useMessage()

const emit = defineEmits(['setFunctions', 'setMessage'])
const props = defineProps({
  triggerData: Object,
})

const params = ref([])
const walletAddress = ref('')
const functions = ref([])
const functionLoading = ref('')
const addFunctionRef = ref(null)

const showModal = (item) => {
  addFunctionRef.value.showAddModal = true
  addFunctionRef.value.params = JSON.parse(JSON.stringify(params.value))
  if (item && item.id) {
  addFunctionRef.value.funItem = JSON.parse(JSON.stringify(item))
  }
}

const handleOk = (val) => {
  console.log(val)
  if (val.id) {
    let index = functions.value.findIndex(item => item.id === val.id)
    functions.value[index] = val
  } else {
    val.id = crypto.randomUUID()
    functions.value.push(val)
  }
  setFunctions()
}

const setFunctions = () => {
  emit('setFunctions', functions.value)
}

const del = (index) => {
  functions.value.splice(index, 1)
  setFunctions()
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
  if (!walletAddress.value) {
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
  let wallets = store.state.wallets
  wallets.forEach(async (el) => {
    if (el.address == walletAddress.value) {
      let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/xQr0n2BqF1Hkkuw5_0YiEXeyQdSYoW1u')
      wallet = new ethers.Wallet(el.privateKey, provider)
    }
  })
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


const apply = async (item) => {
  console.log(item)
  functionLoading.value = item.id
  let inputs = getInputs(item.contractId, item.functionName)
  let C = await setContract(item.contractId)
  let p = []
  let res = null
  if (inputs) {
    inputs.forEach(e => {
      if (item.args[e.name]) {
        let val = item.args[e.name].value
        if (item.args[e.name].type == 'param') {
          for (let i = 0; i < params.value.length; i++) {
            let param = params.value[i]
            if (param.key == item.args[e.name].value) {
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
    console.log(error)
    res = error?.error?.message || error?.message || error
  }
  functionLoading.value = ''
  let msg = {
    type: 'function',
    name: item.name,
    result: res
  }
  console.log(msg)
  emit('setMessage', msg)
}

watch(() => props.triggerData, (val) => {
  let trigger = JSON.parse(JSON.stringify(val))
  let funs = trigger.functions
  let globalParams = trigger.globalParams
  let address = trigger.wallet?.address
  if (address) {
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
  walletAddress.value = address
  params.value = globalParams || []
  functions.value = funs || []
}, {immediate: true, deep: true})

  
</script>
<template>
  <div class="function">
    <div class="card" v-for="(item, index) in functions" :key="item.id">
      <n-spin :show="functionLoading == item.id">
        <n-collapse>
          <template #header-extra>
            <div class="flex-center" @click.stop>
              <div class="edit-btn" @click.stop="showModal(item)">编辑</div>
              <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del(index)">
                <template #trigger>
                  <div class="edit-btn">删除</div>
                </template>
                <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
              </n-popconfirm>
            </div>
          </template>
          <n-collapse-item :title="item.name" name="1" class="collapse-item">
            <div class="mt12 sub-title">触发函数</div>
            <div class="mt12 flex-center">
              <div class="fun flex-center">
                <div class="name flex-center">{{getContract(item.contractId, 'name')}}</div>
                <div class="function-name flex-center">{{item.functionName}}</div>
              </div>
              <div class="type">（{{getContract(item.contractId, 'type', item.functionName)}}）</div>
            </div>
            <div class="mt16 sub-title flex-center">
              <div class="k">参数</div>
              <div class="v">值</div>
            </div>
            <div class="mt12 params">
              <div class="params-item flex-center" v-for="(val, key) in item.args" :key="key">
                <div class="params-item-key flex-center">{{key}}</div>
                <div class="params-item-value flex-center">
                  <n-select class="params-select"
                    v-model:value="item.args[key].value"
                    filterable tag
                    :options="params"
                    label-field="label"
                    value-field="key"
                    @update:value="setFunctions"
                  />
                  <!-- <n-input v-model:value="item.args[key]" /> -->
                </div>
              </div>
            </div>
            <div class="btn-primary mt16" @click="apply(item)">执行</div>
          </n-collapse-item>
        </n-collapse>
      </n-spin>
    </div>
    <div class="btn" @click="showModal">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8H13" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 13L8 3" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      新增附加函数</div>
  </div>
  <AddFunction ref="addFunctionRef" @handleOk="handleOk" />
</template>
<style lang="scss" scoped>
.function {
  padding: 16px;
  box-sizing: border-box;
  min-height: 72px;
  .card {
    margin-bottom: 16px;
    & ~ .card {
      margin-top: 24px;
    }
  }
  .fun-name {
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
      flex: 1;
      background: #FFFFFF;
      border-radius: 4px;
      font-size: 12px;
      line-height: 16px;
      color: #262C33;
      height: 32px;
      padding: 0 8px;
      box-sizing: border-box;
    }
  }
  .type {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: #9BA0A8;
  }
  .params {
    .params-item {
      margin-bottom: 12px;
      .params-item-key {
        flex: 0 0 130px;
        width: 130px;
        height: 40px;
        background: #F8F9FA;
        border-width: 1px 0px 1px 1px;
        border-style: solid;
        border-color: #E5E7EB;
        border-radius: 6px 0px 0px 6px;
        padding: 0 8px;
        box-sizing: border-box;
        font-size: 13px;
        line-height: 16px;
        color: #9BA0A8;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .params-item-value  {
        flex: 1;
        height: 40px;
        .params-select {
          height: 40px;
          border-radius: 0px 6px 6px 0px;
        }
      }
    }
  }
}
.mt12 {
  margin-top: 12px;
}
.mt16 {
  margin-top: 16px;
}
</style>