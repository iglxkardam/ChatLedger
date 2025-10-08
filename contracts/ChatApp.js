import ABI from "../web3/artifacts/contracts/ChatApp.sol/ChatApp.json";
export const ChatAppABI = ABI.abi;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const MESSAGE_TYPES = {
  TEXT: 0,
  IMAGE: 1,
  VIDEO: 2,
  AUDIO: 3,
  AVAX_TRANSFER: 4,
  TOKEN_TRANSFER: 5,
};
