import { useContract, useProvider, useSigner } from "wagmi";
import { ethers } from "ethers";
import { ChatAppABI, CONTRACT_ADDRESS } from "../contracts/ChatApp.json";

export const useContractRead = () => {
  const provider = useProvider();

  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    signerOrProvider: provider,
  });

  return contract;
};

export const useContractWrite = () => {
  const { data: signer } = useSigner();

  const contract = useContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    signerOrProvider: signer,
  });

  return contract;
};
