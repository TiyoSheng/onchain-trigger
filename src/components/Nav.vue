<script setup>
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import { useGlobalStore } from '../hooks/globalStore'
const { store } = useGlobalStore()

const href = window.location.href
const gasPrice = ref(0)
console.log(href)

const openOT = () => {
  window.open(href)
}
const getGas = async () => {
  let provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/xQr0n2BqF1Hkkuw5_0YiEXeyQdSYoW1u')
  let GP = await provider.getGasPrice()
  return (ethers.utils.formatUnits(GP, "gwei") * 1).toFixed(2)
}
onMounted(async () => {
  gasPrice.value = await getGas()
  setInterval(async () => {
    gasPrice.value = await getGas()
  }, 5000)
})
</script>
<template>
  <div class="nav flex-center">
    <div class="logo flex-center">
      <img src="../assets/images/logo.svg" alt="">
      <span v-if="!href.includes('https://onchain-trigger.jetable.xyz/')">当前是测试环境</span>
    </div>
    <div class="flex-center">
      <div class="flex-center-center gas-price">
        <img src="../assets/images/gas.gif" alt="">
        <p>{{gasPrice}}</p>
      </div>
      <div class="menu flex-center" v-if="!store.state.isIframe">
        <div class="menu-item"><router-link to="/">Trigger</router-link></div>
        <div class="menu-item"><router-link to="/playground">Playground</router-link></div>
      </div>
      <div v-else class="btn" @click="openOT">Open In Jetable OS</div>
    </div>
    
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
  margin-left: auto;
}
.gas-price {
  border: 1px solid rgba(133, 141, 153, 0.15);
  padding: 0 12px;
  border-radius: 10px;
  padding: 0 12px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 18px;
    height: 18px;
  }
  p {
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    margin-left: 8px;
    font-weight: 600;
  }
}
</style>