<script setup >
import { ref, watch } from 'vue'
import { setLs } from '../libs/storage'
import { JsonViewer } from "vue3-json-viewer"
import { useMessage } from "naive-ui"
import { ethers } from 'ethers'
import "vue3-json-viewer/dist/index.css"
import { useGlobalStore } from "../hooks/globalStore"
import { Alchemy, Network, AlchemySubscription } from "alchemy-sdk"
const settings = {
  apiKey: "72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G",
  network: Network.ETH_GOERLI
}
const alchemy = new Alchemy(settings)

const { store, setTriggrts } = useGlobalStore()
const message = useMessage()

const activatedId = ref('')
const msgsRef = ref(null)
const msgs = ref([])
const params = ref([])
const triggerData = ref({})

let contractData = []

const getType = (type) => {
  if (type == 'function') {
    return '执行附加函数'
  } else if (type == 'flow') {
    return '执行流程'
  } else if (type == 'trigger') {
    return '监听器'
  } else if (type == 'triggerHanddle') {
    return '监听后执行'
  }
}

const getContract = (id, type, funName) => {
  let contract = store.state.contracts.find(item => item.id === id)
  if (type == 'type') {
    let abi = JSON.parse(contract.abi)
    let type = abi.find(item => item.name === funName).stateMutability
    return type
  } else if (type == 'name') {
    return contract.name
  } else if (type == 'input') {
    let abi = JSON.parse(contract.abi)
    let inputs = abi.find(item => item.name === funName).inputs
    return inputs
  }
}

const setContract = async (contractId) => {
  if (!triggerData.value.wallet?.address) {
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
  wallet = new ethers.Wallet(triggerData.value.wallet?.privateKey, provider)
  let C = await new ethers.Contract(cd.address, cd.abi, wallet)
  return C
}

const filterFun = (args, filters) => {
  let r = true
  filters.forEach((filter, i) => {
    if (filter) {
      console.log(filter)
      let argsValue = args[filter.name]
      if (argsValue._isBigNumber) {
        argsValue = ethers.utils.formatUnits(argsValue, 0)
      }
      let val = filter.value
      if (filter.type == 'param') {
        let param = params.value.find(param => param.key === filter.value)
        val = param.value
      }
      console.log(argsValue, val, filter.condition)
      switch(filter.condition) {
        case '$gt':
          if (!(+argsValue > +val)) {
            r = false
          }
          break
        case '$lt':
          if (!(+argsValue < +val)) {
            r = false
          }
          break
        case '$gte':
          if (!(+argsValue >= +val)) {
            r = false
          }
          break
        case '$lte':
          if (!(+argsValue <= +val)) {
            r = false
          }
          break
        case '$eq':
          if (!(argsValue == val)) {
            r = false
          }
          break
        case '$ne':
          if (!(argsValue != val)) {
            r = false
          }
          break
        case '$in':
          if (!(argsValue.indexOf(val) > -1)) {
            r = false
          }
          break
      }
    }
  })
  return r
}

const handdleFun = async (list, res, args, index) => {
  if (list && list.length) {
    let item = list.shift()
    let input = []
    let inputs = getContract(item.contractId, 'input', item.functionName)
    let C = contractData[index]
    let gp = ethers.utils.formatUnits(res.maxFeePerGas, 0)
    let mpfg = ethers.utils.formatUnits(res.maxPriorityFeePerGas, 0)
    let gl = ethers.utils.formatUnits(res.gas, 0)
    let value = ethers.utils.formatUnits(res.value, 0)
    // let nonce = triggerData.value.wallet.nonce + 1
    let sendInfo = {
      maxFeePerGas: (gp * 1.5).toFixed(0),
      maxPriorityFeePerGas: (mpfg * 1.5).toFixed(0),
      gasLimit: (gl * 1.5).toFixed(0)
    }
    if (value) {
      if (item.args.value && item.args.value.value) {
        sendInfo.value = item.args.value.value
      } else {
        sendInfo.value = value
      }
    }
    inputs.forEach((e, i) => {
      let data = item.args[e.name] || null
      if (data && data.value) {
        let val = data.value
        if (data.type == 'param') {
          let param = params.value.find(param => param.key === data.value)
          val = param.value
        }
        input[i] = val
      } else {
        input[i] = args[e.name]
      }
    })
    console.log(...input, sendInfo)
    try {
      let tx = await C[item.functionName](...input, sendInfo)
      let txData = {
        name: item.name,
        result: tx,
        type: 'triggerHanddle',
      }
      msgs.value.push(txData)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
      if (tx.hash) {
        triggerData.value.wallet.nonce = tx.nonce
        await tx.wait()
      }
      index += 1
      handdleFun(list, res, args, index)
    } catch (error) {
      console.log(error)
      message.error('transaction failed')
    }
  }
}

const off = async () => {
  await alchemy.ws.off()
  triggerData.value.status = 'off'
}

const getTriggerData = () => {
  let triggers = store.state.triggers
  let trigger = triggers.find(e => e.id == triggerData.value.id)
  trigger = JSON.parse(JSON.stringify(trigger))
  let globalParams = JSON.parse(JSON.stringify(trigger.globalParams))
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
  if (!trigger.message) trigger.message = []
  triggerData.value = trigger
  params.value = globalParams || []
}

const on = (index) => {
  getTriggerData()
  if (!(triggerData.value.wallet && triggerData.value.wallet.address)) {
    message.error("请先设置钱包");
    return
  }
  if (!triggerData.value.triggers[index]) {
    message.error("请先设置触发器");
    return
  }
  off()
  let trigger = triggerData.value.triggers[index]
  let contractId = trigger.contractId
  let contractAbi = []
  let contractAddress = ''
  store.state.contracts.forEach(e => {
    if (e.id == contractId) {
      contractAddress = e.address
      contractAbi = JSON.parse(e.abi)
    }
  })
  alchemy.core.getTokenBalances(triggerData.value.wallet?.address).then(async () => {
    if (trigger.handdleList) {
      for (let i = 0; i < trigger.handdleList.length; i++) {
        let item = trigger.handdleList[i]
        contractData[i] = await setContract(item.contractId)
      }
    }
    message.success("开始监听")
    triggerData.value.status = 'on'
  })
  alchemy.ws.on({
    method: AlchemySubscription.PENDING_TRANSACTIONS,
    toAddress: contractAddress
  }, async (res) => {
    try {
      const iface = new ethers.utils.Interface(contractAbi)
      let args = iface.decodeFunctionData(res.input.slice(0,10), res.input)
      let functionName = iface.getFunction(res.input.slice(0,10)).name
      console.log(args)
      if (functionName == trigger.functionName && filterFun(args, trigger.filter) && res.from.toLocaleLowerCase() != triggerData.value.wallet.address.toLocaleLowerCase()) {
        let msg = {
          name: trigger.name,
          result: res,
          type: 'trigger',
        }

        msgs.value.push(msg)
        triggerData.value.messages = msgs.value
        setTrigger(triggerData.value)
        try {
          let list = JSON.parse(JSON.stringify(trigger.handdleList))
          handdleFun(list, res, args, 0)
        } catch (error) {
          console.log(error)
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
}

const setTrigger = async (item) => {
  console.log(item)
  let triggers = store.state.triggers
  let index = triggers.findIndex(i => i.id === item.id)
  if (index > -1) {
    triggers[index] = item
  } else {
    triggers.push(item)
  }
  await setTriggrts(triggers)
  await setLs('triggers', JSON.parse(JSON.stringify(triggers)))
}

const clear = async () => {
  msgs.value = []
  triggerData.value.messages = msgs.value
  setTrigger(triggerData.value)
}

watch(() => store.state.activatedId, (val) => {
  if (val) {
    activatedId.value = val
    const trigger = store.state.triggers.find(item => item.id === val)
    if (!trigger) return
    msgs.value = trigger?.messages || []
    trigger.status = 'off'
    triggerData.value = JSON.parse(JSON.stringify(trigger))
  }
  off()
}, {immediate: true})

watch(() => store.state.triggers, (val) => {
  if (val && store.state.activatedId) {
    const trigger = store.state.triggers.find(item => item.id === store.state.activatedId)
    if (!trigger) return
    msgs.value = trigger.messages || []
    triggerData.value = JSON.parse(JSON.stringify(trigger))
  }
}, {immediate: true, deep: true})

watch(() => msgs.value, (val) => {
  if (val) {
    setTimeout(() => {
      msgsRef.value.scrollTop = msgsRef.value.scrollHeight
    }, 50);
  }
}, {immediate: true, deep: true})
</script>
<template>
  <div class="msgs" ref="msgsRef">
    <div class="msg-list">
      <div class="msg-item" v-for="(item, index) in msgs" :key="index">
        <div class="msg-title">{{getType(item.type)}}-{{item.name}}</div>
        <JsonViewer :value="item.result" />
      </div>
    </div>
    <div class="ft flex-center-sb">
      <div class="ft-l flex-center">
        <div class="status" :style="{background: triggerData.status == 'on' ? '#31C48D' : '#F98080'}"></div>
        <div class="status-text">{{triggerData.status == 'on' ? '监听中' : '未监听'}}</div>
        <div class="line"></div>
        <div>日志数量：{{msgs.length}}</div>
      </div>
      <div class="ft-r flex-center">
        <div class="ft-btn-clear flex-center-center" @click="clear">Clear</div>
        <div v-show="triggerData.status == 'on'" class="ft-btn flex-center-center" style="background:#F98080" @click="off">停止监听</div>
        <div v-show="triggerData.status != 'on'" class="ft-btn flex-center-center" style="background:#2152EC" @click="on(0)">立即监听</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.msgs {
  flex: 1;
  max-width: 618px;
  height: calc(100vh - 64px);
  background: #1F1E26;
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  .msg-list {
    flex: 1;
    margin-bottom: 10px;
  }
  .msg-item {
    background: rgb(41, 44, 51);
    padding: 16px;
    box-sizing: border-box;
    margin-bottom: 16px;
    border-radius: 8px;
    .msg-title {
      font-size: 12px;
      color:rgba(255, 255, 255, 0.9);
      margin-bottom: 8px;
      margin-bottom: 12px;
    }
  }
}
.ft {
  width: 100%;
  height: 52px;
  flex:  0 0 52px;
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  color: #262C33;
  padding: 0 16px;
  box-sizing: border-box;
  .status {
    width: 10px;
    height: 10px;
    border-radius: 10px;
    margin-right: 4px;
    background: #F98080;
  }
  .line {
    width: 1px;
    height: 14px;
    background: #C9D1DC;
    margin: 0 12px;
  }
  .ft-btn-clear {
    width: 56px;
    height: 28px;
    border: 1px solid #C9D1DC;
    border-radius: 6px;
    cursor: pointer;
  }
  .ft-btn {
    background: #F98080;
    border-radius: 6px;
    margin-left: 12px;
    width: 76px;
    height: 28px;
    color: #FCFCFC;
    cursor: pointer;
  }
}
</style>