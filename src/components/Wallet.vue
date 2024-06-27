<script setup>
import { ref, watch } from 'vue'
import { ethers } from 'ethers'
import { useGlobalStore } from '../hooks/globalStore'
import { useUtils } from '../hooks/utils'
import { useMessage } from "naive-ui"
import SetWallet from './form/SetWallet.vue'
import { defaultChains } from '../libs/chains'
import PrivateKey from './wallet/PrivateKey.vue'
import Transfer from './wallet/Transfer.vue'

const { store, setTriggrts } = useGlobalStore()
const { copy } = useUtils()
const message = useMessage()

const emit = defineEmits(['setTrigger'])
const props = defineProps({
  trigger: Object
})

const setWalletRef = ref(null)
const privateKeyRef = ref(null)
const transferRef = ref(null)
const walletSpin = ref(false)
const triggerData = ref({})
const popselectOptions = [
  { label: '转账', value: 'transfer' },
  { label: '查看私钥', value: 'privateKey' }
]

const showWalletModal = () => {
  setWalletRef.value.showModal = true
  if (triggerData.value.wallet?.address) {
    setWalletRef.value.walletKey = triggerData.value.wallet?.privateKey
  }
}

const getBalance = async () => {
  walletSpin.value = true
  if (triggerData.value.wallet?.address) {
    let chainId = triggerData.value.chainId || 5
    let chain = defaultChains.find(item => item.chainId === chainId)
    let provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl)
    let balance = await provider.getBalance(triggerData.value.wallet?.address)
    triggerData.value.wallet.balance = ethers.utils.formatEther(balance) + ' ' + chain.symbol
  }
  walletSpin.value = false
}

const setWallerSuccess = async (val) => {
  triggerData.value.wallet = val
  getBalance()
  emit('setTrigger', triggerData.value)
}

const toScan = (address) => {
  let url = `https://goerli.etherscan.io/address/${address}`
  window.open(url)
}

const popselectChange = (val) => {
  switch (val) {
    case 'transfer':
      transferRef.value.showTransferModal = true
      transferRef.value.triggerData = triggerData.value
      break
    case 'privateKey':
      console.log(privateKeyRef.value, triggerData.value.wallet?.privateKey)
      privateKeyRef.value.privateKey = triggerData.value.wallet?.privateKey
      break
  }
}

watch(() => props.trigger, (val) => {
  triggerData.value = val
  getBalance()
}, { immediate: true })
</script>
<template>
  <div class="wallet">
    <div v-if="triggerData.wallet?.address">
      <div class="wallet-hd flex-center">
        <div class="wallet-address flex-center" @click="copy(triggerData.wallet?.address)">{{
          triggerData.wallet?.address }}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.79175 4.62592V3.27869C4.79175 2.82564 5.15901 2.45837 5.61206 2.45837H12.7214C13.1745 2.45837 13.5417 2.82564 13.5417 3.27869V10.3881C13.5417 10.8411 13.1745 11.2084 12.7214 11.2084H11.359"
              stroke="#9BA0A8" stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M10.3879 4.79163H3.27856C2.82552 4.79163 2.45825 5.15889 2.45825 5.61194V12.7213C2.45825 13.1744 2.82552 13.5416 3.27856 13.5416H10.3879C10.841 13.5416 11.2083 13.1744 11.2083 12.7213V5.61194C11.2083 5.15889 10.841 4.79163 10.3879 4.79163Z"
              stroke="#9BA0A8" stroke-linejoin="round" />
          </svg>
          <svg @click.stop="toScan(triggerData.wallet?.address)" width="16" height="16" viewBox="0 0 123 123"
            fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M25.79 58.4149C25.7901 57.7357 25.9244 57.0633 26.1851 56.4361C26.4458 55.809 26.8278 55.2396 27.3092 54.7605C27.7907 54.2814 28.3619 53.9021 28.9903 53.6444C29.6187 53.3867 30.2918 53.2557 30.971 53.2589L39.561 53.2869C40.9305 53.2869 42.244 53.831 43.2124 54.7994C44.1809 55.7678 44.725 57.0813 44.725 58.4509V90.9309C45.692 90.6439 46.934 90.3379 48.293 90.0179C49.237 89.7962 50.0783 89.262 50.6805 88.5019C51.2826 87.7418 51.6102 86.8006 51.61 85.8309V45.5409C51.61 44.1712 52.154 42.8576 53.1224 41.889C54.0908 40.9204 55.4043 40.3762 56.774 40.3759H65.381C66.7506 40.3762 68.0641 40.9204 69.0325 41.889C70.0009 42.8576 70.545 44.1712 70.545 45.5409V82.9339C70.545 82.9339 72.7 82.0619 74.799 81.1759C75.5787 80.8462 76.2441 80.2941 76.7122 79.5886C77.1803 78.8832 77.4302 78.0555 77.431 77.2089V32.6309C77.431 31.2615 77.9749 29.9481 78.9431 28.9797C79.9113 28.0113 81.2245 27.4672 82.5939 27.4669H91.201C92.5706 27.4669 93.884 28.0109 94.8525 28.9794C95.8209 29.9478 96.365 31.2613 96.365 32.6309V69.3399C103.827 63.9319 111.389 57.4279 117.39 49.6069C118.261 48.4717 118.837 47.1386 119.067 45.7267C119.297 44.3148 119.174 42.8678 118.709 41.5149C115.931 33.5227 111.516 26.1983 105.745 20.0105C99.974 13.8228 92.9749 8.90785 85.1955 5.58032C77.4161 2.2528 69.0277 0.585938 60.5671 0.686416C52.1065 0.786893 43.7601 2.6525 36.062 6.16383C28.3638 9.67517 21.4834 14.7549 15.8611 21.078C10.2388 27.401 5.99842 34.8282 3.41131 42.8842C0.824207 50.9401 -0.0526487 59.4474 0.836851 67.8617C1.72635 76.276 4.36263 84.4119 8.57696 91.7489C9.31111 93.0145 10.3912 94.0444 11.6903 94.7175C12.9894 95.3906 14.4536 95.679 15.911 95.5489C17.539 95.4059 19.566 95.2029 21.976 94.9199C23.0251 94.8008 23.9937 94.2999 24.6972 93.5126C25.4008 92.7253 25.7901 91.7067 25.791 90.6509L25.79 58.4149Z"
              fill="#21325B" />
            <path
              d="M25.6021 110.51C34.6744 117.11 45.3959 121.072 56.5802 121.957C67.7646 122.841 78.9757 120.615 88.9731 115.523C98.9705 110.431 107.364 102.673 113.226 93.1068C119.087 83.5405 122.188 72.539 122.185 61.3197C122.185 59.9197 122.12 58.5347 122.027 57.1577C99.808 90.2957 58.7831 105.788 25.604 110.505"
              fill="#979695" />
          </svg>
        </div>
        <div class="wallet-operation flex-center" @click="showWalletModal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.25 6.54163H2.75" stroke="#9BA0A8" stroke-width="1.16667" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M9.75 3.04163L13.25 6.54163" stroke="#9BA0A8" stroke-width="1.16667" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M2.98291 9.45837H13.4829" stroke="#9BA0A8" stroke-width="1.16667" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M2.98291 9.45837L6.48292 12.9584" stroke="#9BA0A8" stroke-width="1.16667" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          切换地址
        </div>
      </div>
      <n-spin size="small" :show="walletSpin">
        <div class="flex-center-sb">
          <div class="wallet-balance flex-center">
            余额：<span>{{ triggerData.wallet?.balance || '0.0' }} </span>
            <svg @click="getBalance" width="16" height="16" viewBox="0 0 16 16" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 2.74994C10.8995 2.74994 13.25 5.10044 13.25 7.99994C13.25 10.8994 10.8995 13.2499 8 13.2499C5.1005 13.2499 2.75 10.8994 2.75 7.99994C2.75 6.3507 3.51047 4.87908 4.69989 3.91661"
                stroke="#9BA0A8" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2.75 3.62494H5.08333V5.95827" stroke="#9BA0A8" stroke-width="1.05" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <n-popselect :options="popselectOptions" trigger="click" @update:value="popselectChange">
            <div class="more flex-center-center">
              <img src="../assets/images/more.svg" alt="">
            </div>
          </n-popselect>
        </div>

      </n-spin>
    </div>
    <div v-else>
      <div class="btn" @click="showWalletModal">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8H13" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M8 13L8 3" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>选择钱包</span>
      </div>
    </div>
  </div>
  <SetWallet ref="setWalletRef" @success="setWallerSuccess" />
  <PrivateKey ref="privateKeyRef" />
  <Transfer ref="transferRef" @transfer="getBalance" />
</template>
<style lang="scss" scoped>
.wallet {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background: #F8F9FA;
  height: 72px;
  border-radius: 8px;

  .wallet-hd {
    margin-bottom: 6px;
  }

  .more {
    cursor: pointer;
    width: 24px;
    height: 16px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    img {
      width: 16px;
      height: 16px;
    }
  }

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