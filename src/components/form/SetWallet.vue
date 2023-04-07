<script setup >
import { ref, watch } from 'vue'
import { setLs } from '../../libs/storage'
import { useGlobalStore } from '../../hooks/globalStore'
import { useMessage } from "naive-ui"
import AddWallet from './AddWallet.vue'

const { store, setWallet } = useGlobalStore()
const message = useMessage()

const emit = defineEmits(['success'])

const showModal = ref(false)
const addWalletRef = ref(null)
const walletKey = ref('')
const wallets = ref([])

const handleCreated = async () => {
  if (!walletKey.value) {
    message.error('请选择钱包')
    return
  }
  let wallets = store.state.wallets
  let wallet = wallets.find(item => item.privateKey === walletKey.value)
  emit('success', wallet)
  cancel()
}

const addWallet = () => {
  console.log('addWallet')
  addWalletRef.value.showAddModal = true
  addWalletRef.value.walletName = `Account ${wallets.value.length + 1}`
}

const addSuccess = (val) => {
  walletKey.value = val.privateKey
}

const cancel = () => {
  showModal.value = false
  walletKey.value = ''
}

watch(() => store.state.wallets, (val) => {
  val.map((item) => {
    item.label = `${item.name} (${item.address.slice(0, 6)}...${item.address.slice(-4)})`
    item.privateKey = item.privateKey
    item.address = item.address

  })
  wallets.value = val
}, {immediate: true})

defineExpose({
  showModal,
  walletKey
});

</script>
<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    title="设置触发器钱包"
    @afterLeave="cancel"
  >
    <div>
      <n-form-item label="选择钱包：" path="walletKey">
        <n-select
          v-model:value="walletKey"
          placeholder="选择钱包"
          :options="wallets"
          label-field="label"
          value-field="privateKey"
        >
        <template #action>
          <p @click="addWallet" class="add-new-btn">添加新钱包</p>
        </template>
        </n-select>
      </n-form-item>
      <n-form-item style="display: flex;justify-content: flex-end;">
        <n-button attr-type="button" @click="cancel">取消</n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleCreated">确定</n-button>
      </n-form-item>
    </div>
    <AddWallet ref="addWalletRef" @success="addSuccess" />
  </n-modal>
</template>
<style lang="scss" scoped>

</style>