import { reactive } from "vue";

const store = reactive({
  state: {
    triggers: [],
    contracts: [],
    wallets: [],
    activatedId: ""
  },
});

const setTriggrts = (triggers) => {
  store.state.triggers = triggers;
};

const setContracts = (contracts) => {
  store.state.contracts = contracts;
};

const setWallet = (wallets) => {
  store.state.wallets = wallets;
};

const setActivatedId = (activatedId) => {
  store.state.activatedId = activatedId;
};

export const useGlobalStore = () => ({
  store,
  setTriggrts,
  setContracts,
  setWallet,
  setActivatedId,
});
