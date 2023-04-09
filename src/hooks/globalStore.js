import { reactive } from "vue";
import { setLs } from '../libs/storage'

const store = reactive({
  state: {
    triggers: [],
    contracts: [],
    wallets: [],
    activatedId: "",
    countdownDuration: 0
  },
});

const setTriggrts = async (triggers) => {
  await setLs('triggers', JSON.parse(JSON.stringify(triggers)))
  store.state.triggers = triggers;
};

const setContracts = async (contracts) => {
  await setLs('contracts', JSON.parse(JSON.stringify(contracts)))
  store.state.contracts = contracts;
};

const setWallet = async (wallets) => {
  await setLs('wallets', JSON.parse(JSON.stringify(wallets)))
  store.state.wallets = wallets;
};

const setActivatedId = async (activatedId) => {
  await setLs('activatedId', activatedId)
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
