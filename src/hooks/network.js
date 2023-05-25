import { reactive } from "vue";
import { rpcs } from '../libs/rpcs'
import { ethers } from "ethers";

const networkStore = reactive({
  state: {
    rpcs: [],
    chainId: 5,
    rpc: {},
  },
})

const setChainId = (chainId) => {
  networkStore.state.chainId = chainId
  let item = rpcs.filter(item => item.chainId == chainId)[0]
  let { infuraRpc, alchemyRpc, ankrRpc } = item
  let list = []
  if (infuraRpc) list.push(infuraRpc)
  if (alchemyRpc) list.push(alchemyRpc)
  if (ankrRpc) list.push(ankrRpc)
  networkStore.state.rpcs = list

  let rpc = list.filter(item => item.name == networkStore.state.rpc.name)[0]
  if (rpc) {
    networkStore.state.rpc = rpc
  } else {
    networkStore.state.rpc = list[0]
  }

}

const setRpc = (rpc) => {
  networkStore.state.rpc = rpc
}

const getProvider = () => {
  let rpc = networkStore.state.rpc.url
  return new ethers.providers.StaticJsonRpcProvider(rpc)
}

export const useNetwork = () => ({
  networkStore,
  setChainId,
  getProvider,
  setRpc
})