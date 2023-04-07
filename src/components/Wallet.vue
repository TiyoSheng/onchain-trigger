<script setup>
import { ref, watch } from 'vue'
import { useGlobalStore } from '../hooks/globalStore'
import { useUtils } from '../hooks/utils'
import { useMessage } from "naive-ui"
import SetWallet from './form/SetWallet.vue'
import { ethers } from 'ethers'

const { store, setTriggrts } = useGlobalStore()
const { copy } = useUtils()
const message = useMessage()

const emit = defineEmits(['setTrigger'])
const props = defineProps({
  trigger: Object
})

const setWalletRef = ref(null)
const walletSpin = ref(false)
const triggerData = ref({})

const showWalletModal = () => {
  setWalletRef.value.showModal = true
  if (triggerData.value.wallet?.address) {
    setWalletRef.value.walletKey = triggerData.value.wallet?.privateKey
  }
}

const getBalance = async () => {
  walletSpin.value = true
  if (triggerData.value.wallet?.address) {
    let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G')
    let balance = await provider.getBalance(triggerData.value.wallet?.address)
    triggerData.value.wallet.balance = ethers.utils.formatEther(balance)
  }
  walletSpin.value = false
}

const setWallerSuccess = async (val) => {
  triggerData.value.wallet = val
  getBalance()
  emit('setTrigger', triggerData.value)
}

watch(() => props.trigger, (val) => {
  triggerData.value = val
  getBalance()
}, {immediate: true})
</script>
<template>
  <n-spin size="small" :show="walletSpin">
    <div class="wallet">
      <div v-if="triggerData.wallet?.address">
        <div class="wallet-hd flex-center">
          <div class="wallet-address flex-center" @click="copy(triggerData.wallet?.address)">{{triggerData.wallet?.address}}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.79175 4.62592V3.27869C4.79175 2.82564 5.15901 2.45837 5.61206 2.45837H12.7214C13.1745 2.45837 13.5417 2.82564 13.5417 3.27869V10.3881C13.5417 10.8411 13.1745 11.2084 12.7214 11.2084H11.359" stroke="#9BA0A8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10.3879 4.79163H3.27856C2.82552 4.79163 2.45825 5.15889 2.45825 5.61194V12.7213C2.45825 13.1744 2.82552 13.5416 3.27856 13.5416H10.3879C10.841 13.5416 11.2083 13.1744 11.2083 12.7213V5.61194C11.2083 5.15889 10.841 4.79163 10.3879 4.79163Z" stroke="#9BA0A8" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="wallet-operation flex-center" @click="showWalletModal">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.25 6.54163H2.75" stroke="#9BA0A8" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.75 3.04163L13.25 6.54163" stroke="#9BA0A8" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.98291 9.45837H13.4829" stroke="#9BA0A8" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.98291 9.45837L6.48292 12.9584" stroke="#9BA0A8" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            切换地址
          </div>
        </div>
        <div class="wallet-balance flex-center">
          余额：<span>{{triggerData.wallet?.balance || '0.0'}} ETH</span>
          <svg @click="getBalance" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2.74994C10.8995 2.74994 13.25 5.10044 13.25 7.99994C13.25 10.8994 10.8995 13.2499 8 13.2499C5.1005 13.2499 2.75 10.8994 2.75 7.99994C2.75 6.3507 3.51047 4.87908 4.69989 3.91661" stroke="#9BA0A8" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2.75 3.62494H5.08333V5.95827" stroke="#9BA0A8" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div v-else>
        <div class="btn" @click="showWalletModal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 13L8 3" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>选择钱包</span>
        </div>
      </div>
    </div>
    <SetWallet ref="setWalletRef" @success="setWallerSuccess" />
  </n-spin>
</template>
<style lang="scss" scoped>
.wallet {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background: #F8F9FA;
  height: 72px;
  border-radius: 8px;
  .wallet-address {
    flex: 1;
    font-size: 13px;
    line-height: 16px;
    color: #262C33;
    cursor: pointer;
    svg {
      margin-left: 4px;
    }
  }
  .wallet-operation {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: #262C33;
    cursor: pointer;
    svg {
      margin-right: 4px;
    }
  }
  .wallet-balance {
    margin-top: 8px;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: rgba($color: #262C33, $alpha: .4);
    span {
      color: #262C33;
    }
    svg {
      margin-left: 4px;
      cursor: pointer;
    }
  }
}
</style>