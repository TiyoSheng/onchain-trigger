import { useMessage } from 'naive-ui'

export const useUtils = () => {
  const message = useMessage();
  const copy = (value) => {
    if (!navigator.clipboard || window.top != window.self) {
      let textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.style.position = 'fixed'
      textarea.style.clip = 'rect(0 0 0 0)'
      textarea.style.top = '10px'
      textarea.value = value
      textarea.select()
      document.execCommand('copy', true)
      document.body.removeChild(textarea)
    } else {
      navigator.clipboard.writeText(value)
    }
    message.success('Copy successful');
  };

  const resetGlobalParams = (trigger) => {
    let globalParams = JSON.parse(JSON.stringify(trigger.globalParams)) 
    let address = trigger.wallet?.address
    let balance = trigger.wallet?.balance
    if (address && !globalParams.find(item => item.key === 'currentWalletAddress')) {
      globalParams.push({key: 'currentWalletAddress', value: address})
    }
    if (address && !globalParams.find(item => item.key === 'currentWalletBalance')) {
      globalParams.push({key: 'currentWalletBalance', value: balance})
    }
    globalParams = globalParams.map(e => {
      let value = e.value || ''
      if (value.length > 24) {
        value = `${value.slice(0, 6)}...${value.slice(-4)}`
      }
      return {
        key: e.key,
        value: e.value,
        label: `${e.key == 'currentWalletAddress' ? '当前钱包地址' : e.key == 'currentWalletBalance' ? '当前钱包余额' : e.key} (${value})`,
        type: 'param'
      }
    })
    return globalParams
  }

  const getParamLabel = (item, params) => {
    if (item.type == 'param') {
      let param = params.find(param => param.key === item.value)
      console.log(param)
      if (param) {
        return param.label
      } else {
        if (item.value == 'currentWalletAddress' && !triggerData?.wallet?.address) {
          return '请设置钱包'
        }
      }
    } else {
      return item.value
    }
  }

  const getParams = (item, inputs, params) => {
    let p = []
    inputs.forEach(e => {
      if (item.args[e.name]) {
        let val = item.args[e.name].value
        if (item.args[e.name].type == 'param') {
          for (let i = 0; i < params.length; i++) {
            let param = params[i]
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
    return p
  }

  return {
    copy,
    getParams,
    getParamLabel,
    resetGlobalParams
  }
}


// export const useUtils = () => ({
//   copy
// });