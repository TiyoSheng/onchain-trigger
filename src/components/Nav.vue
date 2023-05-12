<script setup>
import { useGlobalStore } from '../hooks/globalStore'
const { store } = useGlobalStore()

const href = window.location.href
console.log(href)

const openOT = () => {
  window.open(href)
}
</script>
<template>
  <div class="nav flex-center">
    <div class="logo flex-center">
      <img src="../assets/images/logo.svg" alt="">
      <span v-if="!href.includes('https://onchain-trigger.jetable.xyz/')">当前是测试环境</span>
    </div>
    <div class="menu flex-center" v-if="!store.state.isIframe">
      <div class="menu-item"><router-link to="/">Trigger</router-link></div>
      <div class="menu-item"><router-link to="/playground">Playground</router-link></div>
    </div>
    <div v-else class="btn" @click="openOT">Open In Jetable OS</div>
  </div>
</template>
<style lang="scss" scoped>
.nav {
  padding: 0 24px;
  height: 64px;
  border-bottom: 1px solid rgb(239, 239, 245);
  box-sizing: border-box;
  .logo {
    flex: 0 0 400px;
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
</style>