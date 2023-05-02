
import { ethers } from 'ethers'
let Interface = ethers.utils.Interface;
const abiCoder = ethers.utils.defaultAbiCoder;
const swapCodes = {
  "00": "V3_SWAP_EXACT_IN",
  "01": "V3_SWAP_EXACT_OUT",
  "08": "V2_SWAP_EXACT_IN",
  "09": "V2_SWAP_EXACT_OUT"
};

const v2VersionDictionary = {
  "swapExactETHForTokens": ["V3_SWAP_EXACT_IN", "V2_SWAP_EXACT_IN"],
  "swapETHForExactTokens": ["V3_SWAP_EXACT_OUT", "V2_SWAP_EXACT_OUT"]
}

let universalABI = [{ "inputs": [{ "components": [{ "internalType": "address", "name": "permit2", "type": "address" }, { "internalType": "address", "name": "weth9", "type": "address" }, { "internalType": "address", "name": "seaport", "type": "address" }, { "internalType": "address", "name": "seaportv1_4", "type": "address" }, { "internalType": "address", "name": "nftxZap", "type": "address" }, { "internalType": "address", "name": "x2y2", "type": "address" }, { "internalType": "address", "name": "foundation", "type": "address" }, { "internalType": "address", "name": "sudoswap", "type": "address" }, { "internalType": "address", "name": "nft20Zap", "type": "address" }, { "internalType": "address", "name": "cryptopunks", "type": "address" }, { "internalType": "address", "name": "looksRare", "type": "address" }, { "internalType": "address", "name": "routerRewardsDistributor", "type": "address" }, { "internalType": "address", "name": "looksRareRewardsDistributor", "type": "address" }, { "internalType": "address", "name": "looksRareToken", "type": "address" }, { "internalType": "address", "name": "v2Factory", "type": "address" }, { "internalType": "address", "name": "v3Factory", "type": "address" }, { "internalType": "bytes32", "name": "pairInitCodeHash", "type": "bytes32" }, { "internalType": "bytes32", "name": "poolInitCodeHash", "type": "bytes32" }], "internalType": "struct RouterParameters", "name": "params", "type": "tuple" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "ContractLocked", "type": "error" }, { "inputs": [], "name": "ETHNotAccepted", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "commandIndex", "type": "uint256" }, { "internalType": "bytes", "name": "message", "type": "bytes" }], "name": "ExecutionFailed", "type": "error" }, { "inputs": [], "name": "FromAddressIsNotOwner", "type": "error" }, { "inputs": [], "name": "InsufficientETH", "type": "error" }, { "inputs": [], "name": "InsufficientToken", "type": "error" }, { "inputs": [], "name": "InvalidBips", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "commandType", "type": "uint256" }], "name": "InvalidCommandType", "type": "error" }, { "inputs": [], "name": "InvalidOwnerERC1155", "type": "error" }, { "inputs": [], "name": "InvalidOwnerERC721", "type": "error" }, { "inputs": [], "name": "InvalidPath", "type": "error" }, { "inputs": [], "name": "InvalidReserves", "type": "error" }, { "inputs": [], "name": "LengthMismatch", "type": "error" }, { "inputs": [], "name": "NoSlice", "type": "error" }, { "inputs": [], "name": "SliceOutOfBounds", "type": "error" }, { "inputs": [], "name": "SliceOverflow", "type": "error" }, { "inputs": [], "name": "ToAddressOutOfBounds", "type": "error" }, { "inputs": [], "name": "ToAddressOverflow", "type": "error" }, { "inputs": [], "name": "ToUint24OutOfBounds", "type": "error" }, { "inputs": [], "name": "ToUint24Overflow", "type": "error" }, { "inputs": [], "name": "TransactionDeadlinePassed", "type": "error" }, { "inputs": [], "name": "UnableToClaim", "type": "error" }, { "inputs": [], "name": "UnsafeCast", "type": "error" }, { "inputs": [], "name": "V2InvalidPath", "type": "error" }, { "inputs": [], "name": "V2TooLittleReceived", "type": "error" }, { "inputs": [], "name": "V2TooMuchRequested", "type": "error" }, { "inputs": [], "name": "V3InvalidAmountOut", "type": "error" }, { "inputs": [], "name": "V3InvalidCaller", "type": "error" }, { "inputs": [], "name": "V3InvalidSwap", "type": "error" }, { "inputs": [], "name": "V3TooLittleReceived", "type": "error" }, { "inputs": [], "name": "V3TooMuchRequested", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "RewardsSent", "type": "event" }, { "inputs": [{ "internalType": "bytes", "name": "looksRareClaim", "type": "bytes" }], "name": "collectRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "commands", "type": "bytes" }, { "internalType": "bytes[]", "name": "inputs", "type": "bytes[]" }], "name": "execute", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "commands", "type": "bytes" }, { "internalType": "bytes[]", "name": "inputs", "type": "bytes[]" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "execute", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "name": "onERC1155BatchReceived", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "name": "onERC1155Received", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "name": "onERC721Received", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "int256", "name": "amount0Delta", "type": "int256" }, { "internalType": "int256", "name": "amount1Delta", "type": "int256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "uniswapV3SwapCallback", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]

let universalInteface = new Interface(universalABI);

export {
  decodeExecute,
  extractPathFromV3,
  buildTransactionObject
}

function buildTransactionObject(transactionDetails, decodedFunction) {
  let methodName;
  if (v2VersionDictionary["swapExactETHForTokens"].includes(decodedFunction.function)) {
    methodName = "swapExactETHForTokens";
  } else if (v2VersionDictionary["swapETHForExactTokens"].includes(decodedFunction.function)) {
    methodName = "swapETHForExactTokens";
  }

  let contractCall = {
    "methodName": methodName,
    "params": {
      "amountIn": decodedFunction.amountIn,
      "amountOut": decodedFunction.amountOut,
      "path": decodedFunction.path,
      "deadline": "99999999999"
    }
  }


  if (methodName === undefined) {
    return undefined;
  }

  return {
    'status': transactionDetails.status,
    'direction': transactionDetails.direction,
    'hash': transactionDetails.hash,
    'value': transactionDetails.value,
    'contractCall': JSON.stringify(contractCall),
    'counterparty': transactionDetails.counterparty,
    'estimatedBlocksUntilConfirmed': transactionDetails.estimatedBlocksUntilConfirmed,
    'dispatchTimestamp': transactionDetails.dispatchTimestamp,
    'maxFeePerGas': transactionDetails.maxFeePerGas,
    'maxPriorityFeePerGas': transactionDetails.maxPriorityFeePerGas,
    'gas': transactionDetails.gas,
    'from': transactionDetails.from,
    'type': transactionDetails.type,
    'gasPriceGwei': transactionDetails.gasPriceGwei,
    'gasPrice': transactionDetails.gasPriceGwei
  }
}

function decodeExecute(transactionInput) {
  const parsedTx = universalInteface.parseTransaction({ data: transactionInput });
  console.log(parsedTx)
  let commandsSplit = parsedTx.args[0].substring(2).match(/.{1,2}/g);
  let foundFunction;
  let inputForFunction;
  commandsSplit.forEach(
    commandCode => {
      const currentIndex = Object.keys(swapCodes).indexOf(commandCode)
      if (currentIndex !== -1) {
        foundFunction = commandCode;
        inputForFunction = parsedTx.args[1][commandsSplit.indexOf(commandCode)];
      }
    }
  )

  let decoded;
  switch (swapCodes[foundFunction]) {
    case "V3_SWAP_EXACT_IN": //"exactInput" FNC 11
      decoded = abiCoder.decode(["address", "uint256", "uint256", "bytes", "bool"], inputForFunction);
      console.log(decoded)
      return {
        function: swapCodes[foundFunction],
        recipient: decoded[0],
        amountIn: decoded[1].toString(),
        amountOut: decoded[2].toString(),
        path: extractPathFromV3(decoded[3]),
        payerIsUser: decoded[4]
      }
    case "V3_SWAP_EXACT_OUT": //exactOutputSingle FNC 9
      decoded = abiCoder.decode(["address", "uint256", "uint256", "bytes", "bool"], inputForFunction);
      return {
        function: swapCodes[foundFunction],
        recipient: decoded[0],
        amountIn: decoded[2].toString(),
        amountOut: decoded[1].toString(),
        path: extractPathFromV3(decoded[3], true), // because exact output swaps are executed in reverse order, in this case tokenOut is actually tokenIn
        payerIsUser: decoded[4]
      }
    case "V2_SWAP_EXACT_IN":
      decoded = abiCoder.decode(["address", "uint256", "uint256", "address[]", "bool"], inputForFunction);
      return {
        function: swapCodes[foundFunction],
        recipient: decoded[0],
        amountIn: decoded[1].toString(),
        amountOut: decoded[2].toString(),
        path: decoded[3],
        payerIsUser: decoded[4]
      }
    case "V2_SWAP_EXACT_OUT":
      decoded = abiCoder.decode(["address", "uint256", "uint256", "address[]", "bool"], inputForFunction);
      return {
        function: swapCodes[foundFunction],
        recipient: decoded[0],
        amountIn: decoded[2].toString(),
        amountOut: decoded[1].toString(),
        path: decoded[3],
        payerIsUser: decoded[4]
      }
    default:
      console.info("No parseable execute function found in input.")
      return undefined;
  }
}

function extractPathFromV3(fullPath, reverse = false) {
  const fullPathWithoutHexSymbol = fullPath.substring(2);
  let path = [];
  let currentAddress = "";
  for (let i = 0; i < fullPathWithoutHexSymbol.length; i++) {
    currentAddress += fullPathWithoutHexSymbol[i];
    if (currentAddress.length === 40) {
      path.push('0x' + currentAddress);
      i = i + 6;
      currentAddress = "";
    }
  }
  if (reverse) {
    return path.reverse();
  }
  return path;
}