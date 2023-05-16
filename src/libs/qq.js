import { ethers } from 'ethers'
import { SupportedChainId, Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core'
import { FeeAmount, Pool, Route, Trade, SwapQuoter, SwapRouter } from '@uniswap/v3-sdk'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { fromReadableAmount } from './conversion'
import JSBI from 'jsbi'
function getProvider() {
  return new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/xQr0n2BqF1Hkkuw5_0YiEXeyQdSYoW1u')
}

const QUOTER_CONTRACT_ADDRESS = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e'

async function getOutputQuote(route, CurrentConfig) {
  const provider = getProvider()
  const { calldata } = await SwapQuoter.quoteCallParameters(
    route,
    CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      ).toString()
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  )
  console.log(calldata)

  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  })
  console.log(quoteCallReturnData)

  return ethers.utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData)
}

export async function quote(tokenA, tokenB, amountIn, walletAddress) {
  const IN_TOKEN = new Token(
    SupportedChainId.GOERLI,
    tokenA.address,
    tokenA.decimals,
    'TokenA',
    'TokenA'
  )

  const OUT_TOKEN = new Token(
    SupportedChainId.GOERLI,
    tokenB.address,
    tokenB.decimals,
    'TokenB',
    'TokenB'
  )

amountIn = ethers.utils.formatUnits(amountIn, tokenA.decimals)

const CurrentConfig = {
  tokens: {
    in: IN_TOKEN,
    amountIn: amountIn,
    out: OUT_TOKEN,
    poolFee: FeeAmount.MEDIUM,
  },
}
  const currentPoolAddress = ethers.utils.getAddress("0x30F1c2bfc1e48f9875c889b3bF0602Eab764e53E")
  const poolConstants =  new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    getProvider()
  )

  const [token0, token1, fee, tickSpacing, liquidity, slot0] = await Promise.all([
    poolConstants.token0(),
    poolConstants.token1(),
    poolConstants.fee(),
    poolConstants.tickSpacing(),
    poolConstants.liquidity(),
    poolConstants.slot0(),
  ])
  console.log(token0, token1, fee, tickSpacing, liquidity, slot0)
  let poolInfo = {
    token0,
    token1,
    fee,
    tickSpacing,
    liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
  const pool = new Pool(
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out,
    CurrentConfig.tokens.poolFee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )
  console.log(pool)
  const swapRoute = new Route(
    [pool],
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out
  )
  const amountOut = 0
  const uncheckedTrade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      ).toString()
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.out,
      JSBI.BigInt(amountOut)
    ),
    tradeType: TradeType.EXACT_INPUT,
  })
  // const walletAddress = '0xFf8505C6fFddFE170121cD5A3C052A594bB74317'
  // const provider = getProvider()
  // const WALLET_SECRET="df598c29fc5ac0c71a55919012f44cb4d6d849ddbb11501036856c9e973854e5"
  // const wallet = new ethers.Wallet(WALLET_SECRET)
  // const connectedWallet = wallet.connect(provider)

  const options = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: walletAddress,
  }

  const methodParameters = SwapRouter.swapCallParameters([uncheckedTrade], options)
  console.log(methodParameters)
  return methodParameters
  // const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
  // const tx = {
  //   data: methodParameters.calldata,
  //   to: SWAP_ROUTER_ADDRESS,
  //   value: ethers.BigNumber.from(methodParameters.value),
  //   from: walletAddress,
  // }
  // return tx
  // let tt = await connectedWallet.sendTransaction(tx)
  // console.log(tt)

}


