<script setup>
import { ref, onMounted, watch, toRaw } from 'vue'
import { ethers } from 'ethers'
import { useGlobalStore } from '../hooks/globalStore'
import { useNetwork } from '../hooks/network'
import { defaultChains, icons } from '../libs/chains'
import Tools from './tools/Tools.vue'
const { store } = useGlobalStore()
const { networkStore, setChainId, setRpc } = useNetwork()

const href = window.location.href
const gasPrice = ref(0)
const chainId = ref(5)
const loading = ref(false)
const provider = ref(null)
const rpcConnectivity = ref([])
const isOver = ref(false)
const toolsRef = ref(null)

const openOT = () => {
  window.open(href)
}
const getProvider = () => {
  let chain = defaultChains.find(item => item.chainId === chainId.value)
  let provider = new ethers.providers.StaticJsonRpcProvider(chain.rpcUrl)
  return provider
}
const getGas = async () => {
  if (!provider.value) return
  let GP = await toRaw(provider.value).getGasPrice()
  return (ethers.utils.formatUnits(GP, "gwei") * 1).toFixed(2)
}
const getChainName = () => {
  let chain = defaultChains.find(item => item.chainId === chainId.value)
  return chain?.name || 'Goerli'
}
const switchChain = async (id) => {
  chainId.value = id
  loading.value = true
  provider.value = await getProvider()
  gasPrice.value = await getGas()
  loading.value = false
}
const switchRpc = (rpc) => {
  setRpc(rpc)
}
const getRpcConnectivity = () => {
  if (isOver.value) return
  isOver.value = true
  let rpcs = networkStore.state.rpcs
  // 用所有rpc获取blocknumber
  rpcs.forEach(async (rpc, index) => {
    let startTime = new Date().getTime()
    let provider = new ethers.providers.StaticJsonRpcProvider(rpc.url)
    await provider.getBlockNumber()
    let endTime = new Date().getTime()
    let time = endTime - startTime
    rpcConnectivity.value[index] = (time / 1000).toFixed(2)
  })
}
onMounted(async () => {
  gasPrice.value = await getGas()
  setInterval(async () => {
    gasPrice.value = await getGas()
  }, 5000)
})
watch(() => store.state.activatedId, (val) => {
  let triggers = store.state.triggers
  let trigger = triggers.find(item => item.id === val)
  let cId = trigger?.chainId || 5
  switchChain(cId)
  setChainId(cId)

}, { immediate: true, deep: true })
</script>
<template>
  <div class="nav flex-center">
    <div class="logo flex-center">
      <a href="/"><img src="../assets/images/logo.svg" alt="" /></a>
      <span v-if="!href.includes('https://onchain-trigger.jetable.xyz/')">当前是测试环境</span>
    </div>
    <div class="flex-center">
      <div class="btn" style="width: 80px;font-weight: 400;" @click="toolsRef.showToolsModal = true">换算工具</div>
      <div class="wallet flex-center-sb chain-w" @mouseenter="getRpcConnectivity" @mouseleave="isOver = false">
        <div class="flex-center">
          <img :src="networkStore.state.rpc.logo" alt="" class="icon">
          <div class="address" style="margin-right: 0">{{ networkStore.state.rpc.name }}</div>
        </div>
        <div class="block"></div>
        <div class="chain-list" v-if="networkStore.state.rpcs && networkStore.state.rpcs.length">
          <div v-for="(item, index) in networkStore.state.rpcs" :key="item.name" @click="switchRpc(item)"
            :class="['chain-item', 'flex-center-sb', networkStore.state.rpc?.url == item.url ? 'chain-item-active' : '']">
            <div class="flex-center" style="width: 100%">
              <img :src="item.logo" alt="" class="icon">
              <div class="chain-name">{{ item.name }}</div>
            </div>
            <div v-show="rpcConnectivity[index]" class="rpc-connectivity">{{ rpcConnectivity[index] }}s</div>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M13.7491 5.65717C14.042 5.95006 14.042 6.42494 13.7491 6.71783L8.12408 12.3428C7.83119 12.6357 7.35631 12.6357 7.06342 12.3428L4.25092 9.53033C3.95803 9.23744 3.95803 8.76256 4.25092 8.46967C4.54381 8.17678 5.01869 8.17678 5.31158 8.46967L7.59375 10.7518L12.6884 5.65717C12.9813 5.36428 13.4562 5.36428 13.7491 5.65717Z"
                fill="#375CFF" />
            </svg>
          </div>
        </div>
      </div>
      <div class="wallet flex-center-sb chain-w">
        <div class="flex-center">
          <img
            :src="chain && icons[chainId] ? `https://icons.llamao.fi/icons/chains/rsz_${icons[chainId]}.jpg` : 'https://chainlist.org/unknown-logo.png'"
            alt="" class="icon">
          <div class="address">{{ getChainName() }}</div>
        </div>
        <n-spin :show="loading">
          <div class="flex-center-center gas-price">
            <img src="../assets/images/gas.gif" alt="">
            <p>{{ gasPrice }}</p>
          </div>
        </n-spin>
        <div class="block"></div>
        <div class="chain-list" v-if="defaultChains && defaultChains.length">
          <div v-for="item in defaultChains" :key="item.chainId" @click="switchChain(item.chainId)"
            :class="['chain-item', 'flex-center-sb', chainId == item.chainId ? 'chain-item-active' : '']">
            <div class="flex-center" style="width: 100%">
              <img
                :src="icons[item.chainId] ? `https://icons.llamao.fi/icons/chains/rsz_${icons[item.chainId]}.jpg` : 'https://chainlist.org/unknown-logo.png'"
                alt="" class="icon">
              <div class="chain-name">{{ item.name }}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M13.7491 5.65717C14.042 5.95006 14.042 6.42494 13.7491 6.71783L8.12408 12.3428C7.83119 12.6357 7.35631 12.6357 7.06342 12.3428L4.25092 9.53033C3.95803 9.23744 3.95803 8.76256 4.25092 8.46967C4.54381 8.17678 5.01869 8.17678 5.31158 8.46967L7.59375 10.7518L12.6884 5.65717C12.9813 5.36428 13.4562 5.36428 13.7491 5.65717Z"
                fill="#375CFF" />
            </svg>
          </div>
        </div>
      </div>
      <div class="menu flex-center" v-if="!store.state.isIframe">
        <div class="menu-item"><router-link to="/">Trigger</router-link></div>
        <div class="menu-item"><router-link to="/playground">Playground</router-link></div>
      </div>
      <div v-else class="btn" @click="openOT">Open In Jetable OS</div>
    </div>
    <Tools ref="toolsRef" />
  </div>
</template>
<style lang="scss" scoped>
.nav {
  padding: 0 24px;
  height: 64px;
  border-bottom: 1px solid rgb(239, 239, 245);
  box-sizing: border-box;

  .logo {
    flex: 1;
    height: 100%;

    img {
      height: 92px;
      height: auto;
    }

    span {
      font-size: 12px;
      margin-left: 12px;
    }
  }

  .menu {
    flex: 1;
    justify-content: flex-end;

    .menu-item {
      margin-left: 24px;
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
      color: #262C33;
      cursor: pointer;

      &:hover {
        color: #2152Ec;
      }

      a {
        text-decoration: none;
        color: inherit;
      }
    }
  }
}

.btn {
  margin-left: 16px;
  padding: 0 12px;
  border: 1px solid rgba(133, 141, 153, 0.15);
  border-radius: 10px;
  font-family: 'Montserrat-Medium';
  font-size: 13px;
  line-height: 18px;
  color: #000;
  height: 34px;
  cursor: pointer;
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.wallet {
  min-width: 150px;
  margin-left: 16px;
  padding: 0 12px;
  border: 1px solid rgba(133, 141, 153, 0.15);
  border-radius: 10px;
  font-family: 'Montserrat-Medium';
  font-size: 13px;
  line-height: 18px;
  height: 34px;
  cursor: pointer;

  &.wallet-btn {
    &:hover {
      background: rgba(133, 141, 153, 0.3);
    }
  }

  .line {
    height: 12px;
    width: 1px;
    margin: 0 12px;
    background: #000;
  }

  .avatar {
    margin-right: 6px;
    width: 14px;
    height: 14px;
  }

  .address {
    font-weight: 500;
    margin-right: 24px;
  }

  .icon {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    margin-right: 6px;
  }

  .gas-price {
    img {
      width: 18px;
      height: 18px;
    }

    p {
      font-weight: 500;
      font-size: 13px;
      line-height: 17px;
      margin-left: 8px;
    }
  }

  &.chain-w {
    position: relative;

    &:hover {
      .chain-list {
        display: block;
      }
    }

    .block {
      position: absolute;
      top: 34px;
      left: 0;
      right: 0;
      height: 10px;
      font-size: 0;
    }

    .chain-list {
      display: none;
      position: absolute;
      top: 42px;
      left: 0;
      right: 0;
      max-height: 350px;
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(133, 141, 153, 0.15);
      box-shadow: 0px 12px 30px rgba(10, 10, 12, 0.3);
      backdrop-filter: blur(10px);
      border-radius: 10px;
      padding: 5px;
      box-sizing: border-box;
      z-index: 99;

      .chain-item {
        padding: 0 12px;
        height: 34px;
        border-radius: 6px;
        box-sizing: border-box;
        font-size: 13px;
        line-height: 18px;
        text-transform: capitalize;
        color: #000;
        position: relative;
        padding-right: 20px;

        .chain-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &:hover {
          background: rgba(133, 141, 153, 0.15);
        }

        &.chain-item-active {
          background: rgba(55, 92, 255, 0.15);
          color: #375CFF;

          svg {
            display: inline-block;
          }
        }

        img {
          width: 18px;
          height: 18px;
          border-radius: 10px;
          margin-right: 6px;
        }

        svg {
          display: none;
          width: 18px;
          flex: 0 0 18px;
          height: auto;
          position: absolute;
          right: 0;
        }

        .rpc-connectivity {
          font-size: 12px;
          color: #63b687;
        }
      }

      .add-btn {
        background: rgba(133, 141, 153, 0.3);
        border-radius: 6px;
        height: 34px;
        cursor: pointer;

        &:hover {
          background: #375CFF;
        }

        span {
          font-weight: 400;
          font-size: 15px;
          line-height: 18px;
          text-transform: capitalize;
        }
      }
    }
  }
}</style>
