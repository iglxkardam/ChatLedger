import { useReadContract } from "wagmi";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";

export const useProfilePicture = (userAddress) => {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getProfilePicture",
    args: [userAddress],
    enabled: !!userAddress,
  });
};
