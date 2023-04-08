import { reactive } from "vue";

const store = reactive({
  state: {
    triggers: [],
    contracts: [],
    wallets: [],
    activatedId: "",
    countdownDuration: 0
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

const setCountdownDuration = (countdownDuration) => {
  store.state.countdownDuration = countdownDuration;
};

export const useGlobalStore = () => ({
  store,
  setTriggrts,
  setContracts,
  setWallet,
  setActivatedId,
  setCountdownDuration
});
