<template>
  <div class="add-trigger">
    <n-form
      ref="formRef"
      :label-width="180"
      class="l"
    >
      <n-form-item label="触发器名称：" path="formValue.name">
        <n-input v-model:value="formValue.name" />
      </n-form-item>
      <n-form-item label="选择合约：" path="formValue.walletKey">
        <n-select
          v-model:value="formValue.address"
          placeholder="选择合约"
          :options="contractList"
          @update:value="contractChange($event, '')"
          label-field="name"
          value-field="address"
        />
      </n-form-item>
      <n-form-item label="选择合约方法：" path="formValue.funName">
        <n-select
          v-model:value="formValue.funName"
          placeholder="选择合约方法"
          :options="abi"
          label-field="name"
          value-field="name"
          @update:value="selectChange($event, '')"
        />
      </n-form-item>
      <n-form-item v-if="funInputs && funInputs.length" label="过滤逻辑：" path="formValue.inputData">
        <div v-for="(item, index) in funInputs" :key="index" class="input-item" >
          <p style="width: 250px;flex:0 0 140px;margin:0">{{item.name + '(' + item.type + ')'}}：</p>
          <n-select
            v-model:value="filterFun[index]"
            style="margin-left: 20px"
            placeholder="选择"
            :options="filterFunList"
            @update:value="filterFunChange(index, item.name)"
          />
          <n-input v-if="item.type == 'uint256'" :allow-input="onlyAllowNumber" v-model:value="filterValue[index]" style="margin-left: 20px" @update:value="filterValueChange(index)" />
          <n-input v-else v-model:value="filterValue[index]" style="margin-left: 20px" @update:value="filterValueChange(index)" />
        </div>
      </n-form-item>
      <n-divider dashed style="font-size: 12px;color:rgba(194, 194, 194, 1);margin-top: 0">监听后执行</n-divider>
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
      <div v-if="wallet && wallet.address" style="margin-bottom: 24px;font-size: 14px;margin-top: -10px"><p>address: {{wallet.address}}</p><p>余额： {{wallet.balance}} <svg v-if="wallet.balance >= 0" @click="getBalance" style="margin-left: 14px;cursor: pointer;" t="1674234880352" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2699" width="12" height="12"><path d="M960 416V192l-73.056 73.056a447.712 447.712 0 0 0-373.6-201.088C265.92 63.968 65.312 264.544 65.312 512S265.92 960.032 513.344 960.032a448.064 448.064 0 0 0 415.232-279.488 38.368 38.368 0 1 0-71.136-28.896 371.36 371.36 0 0 1-344.096 231.584C308.32 883.232 142.112 717.024 142.112 512S308.32 140.768 513.344 140.768c132.448 0 251.936 70.08 318.016 179.84L736 416h224z" p-id="2700"></path></svg></p></div>
      <n-form-item label="选择合约：" path="formValue.walletKey">
        <n-select
          v-model:value="formValue.applyAddress"
          placeholder="选择合约"
          :options="contractList"
          @update:value="contractChange($event, 'apply')"
          label-field="name"
          value-field="address"
        />
      </n-form-item>
      <n-form-item label="选择合约方法：" path="formValue.funName">
        <n-select
          v-model:value="formValue.applyFunName"
          placeholder="选择合约方法"
          :options="applyAbi"
          label-field="name"
          value-field="name"
          @update:value="selectChange($event, 'apply')"
        />
      </n-form-item>
      <n-form-item v-if="applyInputs && applyInputs.length" label="覆盖内容：" path="formValue.inputData">
        <div v-for="(item, index) in applyInputs" :key="index" class="input-item" >
          <p style="width: 250px;flex:0 0 140px;margin:0">{{item.name + '(' + item.type + ')'}}：</p>
          <n-select
            v-model:value="inputFun[index]"
            style="margin-left: 20px;width: 150px"
            placeholder="相同"
            :options="inputFunList"
            @update:value="inputFunChange(index, item.name)"
          />
          <div v-if="inputFun[index] != '$eq'">
            <n-input v-if="item.type == 'uint256'" :allow-input="onlyAllowNumber" v-model:value="inputValue[index]" style="margin-left: 20px" @update:value="inputValueChange(index)" />
            <n-input v-else v-model:value="inputValue[index]" style="margin-left: 20px" @update:value="inputValueChange(index)" />
          </div>
        </div>
      </n-form-item>
      
    </n-form>
    <AddWalletModal ref="addWalletModal" @addWalletSuccess="addWalletSuccess" />
    <AddContractModel ref="addContractModel" @addContractSuccess="addContractSuccess" />
  </div>
</template>
<script>
import { ref, onMounted, computed, toRaw, watch } from 'vue'
import { useStore } from 'vuex'
// import { ethers } from 'ethers'
import { getLs } from '@/service/service'
import AddWalletModal from '@/components/AddWalletModal.vue'
import AddContractModel from '@/components/AddContractModel.vue'
import { ethers } from 'ethers'
const { Alchemy, Network } = require("alchemy-sdk");
const settings = {
  apiKey: "72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G",
  network: Network.ETH_GOERLI
};
const alchemy = new Alchemy(settings);
export default {
  props: ['fv'],
  components: {
    AddWalletModal,
    AddContractModel
  },
  setup(props) {
    console.log(props)
    const store = useStore()
    const funInputs = ref([])
    const applyInputs = ref([])
    const addContractModel = ref(null)
    const addWalletModal = ref(null)
    const showModal = ref(false)
    const wallet = ref({})
    const formValue = ref({inputData: [], filterData: []})
    const filterFun = ref([])
    const inputFun = ref([])
    const inputValue = ref([])
    const filterValue = ref([])
    const filterFunList = ref([{
      label: '大于',
      value: '$gt'
    }, {
      label: '小于',
      value: '$lt'
    }, {
      label: '大于等于',
      value: '$gte'
    }, {
      label: '小于等于',
      value: '$lte'
    }, {
      label: '等于',
      value: '$eq'
    }, {
      label: '不等于',
      value: '$ne'
    }, {
      label: '包含',
      value: '$in'
    }])
    const inputFunList = ref([{
      label: '相同',
      value: '$eq'
    }, {
      label: '更改',
      value: '$ne'
    }])
    const abi = ref([])
    const applyAbi = ref([])
    const walletList = computed(() => {
      return store.state.walletList
    })
    const contractList = computed(() => {
      return store.state.contractList
    })
    const contractChange = (e, apply) => {
      console.log(e, apply)
      if (apply) {
        applyInputs.value = []
        inputFun.value = []
        inputValue.value = []
        formValue.value.inputData = []
        formValue.value.applyFunName = ''
        if (formValue.value.applyAddress == 'add') {
          addContractModel.value.showAddModal = true
        } else {
          let contract = contractList.value
          contract.forEach(e => {
            if (e.address == formValue.value.applyAddress) {
              console.log(e)
              applyAbi.value = JSON.parse(e.abi)
            }
          })
        }
      } else {
        formValue.value.funName = ''
        funInputs.value = []
        formValue.value.filterData = []
        filterFun.value = []
        if (formValue.value.address == 'add') {
          addContractModel.value.showAddModal = true
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
    }
    const getBalance = async () => {
      let balance = await toRaw(wallet.value).getBalance()
      wallet.value.balance = ethers.utils.formatEther(balance)
      wallet.value.nonce = await alchemy.core.getTransactionCount(wallet.value.address)
      
      console.log(wallet.value.nonce)
    }
    const walletChange = async () => {
      console.log(formValue.value.walletKey)
      if (formValue.value.walletKey == 'add') {
        addWalletModal.value.showModal = true
        let wallets = await getLs('wallet') || []
        addWalletModal.value.walletName = `Account${wallets.length || ''}`
      } else {
        let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
        wallet.value = new ethers.Wallet(formValue.value.walletKey, provider)
        getBalance()
      }
    }
    const selectChange = (e, apply) => {
      if (apply) {
        applyAbi.value.forEach(e => {
          if (e.name == formValue.value.applyFunName) {
            applyInputs.value = e.inputs
          }
        })
      } else {
        abi.value.forEach(e => {
          if (e.name == formValue.value.funName) {
            funInputs.value = e.inputs
          }
        })
      }
    }
    const inputFunChange = (index, name) => {
      if (!formValue.value.inputData[index]) {
        formValue.value.inputData[index] = {}
      }
      formValue.value.inputData[index].inputFun = inputFun.value[index]
      formValue.value.inputData[index].name = name
      if (inputFun.value[index] == '$eq') {
        formValue.value.inputData[index].inputValue = ''
        inputValue.value[index] = ''
      }
    }
    const filterFunChange = (index, name) => {
      if (!formValue.value.filterData[index]) {
        formValue.value.filterData[index] = {}
      }
      formValue.value.filterData[index].filterFun = filterFun.value[index]
      formValue.value.filterData[index].name = name
    }
    const filterValueChange = (index) => {
      if (!formValue.value.filterData[index]) {
        formValue.value.filterData[index] = {}
      }
      formValue.value.filterData[index].filterValue = filterValue.value[index]
    }
    const inputValueChange = (index) => {
      if (!formValue.value.inputData[index]) {
        formValue.value.inputData[index] = {}
      }
      formValue.value.inputData[index].inputValue = filterValue.value[index]
    }

    const addWalletSuccess = (e) => {
      console.log(e)
      formValue.value.walletKey = e.privateKey
      walletChange()
    }

    const addContractSuccess = (e) => {
      formValue.value.address = e.address
      contractChange(e.address, '')
    }

    const cancel = () => {
      funInputs.value = []
      applyInputs.value = []
      filterFun.value = []
      inputFun.value = []
      inputValue.value = []
      filterValue.value = []
      showModal.value = false
      wallet.value = {}
      formValue.value = {inputData: [], filterData: []}
    }
    
    onMounted(async () => {
      // getProvider()
      let wallets = await getLs('wallet') || []
      let contracts = await getLs('contracts') || []
      wallets.push({name: '添加新钱包', privateKey: 'add'})
      contracts.push({name: '添加新合约', address: 'add'})
      store.commit('setWallet', wallets)
      store.commit('setContract', contracts)
    })
    watch(() => props.fv, () => {
      if (props.fv) {
        formValue.value = props.fv
        funInputs.value = props.fv.funInputs
        filterFun.value = props.fv.filterFun
        filterValue.value = props.fv.filterValue
        abi.value = props.fv.abi
        applyAbi.value = props.fv.applyAbi
        applyInputs.value = props.fv.applyInputs
        inputFun.value = props.fv.inputFun
        inputValue.value = props.fv.inputValue
      }
    }, { immediate: true })
    return {
      inputValue,
      inputFun,
      inputFunList,
      filterValue,
      filterFunList,
      filterFun,
      abi,
      funInputs,
      applyInputs,
      addWalletModal,
      addContractModel,
      formValue,
      contractList,
      walletList,
      showModal,
      wallet,
      applyAbi,
      contractChange,
      filterFunChange,
      walletChange,
      selectChange,
      filterValueChange,
      inputFunChange,
      inputValueChange,
      cancel,
      addWalletSuccess,
      addContractSuccess,
      onlyAllowNumber: (value) => !value || /^\d+$/.test(value),
    }
  },
}
</script>
<style lang="scss" scoped>
.input-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;
}
</style>
<style>
  .n-form-item .n-form-item-blank {
    display: block;
  }
</style>