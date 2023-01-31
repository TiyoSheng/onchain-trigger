<template>
  <div class="home flex-center">
    <Menu />
    <HelloWorld />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import Menu from '@/components/Menu.vue'
import { useStore } from 'vuex'
import { onMounted } from 'vue'
import { getLs } from '@/service/service'
export default {
  name: 'Home',
  components: {
    HelloWorld,
    Menu
  },
  setup() {
    const store = useStore()
    onMounted(async () => {
      // getProvider()
      let wallets = await getLs('wallet') || []
      let contracts = await getLs('contracts') || []
      let triggers = await getLs('triggers') || []
      wallets.push({name: '添加新钱包', privateKey: 'add'})
      contracts.push({name: '添加新合约', address: 'add'})
      triggers.forEach(e => {
        e.running = false
        e.msgList = e.msgList || []
      })
      store.commit('setWallet', wallets)
      store.commit('setContract', contracts)
      store.commit('setTriggers', triggers)
    })
  }
}
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
