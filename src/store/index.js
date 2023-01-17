import { createStore } from 'vuex'
export default createStore({
  state: {
    provider: null,
    address: '',
    network: null,
    balance: 0
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
