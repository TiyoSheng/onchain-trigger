import { reactive } from "vue";
import { setLs } from '../libs/storage'
import { ethers } from "ethers";
import { defaultChains } from '../libs/chains.js'

const store = reactive({
  state: {
    triggers: [],
    contracts: [],
    wallets: [],
    tokens: [],
    activatedId: "",
    countdownDuration: 0,
    gasPrice: 0,
    isIframe: false,
    nonce: 0,
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

const setGasPrice = (gasPrice) => {
  store.state.gasPrice = gasPrice;
};

const setTokens = (tokens) => {
  store.state.tokens = tokens
}

const setIsIframe = (isIframe) => {
  store.state.isIframe = isIframe
}

const setNonce = async (trigger) => {
  const wallet = trigger.wallet
  const chainId = trigger.chainId
  const address = wallet.address
  const rpc = defaultChains.find(item => item.chainId == chainId).rpcUrl
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  const nonce = await provider.getTransactionCount(address)
  store.state.nonce = nonce
}

export const useGlobalStore = () => ({
  store,
  setNonce,
  setTriggrts,
  setContracts,
  setWallet,
  setActivatedId,
  setCountdownDuration,
  setGasPrice,
  setTokens,
  setIsIframe
});
