import { ethers } from 'ethers'
import { SupportedChainId, Token } from '@uniswap/sdk-core'
import { computePoolAddress, FeeAmount } from '@uniswap/v3-sdk'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import SwapRouterABI from '@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json'
import UniswapV3Factory from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import { toReadableAmount, fromReadableAmount } from './conversion'
import ERC20ABI from './abi.json'
const WALLET_ADDRESS="0xFf8505C6fFddFE170121cD5A3C052A594bB74317"
const WALLET_SECRET="df598c29fc5ac0c71a55919012f44cb4d6d849ddbb11501036856c9e973854e5"
const POOL_FACTORY_CONTRACT_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
const provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/xQr0n2BqF1Hkkuw5_0YiEXeyQdSYoW1u')
const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
const factoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'

const name1 = 'MTUniswap Token'
const symbol1 = 'UNI'
const decimals1 = 18
const address1 = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
// Token info
let outToken = new Token(
  SupportedChainId.GOERLI,
  address0,
  decimals0,
  symbol0,
  name0
)
let inToken = new Token(
  SupportedChainId.GOERLI,
  address1,
  decimals1,
  symbol1,
  name1
)
export async function quote() {
  // const currentPoolAddress = computePoolAddress({
  //   factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
  //   tokenA: outToken,
  //   tokenB: inToken,
  //   fee: 500,
  // })
  // const currentPoolAddress = ethers.utils.getAddress("0x30F1c2bfc1e48f9875c889b3bF0602Eab764e53E")
  // const poolConstants = new ethers.Contract(
  //   currentPoolAddress,
  //   IUniswapV3PoolABI.abi,
  //   provider
  // )
  // const [token0, token1, fee] = await Promise.all([
  //   poolConstants.token0(),
  //   poolConstants.token1(),
  //   poolConstants.fee(),
  // ])
  const wallet = new ethers.Wallet(WALLET_SECRET)
  const connectedWallet = wallet.connect(provider)
  const contract0 = new ethers.Contract('0x07865c6E87B9F70255377e024ace6630C1Eaa37F', ERC20ABI, provider)
  // await contract0.connect(connectedWallet).approve(
  //   '0xe592427a0aece92de3edee1f18e0157c05861564',
  //   ethers.utils.parseUnits('10000000', 6)
  // )
  const swapRouterContract = new ethers.Contract(
    swapRouterAddress,
    SwapRouterABI.abi,
    provider
  )
  const inputAmount = 0.01
  const amountIn = ethers.utils.parseUnits(
    inputAmount.toString(),
    18
  )
  const params = {
    tokenIn: '0xD64565Bdd10454Fd262277ddcfb747Bb13B8aE97',
    tokenOut: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    fee: 500,
    recipient: WALLET_ADDRESS,
    deadline: 4294967295,
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  }

  console.log(params)
  
  const transaction = await swapRouterContract.connect(connectedWallet).exactInputSingle(
    params,
    {
      gasLimit: ethers.utils.hexlify(25000)
    }
  )
  console.log(transaction)
}
// export const POOL_FACTORY_CONTRACT_ADDRESS =
//   '0x1F98431c8aD98523631AE4a59f267346ea31F984'
// export const QUOTER_CONTRACT_ADDRESS =
//   '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
// export const WETH_TOKEN = new Token(
//   SupportedChainId.MAINNET,
//   '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
//   18,
//   'WETH',
//   'Wrapped Ether'
// )

// export const USDC_TOKEN = new Token(
//   SupportedChainId.MAINNET,
//   '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
//   6,
//   'USDC',
//   'USD//C'
// )

// const CurrentConfig = {
//   tokens: {
//     in: USDC_TOKEN,
//     amountIn: 1000,
//     out: WETH_TOKEN,
//     poolFee: FeeAmount.MEDIUM,
//   },
// }

// export async function quote() {
//   const quoterContract = new ethers.Contract(
//     QUOTER_CONTRACT_ADDRESS,
//     Quoter.abi,
//     getProvider()
//   )
//   // const poolConstants = await getPoolConstants()
//   const currentPoolAddress = ethers.utils.getAddress("0x30F1c2bfc1e48f9875c889b3bF0602Eab764e53E")
//   console.log(currentPoolAddress)
//   const poolConstants =  new ethers.Contract(
//     currentPoolAddress,
//     IUniswapV3PoolABI.abi,
//     getProvider()
//   )

//   const [token0, token1, fee] = await Promise.all([
//     poolConstants.token0(),
//     poolConstants.token1(),
//     poolConstants.fee(),
//   ])
//   console.log(token0, token1, fee)

//   const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
//     token0,
//     token1,
//     fee,
//     fromReadableAmount(1, 18).toString(),
//     0
//   )

//   return toReadableAmount(quotedAmountOut, 18)
// }

// async function getPoolConstants() {
//   const currentPoolAddress = computePoolAddress({
//     factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
//     tokenA: CurrentConfig.tokens.in,
//     tokenB: CurrentConfig.tokens.out,
//     fee: CurrentConfig.tokens.poolFee,
//   })

//   const poolContract = new ethers.Contract(
//     currentPoolAddress,
//     IUniswapV3PoolABI.abi,
//     getProvider()
//   )
//   const [token0, token1, fee] = await Promise.all([
//     poolContract.token0(),
//     poolContract.token1(),
//     poolContract.fee(),
//   ])

//   return {
//     token0,
//     token1,
//     fee,
//   }
// }
