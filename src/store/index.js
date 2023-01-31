import { createStore } from 'vuex'
export default createStore({
  state: {
    provider: null,
    address: '',
    network: null,
    balance: 0,
    walletList: [],
    contractList: [],
    triggerList: [],
    activateTrigger: null
  },
  mutations: {
    setAddress(state, value) {
      state.address = value
    },
    setProvider(state, value) {
      state.provider = value
    },
    setNetwork(state, value) {
      state.network = value
    },
    setBalance(state, value) {
      state.balance = value
    },
    setWallet(state, value) {
      state.walletList = value
    },
    setContract(state, value) {
      state.contractList = value
    },
    setTriggers(state, value) {
      state.triggerList = value
    },
    setActivateTrigger(state, value) {
      state.activateTrigger = value
    },
    init(state) {
      state.provider = null
      state.wallet = null
      state.network = null
    }
  },
  actions: {
  },
  modules: {
  }
})
