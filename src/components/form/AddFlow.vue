<script setup>
import { ref, watch } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'
import AddContract from '../../components/form/AddContract.vue'

const { store } = useGlobalStore()

const emit = defineEmits(['handleOk'])

const addContractRef = ref(null)
const showAddModal = ref(false)
const modalTitle = ref('设置流程')
const params = ref([])
const flowItem = ref({
  name: '',
  handdleList: []
})

const methods = [{
  value: 'GET',
  label: 'GET'
}, {
  value: 'POST',
  label: 'POST'
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
        args: e.args
      }
    } else if (e.type == 'http') {
      return {
        id: e.id,
        name: e.name,
        type: e.type,
        url: e.url,
        method: e.method,
        params: e.params,
        headers: e.headers
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
    let param = getParams(index).find(item => item.key === val)
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
    method: ''
  })
}

const paramChange = (type, index, i) => {
  let handdle = flowItem.value.handdleList[index]
  console.log(handdle, type, i)
  if (handdle[type][i].value) {
    console.log(getParams(index))
    let param = getParams(index).find(item => item.key === handdle[type][i].value)
    if (param) {
      handdle[type][i].type = param.type
    } else {
      handdle[type][i].type = 'var'
    }
  }
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
      <n-form-item label="请求方式：">
        <n-radio-group v-model:value="item.type" name="radio" size="large" @update:value="radioUpdate(index)">
          <n-radio-button value="contract">合约</n-radio-button>
          <n-radio-button value="http">HTTP</n-radio-button>
        </n-radio-group>
      </n-form-item>
      <div v-if="item.type == 'http'">
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
              <n-select 
                v-model:value="param.value"
                filterable tag
                :options="getParams(index)"
                label-field="label"
                value-field="key"
                placeholder="输入变量"
                @update:value="paramChange('params', index, i)"
              />
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
              <n-select 
                v-model:value="header.value"
                filterable tag
                :options="getParams(index)"
                label-field="label"
                value-field="key"
                placeholder="输入变量"
                @update:value="paramChange('headers', index, i)"
              />
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
              <n-select 
                v-model:value="val.value"
                filterable 
                tag 
                :options="getParams(index)" 
                label-field="label" 
                value-field="key"
                @update:value="argsChange(key, val.value, index)"
              />
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
  .icon {
    margin-left: 12px;
    font-size: 0;
    cursor: pointer;
    &:hover {
      background: rgba(201, 209, 220, 0.35);
      border-radius: 2px;
    }
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
</style>