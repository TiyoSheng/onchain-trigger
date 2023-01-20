<template>
  <div class="hello">
    <!-- <div class="l">
      <p>合约地址：<input type="text" v-model="notifyAddresss"></p>
      <p>合约ABI：<textarea cols="30" rows="10" v-model="abi" @change="abiChange"></textarea></p>
      <p>选择合约：
        <select name="languages" id="lang" placeholder="选择合约" v-model="funName" @change="selectChange">
          <option v-for="(item, index) in abi" :key="index" :value="item.name">{{item.name}}</option>
        </select>
      </p>
      <p>钱包私钥：
        <select name="languages" id="lang" placeholder="选择合约" v-model="walletKey" @change="walletChange">
          <option v-for="(item, index) in abi" :key="index" :value="item.name">{{item.name}}</option>
          <option :value="'add'">添加钱包</option>
        </select>
      </p>
      <div>输入覆盖内容：
        <div>
          <p v-for="item in funInputs" :key="item.name">{{item.name}}<input type="text" v-model="inputData[item.name]"></p>
        </div>
      </div>
      <button @click="notifyFun">开始监听</button>
    </div> -->
    <n-form
      ref="formRef"
      :label-width="180"
      class="l"
    >
      <n-form-item label="合约地址：" path="formValue.address">
        <n-input v-model:value="formValue.address" placeholder="输入合约地址" />
      </n-form-item>
      <n-form-item label="合约ABI：" path="formValue.abi">
        <n-input v-model:value="formValue.abi" type="textarea" placeholder="输入abi" @change="abiChange" />
      </n-form-item>
      <n-form-item label="选择合约方法：" path="formValue.funName">
        <n-select
          v-model:value="formValue.funName"
          placeholder="选择合约方法"
          :options="abi"
          label-field="name"
          value-field="name"
          @update:value="selectChange"
        />
      </n-form-item>
      <n-form-item label="选择钱包：" path="formValue.walletKey">
        <n-select
          v-model:value="formValue.walletKey"
          placeholder="选择钱包"
          :options="walletList"
          @update:value="walletChange"
          label-field="name"
          value-field="privateKey"
        />
      </n-form-item>
      <div style="margin-bottom: 24px;font-size: 14px;margin-top: -10px"><p>address: {{wallet.address}}</p><p>余额： {{wallet.balance}} <svg v-if="wallet.balance >= 0" @click="getBalance" style="margin-left: 14px;cursor: pointer;" t="1674234880352" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2699" width="12" height="12"><path d="M960 416V192l-73.056 73.056a447.712 447.712 0 0 0-373.6-201.088C265.92 63.968 65.312 264.544 65.312 512S265.92 960.032 513.344 960.032a448.064 448.064 0 0 0 415.232-279.488 38.368 38.368 0 1 0-71.136-28.896 371.36 371.36 0 0 1-344.096 231.584C308.32 883.232 142.112 717.024 142.112 512S308.32 140.768 513.344 140.768c132.448 0 251.936 70.08 318.016 179.84L736 416h224z" p-id="2700"></path></svg></p></div>
      <n-form-item label="覆盖内容：" path="formValue.inputData">
        <div v-for="(item, index) in funInputs" :key="index" style="display: flex;align-items: center;justify-content: space-between;font-size: 14px;">
          <p style="width: 150px;margin:0">{{item.name + '(' + item.type + ')'}}：</p>
          <n-input v-model:value="formValue.inputData[item.name]" style="margin-left: 20px" />
        </div>
      </n-form-item>
      <n-form-item>
        <n-button attr-type="button" @click="handleValidateClick">
          开始监听
        </n-button>
      </n-form-item>
    </n-form>
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
    <n-modal
      v-model:show="showModal"
      :mask-closable="false"
      :style="{width: '600px', 'border-radius': '10px'}"
      preset="card"
      title="创建新钱包"
    >
      <div>
        <n-form-item label="钱包名称" >
          <n-input v-model:value="walletName" placeholder="输入钱包名" />
        </n-form-item>
        <n-form-item style="display: flex;justify-content: flex-end;">
          <n-button attr-type="button" @click="showModal = false">取消</n-button>
          <n-button style="margin-left: 20px" attr-type="button" @click="handleCreated">创建</n-button>
      </n-form-item>
      </div>
    </n-modal>
  </div>
</template>

<script>
import { getLs, setLs } from '@/service/service'
import { useIsActivating } from '../hooks/useIsActivating'
import { ethers } from 'ethers'
import {JsonViewer} from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"
import { onMounted, ref, watch, nextTick, toRaw } from 'vue'
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");
import { useMessage } from "naive-ui";
const settings = {
  apiKey: "72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G",
  network: Network.ETH_GOERLI,
};
const alchemy = new Alchemy(settings);
export default {
  name: 'HelloWorld',
  components: { JsonViewer },
  setup() {
    const formRef = ref(null);
    const message = useMessage();
    const child = ref(null)
    const showModal = ref(false)
    const msgList = ref([])
    const funInputs = ref([])
    const walletList = ref([])
    const abi = ref('')
    const privateKey = ref('')
    const inputData = ref({})
    const funName = ref('')
    const walletKey = ref('')
    const notifyAddresss = ref('')
    const walletName = ref('')
    const { getProvider } = useIsActivating()
    const toAddress = ref('')
    const wallet = ref({})
    const contractValue = ref(null)
    const formValue = ref({inputData: {}})

    const abiChange = () => {
      abi.value = JSON.parse(formValue.value.abi)
    }

    const selectChange = () => {
      console.log(abi.value, formValue.value.funName)
      abi.value.forEach(e => {
        if (e.name == formValue.value.funName) {
          console.log(e)
          funInputs.value = e.inputs
        }
      })
    }

    const walletChange = async () => {
      console.log(formValue.value.walletKey)
      if (formValue.value.walletKey == 'add') {
        showModal.value = true
        let wallets = await getLs('wallet') || []
        walletName.value = `Account${wallets.length || ''}`
        // wallets.push(randomWallet)
        // localStorage.setItem('wallet', wallets)
        // walletList.value = wallets
      } else {
        let provider = ethers.getDefaultProvider('goerli')
        wallet.value = new ethers.Wallet(formValue.value.walletKey, provider)
        getBalance()
      }
    }

    const getBalance = async () => {
      let balance = await toRaw(wallet.value).getBalance()
      wallet.value.balance = ethers.utils.formatEther(balance)
    }

    const handleCreated = async () => {
      let lbcWallet = ethers.Wallet.createRandom()
      let newWallet = {}
      console.log(lbcWallet.privateKey)
      newWallet.privateKey = lbcWallet.privateKey
      newWallet.name =  walletName.value
      let wallets = await getLs('wallet') || []
      wallets.push(newWallet)
      setLs('wallet', JSON.parse(JSON.stringify(wallets))).then(async () => {
        showModal.value = false
        walletName.value = ''
        wallets.push({name: '添加新钱包', privateKey: 'add'})
        walletList.value = wallets
        formValue.value.walletKey = newWallet.privateKey
        let provider = ethers.getDefaultProvider('goerli')
        wallet.value = new ethers.Wallet(formValue.value.walletKey, provider)
        getBalance()
      })
    }

    const handleValidateClick = (e) => {
      e.preventDefault();
      console.log(formValue.value)
      let fv = formValue.value
      let walletAddress = wallet.value.address
      if (!fv.address || !fv.abi || !fv.funName || !fv.walletKey) {
        message.error("请先输入配置");
        return
      }
      console.log(fv.address)
      alchemy.core.getTokenBalances(fv.address).then(async () => {
        contractValue.value = await new ethers.Contract(fv.address, fv.abi, toRaw(wallet.value))
        console.log(contractValue.value)
        message.success("开始监听");
      })
      alchemy.ws.on({
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        toAddress: fv.address
      }, async (res) => {
        console.log(res)
        msgList.value.push(res)
        if (res && res.hash && (res.from.toLocaleLowerCase() != walletAddress.toLocaleLowerCase())) {
          let gp = ethers.utils.formatUnits(res.gasPrice, 0)
          let mpfg = ethers.utils.formatUnits(res.maxPriorityFeePerGas, 0)
          setTimeout(async () => {
            try {
              let tx = await contractValue.value[fv.funName](...Object.values(fv.inputData), { maxFeePerGas: (gp * 1.1).toFixed(0), maxPriorityFeePerGas: (mpfg * 1.1).toFixed(0)})
              console.log(tx)
            } catch (error) {
              console.log(error)
            }
          }, 1750)
        }
      })
    }

    onMounted(async () => {
      // getProvider()
      let wallets = await getLs('wallet') || []
      console.log(wallets)
      wallets.push({name: '添加新钱包', privateKey: 'add'})
      walletList.value = wallets
    })
    watch(() => msgList, () => {
      nextTick(() => {
        setTimeout(() => {
          child.value[msgList.value.length - 1].scrollIntoView({block: "end", behavior: "smooth"})
        }, 200)
      });
    }, { deep: true })
    return {
      wallet,
      walletName,
      showModal,
      formRef,
      formValue,
      walletList,
      walletKey,
      privateKey,
      funInputs,
      funName,
      inputData,
      abi,
      child,
      toAddress,
      msgList,
      notifyAddresss,
      abiChange,
      selectChange,
      getProvider,
      walletChange,
      handleValidateClick,
      handleCreated,
      getBalance
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
    margin-left: 40px;
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

/* .n-form-item-feedback-wrapper {
  display: none;
} */
  
</style>
