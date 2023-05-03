<script setup>
import { ref } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'
import AddContract from '../../components/form/AddContract.vue'
import AddFlow from '../../components/form/AddFlow.vue'
import AddParams from '../../components/form/AddParams.vue'

let paramsName = ''

const { store, setTriggrts } = useGlobalStore()

const emit = defineEmits(['handleOk'])

const addContractRef = ref(null)
const addFlowRef = ref(null)
const addParams = ref(null)
const showAddModal = ref(false)
const modalTitle = ref('设置触发器')
const params = ref([])
const triggerItem = ref({
  type: 'contract',
  applyType: 'contract',
  filter: [],
  handdleList: [],
  conditions: []
})
const filterConditions = [{
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
const gasConditions = [{
  label: '大于等于',
  value: '$gte'
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
}]

const inputFun = [{
  label: '相同',
  value: '$eq'
}, {
  label: '更改',
  value: '$ne'
}]

const units = [{
  label: '秒',
  value: 's'
}, {
  label: '分钟',
  value: 'm'
}, {
  label: '小时',
  value: 'h'
}, {
  label: '天',
  value: 'd'
}]

let handdleIndex = -1

const addFlow = () => {
  console.log(addFlowRef.value)
  addFlowRef.value.params = JSON.parse(JSON.stringify(params.value))
  addFlowRef.value.showAddModal = true
}

const addFlowSuccess = async (val) => {
  val.id = crypto.randomUUID()
  let triggrts = store.state.triggers
  let activatedId = store.state.activatedId
  let triggerData = triggrts.find(item => item.id === activatedId)
  let index = triggrts.findIndex(item => item.id === activatedId)
  triggerData.flows.push(val)
  triggrts[index] = triggerData
  await setTriggrts(triggrts)
  triggerItem.value.flowId = val.id
}

const addContract = (index) => {
  console.log(index)
  index > -1 ? handdleIndex = index : handdleIndex = -1
  addContractRef.value.showAddModal = true
}

const addContractSuccess = (val) => {
  console.log(val, handdleIndex)
  if (handdleIndex > -1) {
    triggerItem.value.handdleList[handdleIndex].contractId = val.id
    contractChange(handdleIndex)
  } else {
    triggerItem.value.contractId = val.id
    contractChange()
  }
}

const contractChange = (index) => {
  if (index > -1) {
    let handdle = triggerItem.value.handdleList[index]
    handdle.functionName = ''
    triggerItem.value.handdleList[index] = JSON.parse(JSON.stringify(handdle))
  } else {
    triggerItem.value.functionName = ''
  }
}

const addHanddle = () => {
  console.log(triggerItem.value)
  if (!triggerItem.value.handdleList) {
    triggerItem.value.handdleList = []
  }
  triggerItem.value.handdleList.push({
    contractId: '',
    functionName: '',
    args: {},
    name: ''
  })
}

const delHanddle = (index) => {
  triggerItem.value.handdleList.splice(index, 1)
}

const addFilter = () => {
  console.log(triggerItem.value)
  triggerItem.value.filter.push({
    name: '',
    condition: '',
    value: ''
  })
}

const delFilter = (index) => {
  triggerItem.value.filter.splice(index, 1)
}

const handleOk = () => {
  let trigger = JSON.parse(JSON.stringify(triggerItem.value))
  let data = {}
  if (trigger.type === 'time') {
    if (trigger.timeType == 'timing') {
      data = {
        type: 'time',
        timeType: 'timing',
        timestamp: trigger.timestamp
      }
    } else {
      data = {
        type: 'time',
        timeType: 'loop',
        interval: trigger.interval,
        unit: trigger.unit,
      }
    }
  } else if (trigger.type === 'gas') {
    data = {
      type: 'gas',
      conditions: trigger.conditions
    }
  } else if (trigger.type == 'uni') {
    data = {
      type: 'uni',
      daiAddress: trigger.daiAddress,
      address: trigger.address,
      uniType: trigger.uniType
    }
  } else {
    data = {
      type: 'contract',
      contractId: trigger.contractId,
      functionName: trigger.functionName,
      filter: trigger.filter,
    }
  }
  if (trigger.applyType == 'flow') {
    data.applyType = 'flow'
    data.flowId = trigger.flowId
  } else {
    data.applyType = 'contract'
    data.handdleList = trigger.handdleList
  }
  data.name = trigger.name
  data.id = trigger.id || ''
  emit('handleOk', data)
  cancel()
}

const cancel = () => {
  triggerItem.value = {
    type: 'contract',
    filter: [],
    handdleList: []
  }
  showAddModal.value = false
}

const getTirggerFlows = () => {
  let triggers = store.state.triggers
  let id = store.state.activatedId
  let trigger = triggers.find(item => item.id === id)
  return trigger.flows || []
}

const getAbi = (id) => {
  if (!id) return []
  let contract = store.state.contracts.find(item => item.id === id)
  return JSON.parse(contract.abi).filter(e => e.type == 'function')
}

const getFitlerParams = (id ,name) => {
  if (!id || !name) return []
  let contract = store.state.contracts.find(item => item.id === id)
  let abi = JSON.parse(contract.abi).find(e => e.name === name)
  return abi.inputs.map(e => {
    return {
      label: e.name,
      value: e.name
    }
  })
}

const uniParamsChange = (name) => {
  let val = triggerItem.value[name].value
  if (val) {
    let param = params.value.find(item => item.key === val)
    if (param) {
      triggerItem.value[name].type = param.type
    } else {
      triggerItem.value[name].type = 'var'
    }
  }
}

const argsChange = (key, val, index) => {
  let handdle = triggerItem.value.handdleList[index]
  console.log(handdle)
  if (val) {
    let param = params.value.find(item => item.key === val)
    if (param) {
      handdle.args[key].type = param.type
    } else {
      handdle.args[key].type = 'var'
    }
  }
}

const functionChange = (index) => {
  let handdle = triggerItem.value.handdleList[index]
  let fun = getAbi(handdle.contractId).find(item => item.name === handdle.functionName)
  handdle.args = {}
  if (triggerItem.value.type === 'time') {
    fun.inputs.forEach(item => {
      handdle.args[item.name] = {
        value: '',
        type: ''
      }
    })
  } else {
    let inputs = JSON.parse(JSON.stringify(fun.inputs))
    if (fun.stateMutability == 'payable') {
      inputs.push({name: "value(ETH)", type: "ETH"})
    }
    inputs.forEach(item => {
      handdle.args[item.name] = {
        value: '',
        condition: '$eq',
        type: ''
      }
    })
  }
}

const filterValueChange = (index) => {
  let filter = triggerItem.value.filter[index]
  let param = params.value.find(item => item.key === filter.value)
  if (param) {
    filter.type = param.type
  } else {
    filter.type = 'var'
  }
}

const addCondition = () => {
  triggerItem.value.conditions.push({
    condition: '$eq',
    value: '',
    type: ''
  })
}

const conditionChange = (index) => {
  let condition = triggerItem.value.conditions[index]
  let param = params.value.find(item => item.key === condition.value)
  if (param) {
    condition.type = param.type
  } else {
    condition.type = 'var'
  }
}

const radioUpdate = () => {
  triggerItem.value.handdleList = []
  triggerItem.value.filter = []
  triggerItem.value.functionName = ''
  triggerItem.value.contractId = '',
  triggerItem.value.timeType = ''
  triggerItem.value.applyType = 'contract'
  triggerItem.value.flowId = ''
  if (triggerItem.value.type === 'time') {
    triggerItem.value.timeType = 'timing'
    triggerItem.value.unit = 's'
  }
  if (triggerItem.value.type === 'uni') {
    triggerItem.value.uniType = '1'
    triggerItem.value.address = {
      value: '',
      type: ''
    }
    triggerItem.value.daiAddress = {
      value: '',
      type: ''
    }
  }
  if (triggerItem.value.type === 'gas') {
    triggerItem.value.conditions = [{
      condition: '$gte',
      value: '',
      type: ''
    }]
  }
}

const addParamsSuccess = async (e) => {
  console.log(e)
  let triggrts = store.state.triggers
  let activatedId = store.state.activatedId
  let triggerData = triggrts.find(item => item.id === activatedId)
  let index = triggrts.findIndex(item => item.id === activatedId)
  triggerData.globalParams = e
  triggrts[index] = triggerData
  await setTriggrts(triggrts)
  let item = e[e.length - 1]
  item.label = `${item.key} (${item.value})`
  item.type = 'param'
  params.value.splice(-1, 0, item)
  if (paramsName) {
    triggerItem.value[paramsName].value = item.key
    triggerItem.value[paramsName].type = item.type
    paramsName = ''
  }

}

const addParamsFun = (name) => {
  addParams.value.showAddModal = true
  paramsName = name
}

const getOutParams = () => {
  let p = JSON.parse(JSON.stringify(params.value))
  p.push({
    key: 'any',
    label: '任意',
    type: 'val'
  })
  return p
  
}

defineExpose({
  showAddModal,
  params,
  triggerItem
});
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
    <n-form-item label="触发器名称：">
      <n-input v-model:value="triggerItem.name" placeholder="输入触发器名称" autocomplete="off" />
    </n-form-item>
    <n-form-item label="触发器类型：">
      <n-radio-group v-model:value="triggerItem.type" name="radio" size="large" @update:value="radioUpdate">
        <n-radio-button value="contract">合约触发器</n-radio-button>
        <n-radio-button value="time">时间触发器</n-radio-button>
        <n-radio-button value="gas">Gas触发器</n-radio-button>
        <n-radio-button value="uni">Uni触发器</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <div v-if="triggerItem.type == 'time' || triggerItem.type == 'gas' || triggerItem.type == 'uni'">
      <div v-if="triggerItem.type == 'uni'">
        <n-form-item label="方向判断：">
          <n-radio-group v-model:value="triggerItem.uniType" name="radio" size="large" >
            <n-radio-button value="1">买入</n-radio-button>
            <n-radio-button value="0">卖出</n-radio-button>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="监控账户地址：">
          <div style="width: 100%">
            <n-select 
              v-model:value="triggerItem.address.value"
              filterable 
              tag 
              :options="params" 
              label-field="label" 
              value-field="key"
              placeholder="Input or Select"
              @update:value="uniParamsChange('address')"
            >
              <template #action>
                <p @click="addParamsFun('address')" class="add-new-btn">新增全局变量</p>
              </template>
            </n-select>
          </div>
        </n-form-item>
        <n-form-item label="监控代币地址：">
          <div style="width: 100%">
            <n-select 
              v-model:value="triggerItem.daiAddress.value"
              filterable 
              tag 
              :options="params" 
              label-field="label" 
              value-field="key"
              placeholder="Input or Select"
              @update:value="uniParamsChange('daiAddress')"
            >
              <template #action>
                <p @click="addParamsFun('daiAddress')" class="add-new-btn">新增全局变量</p>
              </template>
            </n-select>
          </div>
        </n-form-item>
      </div>
      <div v-if="triggerItem.type == 'gas'">
        <n-form-item label="当gas的值为：">
          <div style="width: 100%">
            <div class="condition-item flex-center" style="margin-bottom: 12px" v-for="(condition, index) in triggerItem.conditions" :key="index">
              <n-select 
                v-model:value="condition.condition"
                :options="gasConditions"
                label-field="label" 
                value-field="value"
              />
              <n-select 
                v-model:value="condition.value"
                filterable 
                tag 
                :options="params" 
                label-field="label" 
                value-field="key"
                placeholder="Input or Select"
                @update:value="conditionChange(index)"
                style="margin-left: 12px"
              />
            </div>
            <!-- <div class="btn" @click="addCondition">添加触发条件</div> -->
          </div>
        </n-form-item>
      </div>
      <div v-else-if="triggerItem.type == 'time'">
        <n-form-item label="触发方式：">
          <n-radio-group v-model:value="triggerItem.timeType" name="radio" size="large">
            <n-radio-button value="timing">定时触发</n-radio-button>
            <n-radio-button value="loop">循环触发</n-radio-button>
          </n-radio-group>
        </n-form-item>
        <div v-show="triggerItem.timeType == 'timing'">
          <n-form-item label="触发时间：">
            <n-date-picker v-model:value="triggerItem.timestamp" type="datetime" clearable />
          </n-form-item>
        </div>
        <div v-show="triggerItem.timeType == 'loop'">
          <n-form-item label="触发间隔：">
            <n-input-number style="margin-right: 12px" v-model:value="triggerItem.interval" :min="1" :max="100000" />
            <n-select 
              v-model:value="triggerItem.unit"
              :options="units"
              label-field="label" 
              value-field="value"
              style="width: 120px"
            />
          </n-form-item>
        </div>
      </div>
      <n-divider class="divider"><p>触发后执行</p></n-divider>
      <n-radio-group v-model:value="triggerItem.applyType" name="radio" size="large">
        <n-radio-button value="contract">添加执行合约</n-radio-button>
        <n-radio-button value="flow">添加执行流程</n-radio-button>
      </n-radio-group>
      <div v-if="triggerItem.applyType == 'flow'" class="mt16">
        <n-select 
          v-model:value="triggerItem.flowId"
          :options="getTirggerFlows()"
          label-field="name" 
          value-field="id"
        >
          <template #action>
            <p @click="addFlow" class="add-new-btn">添加新流程</p>
          </template>
        </n-select>
      </div>
      <div v-else class="mt16">
        <div v-for="(item, index) in triggerItem.handdleList" :key="index" class="handdle-item">
          <div class="handdle-item-del" @click="delHanddle(index)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <n-form-item label="函数名称：">
            <n-input v-model:value="item.name" placeholder="输入函数名称" autocomplete="off" />
          </n-form-item>
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
                <p @click="addContract" class="add-new-btn">添加新合约</p>
              </template>
            </n-select>
          </n-form-item>
          <n-form-item label="选择合约方法：">
            <n-select
              v-model:value="item.functionName"
              placeholder="选择合约方法"
              :options="getAbi(item.contractId)"
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
                <n-select 
                  v-model:value="val.value"
                  filterable 
                  tag 
                  :options="params" 
                  label-field="label" 
                  value-field="key"
                  placeholder="Input or Select"
                  @update:value="argsChange(key, val.value, index)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <n-form-item label="选择合约：">
        <n-select
          v-model:value="triggerItem.contractId"
          placeholder="选择合约"
          filterable
          :options="store.state.contracts"
          label-field="name"
          value-field="id"
          @update:value="contractChange(-1)"
        >
          <template #action>
            <p @click="addContract(-1)" class="add-new-btn">添加新合约</p>
          </template>
        </n-select>
      </n-form-item>
      <n-form-item label="选择合约方法：">
        <n-select
          v-model:value="triggerItem.functionName"
          placeholder="选择合约方法"
          :options="getAbi(triggerItem?.contractId)"
          filterable
          label-field="name"
          value-field="name"
        />
      </n-form-item>
      <n-form-item label="过滤逻辑：">
        <div style="width: 100%">
          <div v-for="(filter, index) in triggerItem.filter" class="flex-center filter-item">
            <n-select
              v-model:value="filter.name"
              placeholder="选择过滤参数"
              :options="getFitlerParams(triggerItem?.contractId, triggerItem?.functionName)"
              label-field="label"
              value-field="value"
              style="flex:0 0 180px"
            />
            <n-select
              v-model:value="filter.condition"
              placeholder="选择过滤条件"
              :options="filterConditions"
              label-field="label"
              value-field="value"
              style="margin: 0 12px;width: 100px;flex:0 0 100px"
            />
            <n-select
              v-model:value="filter.value"
              filterable 
              tag 
              placeholder="选择过滤值"
              :options="params"
              label-field="label" 
              value-field="key"
              @update:value="filterValueChange(index)"
            />
            <div class="del" @click="delFilter(index)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="btn" @click="addFilter">添加过滤条件</div>
        </div>
      </n-form-item>
      <n-divider class="divider"><p>触发后执行</p></n-divider>
      <n-radio-group v-model:value="triggerItem.applyType" name="radio" size="large">
        <n-radio-button value="contract">添加执行合约</n-radio-button>
        <n-radio-button value="flow">添加执行流程</n-radio-button>
      </n-radio-group>
      <div v-if="triggerItem.applyType == 'flow'" class="mt16">
        <n-select 
          v-model:value="triggerItem.flowId"
          :options="getTirggerFlows()"
          label-field="name" 
          value-field="id"
        >
          <template #action>
            <p @click="addFlow" class="add-new-btn">添加新流程</p>
          </template>
        </n-select>
      </div>
      <div v-else class="mt16">
        <div v-for="(item, index) in triggerItem.handdleList" :key="index" class="handdle-item">
          <div class="handdle-item-del" @click="delHanddle(index)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.33325 6.66663L9.33325 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.66675 6.66663L6.66675 11.3333" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 4H4V13.3333C4 13.7015 4.29848 14 4.66667 14H11.3333C11.7015 14 12 13.7015 12 13.3333V4Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.66675 4H13.3334" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.99992 2H5.99992C5.63173 2 5.33325 2.29848 5.33325 2.66667V4H10.6666V2.66667C10.6666 2.29848 10.3681 2 9.99992 2Z" stroke="#4C4F53" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <n-form-item label="函数名称：">
            <n-input v-model:value="item.name" placeholder="输入函数名称" autocomplete="off" />
          </n-form-item>
          <div>
            <n-form-item label="选择合约：">
              <n-select
                v-model:value="item.contractId"
                placeholder="选择合约"
                filterable
                :options="store.state.contracts"
                label-field="name"
                value-field="id"
                @update:value="contractChange(index)"
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
                <n-select 
                  v-model:value="val.condition"
                  filterable 
                  tag 
                  :options="inputFun" 
                  label-field="label" 
                  value-field="value"
                  style="flex:0 0 100px"
                />
                <n-select 
                  v-if="val.condition == '$ne'"
                  v-model:value="val.value"
                  filterable 
                  tag 
                  :options="params" 
                  label-field="label" 
                  value-field="key"
                  placeholder="Input or Select"
                  @update:value="argsChange(key, val.value, index)"
                  style="margin-left: 12px"
                />
                <n-input style="margin-left:12px" v-if="val.type == 'http'" v-model:value="val.var" placeholder="输入返回值变量名" autocomplete="off" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="triggerItem.applyType != 'flow'" class="btn" @click="addHanddle">添加执行函数</div>
    <n-form-item style="display: flex;justify-content: flex-end;margin-top: 16px">
      <n-button attr-type="button" @click="cancel">取消</n-button>
      <n-button style="margin-left: 20px" attr-type="button" @click="handleOk">确定</n-button>
    </n-form-item>
  </n-modal>
  <AddContract ref="addContractRef" @success="addContractSuccess" />
  <AddFlow ref="addFlowRef" @handleOk="addFlowSuccess" />
  <AddParams ref="addParams" @handleOk="addParamsSuccess" />
</template>
<style lang="scss" scoped>
.filter-item {
  width: 100%;
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 16px;
  }
}
.mt16 {
  margin-top: 16px;
}
.del {
  margin-left: 12px;
  font-size: 0;
  cursor: pointer;
}
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
  margin-bottom: 12px;
  p {
    flex: 0 0 90px;
  }
}
.handdle-item {
  position: relative;
  margin-bottom: 24px;
  .handdle-item-del {
    position: absolute;
    top: 0px;
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
</style>