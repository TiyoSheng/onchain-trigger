<template>
  <n-modal
    v-model:show="showModal"
    :mask-closable="false"
    :style="{width: '600px', 'border-radius': '10px'}"
    preset="card"
    title="创建新钱包"
  >
    <div>
      <n-form-item label="钱包名称" >
        <n-input v-model:value="walletName" placeholder="输入钱包名" />
      </n-form-item>
      <n-form-item style="display: flex;justify-content: flex-end;">
        <n-button attr-type="button" @click="showModal = false">取消</n-button>
        <n-button style="margin-left: 20px" attr-type="button" @click="handleCreated">创建</n-button>
      </n-form-item>
    </div>
  </n-modal>
</template>
<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { setLs, getLs } from '@/service/service'
import { ethers } from 'ethers'
export default {
  setup(props, {emit}) {
    const store = useStore()
    const walletName = ref('')
    const showModal = ref(false)
    const handleCreated = async () => {
      let lbcWallet = ethers.Wallet.createRandom()
      let newWallet = {}
      console.log(lbcWallet.privateKey)
      newWallet.privateKey = lbcWallet.privateKey
      newWallet.address = lbcWallet.address
      newWallet.name = walletName.value
      let wallets = await getLs('wallet') || []
      wallets.push(newWallet)
      setLs('wallet', JSON.parse(JSON.stringify(wallets))).then(async () => {
        showModal.value = false
        walletName.value = ''
        wallets.push({name: '添加新钱包', privateKey: 'add'})
        store.commit('setWallet', wallets)
        emit('addWalletSuccess', newWallet)
      })
    }
    return {
      showModal,
      walletName,
      handleCreated
    }
  },
}
</script>
<style lang="scss" scoped>

</style>