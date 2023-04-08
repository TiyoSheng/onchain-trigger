<script setup>
import { ref } from 'vue'
import { setLs } from '../../libs/storage'
import { useGlobalStore } from '../../hooks/globalStore'
import { useMessage } from "naive-ui"

const { store, setContracts } = useGlobalStore()
const message = useMessage()

const emit = defineEmits(['success'])

const showAddModal = ref(false)
const isEdit = ref(false)
const contractData = ref({chain: {chainId: 5, name: 'Goerli'}})
const handleCreatedContractData = async () => {
  if (!contractData.value.name) {
    message.error('请输入合约名称')
    return
  }
  if (!contractData.value.address) {
    message.error('请输入合约地址')
    return
  }
  if (!contractData.value.abi) {
    message.error('请输入合约ABI')
    return
  }

  let contracts = store.state.contracts
  if (contractData.value.id) {
    // 修改
    let index = contracts.findIndex(item => item.id === contractData.value.id)
    contracts[index] = contractData.value
    message.success('修改成功')
  } else {
    // address是否已存在
    let isExist = contracts.some(item => item.address === contractData.value.address)
    if (isExist) {
      message.error('合约地址已存在')
      return
    }
    contractData.value.id = contractData.value.address
    contracts.push(contractData.value)
    message.success('添加成功')
  }
  setLs('contracts', JSON.parse(JSON.stringify(contracts))).then(async () => {
    await setContracts(contracts)
    await emit('success', contractData.value)
    cancel()
  })
}
const cancel = () => {
  showAddModal.value = false
  isEdit.value = false
  contractData.value= {chain: {chainId: 5, name: 'Goerli'}}
}
defineExpose({
  isEdit,
  showAddModal,
  contractData
});
</script>
<template>
  <n-modal
    v-model:show="showAddModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    :title="isEdit ? '修改合约' : '添加合约'"
    @afterLeave="cancel"
  >
    <div>
      <n-form-item label="合约名称" >
        <n-input v-model:value="contractData.name" placeholder="输入合约名" />
      </n-form-item>
      <n-form-item label="合约地址：">
        <n-input v-model:value="contractData.address" placeholder="输入合约地址" />
      </n-form-item>
      <n-form-item label="网络：">
        <n-input v-model:value="contractData.chain.name" disabled />
      </n-form-item>
      <n-form-item label="合约ABI：">
        <n-input v-model:value="contractData.abi" type="textarea" placeholder="输入abi" />
      </n-form-item>
      <n-form-item style="display: flex;justify-content: flex-end;">
        <n-button attr-type="button" @click="cancel">取消</n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleCreatedContractData">提交</n-button>
      </n-form-item>
    </div>
  </n-modal>
</template>