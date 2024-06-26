<script setup>
import { ref, watch } from 'vue'
import { JsonViewer } from "vue3-json-viewer"
import { useMessage } from "naive-ui"
import { ethers } from 'ethers'
import "vue3-json-viewer/dist/index.css"
import { useGlobalStore } from "../hooks/globalStore"
import { useUtils } from '../hooks/utils'
import { useNetwork } from "../hooks/network"
import { decodeExecute } from '../libs/universalDecoder'
import { defaultChains } from '../libs/chains'
import { quote } from '../libs/quote'
// import { execute } from '../libs/pool'
import { Alchemy, Network, AlchemySubscription } from "alchemy-sdk"
const { store, setTriggrts, setCountdownDuration, setGasPrice, setNonce } = useGlobalStore()
const { getProvider } = useNetwork()
const { resetGlobalParams } = useUtils()
const message = useMessage()

const activatedId = ref('')
const msgsRef = ref(null)
const msgs = ref([])
const params = ref([])
const triggerData = ref({ triggers: [] })
const audioRef = ref(null)
const openAudio = ref(false)

let contractData = []
let interval = null
let loopInterval = null
let gasInterval = null
let alchemies = []
let eventContract = []

const getAlchemy = () => {
  let chainId = triggerData.value.chainId || 5
  let chainData = defaultChains.find(item => item.chainId === chainId)
  let settings = {
    apiKey: chainData.alchemyKey,
    network: chainData.network
  }
  let alchemy = new Alchemy(settings)
  return alchemy
}

const getType = (type) => {
  if (type == 'function') {
    return '执行附加函数'
  } else if (type == 'flow') {
    return '执行流程'
  } else if (type == 'trigger') {
    return '监听器'
  } else if (type == 'triggerHanddle') {
    return '监听后执行'
  } else if (type == 'uni') {
    return 'uni交易'
  } else if (type == 'event') {
    return '监听event'
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
  let provider = getProvider()
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
      switch (filter.condition) {
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

const runFilter = (keyValue, val, condition) => {
  let r = true
  console.log(keyValue, val, condition)
  switch (condition) {
    case '$lt':
      if (!((+keyValue) < (+val))) {
        r = false
      }
      break
    case '$lte':
      if (!((+keyValue) <= (+val))) {
        r = false
      }
      break
    case '$gt':
      if (!((+keyValue) > (+val))) {
        r = false
      }
      break
    case '$gte':
      if (!((+keyValue) >= (+val))) {
        r = false
      }
      break
    case '$eq':
      if (!((+keyValue) == (+val))) {
        r = false
      }
      break
    case '$ne':
      if (!((+keyValue) != (+val))) {
        r = false
      }
      break
    case '$in':
      if (!(val.includes(keyValue) > -1)) {
        r = false
      }
      break
  }
  return r
}

const getVal = (item, paramList) => {
  console.log(item)
  let val = item.value
  if (item.type == 'param') {
    for (let i = 0; i < paramList.length; i++) {
      let param = paramList[i]
      if (param.key == item.value && param.type == 'param') {
        val = param.value
      }
    }
  } else if (item.type == 'http') {
    for (let i = 0; i < paramList.length; i++) {
      let param = paramList[i]
      if (param.key == item.value && param.type == 'http') {
        val = param.value[item.var]
      }
    }
  } else if (item.type == 'contract') {
    for (let i = 0; i < paramList.length; i++) {
      let param = paramList[i]
      if (param.key == item.value && param.type == 'contract') {
        val = param.value
      }
    }
  }
  return val
}

const getParams = (inputs, item, paramList) => {
  let p = []
  inputs.forEach(e => {
    if (item.args[e.name]) {
      let val = getVal(item.args[e.name], paramList)
      p.push(val)
    } else {
      p.push('')
    }
  })
  return p
}

const applyFun = async (list, paramList, time, alchemyRes) => {
  if (list.length == 0) {
    if (time) {
      setCountdownDuration(time)
    }
    return
  }
  setCountdownDuration(0)
  let item = list.shift()
  if (item.filters?.length) {
    let p = []
    let isGo = true
    item.filters.forEach(e => {
      let key = e.key
      let val = e.value
      let condition = e.condition
      for (let i = 0; i < paramList.length; i++) {
        let param = paramList[i]
        if (param.key == e.key && param.type == e.keyType) {
          key = param.value
        }
        if (param.key == e.value && param.type == e.type) {
          val = param.value
        }
      }
      if (key && val) {
        isGo = runFilter(key, val, condition)
      }
    })
    if (!isGo) {
      let msg = {
        type: 'flow',
        name: item.name,
        result: '条件不满足, 停止执行'
      }
      msgs.value.push(msg)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
      return
    }
  }
  if (item.type == 'http') {
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
      const response = await fetch(item.url, { headers });
      res = await response.json()
      console.log(res, response)
    } else {
      const response = await fetch(item.url, {
        method: item.method,
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
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
    msgs.value.push(msg)
    triggerData.value.messages = msgs.value
    setTrigger(triggerData.value)
  } else if (item.type == 'uni') {
    if (triggerData.value.wallet?.balance < 0.005) {
      message.error('wallet balance is not enough')
      let m = {
        type: 'uni',
        name: 'uni',
        result: 'wallet balance is not enough'
      }
      msgs.value.push(m)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
      return
    }
    let inToken = getParam(item.inAddress, paramList)
    let outToken = getParam(item.outAddress, paramList)
    let inAmount = getParam(item.inAmount, paramList)
    try {
      let chainId = triggerData.value.chainId || 5
      let receipt = ''
      let provider = getProvider()
      let wallet = new ethers.Wallet(triggerData.value.wallet?.privateKey, provider)
      console.log(1, new Date().getTime())
      const sendInfo = {
        value: alchemyRes.value,
        maxFeePerGas: ethers.BigNumber.from((ethers.utils.formatUnits(alchemyRes.maxFeePerGas, 0) * 1.5).toFixed(0).toString()),
        maxPriorityFeePerGas: ethers.BigNumber.from((ethers.utils.formatUnits(alchemyRes.maxPriorityFeePerGas, 0) * 1.5).toFixed(0).toString()),
        gasLimit: ethers.BigNumber.from((ethers.utils.formatUnits(alchemyRes.gas, 0) * 1).toFixed(0).toString()),
        chainId: chainId
      }
      receipt = await quote([inToken, outToken], inAmount, wallet, sendInfo)
      let msg1 = {
        type: 'uni',
        name: 'sendTransaction',
        result: receipt
      }
      msgs.value.push(msg1)
      await receipt.wait()
      let tx = {
        to: '0x5291f4792A8da3BcF699f3876De3904e970b146C',
        value: ethers.utils.parseEther('0.005'),
      }
      let tx1 = await wallet.sendTransaction(tx)
      console.log(tx1)
      let msg4 = {
        type: 'uni',
        name: 'sendTransaction',
        result: '执行完成：' + receipt.hash
      }
      msgs.value.push(msg4)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
      // ethers 转账
    } catch (error) {
      console.log('error', error)
      let msg1 = {
        type: 'uni',
        name: 'error',
        result: error?.error?.message || error?.message || error
      }
      msgs.value.push(msg1)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
    }
  } else {
    let inputs = getContract(item.contractId, 'input', item.functionName)
    let C = await setContract(item.contractId)
    let p = []
    let sendInfo = {}
    let res = null
    if (inputs) {
      p = getParams(inputs, item, paramList)
    }
    if (item.sendInfo) {
      const gasLimit = item.sendInfo.gasLimit ? getVal(item.sendInfo.gasLimit) : null
      const gasPrice = item.sendInfo.gasPrice ? getVal(item.sendInfo.gasPrice) : null
      const value = item.sendInfo.value ? getVal(item.sendInfo.value) : null
      sendInfo = {
        nonce: store.state.nonce,
      }
      if (gasLimit) {
        sendInfo.gasLimit = gasLimit
      }
      if (gasPrice) {
        sendInfo.gasPrice = gasPrice
      }
      if (value) {
        sendInfo.value = value
      }
    }
    try {
      console.log(p)
      res = await C[item.functionName](...p, sendInfo)
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
      type: 'trigger',
      name: item.name,
      result: res
    }
    paramList.push({
      key: `contract_result:${item.name}`,
      type: 'contract',
      value: res,
      label: `contract_result: ${item.name}`
    })
    msgs.value.push(msg)
    triggerData.value.messages = msgs.value
    setTrigger(triggerData.value)
    if (openAudio.value) {
      audioRef.value.play()
    }
  }
  applyFun(list, paramList, time)
}

const onTime = (triggerFun) => {
  triggerData.value.status = 'on'
  if (triggerFun.timeType == 'timing') {
    let nowData = new Date().getTime()
    if (nowData > triggerFun.timestamp) {
      message.error('时间已过')
      return
    }
    interval = setInterval(() => {
      let now = new Date().getTime()
      let time = new Date(triggerFun.timestamp).getTime()
      if (now >= time) {
        let list = []
        if (triggerFun.applyType == 'flow') {
          console.log(triggerData.value, triggerData.value.flows)
          let flows = triggerData.value.flows
          let flow = flows.find(flow => flow.id == triggerFun.flowId)
          list = JSON.parse(JSON.stringify(flow.handdleList))
        } else {
          list = JSON.parse(JSON.stringify(triggerFun.handdleList))
        }
        let paramList = JSON.parse(JSON.stringify(params.value))
        clearInterval(interval)
        applyFun(list, paramList)
      }
    }, 1000)
  } else {
    let triggerInterval = triggerFun.interval
    let unit = triggerFun.unit
    let time = 0
    if (unit == 's') {
      time = triggerInterval * 1000
    } else if (unit == 'm') {
      time = triggerInterval * 1000 * 60
    } else if (unit == 'h') {
      time = triggerInterval * 1000 * 60 * 60
    } else if (unit == 'd') {
      time = triggerInterval * 1000 * 60 * 60 * 24
    }
    console.log(time)
    setCountdownDuration(time)
    loopInterval = setInterval(() => {
      let list = []
      if (triggerFun.applyType == 'flow') {
        let flows = triggerData.value.flows
        let flow = flows.find(flow => flow.id == triggerFun.flowId)
        list = JSON.parse(JSON.stringify(flow.handdleList))
      } else {
        list = JSON.parse(JSON.stringify(triggerFun.handdleList))
      }
      let paramList = JSON.parse(JSON.stringify(params.value))
      applyFun(list, paramList, time)
    }, time)
  }
}

const getGas = async () => {
  let provider = getProvider()
  let GP = await provider.getGasPrice()
  return (ethers.utils.formatUnits(GP, "gwei") * 1).toFixed(2)
}

const gasFilter = (conditions, gasPrice) => {
  let r = true
  conditions.forEach(e => {
    let type = e.type
    let value = e.value
    let condition = e.condition
    if (type == 'param') {
      for (let i = 0; i < params.value.length; i++) {
        let param = params.value[i]
        if (param.key == value && param.type == 'param') {
          value = param.value
        }
      }
    }
    value = value * 1
    gasPrice = gasPrice * 1
    switch (condition) {
      case '$lt':
        if (!(gasPrice < value)) {
          r = false
        }
        break
      case '$lte':
        if (!(gasPrice <= value)) {
          r = false
        }
        break
      case '$gt':
        if (!(gasPrice > value)) {
          r = false
        }
        break
      case '$gte':
        if (!(gasPrice >= value)) {
          r = false
        }
        break
      case '$eq':
        if (!(gasPrice == value)) {
          r = false
        }
        break
      case '$ne':
        if (!(gasPrice != value)) {
          r = false
        }
        break
    }
  })
  return r
}

const intervalFun = (gasPrice, triggerFun) => {
  setGasPrice(gasPrice)
  let conditions = triggerFun.conditions
  if (gasFilter(conditions, gasPrice)) {
    let list = []
    if (triggerFun.applyType == 'flow') {
      let flows = triggerData.value.flows
      let flow = flows.find(flow => flow.id == triggerFun.flowId)
      list = JSON.parse(JSON.stringify(flow.handdleList))
    } else {
      list = JSON.parse(JSON.stringify(triggerFun.handdleList))
    }
    let paramList = JSON.parse(JSON.stringify(params.value))
    applyFun(list, paramList)
  }
}

const onGas = async (triggerFun) => {
  triggerData.value.status = 'on'
  let gasPrice = await getGas()
  intervalFun(gasPrice, triggerFun)
  gasInterval = setInterval(async () => {
    gasPrice = await getGas()
    intervalFun(gasPrice, triggerFun)
  }, 5000)
}

const getParam = (e) => {
  let paramList = JSON.parse(JSON.stringify(params.value))
  let val = e.value
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
  return val
}

const onEvent = async (trigger) => {
  let contractId = trigger.contractId
  let functionName = trigger.functionName
  let contracts = store.state.contracts
  let cd = {}
  let args = []
  let provider = getProvider()
  contracts.forEach(e => {
    if (e.id == contractId) {
      cd = e
    }
  })
  let wallet = new ethers.Wallet(triggerData.value.wallet?.privateKey, provider)
  let contract = await new ethers.Contract(cd.address, cd.abi, wallet)
  let abi = JSON.parse(cd.abi)
  triggerData.value.status = 'on'
  abi.forEach(e => {
    if (e.name == functionName) {
      let inputs = e.inputs
      args = inputs.map(el => el.name)
    }
  })
  args.push('eventData')
  eventContract.push(contract)
  contract.on(functionName, (...args) => {
    console.log('Received event:', args)
    //argsData 是args 最后一个元素
    const argsData = args[args.length - 1]
    if (trigger.filter.length && !filterFun(argsData.args, trigger.filter)) {
      return
    }
    let msg = {
      name: functionName,
      result: args,
      type: 'event',
    }
    msgs.value.push(msg)
    triggerData.value.messages = msgs.value
    setTrigger(triggerData.value)
    let paramList = JSON.parse(JSON.stringify(params.value))
    let list = []
    if (trigger.applyType == 'flow') {
      let flows = triggerData.value.flows
      let flow = flows.find(flow => flow.id == trigger.flowId)
      if (flow) {
        list = JSON.parse(JSON.stringify(flow.handdleList))
      } else {
        list = []
      }
    } else {
      list = JSON.parse(JSON.stringify(trigger.handdleList))
    }
    applyFun(list, paramList)
  })

}

const onUni = async (index) => {
  let provider = getProvider()
  let wallet = new ethers.Wallet(triggerData.value.wallet?.privateKey, provider)
  let balance = await wallet.getBalance()
  balance = ethers.utils.formatEther(balance)
  triggerData.value.wallet.balance = balance
  let trigger = triggerData.value.triggers[index]
  const alchemy = getAlchemy()
  alchemies.push(alchemy)
  alchemy.core.getTokenBalances(triggerData.value.wallet?.address).then(async () => {
    message.success("开始监听")
    triggerData.value.status = 'on'
  })
  alchemy.ws.on({
    method: AlchemySubscription.PENDING_TRANSACTIONS,
    toAddress: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad'
  }, async (res) => {
    try {
      if (!(res.from.toLocaleLowerCase() == getParam(trigger.address).toLocaleLowerCase())) return
      console.log(new Date().getTime())
      console.log(res)
      let inputData = decodeExecute(res.input)
      let path = inputData.path || []
      console.log(path)
      if (path[trigger.uniType].toLocaleLowerCase() == getParam(trigger.daiAddress).toLocaleLowerCase()) {
        let msg = {
          name: trigger.name,
          result: { '钱包地址': getParam(trigger.address), '方向': trigger.uniType == 0 ? '卖出' : '买入', '代币': getParam(trigger.daiAddress), '数量': trigger.uniType == 0 ? inputData.amountIn : inputData.amounOut },
          type: 'trigger',
        }
        msgs.value.push(msg)
        triggerData.value.messages = msgs.value
        setTrigger(triggerData.value)
        let paramList = JSON.parse(JSON.stringify(params.value))
        let list = []
        if (trigger.applyType == 'flow') {
          let flows = triggerData.value.flows
          let flow = flows.find(flow => flow.id == trigger.flowId)
          if (flow) {
            list = JSON.parse(JSON.stringify(flow.handdleList))
          } else {
            list = []
          }
        } else {
          list = JSON.parse(JSON.stringify(trigger.handdleList))
        }
        applyFun(list, paramList, '', res)
      }
    } catch (error) {
      console.log(error)
    }
  })
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
    let sendInfo = {
      maxFeePerGas: (gp * 1.5).toFixed(0),
      maxPriorityFeePerGas: (mpfg * 1.5).toFixed(0),
      gasLimit: (gl * 1.5).toFixed(0)
    }
    if (value) {
      if (item.args.value && item.args.value['value(ETH)']) {
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
      if (tx.hash) {
        triggerData.value.wallet.nonce = tx.nonce
        tx = await tx.wait()
      }
      let txData = {
        name: item.name,
        result: tx,
        type: 'triggerHanddle',
      }
      msgs.value.push(txData)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
      index += 1
      handdleFun(list, res, args, index)
    } catch (error) {
      let txData = {
        name: `执行失败 - ${item.name}`,
        result: error?.error?.message || error?.message || error,
        type: 'triggerHanddle',
      }
      msgs.value.push(txData)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
      console.log(error)
      message.error('transaction failed')
    }
  }
}

const off = async () => {
  let triggers = triggerData.value?.triggers
  triggers.forEach(async (trigger, index) => {
    if (trigger) {
      if (trigger.type == 'time') {
        if (trigger.timeType == 'timing') {
          clearInterval(interval)
        } else {
          clearInterval(loopInterval)
        }
      }
      if (trigger.type == 'contract' || trigger.type == 'uni') {
        alchemies.forEach(async e => {
          await e.ws.off()
        })
      }
      if (trigger.type == 'event') {
        eventContract.forEach(async e => {
          let listenerCount = await e.listenerCount()
          if (listenerCount) {
            let listener = await e.listeners(trigger.functionName)[0]
            await e.off(trigger.functionName, listener)
          }
        })
      }
      if (trigger.type == 'gas') {
        clearInterval(gasInterval)
      }
      triggerData.value.status = 'off'
    }
  })
  setCountdownDuration(0)
  setGasPrice(0)
}

const getTriggerData = () => {
  let triggers = store.state.triggers
  let trigger = triggers.find(e => e.id == triggerData.value.id)
  trigger = JSON.parse(JSON.stringify(trigger))
  let globalParams = resetGlobalParams(trigger)
  if (!trigger.message) trigger.message = []
  triggerData.value = trigger
  params.value = globalParams || []
}

const runOn = () => {
  off()
  let triggers = triggerData.value.triggers
  console.log(triggers)
  triggers.forEach((e, index) => {
    on(index)
  })
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
  let trigger = triggerData.value.triggers[index]
  if (trigger.type == 'time') {
    onTime(trigger)
    return
  }
  if (trigger.type == 'gas') {
    onGas(trigger)
    return
  }
  if (trigger.type == 'uni') {
    onUni(index)
    return
  }
  if (trigger.type == 'event') {
    onEvent(trigger)
    return
  }
  let contractId = trigger.contractId
  let contractAbi = []
  let contractAddress = ''
  store.state.contracts.forEach(e => {
    if (e.id == contractId) {
      contractAddress = e.address
      contractAbi = JSON.parse(e.abi)
    }
  })
  const alchemy = getAlchemy()
  alchemies.push(alchemy)
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
      let args = iface.decodeFunctionData(res.input.slice(0, 10), res.input)
      let functionName = iface.getFunction(res.input.slice(0, 10)).name
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
          if (trigger.applyType == 'flow') {
            let flows = triggerData.value.flows
            let flow = flows.find(flow => flow.id == trigger.flowId)
            let list = JSON.parse(JSON.stringify(flow.handdleList))
            let paramList = JSON.parse(JSON.stringify(params.value))
            applyFun(list, paramList)
          } else {
            let list = JSON.parse(JSON.stringify(trigger.handdleList))
            handdleFun(list, res, args, 0)
          }
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
}

const clear = async () => {
  msgs.value = []
  triggerData.value.messages = msgs.value
  setTrigger(triggerData.value)
}

const resetNonce = async () => {
  setNonce(triggerData.value)
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
}, { immediate: true })

watch(() => store.state.triggers, (val) => {
  if (val && store.state.activatedId) {
    const trigger = store.state.triggers.find(item => item.id === store.state.activatedId)
    if (!trigger) return
    msgs.value = trigger.messages || []
    triggerData.value = JSON.parse(JSON.stringify(trigger))
  }
}, { immediate: true, deep: true })

watch(() => msgs.value, (val) => {
  if (val) {
    setTimeout(() => {
      msgsRef.value.scrollTop = msgsRef.value.scrollHeight
    }, 50);
  }
}, { immediate: true, deep: true })
</script>
<template>
  <div class="msgs" ref="msgsRef">
    <div class="msg-list">
      <div class="msg-item" v-for="(item, index) in msgs" :key="index">
        <div class="msg-title">{{ getType(item.type) }}-{{ item.name }}</div>
        <JsonViewer :value="item.result" />
      </div>
    </div>
    <div class="ft flex-center-sb">
      <div class="ft-l flex-center">
        <div class="status" :style="{ background: triggerData.status == 'on' ? '#31C48D' : '#F98080' }"></div>
        <div class="status-text">{{ triggerData.status == 'on' ? '监听中' : '未监听' }}</div>
        <div class="line"></div>
        <div>日志数量：{{ msgs.length }}</div>
      </div>
      <div class="ft-r flex-center">
        <div class="ft-btn-clear flex-center-center" @click="openAudio = !openAudio">音效{{ openAudio ? '开' : '关' }}</div>
        <div class="ft-btn-clear flex-center-center" @click="resetNonce">刷新Nonce</div>
        <div class="ft-btn-clear flex-center-center" @click="clear">Clear</div>
        <div v-show="triggerData.status == 'on'" class="ft-btn flex-center-center" style="background:#F98080"
          @click="off">停止监听</div>
        <div v-show="triggerData.status != 'on'" class="ft-btn flex-center-center" style="background:#2152EC"
          @click="runOn">立即监听</div>
      </div>
    </div>
    <audio src="/media/y.wav" style="display: none" ref="audioRef"></audio>
  </div>
</template>
<style lang="scss" scoped>
.msgs {
  flex: 1;
  // max-width: 618px;
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
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 8px;
      margin-bottom: 12px;
    }
  }
}

.ft {
  width: 100%;
  height: 52px;
  flex: 0 0 52px;
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
    height: 28px;
    border: 1px solid #C9D1DC;
    border-radius: 6px;
    cursor: pointer;
    padding: 0 12px;
    box-sizing: border-box;
    margin-right: 12px;
  }

  .ft-btn {
    background: #F98080;
    border-radius: 6px;
    width: 76px;
    height: 28px;
    color: #FCFCFC;
    cursor: pointer;
  }
}
</style>