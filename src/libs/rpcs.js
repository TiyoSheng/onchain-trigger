import alchemy from '../assets/images/alchemy.svg'
import ankr from '../assets/images/ankr.png'
import infura from '../assets/images/infura.png'

export const rpcs = [{
  chainId: 1,
  infuraRpc: {
    url: 'https://mainnet.infura.io/v3/f2d8df49b1da46f49db541f7e66a74bb',
    name: 'Infura',
    logo: infura
  },
  alchemyRpc: {
    url: 'https://eth-mainnet.g.alchemy.com/v2/jN8fV_NMTGZqSGr89H1--BhcSK_2DS7B',
    name: 'Alchemy',
    logo: alchemy
  },
  ankrRpc: {
    url: 'https://rpc.ankr.com/eth',
    name: 'Ankr',
    logo: ankr
  }
}, {
  chainId: 5,
  infuraRpc: {
    url: 'https://goerli.infura.io/v3/f2d8df49b1da46f49db541f7e66a74bb',
    name: 'Infura',
    logo: infura
  },
  alchemyRpc: {
    url: 'https://eth-goerli.g.alchemy.com/v2/xQr0n2BqF1Hkkuw5_0YiEXeyQdSYoW1u',
    name: 'Alchemy',
    logo: alchemy
  },
  ankrRpc: {
    url: 'https://rpc.ankr.com/eth_goerli',
    name: 'Ankr',
    logo: ankr
  }
}, {
  chainId: 42161,
  alchemyRpc: {
    url: 'https://arb-mainnet.g.alchemy.com/v2/EiXW-C3n5hjVz51wqPQ2DiMC755SdNUv',
    name: 'Alchemy',
    logo: alchemy
  },
  ankrRpc: {
    url: 'https://rpc.ankr.com/arbitrum',
    name: 'Ankr',
    logo: ankr
  }
}, {
  chainId: 10,
  alchemyRpc: {
    url: 'https://opt-mainnet.g.alchemy.com/v2/NvzukYnwii_v0-vm6eu2KDHqNSi0h20L',
    name: 'Alchemy',
    logo: alchemy
  },
  ankrRpc: {
    url: 'https://rpc.ankr.com/optimism',
    name: 'Ankr',
    logo: ankr
  }
}, {
  chainId: 80001,
  alchemyRpc: {
    url: 'https://polygon-mumbai.g.alchemy.com/v2/dvEObOGHsdlwKqC0dShjUVJyLiDqfdzC',
    name: 'Alchemy',
    logo: alchemy
  },
  ankrRpc: {
    url: 'https://rpc.ankr.com/polygon_mumbai',
    name: 'Ankr',
    logo: ankr
  }
}]