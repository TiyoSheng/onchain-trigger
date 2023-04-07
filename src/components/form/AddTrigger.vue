<script setup>
import { ref } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'

const { store } = useGlobalStore()

const emit = defineEmits(['handleOk'])

const showAddModal = ref(false)
const modalTitle = ref('设置触发器')
const params = ref([])
const triggerItem = ref({
  filter: [],
  handdleList: []
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

const inputFun = [{
  label: '相同',
  value: '$eq'
}, {
  label: '更改',
  value: '$ne'
}]

const addHanddle = () => {
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
  console.log(trigger)
  emit('handleOk', trigger)
  cancel()
}

const cancel = () => {
  showAddModal.value = false
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

const argsChange = (key, val, index) => {
  let handdle = triggerItem.value.handdleList[index]
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
  fun.inputs.forEach(item => {
    handdle.args[item.name] = {
      value: '',
      condition: '$eq',
      type: ''
    }
  })
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
    :style="{width: '600px', 'border-radius': '10px', maxHeight: '80vh', overflow: 'auto'}"
    preset="card"
    :title="modalTitle"
    @afterLeave="cancel"
  >
    <n-form-item label="触发器名称：">
      <n-input v-model:value="triggerItem.name" placeholder="输入触发器名称" autocomplete="off" />
    </n-form-item>
    <n-form-item label="选择合约：">
      <n-select
        v-model:value="triggerItem.contractId"
        placeholder="选择合约"
        filterable
        :options="store.state.contracts"
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
    <n-divider class="divider"><p>监听后执行</p></n-divider>
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
              style="margin:12px;flex:0 0 100px"
            />
            <n-select 
              v-if="val.condition == '$ne'"
              v-model:value="val.value"
              filterable 
              tag 
              :options="params" 
              label-field="label" 
              value-field="key"
              @update:value="argsChange(key, val.value, index)"
            />
            <n-input style="margin-left:12px" v-if="val.type == 'http'" v-model:value="val.var" placeholder="输入返回值变量名" autocomplete="off" />
          </div>
        </div>
      </div>
    </div>
    <div class="btn" @click="addHanddle">添加执行函数</div>
    <n-form-item style="display: flex;justify-content: flex-end;margin-top: 16px">
      <n-button attr-type="button" @click="cancel">取消</n-button>
      <n-button style="margin-left: 20px" attr-type="button" @click="handleOk">确定</n-button>
    </n-form-item>
  </n-modal>
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