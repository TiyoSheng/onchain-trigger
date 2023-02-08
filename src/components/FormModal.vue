<template>
  <n-modal
    v-model:show="isShowModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    :title="modalTitle"
    @afterLeave="cancel"
  >
    <div v-if="modalType == 'wallet'" class="modal-content">
      <n-form-item label="选择钱包：" path="walletKey">
        <n-select
          v-model:value="walletKey"
          placeholder="选择钱包"
          :options="walletList"
          @update:value="walletChange"
          label-field="name"
          value-field="privateKey"
        />
      </n-form-item>
      <div v-if="wallet && wallet.address" style="margin-bottom: 24px;font-size: 14px;margin-top: -10px"><p>address: {{wallet.address}}</p><p>余额： {{wallet.balance}} <svg v-if="wallet.balance >= 0" @click="getBalance" style="margin-left: 14px;cursor: pointer;" t="1674234880352" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2699" width="12" height="12"><path d="M960 416V192l-73.056 73.056a447.712 447.712 0 0 0-373.6-201.088C265.92 63.968 65.312 264.544 65.312 512S265.92 960.032 513.344 960.032a448.064 448.064 0 0 0 415.232-279.488 38.368 38.368 0 1 0-71.136-28.896 371.36 371.36 0 0 1-344.096 231.584C308.32 883.232 142.112 717.024 142.112 512S308.32 140.768 513.344 140.768c132.448 0 251.936 70.08 318.016 179.84L736 416h224z" p-id="2700"></path></svg></p></div>
    </div>
    <div v-if="modalType == 'function'" class="modal-content">
      <n-form-item label="备注名称：">
        <n-input v-model:value="dataItem.name" placeholder="输入备注名称" />
      </n-form-item>
      <n-form-item label="选择合约：" path="formValue.walletKey">
        <n-select
          v-model:value="dataItem.contractId"
          placeholder="选择合约"
          :options="contractList"
          @update:value="contractChange"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
      <n-form-item label="选择合约方法：" path="formValue.funName">
        <n-select
          v-model:value="dataItem.functionName"
          placeholder="选择合约方法"
          :options="abi"
          label-field="name"
          value-field="name"
          @update:value="functionChange"
        />
      </n-form-item>
      <n-form-item v-if="filterInputs && filterInputs.length" label="参数：" path="formValue.inputData">
        <div v-for="(item, index) in filterInputs" :key="index" class="input-item flex-center" >
          <p style="width: 140px;flex:0 0 140px;margin:0">{{item.name + '(' + item.type + ')'}}：</p>
          <div style="margin-left: 20px;flex:1;width: 100%">
            <n-input v-if="item.type == 'uint256'" :allow-input="onlyAllowNumber" v-model:value="dataItem.args[item.name]" />
            <n-input v-else v-model:value="dataItem.args[item.name]" />
          </div>
        </div>
      </n-form-item>
    </div>
    <div v-if="modalType == 'trigger'" class="modal-content">
      <n-form-item label="备注名称：">
        <n-input v-model:value="dataItem.name" placeholder="输入备注名称" />
      </n-form-item>
      <n-form-item label="选择合约：" >
        <n-select
          v-model:value="dataItem.contractId"
          placeholder="选择合约"
          :options="contractList"
          @update:value="contractChange"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
      <n-form-item label="选择合约方法：" >
        <n-select
          v-model:value="dataItem.functionName"
          placeholder="选择合约方法"
          :options="abi"
          label-field="name"
          value-field="name"
          @update:value="functionChange"
        />
      </n-form-item>
      <n-form-item v-if="inputs && inputs.length" label="过滤逻辑：" >
        <div v-for="(item, index) in dataItem.filter" :key="index" class="input-item flex-center"  >
          <n-select
            v-model:value="dataItem.filter[index].name"
            style="margin-left: 20px;width: 150px"
            placeholder="选择"
            :options="filterInputs"
            label-field="oName"
            value-field="name"
            @update:value="filterChange"
          />
          <n-select
            v-model:value="dataItem.filter[index].type"
            style="margin-left: 20px;width: 150px"
            placeholder="选择"
            :options="filterFunList"
          />
          <div style="margin-left: 20px;flex:1;width: 100%">
            <n-input v-if="item.type == 'uint256'" :allow-input="onlyAllowNumber" v-model:value="dataItem.filter[index].value" />
            <n-input v-else v-model:value="dataItem.filter[index].value" />
          </div>
          <div class="del" @click="delFilter(index)">
            <svg t="1675512681148" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2711" width="18" height="18"><path d="M789.333333 343.466667c-12.8 0-21.333333 8.533333-21.333333 21.333333v490.666667c0 23.466667-19.2 42.666667-42.666667 42.666666H298.666667c-23.466667 0-42.666667-19.2-42.666667-42.666666V362.666667c0-12.8-8.533333-21.333333-21.333333-21.333334s-21.333333 8.533333-21.333334 21.333334v490.666666c0 46.933333 38.4 85.333333 85.333334 85.333334h426.666666c46.933333 0 85.333333-38.4 85.333334-85.333334V362.666667c0-10.666667-10.666667-19.2-21.333334-19.2zM915.2 234.666667H746.666667V170.666667c0-46.933333-38.4-85.333333-85.333334-85.333334H362.666667c-46.933333 0-85.333333 38.4-85.333334 85.333334v64H106.666667c-12.8 0-21.333333 8.533333-21.333334 21.333333s8.533333 21.333333 21.333334 21.333333h808.533333c12.8 0 21.333333-8.533333 21.333333-21.333333s-8.533333-21.333333-21.333333-21.333333zM320 170.666667c0-23.466667 19.2-42.666667 42.666667-42.666667h298.666666c23.466667 0 42.666667 19.2 42.666667 42.666667v64H320V170.666667z" fill="#666666" p-id="2712"></path><path d="M640 704V364.8c0-12.8-8.533333-21.333333-21.333333-21.333333s-21.333333 8.533333-21.333334 21.333333V704c0 12.8 8.533333 21.333333 21.333334 21.333333s21.333333-10.666667 21.333333-21.333333zM426.666667 704V362.666667c0-12.8-8.533333-21.333333-21.333334-21.333334s-21.333333 8.533333-21.333333 21.333334v341.333333c0 12.8 8.533333 21.333333 21.333333 21.333333s21.333333-10.666667 21.333334-21.333333z" fill="#666666" p-id="2713"></path></svg>
          </div>
        </div>
        <div class="add-btn" @click="addFilter">添加过滤条件</div>
      </n-form-item>
      <n-divider dashed style="font-size: 12px;color:rgba(194, 194, 194, 1);margin-top: 0">监听后执行</n-divider>
      <div v-if="dataItem.handdleList && dataItem.handdleList.length">
        <div v-for="(handdle, index) in dataItem.handdleList" :key="index" class="handdle-item">
          <div class="del" @click="delHanddle(index)">
            <svg t="1675512681148" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2711" width="18" height="18"><path d="M789.333333 343.466667c-12.8 0-21.333333 8.533333-21.333333 21.333333v490.666667c0 23.466667-19.2 42.666667-42.666667 42.666666H298.666667c-23.466667 0-42.666667-19.2-42.666667-42.666666V362.666667c0-12.8-8.533333-21.333333-21.333333-21.333334s-21.333333 8.533333-21.333334 21.333334v490.666666c0 46.933333 38.4 85.333333 85.333334 85.333334h426.666666c46.933333 0 85.333333-38.4 85.333334-85.333334V362.666667c0-10.666667-10.666667-19.2-21.333334-19.2zM915.2 234.666667H746.666667V170.666667c0-46.933333-38.4-85.333333-85.333334-85.333334H362.666667c-46.933333 0-85.333333 38.4-85.333334 85.333334v64H106.666667c-12.8 0-21.333333 8.533333-21.333334 21.333333s8.533333 21.333333 21.333334 21.333333h808.533333c12.8 0 21.333333-8.533333 21.333333-21.333333s-8.533333-21.333333-21.333333-21.333333zM320 170.666667c0-23.466667 19.2-42.666667 42.666667-42.666667h298.666666c23.466667 0 42.666667 19.2 42.666667 42.666667v64H320V170.666667z" fill="#666666" p-id="2712"></path><path d="M640 704V364.8c0-12.8-8.533333-21.333333-21.333333-21.333333s-21.333333 8.533333-21.333334 21.333333V704c0 12.8 8.533333 21.333333 21.333334 21.333333s21.333333-10.666667 21.333333-21.333333zM426.666667 704V362.666667c0-12.8-8.533333-21.333333-21.333334-21.333334s-21.333333 8.533333-21.333333 21.333334v341.333333c0 12.8 8.533333 21.333333 21.333333 21.333333s21.333333-10.666667 21.333334-21.333333z" fill="#666666" p-id="2713"></path></svg>
          </div>
          <n-form-item label="备注名称：">
            <n-input v-model:value="handdle.name" placeholder="输入备注名称" />
          </n-form-item>
          <n-form-item label="选择合约：">
            <n-select
              v-model:value="handdle.contractId"
              placeholder="选择合约"
              :options="contractList"
              @update:value="handdleContractChange(index)"
              label-field="name"
              value-field="id"
            />
          </n-form-item>
          <n-form-item label="选择合约方法：">
            <n-select
              v-model:value="handdle.functionName"
              placeholder="选择合约方法"
              :options="handdle.abi"
              label-field="name"
              value-field="name"
              @update:value="handdleFunctionChange(index)"
            />
          </n-form-item>
          <n-form-item v-if="handdle.params && handdle.params.length" label="覆盖内容：">
            <div v-for="(item, index) in handdle.params" :key="index" class="input-item flex-center" >
              <p style="width: 250px;flex:0 0 140px;margin:0">{{item.name + '(' + item.type + ')'}}：</p>
              <n-select
                v-model:value="handdle.args[item.name].type"
                style="margin-left: 20px;width: 150px"
                placeholder="相同"
                :options="inputFunList"
              />
              <div v-if="handdle.args[item.name].type == '$ne'" style="margin-left: 20px;flex:1;width: 100%">
                <n-input v-if="item.type == 'uint256'" :allow-input="onlyAllowNumber" v-model:value="handdle.args[item.name].value" style="margin-left: 20px" />
                <n-input v-else v-model:value="handdle.args[item.name].value" style="margin-left: 20px" />
              </div>
            </div>
          </n-form-item>
        </div>
      </div>
      <div class="add-btn" @click="addHanddle">添加执行函数</div>
    </div>
    <n-form-item style="justify-content: flex-end;display:flex">
      <n-button attr-type="button" @click="cancel">
        取消
      </n-button>
      <n-button style="margin-left: 20px" attr-type="button" @click="ok">
        确认
      </n-button>
    </n-form-item>
    <AddWalletModal ref="addWalletModal" @addWalletSuccess="addWalletSuccess" />
    <AddContractModal ref="addContractModal" @addContractSuccess="addContractSuccess" />
  </n-modal>
</template>
<script>
import { ref, computed, toRaw } from 'vue'
import { useStore } from 'vuex'
import { ethers } from 'ethers'
import { useMessage } from "naive-ui"
import { filterFun, inputFun } from '@/libs/config'
import AddWalletModal from '@/components/AddWalletModal.vue'
import AddContractModal from '@/components/AddContractModal.vue'
export default {
  components: {
    AddWalletModal,
    AddContractModal
  },
  setup(props, { emit }) {
    let handdleIndex = -1
    const message = useMessage()
    const store = useStore()
    const isShowModal = ref(false)
    const modalTitle = ref('')
    const modalType = ref('')
    const walletKey = ref('')
    const addContractModal = ref(null)
    const addWalletModal = ref(null)
    const wallet = ref(null)
    const dataItem = ref({})
    const abi = ref([])
    const inputs = ref([])
    const filterInputs = ref([])
    const filterFunList = ref(filterFun)
    const inputFunList = ref(inputFun)
    const walletList = computed(() => {
      return store.state.walletList
    })
    const contractList = computed(() => {
      return store.state.contractList
    })

    const getBalance = async () => {
      let balance = await toRaw(wallet.value).getBalance()
      wallet.value.balance = ethers.utils.formatEther(balance)
    }

    const walletChange = async () => {
      if (walletKey.value == 'add') {
        addWalletModal.value.showModal = true
        let wallets = toRaw(walletList.value)
        addWalletModal.value.walletName = `Account${wallets.length || ''}`
      } else {
        let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
        wallet.value = new ethers.Wallet(walletKey.value, provider)
        getBalance()
      }
    }

    const contractChange = async () => {
      if (dataItem.value.contractId == 'add') {
        addContractModal.value.showAddModal = true
      } else {
        let contracts = toRaw(contractList.value)
        contracts.forEach(e => {
          if (e.id == dataItem.value.contractId) {
            let list = JSON.parse(e.abi)
            list = list.filter((e) => e.type == "function")
            abi.value = list
          }
        })
      }
    }

    const functionChange = () => {
      abi.value.forEach(e => {
        console.log(e)
        if (e.name == dataItem.value.functionName) {
          e.inputs.forEach(el => {
            el.oName = `${el.name}(${el.type})`
          })
          console.log(e.inputs)
          inputs.value = JSON.parse(JSON.stringify(e.inputs))
          filterInputs.value = JSON.parse(JSON.stringify(e.inputs))
          if (e.stateMutability == 'payable') {
            filterInputs.value.push({name: "value", type: "ETH"})
          }
          dataItem.value.args = {}
          dataItem.value.filter = []
          if (modalType.value == 'trigger') {
            e.inputs.forEach(el => {
              dataItem.value.args[el.name] = {}
            })
          }
          console.log(dataItem.value)
          dataItem.value.methodType = e.stateMutability
        }
      })
    }

    const filterChange = (e) => {
      // filterInputs.value = filterInputs.value.filter(el => el.name != e)
      console.log(e)
    }

    const addFilter = () => {
      console.log(dataItem.value, filterInputs.value.length)
      if (filterInputs.value.length) {
        dataItem.value.filter.push({})
      } else {
        message.error('没有可添加项')
      }
    }

    const delFilter = (index) => {
      // let name = dataItem.value.filter[index].name
      dataItem.value.filter.splice(index, 1)
      // inputs.value.forEach(e => {
      //   if (e.name == name) {
      //     filterInputs.value.push(e)
      //   }
      // })
    }

    const handdleContractChange = async (index) => {
      console.log(dataItem.value.handdleList[index])
      handdleIndex = -1
      if (dataItem.value.handdleList[index].contractId == 'add') {
        addContractModal.value.showAddModal = true
        handdleIndex = index
      } else {
        let contracts = toRaw(contractList.value)
        contracts.forEach(e => {
          if (e.id == dataItem.value.handdleList[index].contractId) {
            let list = JSON.parse(e.abi)
            list = list.filter((e) => e.type == "function")
            dataItem.value.handdleList[index].abi = list
          }
        })
      }
    }

    const handdleFunctionChange = (index) => {
      console.log(1)
      dataItem.value.handdleList[index].abi.forEach(e => {
        if (e.name == dataItem.value.handdleList[index].functionName) {
          console.log(e.inputs)
          dataItem.value.handdleList[index].inputs = JSON.parse(JSON.stringify(e.inputs))
          dataItem.value.handdleList[index].params = JSON.parse(JSON.stringify(e.inputs))
          dataItem.value.handdleList[index].args = {}
          if (e.stateMutability == 'payable') {
            dataItem.value.handdleList[index].params.push({name: "value", type: "ETH"})
          }
          dataItem.value.handdleList[index].params.forEach(el => {
            dataItem.value.handdleList[index].args[el.name] = {}
          })
          dataItem.value.handdleList[index].methodType = e.stateMutability
        }
      })
      console.log(dataItem.value)
    }

    const addWalletSuccess = (e) => {
      walletKey.value = e.privateKey
      walletChange()
    }

    const addContractSuccess = (e) => {
      console.log(e)
      if (handdleIndex >= 0) {
        dataItem.value.handdleList[handdleIndex].contractId = e.id
        handdleContractChange()
      } else {
        dataItem.value.contractId = e.id
        contractChange()
      }
    }

    const addHanddle = () => {
      if (dataItem.value.handdleList && dataItem.value.handdleList.length) {
        dataItem.value.handdleList.push({id: crypto.randomUUID()})
      } else {
        dataItem.value.handdleList = [{id: crypto.randomUUID()}]
      }
    }

    const delHanddle = (index) => {
      dataItem.value.handdleList.splice(index, 1)
    }

    const ok = () => {
      if (modalType.value == 'wallet') {
        walletList.value.forEach(e => {
          if (e.privateKey == walletKey.value) {
            emit('setWallet', e.address)
          }
        })
      } else if (modalType.value == 'function') {
        if (!dataItem.value.id) dataItem.value.id = crypto.randomUUID()
        dataItem.value.inputs = toRaw(inputs.value)
        emit('addFunction', toRaw(dataItem.value))
      } else if (modalType.value == 'trigger') {
        if (!dataItem.value.id) dataItem.value.id = crypto.randomUUID()
        let filters = dataItem.value.filter
        let args = JSON.parse(JSON.stringify(dataItem.value.args))
        for (let key in args) {
          args[key] = {}
        }
        filters.forEach(e => {
          let key = e.name
          args[key] = e
        })
        console.log(args)
        dataItem.value.args = args
        emit('addTrigger', toRaw(dataItem.value))
      }
      cancel()
    }

    const cancel = () => {
      walletKey.value = ''
      modalTitle.value = ''
      modalType.value = ''
      dataItem.value = {}
      inputs.value = []
      filterInputs.value = []
      abi.value = []
      isShowModal.value = false
      wallet.value = null
      addContractModal.value = null
      addWalletModal.value = null
    }

    const onlyAllowNumber = (value) => {
      return !value || /^\d+$/.test(value)
    }

    return {
      abi,
      inputs,
      filterInputs,
      wallet,
      walletList,
      isShowModal,
      dataItem,
      contractList,
      inputFunList,
      filterFunList,
      addContractModal,
      addWalletModal,
      walletKey,
      modalTitle,
      modalType,
      walletChange,
      ok,
      cancel,
      addWalletSuccess,
      addContractSuccess,
      contractChange,
      functionChange,
      onlyAllowNumber,
      addHanddle,
      handdleContractChange,
      handdleFunctionChange,
      delHanddle,
      addFilter,
      filterChange,
      delFilter
    }
  },
}
</script>
<style lang="scss" scoped>
.add-btn {
  height: 40px;
  width: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 1px solid rgb(239, 239, 245);
  margin-bottom: 24px;
  cursor: pointer;
  margin-top: 12px;
}
.handdle-item {
  border-bottom: 1px solid rgb(239, 239, 245);
  position: relative;
  margin-bottom: 24px;
  .del {
    position: absolute;
    top: 0;
    right: 0;
  }
}
.del {
  margin-left: 6px;
  cursor: pointer;
}
.input-item {
  margin-bottom: 10px;
}
</style>