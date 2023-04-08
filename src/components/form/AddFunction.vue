<script setup>
import { ref } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'
import AddContract from '../../components/form/AddContract.vue'

const { store } = useGlobalStore()

const emit = defineEmits(['handleOk'])

const showAddModal = ref(false)
const addContractRef = ref(null)
const modalTitle = ref('设置附加函数')
const funItem = ref({})
const abi = ref([])
const params = ref([])

const cancel = () => {
  showAddModal.value = false
  funItem.value = {}
  params.value = []
}

const handleOk = () => {
  emit('handleOk', funItem.value)
  cancel()
}

const contractChange = (value) => {
  funItem.value.functionName = ''
}

const getAbi = (id) => {
  if (!id) return []
  let contract = store.state.contracts.find(item => item.id === id)
  return JSON.parse(contract.abi).filter(e => e.type == 'function')
}

const functionChange = (value) => {
  console.log(value)
  let fun = getAbi(funItem.value.contractId).find(item => item.name === value)
  funItem.value.args = {}
  fun.inputs.forEach(item => {
    funItem.value.args[item.name] = {
      value: '',
      type: ''
    }
  })
}

const argsChange = (key, val) => {
  if (val) {
    let param = params.value.find(item => item.key === val)
    if (param) {
      funItem.value.args[key].type = 'param'
    } else {
      funItem.value.args[key].type = 'var'
    }
  }
}

const addContract = () => {
  addContractRef.value.showAddModal = true
}

const addContractSuccess = (val) => {
  console.log(val)
  funItem.value.contractId = val.id
  contractChange(val.id)
}

defineExpose({
  showAddModal,
  params,
  funItem
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
    <div class="modal-content">
      <n-form-item label="函数名称：">
        <n-input v-model:value="funItem.name" placeholder="输入备注名称" autocomplete="off" />
      </n-form-item>
      <n-form-item label="选择合约：">
        <n-select
          v-model:value="funItem.contractId"
          placeholder="选择合约"
          filterable
          :options="store.state.contracts"
          @update:value="contractChange"
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
          v-model:value="funItem.functionName"
          placeholder="选择合约方法"
          :options="getAbi(funItem.contractId)"
          filterable
          label-field="name"
          value-field="name"
          @update:value="functionChange"
        />
      </n-form-item>
      <div v-if="funItem.args">
        <p>参数：</p>
        <div v-for="(val, key, index) in funItem.args" :key="index" class="input-item flex-center" >
          <p>{{key}}：</p>
          <div>
            <n-select 
              v-model:value="val.value"
              filterable 
              tag 
              :options="params" 
              label-field="label" 
              value-field="key"
              @update:value="argsChange(key, val.value)"
            />
          </div>
        </div>
      </div>
      <n-form-item style="display: flex;justify-content: flex-end;">
        <n-button attr-type="button" @click="cancel">取消</n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleOk">确定</n-button>
      </n-form-item>
      </div>
  </n-modal>
  <AddContract ref="addContractRef" @success="addContractSuccess" />
</template>
<style lang="scss" scoped>
.input-item {
  margin-bottom: 12px;
  p {
    width: 180px;
    flex: 0 0 180px;
  }
  div {
    flex: 1;
  }
}
</style>