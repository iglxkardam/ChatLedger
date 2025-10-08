import { useState, useEffect } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { ChatAppABI, CONTRACT_ADDRESS } from "../contracts/ChatApp.json";

export const useChatApp = () => {
  const { address, isConnected } = useAccount();
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user exists
  const { data: userExistsData, refetch: refetchUserExists } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "checkUserExists",
    args: [address],
    enabled: !!address,
  });

  useEffect(() => {
    if (userExistsData !== undefined) {
      setUserExists(userExistsData);
    }
  }, [userExistsData]);

  // Create Account
  const createAccount = async (username) => {
    try {
      setLoading(true);
      const { config } = await usePrepareContractWrite({
        address: CONTRACT_ADDRESS,
        abi: ChatAppABI,
        functionName: "createAccount",
        args: [username],
      });

      const { data, write } = useContractWrite(config);

      if (write) {
        await write();
        const { wait } = useWaitForTransaction({ hash: data?.hash });
        await wait();

        toast.success("Account created successfully!");
        refetchUserExists();
      }
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return {
    userExists,
    loading,
    createAccount,
    refetchUserExists,
  };
};
