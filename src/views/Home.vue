<template>
  <div class="home flex-start">
    <Menu />
    <Main />
    <GetTriggerModal ref="getTriggerModal" @confirm="confirm" />
  </div>
</template>

<script>
// @ is an alias to /src
import Main from '@/components/Main.vue'
import Menu from '@/components/Menu.vue'
import GetTriggerModal from '@/components/GetTriggerModal.vue'
import { useStore } from 'vuex'
import { onMounted, ref, onBeforeMount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLs, setLs } from '@/service/service'
import { getTrigger } from '@/http/api'
import { useMessage } from "naive-ui"
export default {
  name: 'Home',
  components: {
    Main,
    Menu,
    GetTriggerModal
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const message = useMessage()
    const triggerList = computed(() => {
      return store.state.triggerList
    })
    const getTriggerModal = ref(null)
    const setContract = async (res) => {
      let contractList = await getLs('contracts') || []
      let contracts = res.trigger.contracts
      contracts.forEach(e => {
        let hash = `${e.address}-${e.chain.chainId}`
        e.isImport = true
        if (contractList.some(el => el.hash == hash)) {
          contractList.forEach((ele, index) => {
            if (ele.hash == hash) {
              contractList[index] = e
            }
          })
        } else {
          contractList.push(e)
        }
      })
      setLs('contracts', JSON.parse(JSON.stringify(contractList))).then(async () => {
        contracts.push({name: '添加新合约', id: 'add'})
        store.commit('setContract', contractList)
      })
    }
    const setTrigger = async (res, password) => {
      let { functions, globalParams, name, note, trigger_id, triggers, version } = res.trigger
      globalParams = globalParams.map(e => {
        let item = {}
        let val = e.value
        if (val.length > 22) {
          val = `${val.slice(0, 6)}...${val.slice(-4)}`
        }
        if (e.key != 'currentWalletAddress') {
          item =  {
            key: e.key,
            value: e.value,
            label: `${e.key} (${val})`
          }
        } else {
          item =  {
            key: e.key,
            value: e.value,
            label: `当前钱包地址 (${val})`
          }
        }
        return item
      })
      let triggerData = {functions, globalParams, name, note, triggerId: trigger_id, triggers, version, message: [],  running: false, id: crypto.randomUUID(), isImprot: true, password }
      console.log(triggerData)
      let triggerList = await getLs('triggers') || []
      triggerList.push(triggerData)
      setLs('triggers', JSON.parse(JSON.stringify(triggerList))).then(res => {
        store.commit('setTriggers', res)
        setLs('activatedId', triggerData.id).then(() => {
          store.commit('setActivatedId', triggerData.id)
        })
      })
    }
    const getTriggerFun = (password = '') => {
      let triggerId = route.params.id
      getTrigger({trigger_id: triggerId, password}).then(res => {
        if (res.code == 1) {
          message.error(res.msg)
        } else {
          if (triggerList.value.some(e => e.triggerId == triggerId)) {
            message.info('已存在该触发器', {
              keepAliveOnHover: true
            })
            triggerList.value.forEach(el => {
              if (el.triggerId == triggerId) {
                store.commit('setActivatedId', el.id)
              }
            })
          } else {
            setContract(res)
            setTrigger(res, password)
          }
          getTriggerModal.value.showModal = false
          router.replace('/')
        }
        getTriggerModal.value.loading = false
      }).catch(err => {
        console.log(err)
        message.error(err)
        getTriggerModal.value.loading = false
      })
    }
    const confirm = (e) => {
      getTriggerFun(e)
    }
    onBeforeMount(() => {
      
    })
    onMounted(async () => {
      // getProvider()
      let wallets = await getLs('wallet') || []
      let contracts = await getLs('contracts') || []
      contracts.forEach(e => {
        e.hash = `${e.address}-${e.chain.chainId}`
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
      let triggerId = route.params.id
      if (triggerId) {
        getTriggerModal.value.showModal = true
      }
    })
    return {
      getTriggerModal,
      confirm
    }
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
