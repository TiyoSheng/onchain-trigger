<script setup>
import { onBeforeMount } from 'vue'
import { getLs, setLs } from './libs/storage'
import { useGlobalStore } from './hooks/globalStore'

const { setTriggrts, setContracts, setWallet, setActivatedId } = useGlobalStore()


const themeOverrides = {
  common: {
    primaryColor: '#2152EC',
    primaryColorHover: '#2152EC'
  }
}

onBeforeMount(async () => {
  await init()
})

const init = async () => {
  let wallet = await getLs('wallet') || []
  let contracts = await getLs('contracts') || []
  let triggers = await getLs('triggers') || []
  let activatedId = await getLs('activatedId') || ''
  let isV2 = await getLs('isV2') || false
  if (!isV2) {
    setLs('isV2', true)
    setLs('triggers', [])
    triggers = []
  }
  setTriggrts(triggers)
  setContracts(contracts)
  setWallet(wallet)
  setActivatedId(activatedId)
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