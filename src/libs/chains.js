export const chains = [
	{
		"name": "Binance Smart Chain Mainnet",
		"chain": "BSC",
		"rpc": [
			"https://bsc-dataseed1.binance.org",
			"https://bsc-dataseed2.binance.org",
			"https://bsc-dataseed3.binance.org",
			"https://bsc-dataseed4.binance.org",
			"https://bsc-dataseed1.defibit.io",
			"https://bsc-dataseed2.defibit.io",
			"https://bsc-dataseed3.defibit.io",
			"https://bsc-dataseed4.defibit.io",
			"https://bsc-dataseed1.ninicoin.io",
			"https://bsc-dataseed2.ninicoin.io",
			"https://bsc-dataseed3.ninicoin.io",
			"https://bsc-dataseed4.ninicoin.io",
			"wss://bsc-ws-node.nariox.org"
		],
		"faucets": [
			"https://free-online-app.com/faucet-for-eth-evm-chains/"
		],
		"nativeCurrency": {
			"name": "Binance Chain Native Token",
			"symbol": "BNB",
			"decimals": 18
		},
		"infoURL": "https://www.binance.org",
		"shortName": "bnb",
		"chainId": 56,
		"networkId": 56,
		"slip44": 714,
		"explorers": [
			{
				"name": "bscscan",
				"url": "https://bscscan.com",
				"standard": "EIP3091"
			}
		]
	},
	{
		"name": "Mumbai",
		"title": "Polygon Testnet Mumbai",
		"chain": "Polygon",
		"rpc": [
			"https://matic-mumbai.chainstacklabs.com",
			"https://rpc-mumbai.maticvigil.com",
			"https://matic-testnet-archive-rpc.bwarelabs.com"
		],
		"faucets": [
			"https://faucet.polygon.technology/"
		],
		"nativeCurrency": {
			"name": "MATIC",
			"symbol": "MATIC",
			"decimals": 18
		},
		"infoURL": "https://polygon.technology/",
		"shortName": "maticmum",
		"chainId": 80001,
		"networkId": 80001,
		"explorers": [
			{
				"name": "polygonscan",
				"url": "https://mumbai.polygonscan.com",
				"standard": "EIP3091"
			}
		]
	},
]