<script setup>
import { ref } from 'vue'
import { useGlobalStore } from '../../hooks/globalStore'
import { useMessage } from "naive-ui"
import { ethers } from 'ethers'

const { store, setWallet } = useGlobalStore()
const message = useMessage()

const emit = defineEmits(['success'])

const walletName = ref('')
const privateKey = ref('')
const showAddModal = ref(false)
const showPrivateKeyInput = ref(false)

const handleCreated = async () => {
  if (!walletName.value) {
    message.error('请输入钱包名称')
    return
  }
  let lbcWallet = ethers.Wallet.createRandom()
  if (privateKey.value) {
    lbcWallet = new ethers.Wallet(privateKey.value)
  }
  console.log(lbcWallet)
  let newWallet = {}
  newWallet.privateKey = lbcWallet.privateKey
  newWallet.address = lbcWallet.address
  newWallet.name = walletName.value
  let wallets = store.state.wallets
  wallets.push(newWallet)
  await setWallet(wallets)
  emit('success', newWallet)
  cancel()
}

const cancel = () => {
  showAddModal.value = false
  walletName.value = ''
}

defineExpose({
  showAddModal,
  walletName
});
</script>

<template>
  <n-modal
    v-model:show="showAddModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    title="创建新钱包"
    @afterLeave="cancel"
  >
    <div>
      <n-form-item label="钱包名称" >
        <n-input v-model:value="walletName" placeholder="输入钱包名" />
      </n-form-item>
      <n-form-item v-if="showPrivateKeyInput" label="私钥（选填）" >
        <n-input type="textarea" v-model:value="privateKey" placeholder="导入请粘贴私钥,新建钱包请直接点击创建" />
      </n-form-item>
      <div class="btn" v-if="!showPrivateKeyInput" @click="showPrivateKeyInput = true">使用私钥创建</div>
      <n-form-item style="display: flex;justify-content: flex-end;">
        <n-button attr-type="button" @click="cancel">取消</n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleCreated">创建</n-button>
      </n-form-item>
    </div>
  </n-modal>
</template>
