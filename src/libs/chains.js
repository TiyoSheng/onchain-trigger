export const icons = {
	"1": "ethereum",
	"8": "ubiq",
	"10": "optimism",
	"19": "songbird",
	"20": "elastos",
	"24": "kardiachain",
	"25": "cronos",
	"30": "rsk",
	"40": "telos",
	"50": "xdc",
	"52": "csc",
	"55": "zyx",
	"56": "binance",
	"57": "syscoin",
	"60": "gochain",
	"61": "ethereumclassic",
	"66": "okexchain",
	"70": "hoo",
	"82": "meter",
	"87": "nova network",
	"88": "tomochain",
	"100": "xdai",
	"106": "velas",
	"108": "thundercore",
	"122": "fuse",
	"128": "heco",
	"137": "polygon",
	"200": "xdaiarb",
	"246": "energyweb",
	"250": "fantom",
	"269": "hpb",
	"288": "boba",
	"321": "kucoin",
	"336": "shiden",
	"361": "theta",
	"416": "sx",
	"534": "candle",
	"592": "astar",
	"820": "callisto",
	"888": "wanchain",
	"1088": "metis",
	"1231": "ultron",
	"1234": "step",
	"1284": "moonbeam",
	"1285": "moonriver",
	"2000": "dogechain",
	"2222": "kava",
	"4689": "iotex",
	"5050": "xlc",
	"5551": "nahmii",
	"6969": "tombchain",
	"7700": "canto",
	"8217": "klaytn",
	"9001": "evmos",
	"10000": "smartbch",
	"32520": "bitgert",
	"32659": "fusion",
	"39815": "oho",
	"42161": "arbitrum",
	"42170": "arb-nova",
	"42220": "celo",
	"42262": "oasis",
	"43114": "avalanche",
	"47805": "rei",
	"55555": "reichain",
	"71402": "godwoken",
	"333999": "polis",
	"420420": "kekchain",
	"888888": "vision",
	"1313161554": "aurora",
	"1666600000": "harmony",
	"11297108109": "palm",
	"836542336838601": "curio"
}

export const chainNickNames = ['Ethereum Mainnet,Ethereum', 'Ethereum Classic Testnet Kotti,ETC', 'Flare Mainnet,Flare', 'Flare Testnet Coston,Flare Coston', 'ShibaChain,Shiba', 'Boba Network Rinkeby Testnet,Boba Rinkeby', 'Telos EVM Mainnet,Telos', 'Telos EVM Testnet,Telos Test', 'Binance Smart Chain Mainnet,BSC', 'EOS Mainnet,EOS Evm', 'Ethereum Classic Mainnet,ETC', 'Ethereum Classic Testnet Morden,ETC Morden', 'Ethereum Classic Testnet Mordor,ETC Mordor', 'OKExChain Testnet,OKC Test', 'OKXChain Mainnet,OKC', 'Optimism Kovan,OP Kovan', 'Hoo Smart Chain,HOO', 'Conflux eSpace (Testnet),CFX eSpace Test', 'Binance Smart Chain Testnet,BSC Test', 'Huobi ECO Chain Mainnet,HECO', 'Polygon Mainnet,Polygon', 'HOO Smart Chain Testnet,HSC Test', 'Fantom Opera,Fantom', 'Huobi ECO Chain Testnet,HEC Test', 'Boba Network,Boab', 'Tao Network,Tao', 'Lucky Network,Lucky', 'Wanchain Testnet,Wanchain', 'Klaytn Testnet Baobab,Klaytn Baobab', 'Conflux eSpace,CFX eSpace', 'Cube Chain Mainnet,Cube', 'Cube Chain Testnet,Cube Test', 'Kava EVM Testnet,Kava Test', 'DYNO Mainnet,DYNO', 'IoTeX Network Mainnet,IoTeX', 'Uzmi Network Mainnet,Uzmi', 'Nahmii Mainnet,Nahmii', 'Evmos Testnet,Evmos Test', 'Arbitrum One,Arb One', 'Celo Mainnet,Celo', 'Celo Alfajores Testnet,Celo Alfajores', 'Celo Baklava Testnet,Celo Baklava', 'Alaya Mainnet,Alaya', 'Alaya Dev Testnet,Alaya Dev', 'PlatON Mainnet,PlatON', 'Arbitrum Rinkeby,Arb Rinkeby', 'Aurora Mainnet,Aurora']

export const defaultChains = [{
  chainId: 1,
  name: 'Ethereum Mainnet',
  alchemyKey: 'jN8fV_NMTGZqSGr89H1--BhcSK_2DS7B',
  network: 'eth-mainnet',
  rpcUrl: "https://mainnet.infura.io/v3/d10c4ff706c546c485a8d9d92d1e5096",
  explorer: 'https://etherscan.io',
  symbol: 'ETH',
}, {
  chainId: 5,
  name: 'Ethereum Goerli',
  alchemyKey: 'xQr0n2BqF1Hkkuw5_0YiEXeyQdSYoW1u',
  network: 'eth-goerli',
  rpcUrl: "https://goerli.infura.io/v3/f2d8df49b1da46f49db541f7e66a74bb",
  explorer: 'https://goerli.etherscan.io',
  symbol: 'ETH',
}, {
  chainId: 11155111,
  name: 'Ethereum Sepolia',
  alchemyKey: 'xQr0n2BqF1Hkkuw5_0YiEXeyQdSYoW1u',
  network: 'eth-sepolia',
  rpcUrl: "https://sepolia.infura.io/v3/475b4727c26b449d86cf2faa155737da",
  explorer: 'https://sepolia.etherscan.io',
  symbol: 'ETH',
}, {
  chainId: 42161,
  name: 'Arbitrum Mainnet',
  alchemyKey: 'EiXW-C3n5hjVz51wqPQ2DiMC755SdNUv',
  network: 'arb-mainnet',
  rpcUrl: "https://arbitrum-mainnet.infura.io/v3/475b4727c26b449d86cf2faa155737da",
  explorer: 'https://arbiscan.io',
  symbol: 'ETH',
}, {
  chainId: 10,
  name: 'Optimism Mainnet',
  alchemyKey: 'NvzukYnwii_v0-vm6eu2KDHqNSi0h20L',
  network: 'opt-mainnet',
  rpcUrl: "https://optimism-mainnet.infura.io/v3/475b4727c26b449d86cf2faa155737da",
  explorer: 'https://optimistic.etherscan.io',
  symbol: 'ETH',
}]