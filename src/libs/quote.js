import { ethers } from 'ethers'
import SwapRouterABI from '@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json'
// const WALLET_ADDRESS="0xFf8505C6fFddFE170121cD5A3C052A594bB74317"
// const WALLET_SECRET="df598c29fc5ac0c71a55919012f44cb4d6d849ddbb11501036856c9e973854e5"
const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
import { useNetwork } from "../hooks/network"
const { getProvider } = useNetwork()
export const quote = async (path, amountIn, wallet, sendInfo) => {
  return new Promise(async (resolve, reject) => {
    const provider = getProvider()
    let [tokenIn, tokenOut] = path
    let { gasLimit, gasPrice, value, maxFeePerGas, maxPriorityFeePerGas, chainId = 5 } = sendInfo
    // const wallet = new ethers.Wallet(WALLET_SECRET)
    // const connectedWallet = wallet.connect(provider)
    const swapRouterContract = new ethers.Contract(
      swapRouterAddress,
      SwapRouterABI.abi,
      wallet
    )
    // const inputAmount = 0.01
    // const amountIn = ethers.utils.parseUnits(
    //   inputAmount.toString(),
    //   18
    // )
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20
    const params = {
      tokenIn: ethers.utils.getAddress(tokenIn),
      tokenOut: ethers.utils.getAddress(tokenOut),
      fee: 3000,
      recipient: wallet.address,
      deadline: deadline,
      amountIn,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    }

    console.log(params)
    const transaction = await swapRouterContract.populateTransaction['exactInputSingle'](params)
    console.log(transaction)
    if (!gasLimit) {
      const estimateGas = await swapRouterContract.estimateGas['exactInputSingle'](params);
      gasLimit = estimateGas.toNumber()
    }
    if (!gasPrice) {
      gasPrice = await provider.getGasPrice()
    }
    let nonce = await provider.getTransactionCount(wallet.address)
    if (!maxFeePerGas) {
      transaction.gasLimit = gasLimit
      transaction.gasPrice = gasPrice
      transaction.nonce = nonce;
      transaction.value = 0
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
  })
  // const transaction = await swapRouterContract.exactInputSingle(
  //   params,
  //   {
  //     gasLimit
  //   }
  // )
  // console.log(transaction)
}
