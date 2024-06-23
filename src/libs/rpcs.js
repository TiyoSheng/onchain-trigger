import alchemy from '../assets/images/alchemy.svg'
import ankr from '../assets/images/ankr.png'
import infura from '../assets/images/infura.png'

export const rpcs = [{
  chainId: 1,
  infuraRpc: {
    url: 'https://mainnet.infura.io/v3/d10c4ff706c546c485a8d9d92d1e5096',
    name: 'Infura',
    logo: infura
  },
  alchemyRpc: {
    url: 'https://eth-mainnet.g.alchemy.com/v2/rDwBqKe2Zy38AF5b-GB2Y5bfH7wspLM5',
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
  chainId: 11155111,
  infuraRpc: {
    url: 'https://sepolia.infura.io/v3/475b4727c26b449d86cf2faa155737da',
    name: 'Infura',
    logo: infura
  },
  alchemyRpc: {
    url: 'https://eth-sepolia.g.alchemy.com/v2/rDwBqKe2Zy38AF5b-GB2Y5bfH7wspLM5',
    name: 'Alchemy',
    logo: alchemy
  }
}, {
  chainId: 42161,
  infuraRpc: {
    url: 'https://arbitrum-mainnet.infura.io/v3/475b4727c26b449d86cf2faa155737da',
    name: 'Infura',
    logo: infura
  },
  alchemyRpc: {
    url: 'https://arb-mainnet.g.alchemy.com/v2/rDwBqKe2Zy38AF5b-GB2Y5bfH7wspLM5',
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
  infuraRpc: {
    url: 'https://optimism-mainnet.infura.io/v3/475b4727c26b449d86cf2faa155737da',
    name: 'Infura',
    logo: infura
  },
  alchemyRpc: {
    url: 'https://opt-mainnet.g.alchemy.com/v2/rDwBqKe2Zy38AF5b-GB2Y5bfH7wspLM5',
    name: 'Alchemy',
    logo: alchemy
  },
  ankrRpc: {
    url: 'https://rpc.ankr.com/optimism',
    name: 'Ankr',
    logo: ankr
  }
}]