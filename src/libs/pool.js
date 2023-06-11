import { decodeExecute } from './universalDecoder'
import { ethers } from 'ethers'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { computePoolAddress, FeeAmount } from '@uniswap/v3-sdk'
import { SupportedChainId, Token } from '@uniswap/sdk-core'

const abi = [{ "inputs": [{ "components": [{ "internalType": "address", "name": "permit2", "type": "address" }, { "internalType": "address", "name": "weth9", "type": "address" }, { "internalType": "address", "name": "seaport", "type": "address" }, { "internalType": "address", "name": "nftxZap", "type": "address" }, { "internalType": "address", "name": "x2y2", "type": "address" }, { "internalType": "address", "name": "foundation", "type": "address" }, { "internalType": "address", "name": "sudoswap", "type": "address" }, { "internalType": "address", "name": "nft20Zap", "type": "address" }, { "internalType": "address", "name": "cryptopunks", "type": "address" }, { "internalType": "address", "name": "looksRare", "type": "address" }, { "internalType": "address", "name": "routerRewardsDistributor", "type": "address" }, { "internalType": "address", "name": "looksRareRewardsDistributor", "type": "address" }, { "internalType": "address", "name": "looksRareToken", "type": "address" }, { "internalType": "address", "name": "v2Factory", "type": "address" }, { "internalType": "address", "name": "v3Factory", "type": "address" }, { "internalType": "bytes32", "name": "pairInitCodeHash", "type": "bytes32" }, { "internalType": "bytes32", "name": "poolInitCodeHash", "type": "bytes32" }], "internalType": "struct RouterParameters", "name": "params", "type": "tuple" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "ContractLocked", "type": "error" }, { "inputs": [], "name": "ETHNotAccepted", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "commandIndex", "type": "uint256" }, { "internalType": "bytes", "name": "message", "type": "bytes" }], "name": "ExecutionFailed", "type": "error" }, { "inputs": [], "name": "FromAddressIsNotOwner", "type": "error" }, { "inputs": [], "name": "InsufficientETH", "type": "error" }, { "inputs": [], "name": "InsufficientToken", "type": "error" }, { "inputs": [], "name": "InvalidBips", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "commandType", "type": "uint256" }], "name": "InvalidCommandType", "type": "error" }, { "inputs": [], "name": "InvalidOwnerERC1155", "type": "error" }, { "inputs": [], "name": "InvalidOwnerERC721", "type": "error" }, { "inputs": [], "name": "InvalidPath", "type": "error" }, { "inputs": [], "name": "InvalidReserves", "type": "error" }, { "inputs": [], "name": "LengthMismatch", "type": "error" }, { "inputs": [], "name": "NoSlice", "type": "error" }, { "inputs": [], "name": "SliceOutOfBounds", "type": "error" }, { "inputs": [], "name": "SliceOverflow", "type": "error" }, { "inputs": [], "name": "ToAddressOutOfBounds", "type": "error" }, { "inputs": [], "name": "ToAddressOverflow", "type": "error" }, { "inputs": [], "name": "ToUint24OutOfBounds", "type": "error" }, { "inputs": [], "name": "ToUint24Overflow", "type": "error" }, { "inputs": [], "name": "TransactionDeadlinePassed", "type": "error" }, { "inputs": [], "name": "UnableToClaim", "type": "error" }, { "inputs": [], "name": "UnsafeCast", "type": "error" }, { "inputs": [], "name": "V2InvalidPath", "type": "error" }, { "inputs": [], "name": "V2TooLittleReceived", "type": "error" }, { "inputs": [], "name": "V2TooMuchRequested", "type": "error" }, { "inputs": [], "name": "V3InvalidAmountOut", "type": "error" }, { "inputs": [], "name": "V3InvalidCaller", "type": "error" }, { "inputs": [], "name": "V3InvalidSwap", "type": "error" }, { "inputs": [], "name": "V3TooLittleReceived", "type": "error" }, { "inputs": [], "name": "V3TooMuchRequested", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "RewardsSent", "type": "event" }, { "inputs": [{ "internalType": "bytes", "name": "looksRareClaim", "type": "bytes" }], "name": "collectRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "commands", "type": "bytes" }, { "internalType": "bytes[]", "name": "inputs", "type": "bytes[]" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "execute", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "name": "onERC1155BatchReceived", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "name": "onERC1155Received", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "name": "onERC721Received", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "int256", "name": "amount0Delta", "type": "int256" }, { "internalType": "int256", "name": "amount1Delta", "type": "int256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "uniswapV3SwapCallback", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]

let provider = new ethers.providers.WebSocketProvider('wss://goerli.infura.io/ws/v3/f2d8df49b1da46f49db541f7e66a74bb')
// let wallet = new ethers.Wallet('df598c29fc5ac0c71a55919012f44cb4d6d849ddbb11501036856c9e973854e5', provider)
// let connectedWallet = wallet.connect(provider)
// let contract = new ethers.Contract('0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', abi, connectedWallet)

const toFixHex = (num, n) => {
  var end = (num).toString(16)
  var pre = ""
  for (var i = 0; i < n - num.length; i++) {
    pre += "0"
  }
  return pre + end
}

const encodeAddress = (token0, token1, fee) => {
  var hexFee = toFixHex(fee.toString(16), 6)
  return "0x" + token0.substring(2) + hexFee + token1.substring(2)
}

const getEncodeData = (type, data) => {
  var abiCoder = new ethers.utils.AbiCoder()
  return abiCoder.encode(type, data)
}
const WETH_ADDRESS = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'
const JTT_ADDRESS = '0x6f48f85a1355e1f925f4e22bb8955ba6bc309b9a'
const USDC_ADDRESS = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'
const MT_ADDRESS = '0xD64565Bdd10454Fd262277ddcfb747Bb13B8aE97'
const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'

const WETH_TOKEN = new Token(
  SupportedChainId.GOERLI,
  '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
  18,
  'WETH',
  'Wrapped Ether'
)

const JTT_TOKEN = new Token(
  SupportedChainId.GOERLI,
  '0x6f48f85a1355e1f925f4e22bb8955ba6bc309b9a',
  18,
  'JTT',
  'Jetable Test Token'
)

const USDC_TOKEN = new Token(
  SupportedChainId.GOERLI,
  '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
  6,
  'USDC',
  'USD//C'
)

const MT_TOKEN = new Token(
  SupportedChainId.GOERLI,
  '0xD64565Bdd10454Fd262277ddcfb747Bb13B8aE97',
  18,
  'MT',
  'Mental Token'
)


export const execute = async (path, amountIn, wallet, sendInfo) => {
  // let data = '0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006481b73f000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002bd64565bdd10454fd262277ddcfb747bb13b8ae97000bb8b4fbf271143f4fbf7b91a5ded31805e42b2208d6000000000000000000000000000000000000000000'
  // let ad = decodeExecute(data)
  // console.log(ad)
  // const CurrentConfig = {
  // 	tokens: {
  // 		in: JTT_TOKEN,
  // 		amountIn: 0.01,
  // 		out: WETH_TOKEN,
  // 		poolFee: FeeAmount.MEDIUM,
  // 	}
  // }
  // const currentPoolAddress = computePoolAddress({
  //   factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  //   tokenA: CurrentConfig.tokens.in,
  //   tokenB: CurrentConfig.tokens.out,
  //   fee: CurrentConfig.tokens.poolFee,
  // })
  // const poolConstants =  new ethers.Contract(
  //   currentPoolAddress,
  //   IUniswapV3PoolABI.abi,
  //   provider
  // )

  // console.log(poolConstants, currentPoolAddress)

  // const [token0, token1, fee] = await Promise.all([
  //   poolConstants.token0(),
  //   poolConstants.token1(),
  //   poolConstants.fee()
  // ])
  // console.log(token0, token1, fee)
  // let path = [
  // 	ethers.utils.getAddress("0x6f48f85a1355e1f925f4e22bb8955ba6bc309b9a"),
  // 	ethers.utils.getAddress("0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6")
  // ]
  // let amountIn = "100000000000000000"
  // let a = ethers.utils.defaultAbiCoder.decode(
  //   [{
  //     type: "tuple",
  //     name: "permitSingle",
  //     components: [
  //       {
  //         name: "details", type: 'tuple',
  //         components: [
  //           { name: "token", type: 'address' },
  //           { name: "amount", type: 'uint160' },
  //           { name: "expiration", type: 'uint48' },
  //           { name: "nonce", type: 'uint48' }
  //         ]
  //       },
  //       { name: "spender", type: 'address' },
  //       { name: "sigDeadline", type: 'uint256' },
  //     ]
  //   }, 'bytes'], '0x0000000000000000000000006f48f85a1355e1f925f4e22bb8955ba6bc309b9a000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000064aad35f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad0000000000000000000000000000000000000000000000000000000064834d6700000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041d1e21718273e142c05b299226b8f3cdc0b742e37ca7786f578a2b53038fa7ed5734ef5c5acc4d3ec12dcb0615ba2169dff0dc8c212704f0c1a66562a3788860c1b00000000000000000000000000000000000000000000000000000000000000')
  //   console.log('a',a)
  let contract = new ethers.Contract('0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', abi, wallet)
  return new Promise(async (resolve, reject) => {
    let amount = "1000000000000000" // 1
    let payerIsUser = true
    let amountOut = '0'
    let recipient = "0x0000000000000000000000000000000000000002"
    let deadline = Math.floor((new Date().getTime() + 1000 * 60 * 20) / 1000)
    let pathStr = encodeAddress(ethers.utils.getAddress(path[0]), ethers.utils.getAddress(path[1]), 3000)
    let inputs = []
    let { gasLimit, gasPrice, value, maxFeePerGas, maxPriorityFeePerGas, chainId = 5 } = sendInfo
    let permitSingle = {
      details: {
        token: ethers.utils.getAddress(path[0]),
        amount: ethers.BigNumber.from('1461501637330902918203684832716283019655932542975'),
        expiration: ethers.BigNumber.from(deadline.toString()),
        nonce: 0
      },
      spender: ethers.utils.getAddress('0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad'),
      sigDeadline: ethers.BigNumber.from(deadline.toString())
    }
    const domain = {
      name: 'Uniswap V3',
      version: '1',
      chainId,
      verifyingContract: ethers.utils.getAddress('0x000000000022d473030f116ddee9f6b43ac78ba3')
    }
    const types = {
      PermitDetails: [
        { name: "token", type: 'address' },
        { name: "amount", type: 'uint160' },
        { name: "expiration", type: 'uint48' },
        { name: "nonce", type: 'uint48' }
      ],
      PermitSingle: [
        { name: 'details', type: 'PermitDetails' },
        { name: 'spender', type: 'address' },
        { name: 'sigDeadline', type: 'uint256' }
      ]
    }
    let connectedWallet = wallet.connect(provider)
    const singleMsg = await connectedWallet._signTypedData(domain, types, permitSingle)
    console.log(ethers.utils.splitSignature(singleMsg))
    inputs[0] = ethers.utils.defaultAbiCoder.encode([{
      type: "tuple",
      name: "permitSingle",
      components: [
        {
          name: "details", type: 'tuple',
          components: [
            { name: "token", type: 'address' },
            { name: "amount", type: 'uint160' },
            { name: "expiration", type: 'uint48' },
            { name: "nonce", type: 'uint48' }
          ]
        },
        { name: "spender", type: 'address' },
        { name: "sigDeadline", type: 'uint256' },
      ]
    }, 'bytes'], [permitSingle, singleMsg])
    inputs[1] = getEncodeData(["address", "uint256", "uint256", "bytes", "bool"], [recipient, amountIn, amountOut, pathStr, payerIsUser])
    inputs[2] = getEncodeData(["address", "uint256"], ['0x0000000000000000000000000000000000000001', amountOut])
    try {
      const transaction = await contract.populateTransaction['execute']('0x0a000c', inputs, deadline)
      const nonce = await provider.getTransactionCount(wallet.address);
      console.log(transaction, nonce)
      if (!gasLimit) {
        const estimateGas = await contract.estimateGas['execute']('0x0a000c', inputs, deadline);
        console.log(estimateGas)
        gasLimit = estimateGas.toNumber()
      }
      if (!gasPrice) {
        gasPrice = await provider.getGasPrice()
      }
      if (!maxFeePerGas) {
        transaction.gasLimit = gasLimit
        transaction.gasPrice = gasPrice
        transaction.nonce = nonce;
        transaction.value = value
      } else {
        transaction.nonce = nonce;
        transaction.type = 2
        transaction.chainId = chainId
        transaction.gasLimit = gasLimit
        transaction.value = value
        transaction.maxFeePerGas = maxFeePerGas
        transaction.maxPriorityFeePerGas = maxPriorityFeePerGas
      }
      const signedTransaction = await wallet.signTransaction(transaction);
      const txResponse = await provider.sendTransaction(signedTransaction);
      resolve(txResponse)
    } catch (error) {
      reject(error)
    }

    // contract.execute('0x00', inputs, deadline, {gasLimit, maxFeePerGas, maxPriorityFeePerGas, value}).then((res) => {
    // 	resolve(res)
    // }).catch((err) => {
    // 	console.log(err)
    // 	reject(err)
    // })
  })

}