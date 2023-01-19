<template>
  <div class="hello">
    <div class="l">
      <p>合约地址：<input type="text" v-model="notifyAddresss"></p>
      <p>合约ABI：<textarea cols="30" rows="10" v-model="abi" @change="abiChange"></textarea></p>
      <p>选择合约：
        <select name="languages" id="lang" placeholder="选择合约" v-model="funName" @change="selectChange">
          <option v-for="(item, index) in abi" :key="index" :value="item.name">{{item.name}}</option>
        </select>
      </p>
      <p>钱包私钥：<textarea cols="30" rows="10" v-model="privateKey"></textarea></p>
      <div>输入覆盖内容：
        <div>
          <p v-for="item in funInputs" :key="item.name">{{item.name}}<input type="text" v-model="inputData[item.name]"></p>
        </div>
      </div>
      <button @click="notifyFun">开始监听</button>
    </div>
    <div class="r">
      <div
        class="msgs"
        v-for="(item, index) in msgList"
        :key="index"
        ref="child"
      >
        <JsonViewer :value="item" boxed sort expanded />
      </div>
    </div>
  </div>
</template>

<script>
import { useIsActivating } from '../hooks/useIsActivating'
import { ethers } from 'ethers'
import {JsonViewer} from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"
import { onMounted, ref, watch, nextTick } from 'vue'
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");
const settings = {
  apiKey: "72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G",
  network: Network.ETH_GOERLI,
};
const alchemy = new Alchemy(settings);
export default {
  name: 'HelloWorld',
  components: { JsonViewer },
  setup() {
    // let request = false
    const child = ref(null)
    const msgList = ref([])
    const funInputs = ref([])
    const abi = ref('')
    const privateKey = ref('')
    const inputData = ref({})
    const funName = ref('')
    const notifyAddresss = ref('')
    const { getProvider } = useIsActivating()
    const toAddress = ref('')
    const walletAddress = ref('')
    const contractValue = ref(null)
    const notifyFun = () => {
      if (!notifyAddresss.value) {
        alert('请先输入监听地址')
        return
      }
      alchemy.core.getTokenBalances(notifyAddresss.value).then(async res => {
        console.log(11, res)
        let provider = ethers.getDefaultProvider('goerli')
        let wallet = new ethers.Wallet(privateKey.value, provider)
        console.log(wallet.address)
        walletAddress.value = wallet.address
        contractValue.value = await new ethers.Contract(notifyAddresss.value, abi.value, wallet)
        alert('开始监听')
      })
      alchemy.ws.on({
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        toAddress: notifyAddresss.value
      }, async (res) => {
        console.log(res.from.toLocaleLowerCase() != walletAddress.value.toLocaleLowerCase())
        if (res && res.hash && (res.from.toLocaleLowerCase() != walletAddress.value.toLocaleLowerCase())) {
          msgList.value.push(res)
          let gp = ethers.utils.formatUnits(res.gasPrice, 0)
          let mpfg = ethers.utils.formatUnits(res.maxPriorityFeePerGas, 0)
          try {
            let tx = await contractValue.value[funName.value](...Object.values(inputData.value), { maxFeePerGas: (gp * 1.1).toFixed(0), maxPriorityFeePerGas: (mpfg * 1.2).toFixed(0)})
            console.log(tx)
          } catch (error) {
            console.log(error)
          }
          
        }
      })
    }

    const abiChange = () => {
      console.log(abi.value)
      abi.value = JSON.parse(abi.value)
    }

    const selectChange = () => {
      console.log(funName.value)
      abi.value.forEach(e => {
        if (e.name == funName.value) {
          console.log(e)
          funInputs.value = e.inputs
        }
      })
    }

    onMounted(() => {
      // getProvider()
    })
    watch(() => msgList, () => {
      nextTick(() => {
        setTimeout(() => {
          child.value[msgList.value.length - 1].scrollIntoView({block: "end", behavior: "smooth"})
        }, 200)
        
      });
    }, { deep: true })


    return {
      privateKey,
      funInputs,
      funName,
      inputData,
      abi,
      child,
      toAddress,
      msgList,
      notifyAddresss,
      notifyFun,
      abiChange,
      selectChange,
      getProvider
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.hello {
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  align-items: flex-start;
  padding: 30px;
  box-sizing: border-box;
  .l {
    flex: 0 0 500px;
    p {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      input {
        width: 300px;
        height: 30px;
      }
      select {
        width: 100px;
        height: 30px;
      }
    }
  }
  .r {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    .msgs {
      width: 100%;
      margin-bottom: 14px;
    }
  }
}
</style>
<style>
.jv-more {
  display: none;
}

.jv-container.boxed:hover {
  box-shadow: none
}
.jv-container.boxed {
  border: none;
}
  
</style>
