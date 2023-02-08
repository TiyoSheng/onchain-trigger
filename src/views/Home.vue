<template>
  <div class="home flex-start">
    <Menu />
    <Main />
  </div>
</template>

<script>
// @ is an alias to /src
import Main from '@/components/Main.vue'
import Menu from '@/components/Menu.vue'
import { useStore } from 'vuex'
import { onMounted } from 'vue'
import { getLs } from '@/service/service'
export default {
  name: 'Home',
  components: {
    Main,
    Menu
  },
  setup() {
    const store = useStore()
    onMounted(async () => {
      // getProvider()
      let wallets = await getLs('wallet') || []
      let contracts = await getLs('contracts') || []
      console.log(contracts)
      contracts.forEach(e => {
        let abi = JSON.parse(e.abi)
        console.log(abi)
      })
      let triggers = await getLs('triggers') || []
      let activatedId = await getLs('activatedId') || ''
      wallets.push({name: '添加新钱包', privateKey: 'add'})
      contracts.push({name: '添加新合约', id: 'add'})
      triggers.forEach(e => {
        e.running = false
        e.msgList = e.msgList || []
      })
      store.commit('setWallet', wallets)
      store.commit('setContract', contracts)
      store.commit('setTriggers', triggers)
      store.commit('setActivatedId', activatedId)
    })
  }
}
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  max-width: 1680px;
  height: 100vh;
  overflow: hidden;
}
</style>
