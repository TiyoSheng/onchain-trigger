<script setup>
import { onBeforeMount } from 'vue'
import { getLs, setLs } from './libs/storage'
import { useGlobalStore } from './hooks/globalStore'
const { setTriggrts, setContracts, setWallet, setActivatedId, setTokens, setIsIframe } = useGlobalStore()
// import { quote } from './libs/quote'

const themeOverrides = {
  common: {
    primaryColor: '#2152EC',
    primaryColorHover: '#2152EC'
  }
}

onBeforeMount(async () => {
  // a()
  if (window.top === window.self) {
    setIsIframe(false)
  } else {
    setIsIframe(true)
  }
  await init()
})

const init = async () => {
  let wallet = await getLs('wallets') || []
  let contracts = await getLs('contracts') || []
  let triggers = await getLs('triggers') || []
  let activatedId = await getLs('activatedId') || ''
  let isV2 = await getLs('isV2') || false
  // let response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
  // let tokenListJSON = await response.json()
  // let tokens = tokenListJSON.tokens
  console.log('isV2',isV2)
  if (!isV2) {
    setLs('isV2', true)
    setLs('triggers', [])
    triggers = []
  }
  // setTokens(tokens)
  setTriggrts(triggers)
  setContracts(contracts)
  setWallet(wallet)
  setActivatedId(activatedId)
  // quote()
}

</script>
<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang="scss" scoped>

</style>