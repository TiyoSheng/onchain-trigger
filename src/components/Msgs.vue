<script setup >
import { ref, watch } from 'vue'
import { JsonViewer } from "vue3-json-viewer"
import { useMessage } from "naive-ui"
import { ethers } from 'ethers'
import "vue3-json-viewer/dist/index.css"
import { useGlobalStore } from "../hooks/globalStore"
import { decodeExecute } from '../libs/universalDecoder'
import { Alchemy, Network, AlchemySubscription } from "alchemy-sdk"
const settings = {
  apiKey: "72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G",
  network: Network.ETH_GOERLI
}
const alchemy = new Alchemy(settings)
const erc20abi = [{ "inputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint256", "name": "max_supply", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" } ], "name": "decreaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" } ], "name": "increaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }]


const { store, setTriggrts, setCountdownDuration, setGasPrice } = useGlobalStore()
const message = useMessage()

const activatedId = ref('')
const msgsRef = ref(null)
const msgs = ref([])
const params = ref([])
const triggerData = ref({triggers: []})

let contractData = []
let interval = null
let loopInterval = null
let gasInterval = null

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

const runFilter = (keyValue, val, condition) => {
  let r = true
  console.log(keyValue, val, condition)
  switch(condition) {
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
    msgs.value.push(msg)
    triggerData.value.messages = msgs.value
    setTrigger(triggerData.value)
  } else if (item.type == 'uni') {
    let inToken = getParam(item.inAddress, paramList)
    let outToken = getParam(item.outAddress, paramList)
    let inAmount = getParam(item.inAmount, paramList)
    let gp = ethers.utils.formatUnits(alchemyRes.gasPrice, 0)
    let gl = ethers.utils.formatUnits(alchemyRes.gas, 0)
    try {
      const headers = {'0x-api-key': '4243850c-a27b-4f20-bfaf-765641b1d1b2'}
      const response = await fetch(`https://goerli.api.0x.org/swap/v1/quote?sellToken=${inToken}&buyToken=${outToken}&sellAmount=${inAmount}&takerAddress=${triggerData.value.wallet?.address}`)
      let swapQuoteJSON = await response.json()
      console.log("Quote: ", swapQuoteJSON)
      if (swapQuoteJSON.code) {
        let msg3 = {
          type: 'uni',
          name: 'swapQuote-error',
          result: swapQuoteJSON
        }
        msgs.value.push(msg3)
        triggerData.value.messages = msgs.value
        setTrigger(triggerData.value)
        return
      }
      let msg2 = {
        type: 'uni',
        name: 'swapQuote',
        result: swapQuoteJSON
      }
      msgs.value.push(msg2)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
      let isAppoved = await isAppove(item)
      if (!isAppoved) {
        appove(item)
      }
      let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
      let wallet = new ethers.Wallet(triggerData.value.wallet?.privateKey, provider)
      let data = {
        from: swapQuoteJSON.from,
        to: swapQuoteJSON.to,
        data: swapQuoteJSON.data,
        value: ethers.BigNumber.from(swapQuoteJSON.value),
        gasPrice: ethers.BigNumber.from((gp * 1.5).toFixed(0)),
        gasLimit: ethers.BigNumber.from(swapQuoteJSON.gas)
      }
      const receipt = await wallet.sendTransaction(data)
      receipt.wait()
      console.log("receipt: ", receipt);
      let msg1 = {
        type: 'uni',
        name: 'sendTransaction',
        result: receipt
      }
      msgs.value.push(msg1)
      triggerData.value.messages = msgs.value
      setTrigger(triggerData.value)
    } catch (error) {
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
  }
  applyFun(list, paramList, time)
}

const onTime = () => {
  triggerData.value.status = 'on'
  let triggerFun = triggerData.value.triggers[0]
  if (triggerFun.timeType == 'timing') {
    let nowData = new Date().getTime()
    if (nowData > triggerFun.timestamp) {
      message.error('时间已过')
      off()
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

const isAppove = async (item) => {
  let paramList = JSON.parse(JSON.stringify(params.value))
  let inToken = getParam(item.inAddress, paramList)
  let inAmount = getParam(item.inAmount, paramList)
  const fromTokenAddress = inToken
  console.log(fromTokenAddress, inAmount)
  let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
  let wallet = new ethers.Wallet(triggerData.value.wallet?.privateKey, provider)
  let ERC20TokenContract = await new ethers.Contract(fromTokenAddress, erc20abi, wallet)
  let allowance = await ERC20TokenContract.allowance(triggerData.value.wallet?.address, '0xF91bB752490473B8342a3E964E855b9f9a2A668e')
  return (allowance.toString() * 1) > (inAmount * 1)
}

const appove = async (item) => {
  let paramList = JSON.parse(JSON.stringify(params.value))
  let inToken = getParam(item.inAddress, paramList)
  let inAmount = getParam(item.inAmount, paramList)
  const fromTokenAddress = inToken
  const maxApproval = ethers.utils.parseUnits((inAmount * 50).toString(), 0)
  console.log(maxApproval)
  let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
  let wallet = new ethers.Wallet(triggerData.value.wallet?.privateKey, provider)
  let ERC20TokenContract = await new ethers.Contract(fromTokenAddress, erc20abi, wallet)
  let tx = await ERC20TokenContract.approve('0xF91bB752490473B8342a3E964E855b9f9a2A668e', maxApproval)
  await tx.wait()
  let msg = {
    type: 'uni',
    name: 'Approval',
    result: tx
  }
  msgs.value.push(msg)
  triggerData.value.messages = msgs.value
  setTrigger(triggerData.value)
}

const getGas = async () => {
  let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
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
    switch(condition) {
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

const intervalFun = (gasPrice) => {
  setGasPrice(gasPrice)
  let triggerFun = triggerData.value.triggers[0]
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

const onGas = async () => {
  triggerData.value.status = 'on'
  let gasPrice = await getGas()
  intervalFun(gasPrice)
  gasInterval = setInterval(async () => {
    gasPrice = await getGas()
    intervalFun(gasPrice)
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

const onUni = async (index) => {
  triggerData.value.status = 'on'
  let trigger = triggerData.value.triggers[index]
  alchemy.core.getTokenBalances(triggerData.value.wallet?.address).then(async () => {
    message.success("开始监听")
    triggerData.value.status = 'on'
  })
  alchemy.ws.on({
    method: AlchemySubscription.PENDING_TRANSACTIONS,
    toAddress: '0x4648a43B2C14Da09FdF82B161150d3F634f40491'
    // addresses: [{
    //   from: getParam(trigger.address),
    //   to: "0x4648a43B2C14Da09FdF82B161150d3F634f40491",
    // }]
  }, async (res) => {
    try {
      if (!(res.from.toLocaleLowerCase() == getParam(trigger.address).toLocaleLowerCase())) return
      console.log(res)
      let inputData = decodeExecute(res.input)
      let path = inputData.path || []
      if (path[trigger.uniType].toLocaleLowerCase() == getParam(trigger.daiAddress).toLocaleLowerCase()) {
        let msg = {
          name: trigger.name,
          // result: {'钱包地址': getParam(trigger.address), '方向': trigger.uniType == 0 ? '卖出' : '买入', '代币': getParam(trigger.daiAddress), '数量': trigger.uniType == 0 ? inputData.amountIn : inputData.amounOut},
          result: res,
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
          list = JSON.parse(JSON.stringify(flow.handdleList))
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
    // let nonce = triggerData.value.wallet.nonce + 1
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
  let trigger = triggerData.value?.triggers[0]
  if (trigger) {
    if (trigger.type == 'time') {
      if (trigger.timeType == 'timing') {
        clearInterval(interval)
      } else {
        clearInterval(loopInterval)
      }
    }
    if (trigger.type == 'contract' || trigger.type == 'uni') {
      await alchemy.ws.off()
    }
    if (trigger.type == 'gas') {
      clearInterval(gasInterval)
    }
    triggerData.value.status = 'off'
    setCountdownDuration(0)
    setGasPrice(0)
  }
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
  if (trigger.type == 'time') {
    onTime()
    return
  }
  if (trigger.type == 'gas') {
    onGas()
    return
  }
  if (trigger.type == 'uni') {
    onUni(index)
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