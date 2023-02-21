<template>
  <n-modal
    v-model:show="showAddModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    title="添加合约"
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
        <n-button attr-type="button" @click="showAddModal = false">取消</n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleCreatedContractData">创建</n-button>
      </n-form-item>
    </div>
  </n-modal>
</template>
<script>
import { useStore } from 'vuex'
import { ref } from 'vue'
import { getLs, setLs } from '@/service/service'
export default {
  setup(props, { emit }) {
    const store = useStore()
    const showAddModal = ref(false)
    const contractData = ref({chain: {chainId: 5, name: 'Goerli'}})
    const handleCreatedContractData = async () => {
      let contracts = await getLs('contracts') || []
      contractData.value.id = crypto.randomUUID()
      contracts.push(contractData.value)
      setLs('contracts', JSON.parse(JSON.stringify(contracts))).then(async () => {
        showAddModal.value = false
        contracts.push({name: '添加新合约', id: 'add'})
        store.commit('setContract', contracts)
        emit('addContractSuccess', contractData.value)
        contractData.value= {chain: {chainId: 5, name: 'Goerli'}}
      })
    }
    return {
      showAddModal,
      contractData,
      handleCreatedContractData
    }
  },
}
</script>
<style lang="scss" scoped>

</style>