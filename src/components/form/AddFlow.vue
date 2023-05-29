<script setup>
import { ref, watch } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'
import AddContract from '../../components/form/AddContract.vue'
import ParamsSelect from '../ParamsSelect.vue'
import { ethers } from 'ethers'

const { store } = useGlobalStore()

const emit = defineEmits(['handleOk'])

const addContractRef = ref(null)
const showAddModal = ref(false)
const showConvertModal = ref(false)
const convertDecimals = ref(18)
const modalTitle = ref('设置流程')
const params = ref([])
const flowItem = ref({
  name: '',
  handdleList: []
})

const converts = [{
  label: '18',
  value: '18'
}, {
  label: '9',
  value: '9'
}, {
  label: '6',
  value: '6'
}]

const methods = [{
  value: 'GET',
  label: 'GET'
}, {
  value: 'POST',
  label: 'POST'
}]

const conditions = [{
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
}]

let handdleIndex = -1

const getParams = (index) => {
  let paramsList = JSON.parse(JSON.stringify(params.value))
  let handdles = flowItem.value.handdleList.filter((item, i) => i < index)
  handdles.forEach(item => {
    if (item.type === 'contract') {
      paramsList.push({
        key: `contract_result:${item.name}`,
        type: 'contract',
        label: `contract_result: ${item.name}`
      })
    } else if (item.type === 'http') {
      paramsList.push({
        key: `http_result:${item.name}`,
        type: 'http',
        label: `http_result: ${item.name}`
      })
    }
  })
  return paramsList
}

const getVariableList = (index) => {
  let paramsList = []
  let handdles = flowItem.value.handdleList.filter((item, i) => i < index)
  handdles.forEach(item => {
    if (item.type === 'contract') {
      paramsList.push({
        key: `contract_result:${item.name}`,
        type: 'contract',
        label: `contract_result: ${item.name}`
      })
    } else if (item.type === 'http') {
      paramsList.push({
        key: `http_result:${item.name}`,
        type: 'http',
        label: `http_result: ${item.name}`
      })
    }
  })
  return paramsList
}

const cancel = () => {
  showAddModal.value = false
  params.value = []
  flowItem.value = {
    name: '',
    handdleList: []
  }
}

const handleOk = () => {
  let flow = JSON.parse(JSON.stringify(flowItem.value))
  let handdleList = flow.handdleList
  flow.handdleList = handdleList.map(e => {
    if (e.type == 'contract') {
      return {
        id: e.id,
        name: e.name,
        type: e.type,
        contractId: e.contractId,
        functionName: e.functionName,
        args: e.args,
        filters: e.filters
      }
    } else if (e.type == 'http') {
      return {
        id: e.id,
        name: e.name,
        type: e.type,
        url: e.url,
        method: e.method,
        params: e.params,
        headers: e.headers,
        filters: e.filters
      }
    } else if (e.type == 'uni') {
      return {
        id: e.id,
        name: e.name,
        type: e.type,
        inAddress: e.inAddress,
        outAddress: e.outAddress,
        inAmount: e.inAmount
      }
    }
  })
  emit('handleOk', flow)
  cancel()
}

const addContract = (index) => {
  handdleIndex = index
  addContractRef.value.showAddModal = true
}

const addContractSuccess = (val) => {
  console.log(val)
  if (handdleIndex > -1) {
    flowItem.value.handdleList[handdleIndex].contractId = val.id
    contractChange(handdleIndex)
  }
}

const contractChange = (index) => {
  let handdle = flowItem.value.handdleList[index]
  handdle.functionName = ''
  handdle.abi = []
  let contract = store.state.contracts.find(item => item.id === handdle.contractId)
  handdle.abi = JSON.parse(contract.abi).filter(e => e.type == 'function')
  flowItem.value.handdleList[index] = JSON.parse(JSON.stringify(handdle))
}

const functionChange = (index) => {
  console.log(index)
  let handdle = flowItem.value.handdleList[index]
  let fun = getAbi(handdle.contractId).find(item => item.name === handdle.functionName)
  handdle.args = {}
  fun.inputs.forEach(item => {
    handdle.args[item.name] = {
      value: '',
      type: ''
    }
  })
}

const argsChange = (key, val, index) => {
  let handdle = flowItem.value.handdleList[index]
  if (val) {
    let param = getParams(flowItem.value.handdleList.length - 1).find(item => item.key === val)
    if (param) {
      handdle.args[key].type = param.type
    } else {
      handdle.args[key].type = 'var'
    }
  }
  console.log(handdle)
}

const delHanddle = (index) => {
  flowItem.value.handdleList.splice(index, 1)
}

const addHanddle = () => {
  flowItem.value.handdleList.push({
    id: crypto.randomUUID(),
    name: '',
    type: 'contract',
    contractId: '',
    functionName: '',
    args: {},
    headers: [],
    params: [],
    url: '',
    method: '',
    filters: []
  })
}

const addFilter = (index) => {
  let handdle = flowItem.value.handdleList[index]
  if (!handdle.filters) handdle.filters = []
  handdle.filters.push({
    key: '',
    value: '',
    type: '',
    keyType: '',
    condition: '$eq'
  })
}

const uniParamChange = (type, index, key = 'type', value ='value') => {
  let handdle = flowItem.value.handdleList[index]
  if (handdle[type][value]) {
    let param = getParams(index).find(item => item.key === handdle[type][value])
    if (param) {
      handdle[type][key] = param.type
    } else {
      handdle[type][key] = 'var'
    }
  }
}

const paramChange = (type, index, i, key = 'type', value ='value') => {
  console.log(key)
  let handdle = flowItem.value.handdleList[index]
  if (handdle[type][i][value]) {
    let param = getParams(index).find(item => item.key === handdle[type][i][value])
    if (param) {
      handdle[type][i][key] = param.type
    } else {
      handdle[type][i][key] = 'var'
    }
  }
  console.log(handdle)
}

const addParams = (index, type) => {
  let handdle = flowItem.value.handdleList[index]
  handdle[type].push({
    key: '',
    value: '',
    type: ''
  })
  flowItem.value.handdleList[index] = JSON.parse(JSON.stringify(handdle))
}

const getAbi = (id) => {
  if (!id) return []
  let contract = store.state.contracts.find(item => item.id === id)
  return JSON.parse(contract.abi).filter(e => e.type == 'function')
}

const delParams = (index, i, type) => {
  let handdle = flowItem.value.handdleList[index]
  handdle[type].splice(i, 1)
  flowItem.value.handdleList[index] = JSON.parse(JSON.stringify(handdle))
}

const showConvert = (index) => {
  let handdle = flowItem.value.handdleList[index]
  let inAmount = handdle.inAmount
  if (inAmount && inAmount.type == 'var') {
    showConvertModal.value = true
    handdleIndex = index
  }
}

const convert = (index, decimals) => {
  if (handdleIndex > -1) {
    index = handdleIndex
  }
  if (index > -1) {
    let handdle = flowItem.value.handdleList[index]
    let inAmount = handdle.inAmount
    if (inAmount && inAmount.type == 'var') {
      inAmount.value = ethers.utils.parseUnits(inAmount.value.toString(), (decimals || convertDecimals.value)).toString()
    }
  }
  showConvertModal.value = false
  handdleIndex = -1
}

const convertCancel = () => {
  showConvertModal.value = false
  handdleIndex = -1
}

const radioUpdate = (index) => {
  let handdle = flowItem.value.handdleList[index]
  handdle.contractId = ''
  handdle.functionName = ''
  handdle.abi = []
  handdle.args = {}
  handdle.url = ''
  handdle.method = ''
  handdle.headers = []
  handdle.params = []
  handdle.inAddress = {}
  handdle.inDecimals = {}
  handdle.outAddress = {}
  handdle.outDecimals = {}
  handdle.inAmount = {}
  flowItem.value.handdleList[index] = JSON.parse(JSON.stringify(handdle))
}

defineExpose({
  showAddModal,
  params,
  flowItem
})
</script>
<template>
  <n-modal
    v-model:show="showAddModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    :title="modalTitle"
    @afterLeave="cancel"
  >
    <n-form-item label="流程名称：">
      <n-input v-model:value="flowItem.name" placeholder="输入流程名称" autocomplete="off" />
    </n-form-item>
    <div v-for="(item, index) in flowItem.handdleList" :key="index" class="handdle-item">
      <n-divider class="divider"><p>步骤{{index + 1}}</p></n-divider>
      <div class="handdle-item-del" @click="delHanddle(index)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <n-form-item label="步骤名称：">
        <n-input v-model:value="item.name" placeholder="输入步骤名称" autocomplete="off" />
      </n-form-item>
      <n-form-item v-if="index > 0" label="当满足以下条件时流程继续：">
        <div style="width: 100%">
          <div v-for="(filter, i) in item.filters" :key="i" class="flex-center" style="width: 100%;margin-bottom: 12px">
            <n-select 
              v-model:value="filter.key"
              :options="getVariableList(index)"
              label-field="label"
              value-field="key"
              placeholder="变量列表"
              @update:value="paramChange('filters', index, i, 'keyType', 'key')"
            />
            <n-input style="margin-left:12px" v-if="filter.keyType == 'http'" v-model:value="filter.var" placeholder="输入返回值变量名" autocomplete="off" />
            <n-select 
              v-model:value="filter.condition"
              :options="conditions"
              label-field="label"
              value-field="value"
              placeholder="变量列表"
              style="margin-left:12px;width: 120px;flex: 0 0 120px;"
            />
            <ParamsSelect :value="filter.value" :params="getParams(index)"
            @update="(e) => flowItem.handdleList[index].filters[i] = Object.assign(filter, e)" @addParamsSuccess="(e) => params = e"></ParamsSelect>
            <div class="icon" @click="delParams(index, i, 'filters')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="btn" @click="addFilter(index)">添加条件</div>
        </div>
      </n-form-item>
      <n-form-item label="请求方式：">
        <n-radio-group v-model:value="item.type" name="radio" size="large" @update:value="radioUpdate(index)">
          <n-radio-button value="contract">合约</n-radio-button>
          <n-radio-button value="http">HTTP</n-radio-button>
          <n-radio-button value="uni">UNI交易</n-radio-button>
        </n-radio-group>
      </n-form-item>
      <div v-if="item.type == 'uni'">
        <n-form-item label="输入代币：">
          <ParamsSelect :value="item.inAddress.value" :params="getParams(index)"
            @update="(e) => flowItem.handdleList[index].inAddress = Object.assign(item.inAddress, e)" @addParamsSuccess="(e) => params = e">
          </ParamsSelect>
        </n-form-item>
        <n-form-item label="输出代币：">
          <ParamsSelect :value="item.outAddress.value" :params="getParams(index)"
            @update="(e) => flowItem.handdleList[index].outAddress = Object.assign(item.outAddress, e)" @addParamsSuccess="(e) => params = e">
          </ParamsSelect>
        </n-form-item>
        <div style="position: relative;">
          <div class="handdle-item-del" @click="showConvert(index)" style="top: 36px;z-index: 99;right: 34px;">
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.667 9.16699L12.667 11.167L10.667 13.167" stroke="#858D99" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.33301 11.167H12.6663" stroke="#858D99" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5.33301 7.83301L3.33301 5.83301L5.33301 3.83301" stroke="#858D99" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12.6663 5.83301L3.33301 5.83301" stroke="#858D99" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <n-form-item label="输入数量：">
            <div style="width:100%">
              <ParamsSelect :value="item.inAmount.value" :params="getParams(index)"
                @update="(e) => flowItem.handdleList[index].inAmount = Object.assign(item.inAmount, e)" @addParamsSuccess="(e) => params = e">
              </ParamsSelect>
              <div v-if="item.inAmount.value" class="flex-center" style="margin-top:12px">
                <div class="btn" style="width: 100px;height:32px" @click="convert(index, 18)">toWei(10^18)</div>
                <div class="btn" style="width: 100px;height:32px;margin-left:12px" @click="convert(index, 9)">toGWei(10^9)</div>
              </div>
            </div>
            
          </n-form-item>
        </div>
      </div>
      <div v-else-if="item.type == 'http'">
        <n-form-item label="请求地址：">
          <n-input v-model:value="item.url" placeholder="输入请求地址" autocomplete="off" />
        </n-form-item>
        <n-form-item label="请求方法：">
          <n-select 
            v-model:value="item.method"
            :options="methods"
            label-field="label"
            value-field="value"
            placeholder="选择请求方法"
          />
        </n-form-item>
        <n-form-item label="请求参数：">
          <div style="width: 100%">
            <div v-for="(param, i) in item.params" :key="index" class="param-item flex-center"  >
              <n-input v-model:value="param.key" placeholder="输入变量名" autocomplete="off" class="param-name" />
              <div style="margin: 8px">=</div>
              <ParamsSelect :value="param.value" :params="getParams(index)"
                @update="(e) => flowItem.handdleList[index].params[i] = Object.assign(param, e)" @addParamsSuccess="(e) => params = e">
              </ParamsSelect>
              <n-input style="margin-left: 12px" v-if="param.type == 'http'" v-model:value="param.var" placeholder="输入返回值变量名" autocomplete="off" />
              <div class="icon" @click="addParams(index, 'params')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8H13" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 13L8 3" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="icon" @click="delParams(index, i, 'params')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div v-if="!item.params?.length" class="btn" @click="addParams(index, 'params')">添加参数</div>
          </div>
        </n-form-item>
        <n-form-item label="请求Headers：">
          <div style="width: 100%">
            <div v-for="(header, i) in item.headers" :key="index" class="param-item flex-center"  >
              <n-input v-model:value="header.key" placeholder="输入变量名" autocomplete="off" class="param-name" />
              <div style="margin: 8px">=</div>
              <ParamsSelect :value="header.value" :params="getParams(index)"
                @update="(e) => flowItem.handdleList[index].headers[i] = Object.assign(header, e)" @addParamsSuccess="(e) => params = e">
              </ParamsSelect>
              <n-input style="margin-left: 12px" v-if="header.type == 'http'" v-model:value="header.var" placeholder="输入返回值变量名" autocomplete="off" />
              <div class="icon" @click="addParams(index, 'headers')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8H13" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 13L8 3" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="icon" @click="delParams(index, i, 'headers')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div v-if="!item.headers?.length" class="btn" @click="addParams(index, 'headers')">添加Headers</div>
          </div>
        </n-form-item>
      </div>
      <div v-else>
        <n-form-item label="选择合约：">
          <n-select
            v-model:value="item.contractId"
            placeholder="选择合约"
            filterable
            :options="store.state.contracts"
            @update:value="contractChange(index)"
            label-field="name"
            value-field="id"
          >
            <template #action>
              <p @click="addContract(index)" class="add-new-btn">添加新合约</p>
            </template>
          </n-select>
        </n-form-item>
        <n-form-item label="选择合约方法：">
          <n-select
            v-model:value="item.functionName"
            placeholder="选择合约方法"
            :options="getAbi(item?.contractId)"
            filterable
            label-field="name"
            value-field="name"
            @update:value="functionChange(index)"
          />
        </n-form-item>
        <div v-if="item.args">
          <p>参数：</p>
          <div v-for="(val, key, i) in item.args" :key="i" class="input-item flex-center" >
            <p>{{key}}：</p>
            <div>
              <ParamsSelect :value="val.value" :params="getParams(index)"
                @update="(e) => flowItem.handdleList[index].args[key] = Object.assign(val, e)" @addParamsSuccess="(e) => params = e">
              </ParamsSelect>
            </div>
            <n-input style="margin-left:12px" v-if="val.type == 'http'" v-model:value="val.var" placeholder="输入返回值变量名" autocomplete="off" />
          </div>
        </div>
      </div>
    </div>
    <n-divider class="divider"></n-divider>
    <div class="btn mt16" @click="addHanddle">添加步骤</div>
    <n-form-item style="display: flex;justify-content: flex-end;margin-top: 16px">
      <n-button attr-type="button" @click="cancel">取消</n-button>
      <n-button style="margin-left: 20px" attr-type="button" @click="handleOk">确定</n-button>
    </n-form-item>
  </n-modal>
  <n-modal 
    v-model:show="showConvertModal"
    :mask-closable="false"
    :style="{width: '400px'}"
    preset="card"
    title="选择或输入Decimals"
    @afterLeave="convertCancel"
  >
    <n-select 
      v-model:value="convertDecimals"
      filterable tag
      :options="converts"
      label-field="label"
      value-field="value"
      placeholder="选择或输入Decimals"
    />
    <n-form-item style="display: flex;justify-content: flex-end;margin-top: 16px">
      <n-button attr-type="button" @click="convertCancel">取消</n-button>
      <n-button style="margin-left: 20px" attr-type="button" @click="convert">确定</n-button>
    </n-form-item>
  </n-modal>
  <AddContract ref="addContractRef" @success="addContractSuccess" />
</template>
<style lang="scss" scoped>
.divider {
  margin: 24px 0;
  p {
    font-size: 12px;
    line-height: 16px;
    color: #4C4F53;
    font-weight: 400;
  }
}
.input-item {
  margin-bottom: 8px;
  p {
    width: 180px;
    flex: 0 0 180px;
  }
  div {
    flex: 1;
  }
}
.param-item {
  width: 100%;
  & ~ .param-item {
    margin-top: 12px;
  }
  .param-name {
    width: 220px;
    flex: 0 0 220px;
  }
}
.handdle-item {
  position: relative;
  .handdle-item-del {
    position: absolute;
    top: 42px;
    right: 0;
    cursor: pointer;
    svg {
      &:hover {
        background: rgba(201, 209, 220, 0.35);
        border-radius: 2px;
      }
    }
  }
}
.icon {
  margin-left: 12px;
  font-size: 0;
  cursor: pointer;
  &:hover {
    background: rgba(201, 209, 220, 0.35);
    border-radius: 2px;
  }
}
</style>