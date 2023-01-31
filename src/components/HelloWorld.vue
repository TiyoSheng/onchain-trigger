<template>
  <div class="hello" v-if="formValue">
    <div class="l">
      <Form :fv="fv" ref="formRef" />
      <n-form-item style="justify-content: flex-end;display:flex">
        <n-button attr-type="button" @click="editForm">
          确认
        </n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleValidateClick">
          开始监听
        </n-button>
        <n-button v-if="fv.running" style="margin-left: 20px" attr-type="button" @click="off">
          停止监听
        </n-button>
      </n-form-item>
    </div>
    <div class="r">
      <div
        class="msgs"
        v-for="(item, index) in fv.msgList"
        :key="index"
        ref="child"
      >
        <JsonViewer v-if="item.from.toLocaleLowerCase() != wallet.address.toLocaleLowerCase()" :value="item" boxed sort expanded />
        <div v-else class="cover">
          <div class="cover-hd flex-center">
            <p>覆盖交易</p>
            <p>hash: {{item.hash}}</p>
          </div>
          <JsonViewer :value="item" boxed sort expanded />
        </div>
      </div>
      <div class="status flex-center-sb">
        <div class="flex-center">
          <span :style="{background: fv.running ? 'green' : 'red'}"></span>
          {{fv.running ? '监听中' : '未监听'}}
        </div>
        <div class="flex-center">事件数量：{{getEventLength()}} <p @click="clearMsg">clear</p></div>
      </div>
    </div>
  </div>
</template>

<script>
import { getLs, setLs } from '@/service/service'
import { useIsActivating } from '../hooks/useIsActivating'
import { ethers } from 'ethers'
import Form from '@/components/Form.vue'
import {JsonViewer} from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"
import { onMounted, ref, watch, nextTick, toRaw, computed } from 'vue'
import { useStore } from 'vuex'
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");
import { useMessage } from "naive-ui";
const settings = {
  apiKey: "72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G",
  network: Network.ETH_GOERLI
};
const alchemy = new Alchemy(settings);
export default {
  name: 'HelloWorld',
  components: { JsonViewer, Form },
  setup() {
    const store = useStore()
    const formRef = ref(null);
    const showAddModal = ref(false)
    const message = useMessage();
    const child = ref(null)
    const showModal = ref(false)
    const contractData = ref({chain: {chainId: 5, name: 'Goerli'}})
    const funInputs = ref([])
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
    const fv = ref({})
    // const abiChange = () => {
    //   abi.value = JSON.parse(formValue.value.abi)
    // }

    const formValue = computed(() => {
      return store.state.activateTrigger
    })

    const walletList = computed(() => {
      return store.state.walletList
    })
    const contractList = computed(() => {
      return store.state.contractList
    })

    const contractChange = () => {
      formValue.value.funName = ''
      formValue.value.inputData = {}
      funInputs.value = []
      if (formValue.value.address == 'add') {
        showAddModal.value = true
      } else {
        let contract = contractList.value
        contract.forEach(e => {
          if (e.address == formValue.value.address) {
            formValue.value.abi = e.abi
            abi.value = JSON.parse(formValue.value.abi)
          }
        })
      }
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
        let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
        wallet.value = new ethers.Wallet(formValue.value.walletKey, provider)
        getBalance()
      }
    }

    const getBalance = async () => {
      let balance = await toRaw(wallet.value).getBalance()
      wallet.value.balance = ethers.utils.formatEther(balance)
      wallet.value.nonce = await alchemy.core.getTransactionCount(wallet.value.address)
      
      console.log(wallet.value.nonce)
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

    const handleCreatedContractData = async () => {
      let contracts = await getLs('contracts') || []
      contracts.push(contractData.value)
      setLs('contracts', JSON.parse(JSON.stringify(contracts))).then(async () => {
        showAddModal.value = false
        contracts.push({name: '添加新合约', address: 'add'})
        contractList.value = contracts
        formValue.value.address = contractData.value.address
        contractData.value = {chain: {chainId: 5, name: 'Goerli'}}
      })
    }

    const editForm = async () => {
      let f = formRef.value.formValue
      if (f.id) {
        let triggers = await getLs('triggers') || []
        triggers.forEach((e) => {
          if (e.id == f.id) {
            e.funInputs = formRef.value.funInputs
            e.filterFun = formRef.value.filterFun
            e.filterValue = formRef.value.filterValue
            e.abi = formRef.value.abi
            e.applyAbi = formRef.value.applyAbi
            e.applyInputs = formRef.value.applyInputs
            e.inputFun = formRef.value.inputFun
            e.inputValue = formRef.value.inputValue
          }
        })
        console.log(triggers)
        setLs('triggers', JSON.parse(JSON.stringify(triggers))).then(res => {
          store.commit('setTriggers', res)
          fv.value = f
        })
      }
    }

    const filter = (funInputs, filterData) => {
      let r = true
      funInputs.forEach(e => {
        for(let i = 0; i < filterData.length; i++) {
          let filterItem = filterData[i]
          if (filterItem.name == e.name) {
            console.log(filterItem, e)
            switch(filterItem.filterFun) {
              case '$gt':
                if (!(+e.value > +filterItem.filterValue)) {
                  r = false
                }
                break
              case '$lt':
                if (!(+e.value < +filterItem.filterValue)) {
                  r = false
                }
                break
              case '$gte':
                if (!(+e.value >= +filterItem.filterValue)) {
                  r = false
                }
                break
              case '$lte':
                if (!(+e.value <= +filterItem.filterValue)) {
                  r = false
                }
                break
              case '$eq':
                if (!(+e.value == +filterItem.filterValue)) {
                  r = false
                }
                break
              case '$ne':
                if (!(+e.value != +filterItem.filterValue)) {
                  r = false
                }
                break
              case '$in':
                if (!(e.value.indexOf(filterItem.filterValue) > -1)) {
                  r = false
                }
                break
            }
          }
        }
      })
      return r
    }

    const handleValidateClick = async (e) => {
      e.preventDefault();
      off()
      editForm()
      let triggers = await getLs('triggers') || []
      let fv = formValue.value
      if (!fv.address || !fv.abi || !fv.funName || !fv.walletKey) {
        message.error("请先输入配置");
        return
      }
      let walletAddress = wallet.value.address
      alchemy.core.getTokenBalances(fv.address).then(async () => {
        contractValue.value = await new ethers.Contract(fv.applyAddress, fv.applyAbi, toRaw(wallet.value))
        console.log(contractValue.value)
        message.success("开始监听");
        triggers.forEach((e) => {
          if (e.id == fv.id) {
            fv.running = true
            e.running = true
          } else {
            e.running = false
          }
        })
        setLs('triggers', JSON.parse(JSON.stringify(triggers))).then(res => {
          store.commit('setTriggers', res)
          fv.value = fv
        })
      })
      alchemy.ws.on({
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        toAddress: fv.address
      }, async (res) => {
        console.log(res)
        let funInputs = fv.funInputs
        let filterData = fv.filterData
        let funTypes = fv.funInputs.map(e => e.type)
        let inputData = ethers.utils.defaultAbiCoder.decode(funTypes, ethers.utils.hexDataSlice(res.input, 4))
        for (let i = 0; i < inputData.length; i++) {
          if (funInputs[i].type.indexOf("uint") > -1) {
            let data = ethers.utils.formatUnits(inputData[i], 0)
            funInputs[i].value = data
          } else {
            funInputs[i].value = inputData[i]
          }
        }
        if (filter(funInputs, filterData)) {
          triggers.forEach((e) => {
            if (e.running) {
              e.msgList.push(res)
              if (formValue.value.running) {
                formValue.value.msgList.push(res)
              }
            }
          })
          if (res && res.hash && (res.from.toLocaleLowerCase() != walletAddress.toLocaleLowerCase())) {
            let gp = ethers.utils.formatUnits(res.maxFeePerGas, 0)
            let mpfg = ethers.utils.formatUnits(res.maxPriorityFeePerGas, 0)
            let gl = ethers.utils.formatUnits(res.gas, 0)
            try {
              let input = []
              funInputs.forEach((e, i) => {
                let fvInputData = fv.inputData || []
                let filterInput = fvInputData.filter(el => el.name == e.name)
                if (filterInput && filterInput.length && filterInput[0].inputFun == '$ne') {
                  input[i] = filterInput[0].inputValue
                } else {
                  input[i] = e.value
                }
              })
              console.log(input, ...input, fv.funName, contractValue.value)
              let tx = await contractValue.value[fv.funName](...input, { maxFeePerGas: (gp * 1.5).toFixed(0), maxPriorityFeePerGas: (mpfg * 1.5).toFixed(0), gasLimit: (gl * 1.5).toFixed(0)})
              wallet.value.nonce += 1
              console.log(tx)
            } catch (error) {
              console.log(error)
            }
          }
          setLs('triggers', JSON.parse(JSON.stringify(triggers))).then(res => {
            store.commit('setTriggers', res)
          })
        }
      })
    }

    const off = async () => {
      let fv = formValue.value
      await alchemy.ws.off()
      let triggers = await getLs('triggers') || []
      triggers.forEach((e, index) => {
        if (e.id == fv.id) {
          fv.running = false
          triggers[index].running = false
        }
      })
      setLs('triggers', JSON.parse(JSON.stringify(triggers))).then(res => {
        store.commit('setTriggers', res)
        fv.value = fv
      })
    }

    const getEventLength = () => {
      return fv.value.msgList.filter(e => e.from.toLocaleLowerCase() != wallet.value.address.toLocaleLowerCase()).length
    }

    const clearMsg = async () => {
      let triggers = await getLs('triggers') || []
      triggers.forEach((e) => {
        if (e.id == fv.value.id) {
          e.msgList = []
          formValue.value.msgList = []
        }
      })
      setLs('triggers', JSON.parse(JSON.stringify(triggers))).then(res => {
        store.commit('setTriggers', res)
      })
    }

    onMounted(async () => {
      // getProvider()
    })
    watch(formValue, () => {
      console.log(formValue.value)
      fv.value = formValue.value
      if (fv.value.walletKey) {
        let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
        wallet.value = new ethers.Wallet(fv.value.walletKey, provider)
      }
      
    }, { deep: true })
    watch(() => fv.value.msgList, () => {
      nextTick(() => {
        setTimeout(() => {
          if (fv.value.msgList.length - 1 >= 0) {
            child.value[fv.value.msgList.length - 1].scrollIntoView({block: "end", behavior: "smooth"})
          }
        }, 200)
      });
    }, { deep: true })
    return {
      fv,
      contractData,
      contractList,
      showAddModal,
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
      notifyAddresss,
      selectChange,
      getProvider,
      walletChange,
      handleValidateClick,
      handleCreated,
      getBalance,
      handleCreatedContractData,
      contractChange,
      off,
      editForm,
      getEventLength,
      clearMsg
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
    position: relative;
    .msgs {
      width: 100%;
      margin-bottom: 14px;
    }
    .cover {
      margin-top: -14px;
      box-sizing: border-box;
    }
    .cover-hd {
      box-sizing: border-box;
      p {
        font-size: 12px;
        &:first-child {
          width: 80px;
          height: 30px;
          background: #f4f4f8;
          line-height: 30px;
          text-align: center;
          border-radius: 5px;
          margin-right: 10px;
        }
      }
    }
    .status {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      background: #E5E7EB;
      border-radius: 8px;
      height: 50px;
      padding: 0 20px;
      box-sizing: border-box;
      font-size: 14px;
      span {
        width: 10px;
        height: 10px;
        border-radius: 10px;
        background: red;
        margin-right: 8px;
      }
      p {
        cursor: pointer;
        font-size: 12px;
        margin-left: 12px;
        color: green;
      }
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

.jv-container .jv-code {
  padding: 16px;
}

.cover .jv-container.jv-light {
  background: #f4f4f8 !important;
}

.jv-container .jv-code.open {
  padding-bottom: 16px;
}

/* .n-form-item-feedback-wrapper {
  display: none;
} */
  
</style>
