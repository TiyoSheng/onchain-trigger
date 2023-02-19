<template>
  <div class="main flex-start" v-if="triggerData.id">
    <div class="l">
      <div class="card" v-if="triggerData.wallet && triggerData.wallet.address">
        <n-spin :show="walletLoading">
          <div class="flex-center-sb">
            <div class="address" @click="copy(triggerData.wallet.address)">{{triggerData.wallet.address}}</div>
            <div class="edit-btn" @click="showFormModal('wallet', 'edit')">切换</div>
          </div>
          <div class="mt12 flex-center-sb">
            <p>余额</p>
            <div class="flex-center">{{triggerData.wallet.balance}} ETH <svg @click="setWallet(triggerData.wallet.address)" style="margin-left: 6px;cursor: pointer;" t="1674234880352" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2699" width="12" height="12"><path fill="#2c3e50" d="M960 416V192l-73.056 73.056a447.712 447.712 0 0 0-373.6-201.088C265.92 63.968 65.312 264.544 65.312 512S265.92 960.032 513.344 960.032a448.064 448.064 0 0 0 415.232-279.488 38.368 38.368 0 1 0-71.136-28.896 371.36 371.36 0 0 1-344.096 231.584C308.32 883.232 142.112 717.024 142.112 512S308.32 140.768 513.344 140.768c132.448 0 251.936 70.08 318.016 179.84L736 416h224z" p-id="2700"></path></svg></div>
          </div>
        </n-spin>
      </div>
      <div v-else class="add-btn" @click="showFormModal('wallet')">设置钱包</div>
      <n-collapse>
        <n-collapse-item title="全局变量" name="1">
          <template #header-extra>
            变量数量：{{triggerData.globalParams && triggerData.globalParams.length}}
          </template>
          <div class="card" v-if="triggerData.globalParams && triggerData.globalParams.length">
            <div class="flex-center-sb">
              <div class="">全局变量</div>
              <div class="flex-center">
                <div class="edit-btn" @click="showFormModal('params', 'edit')">编辑</div>
              </div>
            </div>
            <div class="mt12 params">
              <div v-for="(item, index) in triggerData.globalParams" :key="index">
                <div v-if="item.key != 'currentWalletAddress'" class="params-item flex-center">
                  <div class="params-item-key">{{item.key}}</div>
                  <div class="params-item-value">
                    <n-input v-model:value="item.value" @blur="setParams(triggerData.globalParams)" />
                  </div>
                </div>
                
              </div>
            </div>
            <!-- <div class="apply-btn flex-center-center mt12" @click="setTrigger">保存</div> -->
          </div>
          <div v-else class="add-btn" @click="showFormModal('params')">设置全局变量</div>
        </n-collapse-item>
        <n-collapse-item title="附加函数" name="2">
          <template #header-extra>
            函数数量：{{triggerData.functions && triggerData.functions.length}}
          </template>
          <div class="card" v-for="(item, index) in triggerData.functions" :key="item.id">
            <n-spin :show="functionLoading == item.id">
              <div class="flex-center-sb">
                <div class="">{{item.name}}</div>
                <div class="flex-center">
                  <div class="edit-btn" @click="showFormModal('function', 'edit', item)">编辑</div>
                  <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del('function', index)">
                    <template #trigger>
                      <div class="edit-btn">删除</div>
                    </template>
                    <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
                  </n-popconfirm>
                </div>
                
              </div>
              <div class="mt12 flex-center">
                <div class="name">{{getContractName(item.contractId)}}</div>
                <div class="line"></div>
                <div class="name">{{item.functionName}}</div>
                <div class="type">（{{item.methodType}}）</div>
              </div>
              <div class="mt12 params">
                <div class="params-item flex-center" v-for="(val, key) in item.args" :key="key">
                  <div class="params-item-key">{{key}}</div>
                  <div class="params-item-value">
                    <n-select v-model:value="item.args[key]" filterable tag :options="triggerData.globalParams" label-field="label" value-field="key" />
                    <!-- <n-input v-model:value="item.args[key]" /> -->
                  </div>
                </div>
              </div>
              <div class="apply-btn flex-center-center mt12" @click="apply(item)">执行</div>
            </n-spin>
          </div>
          <div class="add-btn" @click="showFormModal('function')">添加附加函数</div>
        </n-collapse-item>
        <n-collapse-item title="合约触发器" name="3">
          <template #header-extra>
            触发器数量：{{triggerData.triggers && triggerData.triggers.length}}
          </template>
          <div class="card" v-for="(item, index) in triggerData.triggers" :key="item.id">
            <div class="flex-center-sb">
              <div class="">触发函数</div>
              <div class="flex-center">
                <div class="edit-btn" @click="showFormModal('trigger', 'edit', item)">编辑</div>
                <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del('trigger', index)">
                  <template #trigger>
                    <div class="edit-btn">删除</div>
                  </template>
                  <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
                </n-popconfirm>
              </div>
              
            </div>
            <div class="mt12 flex-center">
              <div class="name">{{getContractName(item.contractId)}}</div>
              <div class="line"></div>
              <div class="name">{{item.functionName}}</div>
            </div>
            <div class="flex-center-sb">
              <div class="mt12">触发条件</div>
            </div>
            <div class="mt12 params no-border">
              <div class="params-item " v-for="(val, key) in item.args" :key="key">
                <div v-if="val.value" class="flex-center">
                  <div class="params-item-key">{{key}}</div>
                  <div class="params-item-type">{{getType(val.type, 0)}}</div>
                  <div class="params-item-value">{{getParams(val.value)}}</div>
                </div>
                
              </div>
            </div>
            <div class="flex-center-sb">
              <div class="mt12">执行函数</div>
            </div>
            <div v-for="handdle in item.handdleList" :key="handdle.id">
              <div class="mt12 flex-center">
                <div class="name">{{getContractName(handdle.contractId)}}</div>
                <div class="line"></div>
                <div class="name">{{handdle.functionName}}</div>
              </div>
              <div class="mt12 params no-border">
                <div class="params-item flex-center" v-for="(val, key) in handdle.args" :key="key">
                  <div class="params-item-key">{{key}}</div>
                  <div class="params-item-type">{{getType(val.type, 1) || '相同'}}</div>
                  <div class="params-item-value">{{getParams(val.value)}}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!(triggerData.triggers && triggerData.triggers.length)" class="add-btn" @click="showFormModal('trigger')">添加触发器</div>
        </n-collapse-item>
      </n-collapse>
      
      <n-divider dashed style="font-size: 12px;color:rgba(194, 194, 194, 1);margin-top: 16px"></n-divider>
      <div class="btn-list">
        <n-form-item style="justify-content: flex-end;display:flex">
          <n-button style="margin-left: 20px;background:#FFF" attr-type="button" @click="showData">
            导出
          </n-button>
          <n-button v-if="!triggerData.running" style="margin-left: 20px;background:#FFF" attr-type="button" @click="on">
            开始监听
          </n-button>
          <n-button v-if="triggerData.running" style="margin-left: 20px;background:#FFF" attr-type="button" @click="off">
            停止监听
          </n-button>
        </n-form-item>
      </div>
    </div>
    <!-- <div class="resize" title="收缩侧边栏">⋮</div> -->
    <div class="r">
      <div v-if="triggerData.msgList && triggerData.msgList.length">
        <div
          class="msgs"
          v-for="(item, index) in triggerData.msgList"
          :key="index"
          ref="child"
        >
          <JsonViewer v-if="!item.isHanddle && !item.isApply" :value="item.content" boxed sort expanded theme="dark" />
          <div v-if="item.isHanddle" class="cover">
            <div class="cover-hd flex-center">
              <p>覆盖交易</p>
              <p>hash: {{item.content.hash}}</p>
              <p @click="toEtherscan(item.content.hash)"><svg t="1675530767636" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3635" width="14" height="14"><path d="M384 128v85.333H170.667v597.334h682.666v-384h85.334v426.666A42.667 42.667 0 0 1 896 896H128a42.667 42.667 0 0 1-42.667-42.667V170.667A42.667 42.667 0 0 1 128 128h256z m298.667 85.333V42.667l298.666 256h-384A85.333 85.333 0 0 0 512 384v256h-85.333V384a170.667 170.667 0 0 1 170.666-170.667h85.334z" fill="#E5E7EB" p-id="3636"></path></svg></p>
            </div>
            <JsonViewer :value="item.content" boxed sort expanded />
          </div>
          <div v-if="item.isApply" class="cover">
            <div class="cover-hd flex-center">
              <p>执行附加函数</p>
              <p>hash: {{item.content.hash}}</p>
              <p @click="toEtherscan(item.content.hash)"><svg t="1675530767636" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3635" width="14" height="14"><path d="M384 128v85.333H170.667v597.334h682.666v-384h85.334v426.666A42.667 42.667 0 0 1 896 896H128a42.667 42.667 0 0 1-42.667-42.667V170.667A42.667 42.667 0 0 1 128 128h256z m298.667 85.333V42.667l298.666 256h-384A85.333 85.333 0 0 0 512 384v256h-85.333V384a170.667 170.667 0 0 1 170.666-170.667h85.334z" fill="#E5E7EB" p-id="3636"></path></svg></p>
            </div>
            <JsonViewer :value="item.content" boxed sort expanded />
          </div>
        </div>
        <div class="status flex-center-sb">
          <div class="flex-center">
            <span :style="{background: triggerData.running ? 'green' : 'red'}"></span>
            {{triggerData.running ? '监听中' : '未监听'}}
          </div>
          <div class="flex-center">事件数量：{{triggerData.msgList.length}} <p @click="clearMsg">clear</p></div>
        </div>
      </div>
    </div>
    <FormModal 
      ref="formRef"
      @setWallet="setWallet"
      @addFunction="addFunction"
      @addTrigger="addTrigger"
      @setParams="setParams"
    />
    <DataInfoModal ref="dataInfoModal" />
  </div>
</template>
<script>
import { ref, computed, watch, toRaw, nextTick, toRefs, reactive } from 'vue'
import { useStore } from 'vuex'
import { ethers } from 'ethers'
import { setLs } from '@/service/service'
import { useMessage } from "naive-ui"
import { filterFun, inputFun } from '@/libs/config'
import { contract } from "../libs/connectWallet"
import FormModal from '@/components/FormModal.vue'
import DataInfoModal from '@/components/DataInfoModal.vue'
import {JsonViewer} from "vue3-json-viewer"
import { useUtils } from '../hooks/useUtils'
import "vue3-json-viewer/dist/index.css"
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk")
const settings = {
  apiKey: "72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G",
  network: Network.ETH_GOERLI
}
const alchemy = new Alchemy(settings)
export default {
  components: {
    FormModal,
    DataInfoModal,
    JsonViewer
  },
  setup() {
    let contractData = []
    const state = reactive({
      activeTabs: 1
    })
    const {copy} = useUtils()
    const store = useStore()
    const message = useMessage()
    const formRef = ref(null)
    const dataInfoModal = ref(null)
    const walletLoading = ref(false)
    const functionLoading = ref('')
    const triggerData = ref({})
    const child = ref(null)
    const activatedId = computed(() => {
      return store.state.activatedId
    })
    const triggerList = computed(() => {
      return store.state.triggerList
    })
    const walletList = computed(() => {
      return store.state.walletList
    })

    const contractList = computed(() => {
      return store.state.contractList
    })

    const getContractName = computed(() => {
      return (id) => {
        let contracts = toRaw(contractList.value)
        let contract = {}
        contracts.forEach(e => {
          if (e.id == id) {
            contract = e
          }
        })
        return contract.name
      }
    })

    const getParams = computed(() => {
      return (value) => {
        let str = ''
        let globalParams = triggerData.value.globalParams
        globalParams.forEach(e => {
          if (e.key == value) {
            str = `${e.label}`
          }
        })
        return str
      }
    })

    const getType = computed(() => {
      return (type, index) => {
        let str = ''
        if (index == 0) {
          filterFun.forEach(e => {
            if (e.value == type) {
              str = e.label
            }
          })
        } else {
          inputFun.forEach(e => {
            if (e.value == type) {
              str = e.label
            }
          })
        }
        return str
      }
    })

    const showFormModal = (type, isEdit, it) => {
      formRef.value.isShowModal = true
      formRef.value.globalParams = triggerData.value.globalParams
      if (type == 'wallet') {
        formRef.value.modalTitle = '设置钱包'
        formRef.value.modalType = 'wallet'
        if (isEdit) {
          console.log(triggerData.value)
          let address = triggerData.value.wallet.address
          let privateKey = ''
          walletList.value.forEach(e => {
            if (e.address == address) {
              privateKey = e.privateKey
            }
          })
          formRef.value.walletKey = privateKey
        }
      } else if (type == 'params') {
        formRef.value.modalTitle = '设置全局变量'
        formRef.value.modalType = 'params'
        formRef.value.dataItem = []
        if (isEdit) {
          let it = triggerData.value.globalParams
          formRef.value.dataItem = JSON.parse(JSON.stringify(it))
        }
      } else if (type == 'function') {
        formRef.value.modalTitle = '添加函数'
        formRef.value.modalType = 'function'
        if (isEdit) {
          let item = JSON.parse(JSON.stringify(it))
          console.log(item)
          formRef.value.dataItem = item
          let contracts = toRaw(contractList.value)
          contracts.forEach(e => {
            if (e.id == item.contractId) {
              let list = JSON.parse(e.abi)
              list = list.filter((e) => e.type == "function")
              formRef.value.abi = list
              list.forEach(el => {
                if (el.name == item.functionName) {
                  console.log(el)
                  formRef.value.dataItem.methodType = el.stateMutability
                  formRef.value.inputs = JSON.parse(JSON.stringify(el.inputs))
                  formRef.value.filterInputs = JSON.parse(JSON.stringify(el.inputs))
                  if (el.stateMutability == 'payable') {
                    formRef.value.filterInputs.push({name: "value", type: "ETH"})
                  }
                }
              })
            }
          })
        }
      } else if (type == 'trigger') {
        formRef.value.modalTitle = '添加触发器'
        formRef.value.modalType = 'trigger'
        formRef.value.dataItem = {handdleList: []}
        if (isEdit) {
          let item = JSON.parse(JSON.stringify(it))
          console.log(item)
          item.filter = []
          for(let key in item.args) {
            console.log(key)
            if (item.args[key].type) {
              let ele = {
                name: key,
                type: item.args[key].type,
                value: item.args[key].value
              }
              item.filter.push(ele)
            }
          }
          formRef.value.dataItem = item
          let contracts = toRaw(contractList.value)
          contracts.forEach(e => {
            if (e.id == item.contractId) {
              let list = JSON.parse(e.abi)
              list = list.filter((e) => e.type == "function")
              formRef.value.abi = list
              list.forEach(el => {
                if (el.name == item.functionName) {
                  console.log(el)
                  el.inputs.forEach(x => {
                    x.oName = `${x.name}(${x.type})`
                  })
                  formRef.value.dataItem.methodType = el.stateMutability
                  formRef.value.inputs = JSON.parse(JSON.stringify(el.inputs))
                  formRef.value.filterInputs = JSON.parse(JSON.stringify(el.inputs))
                  if (el.stateMutability == 'payable') {
                    formRef.value.filterInputs.push({name: "value", type: "uint256", oName: 'value(ETH)'})
                  }
                }
              })
            }
          })
        }
      }
    }
    const del = (type, index) => {
      if (type == 'function') {
        triggerData.value.functions.splice(index, 1)
      } if (type == 'trigger') {
        triggerData.value.triggers.splice(index, 1)
      }
      setTrigger()
    }
    const setTrigger = async (off) => {
      let triggers = toRaw(triggerList.value)
      let td = JSON.parse(JSON.stringify(toRaw(triggerData.value)))
      triggers.forEach((e, index) => {
        if (off) e.running = false
        if (e.id == triggerData.value.id) {
          triggers[index] = td
        }
      })
      setLs('triggers', JSON.parse(JSON.stringify(triggers))).then(res => {
        store.commit('setTriggers', res)
      })
    }

    const setParams = (e) => {
      if (!e) e = triggerData.value.globalParams
      console.log(e, triggerData.value)
      let args = e.map(e => {
        let item = {}
        let val = e.value
        if (val.length > 22) {
          val = `${val.slice(0, 6)}...${val.slice(-4)}`
        }
        if (e.key != 'currentWalletAddress') {
          item =  {
            key: e.key,
            value: e.value,
            label: `${e.key} (${val})`
          }
        } else {
          item =  {
            key: e.key,
            value: e.value,
            label: `当前钱包地址 (${val})`
          }
        }
        return item
      })
      const res = new Map()
      args = args.filter((e) => !res.has(e['key']) && res.set(e['key'], 1));

      triggerData.value.globalParams = JSON.parse(JSON.stringify(args))
      setTrigger()
    }

    const addTrigger = (e) => {
      console.log(e, triggerData.value)
      let triggers = toRaw(triggerData.value.triggers)
      if (triggers.findIndex(it => it.id == e.id) > -1) {
        let index = triggers.findIndex(it => it.id == e.id)
        triggers[index] = e
      } else {
        triggers.push(e)
      }
      triggerData.value.triggers = JSON.parse(JSON.stringify(triggers))
      setTrigger()
    }

    const addFunction = (e) => {
      console.log(e, triggerData.value)
      let functions = toRaw(triggerData.value.functions)
      if (functions.findIndex(it => it.id == e.id) > -1) {
        let index = functions.findIndex(it => it.id == e.id)
        functions[index] = e
      } else {
        functions.push(e)
      }
      triggerData.value.functions = JSON.parse(JSON.stringify(functions))
      setTrigger()
    }

    const setWallet = (e) => {
      console.log(e)
      walletLoading.value = true
      // triggerData.value.address = e
      try {
        walletList.value.forEach(async (el) => {
          if (el.address == e) {
            let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
            let wallet = new ethers.Wallet(el.privateKey, provider)
            let balance = await wallet.getBalance()
            let nonce = await wallet.getTransactionCount()
            let globalParams = triggerData.value.globalParams
            wallet.balance = ethers.utils.formatEther(balance)
            wallet.nonce = nonce - 1
            if (!globalParams.some(e => e.key == 'currentWalletAddress')) globalParams.push({label: `当前钱包地址 (${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}})`, key: 'currentWalletAddress', value: wallet.address})
            triggerData.value.wallet = toRaw(wallet)
            triggerData.value.globalParams = globalParams
            walletLoading.value = false
            setTrigger()
          }
        })
      } catch (error) {
        walletLoading.value = false
      }
    }

    const setContract = async (contractId) => {
      if (!(triggerData.value.wallet && triggerData.value.wallet.address)) {
        message.error("请先设置钱包")
        return
      }
      let contracts = toRaw(contractList.value)
      let cd = {}
      let wallet = null
      contracts.forEach(e => {
        if (e.id == contractId) {
          cd = e
        }
      })
      walletList.value.forEach(async (el) => {
        if (el.address == triggerData.value.wallet.address) {
          let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
          wallet = new ethers.Wallet(el.privateKey, provider)
        }
      })
      let C = await contract(cd.address, cd.abi, wallet)
      return C
    }

    const apply = async (item) => {
      console.log(item)
      functionLoading.value = item.id
      try {
        let C = await setContract(item.contractId)
        let p = []
        if (item.inputs) {
          item.inputs.forEach(e => {
            if (item.args[e.name]) {
              let val = item.args[e.name]
              for (let i = 0; i < triggerData.value.globalParams.length; i++) {
                let param = triggerData.value.globalParams[i]
                if (param.key == item.args[e.name]) {
                  val = param.value
                }
              }
              p.push(val)
            } else {
              p.push('')
            }
          })
        }
        console.log(p)
        let res = await C[item.functionName](...p)
        console.log(res)
        if (res._isBigNumber) {
          console.log(res.toNumber())
          // message.success('执行结果：' + res.toNumber())
        } else {
          // message.success('执行结果：' + res)
        }
        let txData = {
          isApply: true,
          content: res
        }
        try {
          if (!triggerData.value.msgList) {
            triggerData.value.msgList = []
          }
          triggerData.value.msgList.push(txData)
          setTrigger()
        } catch (error) {
          console.log(triggerData.value, error)
        }
        let tx = await res.wait()
        setWallet(triggerData.value.wallet.address)
        console.log(tx)
        message.success('confirmed transaction')
        functionLoading.value = ''
      } catch (error) {
        console.log(error)
        functionLoading.value = ''
      }
    }

    const filter = (funInputs, filterData) => {
      let r = true
      funInputs.forEach((e, i) => {
        let filter = filterData[funInputs[i].name] || null
        if (filter) {
          console.log(filter)
          let val = filter.value
          for (let i = 0; i < triggerData.value.globalParams.length; i++) {
            let param = triggerData.value.globalParams[i]
            if (param.key == filter.value) {
              val = param.value
            }
          }
          switch(filter.type) {
            case '$gt':
              if (!(e.value > +val)) {
                r = false
              }
              break
            case '$lt':
              if (!(+e.value < +val)) {
                r = false
              }
              break
            case '$gte':
              if (!(+e.value >= +val)) {
                r = false
              }
              break
            case '$lte':
              if (!(+e.value <= +val)) {
                r = false
              }
              break
            case '$eq':
              if (!(e.value == val)) {
                r = false
              }
              break
            case '$ne':
              if (!(e.value != val)) {
                r = false
              }
              break
            case '$in':
              if (!(e.value.indexOf(val) > -1)) {
                r = false
              }
              break
          }
        }
      })
      return r
    }

    const handdleFun = async (list, res, inputData, index) => {
      if (list && list.length) {
        let item = list.shift()
        let input = []
        let inputs = item.inputs
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
            for (let i = 0; i < triggerData.value.globalParams.length; i++) {
              let param = triggerData.value.globalParams[i]
              if (param.key == data.value) {
                val = param.value
              }
            }
            input[i] = val
          } else {
            input[i] = inputData[i]
          }
        })
        console.log(...input, sendInfo)
        try {
          let tx = await C[item.functionName](...input, sendInfo)
          triggerData.value.wallet.nonce = tx.nonce
          let txData = {
            isHanddle: true,
            content: tx
          }
          triggerData.value.msgList.push(txData)
          setTrigger()
          if (tx.hash) {
            triggerData.value.wallet.nonce = tx.nonce
            await tx.wait()
          }
          index += 1
          handdleFun(list, res, inputData, index)
        } catch (error) {
          console.log(error)
          message.error('transaction failed')
        }
      }
    }

    const on = () => {
      if (!(triggerData.value.wallet && triggerData.value.wallet.address)) {
        message.error("请先设置钱包");
        return
      }
      if (!(triggerData.value.triggers && triggerData.value.triggers.length)) {
        message.error("请先添加触发器");
        return
      }
      off()
      let contractId = triggerData.value.triggers[0].contractId
      let contractAddress = ''
      let contractInputs = []
      contractList.value.forEach(e => {
        if (e.id == contractId) {
          contractAddress = e.address
          let abi = JSON.parse(e.abi)
          abi.forEach(el => {
            if (el.name == triggerData.value.triggers[0].functionName) {
              contractInputs = JSON.parse(JSON.stringify(el.inputs))
            }
          })
        }
      })
      alchemy.core.getTokenBalances(triggerData.value.wallet.address).then(async () => {
        if (triggerData.value.triggers[0].handdleList) {
          for (let i = 0; i < triggerData.value.triggers[0].handdleList.length; i++) {
            let item = triggerData.value.triggers[0].handdleList[i]
            contractData[i] = await setContract(item.contractId)
          }
        }
        message.success("开始监听")
        triggerList.value.forEach((e) => {
          if (e.id == triggerData.value.id) {
            triggerData.value.running = true
            e.running = true
          } else {
            e.running = false
          }
        })
        store.commit('setTriggers', toRaw(triggerList.value))
      })
      alchemy.ws.on({
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        toAddress: contractAddress
      }, async (res) => {
        try {
          let funTypes = contractInputs.map(e => e.type)
          let inputData = ethers.utils.defaultAbiCoder.decode(funTypes, ethers.utils.hexDataSlice(res.input, 4))
          for (let i = 0; i < inputData.length; i++) {
            if (contractInputs[i].type.indexOf("uint") > -1) {
              let data = ethers.utils.formatUnits(inputData[i], 0)
              contractInputs[i].value = data
            } else {
              contractInputs[i].value = inputData[i]
            }
          }
          console.log(triggerData.value.triggers[0].args, contractInputs)
          if (filter(contractInputs, triggerData.value.triggers[0].args) && res && res.hash && (res.from.toLocaleLowerCase() != triggerData.value.wallet.address.toLocaleLowerCase())) {
            console.log(0)
            triggerData.value.msgList.push({content: res})
            try {
              let list = JSON.parse(JSON.stringify(toRaw(triggerData.value).triggers[0].handdleList))
              handdleFun(list, res, inputData, 0)
            } catch (error) {
              console.log(error)
            }
          } else {
            console.log(1)
          }
          setTrigger()
        } catch (error) {
          console.log(error)
        }
      })
    }

    const off = async () => {
      await alchemy.ws.off()
      triggerData.value.running = false
      setTrigger('off')
    }

    const clearMsg = async () => {
      triggerData.value.msgList = []
      setTrigger()
    }
    
    const toEtherscan = (hash) => {
      window.open(`https://goerli.etherscan.io/tx/${hash}`)
    }

    const getContract = (id) => {
      let contract = contractList.value.filter(e => e.id == id)
      contract = contract[0] || null
      return contract
    }

    const showData = () => {
      dataInfoModal.value.showModal = true
      let info = {}
      let data = JSON.parse(JSON.stringify(toRaw(triggerData.value)))
      let {functions, globalParams, triggers, name, note, id} = data
      let contracts = []
      globalParams = globalParams.filter(e => e.key != 'currentWalletAddress')
      globalParams = globalParams.map(e => {
        return {
          key: e.key,
          value: e.value
        }
      })
      functions = functions.map(e => {
        if (!contracts.some(el => el.id == e.contractId)) {
          let contract = getContract(e.contractId)
          if (contract) {
            contracts.push(contract)
          }
        }
        return {
          args: e.args,
          contractId: e.contractId,
          functionName: e.functionName,
          id: e.id,
          methodType: e.methodType,
          name: e.name
        }
      })
      triggers = triggers.map(e => {
        if (!contracts.some(el => el.id == e.contractId)) {
          let contract = getContract(e.contractId)
          if (contract) {
            contracts.push(contract)
          }
        }
        let handdleList = e.handdleList
        handdleList = handdleList.map(el => {
          if (!contracts.some(ele => ele.id == el.contractId)) {
            let contract = getContract(el.contractId)
            if (contract) {
              contracts.push(contract)
            }
          }
          return {
            args: el.args,
            contractId: el.contractId,
            functionName: el.functionName,
            id: el.id,
            methodType: el.methodType,
            name: el.name,
          }
        })
        return {
          args: e.args,
          contractId: e.contractId,
          functionName: e.functionName,
          id: e.id,
          methodType: e.methodType,
          name: e.name,
          handdleList: handdleList
        }
      })
      info = {functions, globalParams, triggers, name, note, id, contracts}
      dataInfoModal.value.triggerData = info
      console.log(dataInfoModal.value.triggerData)
    }

    // const dragControllerDiv = () => {
    //   let resize = document.querySelector('.resize')
    //   let box = document.querySelector('.main')
    //   let left = document.querySelector('.l')
    //   let mid = document.querySelector('.r') 
    //   console.log(resize)
    //     // 鼠标按下事件
    //     resize.onmousedown = function (e) {
    //       console.log(1)
    //       //颜色改变提醒
    //       resize.style.background = '#818181'
    //       let startX = e.clientX
    //       resize.left = resize.offsetLeft
    //       // 鼠标拖动事件
    //       document.onmousemove = function (e) {
    //           let endX = e.clientX
    //           let moveLen = resize.left + (endX - startX)
    //           let maxT = box.clientWidth - resize.offsetWidth

    //           if (moveLen < 32) moveLen = 32
    //           if (moveLen > maxT - 150) moveLen = maxT - 150

    //           resize.style.left = moveLen
    //           console.log(left)
    //           left.style.width = moveLen + 'px'
    //           mid.style.width = (box.clientWidth - moveLen - 10) + 'px'
    //       }
    //       // 鼠标松开事件
    //       document.onmouseup = function () {
    //         //颜色恢复
    //         resize.style.background = '#d6d6d6'
    //         document.onmousemove = null
    //         document.onmouseup = null
    //         resize.releaseCapture && resize.releaseCapture()
    //       }
    //       resize.setCapture && resize.setCapture()
    //       return false
    //     }
    // }

    // onMounted(() => {
    //   setTimeout(() => {
    //     dragControllerDiv()
    //   }, 500);
    //   // dragControllerDiv()
    // })

    watch(() => activatedId.value, async () => {
      triggerList.value.forEach(e => {
        if (e.id == activatedId.value) {
          console.log(e)
          if (!e.msgList) e.msgList = []
          if (!e.globalParams) e.globalParams = []
          triggerData.value = e
        }
      })
    })
    watch(() => triggerData.value.msgList, () => {
      nextTick(() => {
        setTimeout(() => {
          if (triggerData.value.msgList.length - 1 >= 0) {
            child.value[triggerData.value.msgList.length - 1].scrollIntoView({block: "end", behavior: "smooth"})
          }
        }, 200)
      });
    }, { deep: true })
    return {
      ...toRefs(state),
      dataInfoModal,
      functionLoading,
      walletLoading,
      child,
      triggerData,
      formRef,
      showFormModal,
      setWallet,
      addFunction,
      addTrigger,
      getContractName,
      apply,
      getType,
      on,
      off,
      toEtherscan,
      clearMsg,
      del,
      setParams,
      setTrigger,
      getParams,
      copy,
      showData
    }
  },
}
</script>
<style lang="scss" scoped>
.main {
  flex: 1;
  background: #ffffff;
  height: 100vh;
}
.l {
  height: 100vh;
  overflow-y: auto;
  width: 600px;
  padding: 24px 12px;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none; 
  position: relative;
  &::-webkit-scrollbar {
    display: none;
  }
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
  }
  .card {
    border: 1px solid rgb(239, 239, 245);
    border-radius: 6px;
    width: 100%;
    font-size: 12px;
    padding: 16px;
    box-sizing: border-box;
    margin-bottom: 24px;
    &:hover {
      // box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
    }
    .mt12 {
      margin-top: 12px;
    }
    .edit-btn {
      cursor: pointer;
      margin-right: 10px;
    }
    .line {
      width: 20px;
      height: 1px;
      background: rgb(194, 194, 197);
      margin: 0 10px;
    }
    .name {
      padding: 8px 14px;
      box-sizing: border-box;
      border: 1px solid rgb(239, 239, 245);
      border-radius: 6px;
    }
    .no-border {
      .params-item {
        border: none;
        .params-item-key {
          border: none;
        }
      }
    }
    .params-item {
      border: 1px solid rgb(239, 239, 245);
      margin-top: -1px;
      .params-item-key {
        flex: 0 0 80px;
        border-right: 1px solid rgb(239, 239, 245);
        padding: 8px 10px;
        box-sizing: border-box;
        word-break: break-all;
      }
      .params-item-type {
        flex: 0 0 50px;
      }
      .params-item-value {
        flex: 1;
        padding: 8px 10px;
        box-sizing: border-box;
        word-break: break-all;
      }
    }
    .apply-btn {
      width: 100px;
      height: 30px;
      border: 1px solid rgb(239, 239, 245);
      margin-left: auto;
      border-radius: 6px;
      cursor: pointer;
    }
  }
  .btn-list {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
.r {
  flex: 1;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
  margin-left: 40px;
  position: relative;
  background: #1f1e27;
  padding: 24px;
  box-sizing: border-box;
  .msgs {
    width: 100%;
    margin-bottom: 14px;
  }
  .cover {
    box-sizing: border-box;
  }
  .cover-hd {
    box-sizing: border-box;
    p {
      font-size: 12px;
      color: #E5E7EB;
      &:first-child {
        width: 80px;
        height: 30px;
        background: #282c34;
        line-height: 30px;
        text-align: center;
        border-radius: 5px;
        margin-right: 10px;
      }
      &:last-child {
        margin-left: 10px;
        cursor: pointer;
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
.resize {
  cursor: col-resize;
  float: left;
  position: relative;
  top: 45%;
  background: #d6d6d6;
  border-radius: 5px;
  margin-top: -10px;
  width: 10px;
  height: 50px;
  background-size: cover;
  background-position: center;
  font-size: 32px;
  color: white;
  &:hover {
    color: #444444;
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
