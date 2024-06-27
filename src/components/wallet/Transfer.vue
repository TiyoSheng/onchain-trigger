<script setup>
import { ref, watch } from 'vue'
import { ethers } from 'ethers'
import { defaultChains } from '../../libs/chains'

const emits = defineEmits(['transfer'])

const form = ref({
  originAddress: '',
  targetAddress: '',
  amount: '',
  gasPrice: '',
  gasLimit: ''
})
const triggerData = ref(null)
const showTransferModal = ref(false)
const showLoading = ref(false)

const setAmount = () => {
  const balance = triggerData.value?.wallet?.balance?.split('ETH')[0]
  if (balance) {
    form.value.amount = Number(balance).toString()
  }
}

const handleTransfer = async () => {
  const chainId = triggerData.value.chainId
  const chain = defaultChains.find(item => item.chainId === chainId)
  const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl)
  const wallet = new ethers.Wallet(triggerData.value.wallet.privateKey, provider)
  const transaction = {
    to: form.value.targetAddress,
    value: ethers.utils.parseEther(form.value.amount)
  }
  if (form.value.gasPrice) {
    transaction.gasPrice = ethers.utils.parseUnits(form.value.gasPrice, 'gwei')
  }
  if (form.value.gasLimit) {
    transaction.gasLimit = ethers.utils.parseUnits(form.value.gasLimit, 'gwei')
  }
  showLoading.value = true
  try {
    const tx = await wallet.sendTransaction(transaction)
    console.log(tx)
  } catch (error) {
    console.log(error)
  }
  showLoading.value = false
  close()
  setTimeout(() => {
    emits('transfer')
  }, 1000)
}

const close = () => {
  form.value = {
    originAddress: '',
    targetAddress: '',
    amount: '',
    gasPrice: '',
    gasLimit: ''
  }
  showTransferModal.value = false
}

watch(() => triggerData.value, (val) => {
  if (val) {
    form.value.originAddress = val?.wallet?.address
  }
}, { immediate: true })

defineExpose({
  triggerData,
  showTransferModal
})

</script>
<template>
  <div v-if="showTransferModal" class="transfer flex-center-center">

    <div class="transfer-content" @click.stop>
      <n-spin size="small" :show="showLoading">
        <n-form-item label="当前地址" label-placement="left">
          <n-input v-model:value="form.originAddress" disabled />
        </n-form-item>
        <n-form-item label="目标地址" label-placement="left">
          <n-input v-model:value="form.targetAddress" placeholder="输入目标地址" />
        </n-form-item>
        <div class="form-item">
          <n-form-item label="转账金额" label-placement="left">
            <n-input v-model:value="form.amount" placeholder="输入转账金额" />
          </n-form-item>
          <p class="balance">余额：{{ triggerData?.wallet?.balance || 0 }} <span @click="setAmount">最大值</span></p>
        </div>
        <n-form-item label="gasPrice" label-placement="left">
          <n-input v-model:value="form.gasPrice" placeholder="输入gasPrice(gwei)" />
        </n-form-item>
        <n-form-item label="gasLimit" label-placement="left">
          <n-input v-model:value="form.gasLimit" placeholder="输入gasLimit(gwei)" />
        </n-form-item>
        <div class="btns">
          <n-button attr-type="button" @click="close">取消</n-button>
          <n-button style="margin-left: 20px" attr-type="button" @click="handleTransfer">转账</n-button>
        </div>
      </n-spin>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.transfer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 999;

  .transfer-content {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    padding: 16px;
    font-size: 14px;
    line-height: 20px;
    width: 500px;

    .form-item {
      position: relative;

      .balance {
        position: absolute;
        right: 4px;
        bottom: -12px;
        font-size: 12px;
        line-height: 16px;
        color: #262C33;

        span {
          margin-left: 4px;
          color: #007AFF;
          cursor: pointer;
        }
      }
    }

    .btns {
      text-align: right;
    }
  }
}
</style>
<style>
.transfer .n-form-item .n-form-item-label {
  height: 40px !important;
}
</style>