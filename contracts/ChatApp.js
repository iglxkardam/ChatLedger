import ABI from "../web3/artifacts/contracts/ChatApp.sol/ChatApp.json";
export const ChatAppABI = ABI.abi;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CHAT_DAPP_ADDRESS || "0xc6Eb1291F9F934ba2067bcf3AFdf7090070b9273";
export const MESSAGE_TYPES = {
  TEXT: 0,
  IMAGE: 1,
  VIDEO: 2,
  AUDIO: 3,
  ETH_TRANSFER: 4, // AVAX on Avalanche network
  TOKEN_TRANSFER: 5,
};
