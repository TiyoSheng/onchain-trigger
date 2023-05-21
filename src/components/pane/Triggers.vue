<script setup>
import { ref, watch } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'
import { useMessage } from "naive-ui"
import AddTrigger from '../../components/form/AddTrigger.vue'

const { store } = useGlobalStore()
const message = useMessage()

const emit = defineEmits(['setTrigger', 'setMessage', 'setError'])
const props = defineProps({
  trigger: Object
})

const addTriggerRef = ref(null)
const countdownRef = ref(null)
const triggerData = ref({})
const triggers = ref([])
const params = ref([])
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

const inputFun = [{
  label: '相同',
  value: '$eq'
}, {
  label: '更改',
  value: '$ne'
}]

const getFlowName = (id) => {
  let flow = triggerData.value.flows.find(item => item.id === id)
  if (!flow) {
    emit('setError', 3)
    return '<span style="color:red">流程不存在</span>'
  } else {
    emit('setError', -1)
    return flow.name
  }
  
}

const getUnit = (unit) => {
  if (unit == 's') {
    return '秒'
  } else if (unit == 'm') {
    return '分钟'
  } else if (unit == 'h') {
    return '小时'
  } else if (unit == 'd') {
    return '天'
  }
}

const getCcondition = (val) => {
  if (val == '$gt') {
    return '大于'
  } else if (val == '$lt') {
    return '小于'
  } else if (val == '$gte') {
    return '大于等于'
  } else if (val == '$lte') {
    return '小于等于'
  } else if (val == '$eq') {
    return '等于'
  } else if (val == '$ne') {
    return '不等于'
  } else if (val == '$in') {
    return '包含'
  } else {
    return ''
  }
}

const formatDate = (date, fmt) => {
  let ret
  date = new Date(date)
  let opt = {
    'Y+': date.getFullYear().toString(),
    'm+': (date.getMonth() + 1).toString(),
    'd+': date.getDate().toString(),
    'H+': date.getHours().toString(),
    'M+': date.getMinutes().toString(),
    'S+': date.getSeconds().toString()
  };
  for (let k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    }
  }
  return fmt
}

const getInputConditionsName = (val) => {
  let name = inputFun.find(item => item.value === val).label
  return name
}

const getConditionsName = (val) => {
  let name = filterConditions.find(item => item.value === val).label
  return name
}

const getParamLabel = (item) => {
  if (item.type == 'param') {
    let param = params.value.find(param => param.key === item.value)
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

const setTrigger = () => {
  emit('setTrigger', triggers.value)
}

const del = (index) => {
  triggers.value.splice(index, 1)
  setTrigger()
}

const handleOk = (val) => {
  console.log(val)
  if (val.id) {
    let index = triggers.value.findIndex(item => item.id === val.id)
    triggers.value[index] = val
  } else {
    val.id = crypto.randomUUID()
    triggers.value.push(val)
  }
  setTrigger()
}

const showModal = (item) => {
  addTriggerRef.value.showAddModal = true
  addTriggerRef.value.params = JSON.parse(JSON.stringify(params.value))
  if (item && item.id) {
    addTriggerRef.value.triggerItem = JSON.parse(JSON.stringify(item))
  }
}

const getContract = (id, type, funName) => {
  let contract = store.state.contracts.find(item => item.id === id)
  if (type == 'type') {
    let abi = JSON.parse(contract.abi)
    console.log(funName)
    if (!funName) return ''
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

watch(() => props.trigger, (val) => {
  if (val) {
    let trigger = JSON.parse(JSON.stringify(val))
    console.log(trigger.triggers)
    triggers.value = JSON.parse(JSON.stringify(trigger.triggers))
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
    triggerData.value = trigger
    console.log(trigger)
    params.value = globalParams || []
  }
}, {immediate: true, deep: true})

watch(() => store.state.countdownDuration, (val) => {
  if (countdownRef.value && countdownRef.value[0]) {
    countdownRef.value[0].reset()
  }
}, {deep: true})

</script>
<template>
  <div class="trigger">
    <div class="card">
      <div v-for="(item, index) in triggers" :key="item.id" class="trigger-item mt16">
        <div v-if="item.type == 'gas'">
          <div class="flex-center-sb">
            <div class="name">Gas触发器 - {{item.name}}</div>
            <div class="flex-center">
              <div class="edit-btn" @click="showModal(item)">编辑</div>
              <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del(index)">
                <template #trigger>
                  <div class="edit-btn">删除</div>
                </template>
                <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
              </n-popconfirm>
            </div>
          </div>
          <div class="mt16 sub-title">触发条件 （当前Gas: {{store.state.gasPrice}}）</div>
          <div v-for="(condition, index) in item.conditions" :key="index" class="flex-center mt12">
            <div class="fun flex-center">
              <div class="name flex-center">{{getCcondition(condition.condition)}}</div>
              <div class="function-name flex-center">{{getParamLabel(condition)}}</div>
            </div>
          </div>
          
          <div class="mt16 sub-title">触发后执行</div>
          <div v-if="item.applyType == 'flow'" class="mt12">
            <div class="fun flex-center">
              <div class="name flex-center">执行流程</div>
              <div class="function-name flex-center" v-html="getFlowName(item.flowId)"></div>
            </div>
          </div>
          <div v-else>
            <div v-for="(handdle,i) in item.handdleList" :key="i">
              <div class="mt12 flex-center">
                <div class="fun flex-center">
                  <div class="name flex-center">{{getContract(handdle.contractId, 'name')}}</div>
                  <div class="function-name flex-center">{{handdle.functionName}}</div>
                </div>
                <div class="type">（{{getContract(handdle.contractId, 'type', handdle.functionName)}}）</div>
              </div>
              <div class="mt16 sub-title">参数</div>
              <div class="params mt12" v-if="Object.keys(handdle.args).length">
                <div class="params-item flex-center" v-for="(val, key) in handdle.args" :key="key">
                  <div class="params-item-key flex-center">{{key}}</div>
                  <div class="params-item-value flex-center">{{getParamLabel(val)}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="item.type == 'uni'">
          <div class="flex-center-sb">
            <div class="name">Uni触发器 - {{item.name}}</div>
            <div class="flex-center">
              <div class="edit-btn" @click="showModal(item)">编辑</div>
              <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del(index)">
                <template #trigger>
                  <div class="edit-btn">删除</div>
                </template>
                <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
              </n-popconfirm>
            </div>
          </div>
          <div class="flex-center mt12">
            <div class="fun flex-center">
              <div class="name flex-center">监控类型：</div>
              <div class="function-name flex-center">{{ (item.uniType == 1 ? '买入' : '卖出') }}</div>
            </div>
          </div>
          <div class="flex-center mt12">
            <div class="fun flex-center">
              <div class="name flex-center">监控账户地址：</div>
              <div class="function-name flex-center">{{ getParamLabel(item.address) }}</div>
            </div>
          </div>
          <div class="flex-center mt12">
            <div class="fun flex-center">
              <div class="name flex-center">监控代币地址：</div>
              <div class="function-name flex-center">{{ getParamLabel(item.daiAddress) }}</div>
            </div>
          </div>
          <div class="mt16 sub-title">触发后执行</div>
          <div v-if="item.applyType == 'flow'" class="mt12">
            <div class="fun flex-center">
              <div class="name flex-center">执行流程</div>
              <div class="function-name flex-center" v-html="getFlowName(item.flowId)"></div>
            </div>
          </div>
          <div v-else>
            <div v-for="(handdle,i) in item.handdleList" :key="i">
              <div class="mt12 flex-center">
                <div class="fun flex-center">
                  <div class="name flex-center">{{getContract(handdle.contractId, 'name')}}</div>
                  <div class="function-name flex-center">{{handdle.functionName}}</div>
                </div>
                <div class="type">（{{getContract(handdle.contractId, 'type', handdle.functionName)}}）</div>
              </div>
              <div class="mt16 sub-title">参数</div>
              <div class="params mt12" v-if="Object.keys(handdle.args).length">
                <div class="params-item flex-center" v-for="(val, key) in handdle.args" :key="key">
                  <div class="params-item-key flex-center">{{key}}</div>
                  <div class="params-item-value flex-center">{{getParamLabel(val)}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="item.type == 'time'">
          <div class="flex-center-sb">
            <div class="name">时间触发器 - {{item.name}}</div>
            <div class="flex-center">
              <div class="edit-btn" @click="showModal(item)">编辑</div>
              <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del(index)">
                <template #trigger>
                  <div class="edit-btn">删除</div>
                </template>
                <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
              </n-popconfirm>
            </div>
          </div>
          <div class="mt16 sub-title">触发方式</div>
          <div v-if="item.timeType == 'timing'" class="flex-center mt12">
            <div class="fun flex-center">
              <div class="name flex-center">定时触发</div>
              <div class="function-name flex-center">{{formatDate(item.timestamp, 'YY-mm-dd HH:MM:SS')}}</div>
            </div>
            <div class="type">（<n-countdown :duration="item.timestamp - new Date().getTime()" :active="true" />）</div>
            <!-- <div class="type">（ccc）</div> -->
          </div>
          <div v-if="item.timeType == 'loop'" class="flex-center mt12">
            <div class="fun flex-center">
              <div class="name flex-center">循环触发</div>
              <div class="function-name flex-center">间隔时间：{{item.interval}} {{getUnit(item.unit)}}</div>
              <div class="type">（<n-countdown ref="countdownRef" :duration="store.state.countdownDuration" :active="true" />）</div>
            </div>
          </div>
          
          <div class="mt16 sub-title">触发后执行</div>
          <div v-if="item.applyType == 'flow'" class="mt12">
            <div class="fun flex-center">
              <div class="name flex-center">执行流程</div>
              <div class="function-name flex-center" v-html="getFlowName(item.flowId)"></div>
            </div>
          </div>
          <div v-else>
            <div v-for="(handdle,i) in item.handdleList" :key="i">
              <div class="mt12 flex-center">
                <div class="fun flex-center">
                  <div class="name flex-center">{{getContract(handdle.contractId, 'name')}}</div>
                  <div class="function-name flex-center">{{handdle.functionName}}</div>
                </div>
                <div class="type">（{{getContract(handdle.contractId, 'type', handdle.functionName)}}）</div>
              </div>
              <div class="mt16 sub-title">参数</div>
              <div class="params mt12" v-if="Object.keys(handdle.args).length">
                <div class="params-item flex-center" v-for="(val, key) in handdle.args" :key="key">
                  <div class="params-item-key flex-center">{{key}}</div>
                  <div class="params-item-value flex-center">{{getParamLabel(val)}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="item.type == 'event'">
          <div class="flex-center-sb">
            <div class="name">Event触发器 - {{item.name}}</div>
            <div class="flex-center">
              <div class="edit-btn" @click="showModal(item)">编辑</div>
              <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del(index)">
                <template #trigger>
                  <div class="edit-btn">删除</div>
                </template>
                <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
              </n-popconfirm>
            </div>
          </div>
          <div class="mt16 sub-title">触发函数</div>
          <div class="mt12 flex-center">
            <div class="fun flex-center">
              <div class="name flex-center">{{getContract(item.contractId, 'name')}}</div>
              <div class="function-name flex-center">{{item.functionName}}</div>
            </div>
            <div class="type">（{{getContract(item.contractId, 'type', item.functionName)}}）</div>
          </div>
          <div class="mt16 sub-title">触发后执行</div>
          <div v-if="item.applyType == 'flow'" class="mt12">
            <div class="fun flex-center">
              <div class="name flex-center">执行流程</div>
              <div class="function-name flex-center" v-html="getFlowName(item.flowId)"></div>
            </div>
          </div>
          <div v-else>
            <div v-for="(handdle,i) in item.handdleList" :key="i">
              <div class="mt12 flex-center">
                <div class="fun flex-center">
                  <div class="name flex-center">{{getContract(handdle.contractId, 'name')}}</div>
                  <div class="function-name flex-center">{{handdle.functionName}}</div>
                </div>
                <div class="type">（{{getContract(handdle.contractId, 'type', handdle.functionName)}}）</div>
              </div>
              <div class="mt16 sub-title">参数</div>
              <div class="params mt12" v-if="Object.keys(handdle.args).length">
                <div class="params-item flex-center" v-for="(val, key) in handdle.args" :key="key">
                  <div class="params-item-key flex-center">{{key}}</div>
                  <div class="params-item-value flex-center">{{getParamLabel(val)}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="flex-center-sb">
            <div class="name">合约触发器 - {{item.name}}</div>
            <div class="flex-center">
              <div class="edit-btn" @click="showModal(item)">编辑</div>
              <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick="del(index)">
                <template #trigger>
                  <div class="edit-btn">删除</div>
                </template>
                <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
              </n-popconfirm>
            </div>
          </div>
          <div class="mt16 sub-title">触发函数</div>
          <div class="mt12 flex-center">
            <div class="fun flex-center">
              <div class="name flex-center">{{getContract(item.contractId, 'name')}}</div>
              <div class="function-name flex-center">{{item.functionName}}</div>
            </div>
            <div class="type">（{{getContract(item.contractId, 'type', item.functionName)}}）</div>
          </div>
          <div class="mt16 sub-title">过滤条件</div>
          <div class="mt12 flex-center">
            <div v-for="(filter, i) in item.filter" :key="i" class="filter flex-center">
              <div class="filter-name flex-center">{{filter.name}}</div>
              <div class="filter-condition flex-center-center">{{getConditionsName(filter.condition)}}</div>
              <div class="filter-value flex-center">{{getParamLabel(filter)}}</div>
            </div>
          </div>
          <div class="mt16 sub-title">触发后执行</div>
          <div v-if="item.applyType == 'flow'" class="mt12">
            <div class="fun flex-center">
              <div class="name flex-center">执行流程</div>
              <div class="function-name flex-center" v-html="getFlowName(item.flowId)"></div>
            </div>
          </div>
          <div v-else>
            <div v-for="(handdle,i) in item.handdleList" :key="i">
              <div class="mt12 flex-center">
                <div class="fun flex-center">
                  <div class="name flex-center">{{getContract(handdle.contractId, 'name')}}</div>
                  <div class="function-name flex-center">{{handdle.functionName}}</div>
                </div>
                <div class="type">（{{getContract(handdle.contractId, 'type', handdle.functionName)}}）</div>
              </div>
              <div class="mt16 sub-title">覆盖内容</div>
              <div class="params mt12">
                <div class="params-item flex-center" v-for="(val, key) in handdle.args" :key="key">
                  <div class="params-item-key flex-center">{{key}}</div>
                  <div class="params-item-type flex-center-center" :style="{color: val.condition == '$eq' ? '#31C48D' : '#FF8A4C', background:  val.condition == '$eq' ? '#EFFAF5' : '#FFF6EB'}">{{getInputConditionsName(val.condition)}}</div>
                  <div class="params-item-value flex-center">{{getParamLabel(val)}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn mt16" @click="showModal">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8H13" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 13L8 3" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      添加触发器
    </div>
    <AddTrigger ref="addTriggerRef" @handleOk="handleOk" />
  </div>
</template>
<style lang="scss" scoped>
.trigger {
  padding: 16px;
  box-sizing: border-box;
  min-height: 72px;
  .trigger-item {
    .name {
      font-weight: 600;
      font-size: 13px;
      line-height: 16px;
      color: #262C33;
    }
    .edit-btn {
      font-size: 12px;
      line-height: 16px;
      color: #4C4F53;
      margin-left: 8px;
      cursor: pointer;
    }
    .sub-title {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: #4C4F53;
      .k {
        flex: 0 0 130px;
      }
      .v {
        flex: 1;
      }
    }
    .fun {
      height: 40px;
      background: #F8F9FA;
      border-radius: 5px;
      width: 500px;
      flex: 0 0 500px;
      padding: 0 4px;
      box-sizing: border-box;
      .name {
        font-size: 12px;
        line-height: 16px;
        color: #5C636B;
        padding: 8px;
        box-sizing: border-box;
        width: 130px;
        flex: 0 0 130px;
      }
      .function-name {
        background: #FFFFFF;
        border-radius: 4px;
        font-size: 12px;
        line-height: 16px;
        color: #262C33;
        height: 32px;
        padding: 0 8px;
        box-sizing: border-box;
        overflow-x: auto;
        white-space: nowrap;
        flex: 1;
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }
    }
    .filter {
      width: 500px;
      height: 40px;
      border: 1px solid #F8F9FA;
      border-radius: 5px;
      box-sizing: border-box;
      padding: 0 12px;
      .filter-name {
        flex: 0 0 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        color: #5C636B;
        margin-right: 16px;
      }
      .filter-condition {
        flex: 0 0 64px;
        width: 64px;
        height: 24px;
        background: #F8F9FA;
        border-radius: 4px;
        font-size: 12px;
        line-height: 16px;
        color: #5C636B;
        margin-right: 16px;
      }
      .filter-value {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        color: #5C636B;
      }
    }
    .type {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: #9BA0A8;
    }
    .params {
      border: 1px solid #EEEFF0;
      border-radius: 5px;
      width: 500px;
      box-sizing: border-box;
      padding: 12px;
      .params-item {
        height: 24px;
        margin-bottom: 8px;
        .params-item-key {
          flex: 0 0 100px;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          color: #5C636B;
          margin-right: 16px;
        }
        .params-item-type {
          height: 24px;
          background: #FFF6EB;
          border-radius: 4px;
          margin: 0 24px;
          font-size: 12px;
          line-height: 16px;
          padding: 0 8px;
          text-transform: capitalize;
          color: #FF8A4C;
        }
        .params-item-value {
          flex: 1;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          color: #5C636B;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
.mt12 {
  margin-top: 12px;
}
.mt16 {
  margin-top: 16px;
}
</style>