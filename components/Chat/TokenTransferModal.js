import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import {
  FiX,
  FiLoader,
  FiExternalLink,
  FiShield,
  FiZap,
  FiCheck,
} from "react-icons/fi";
import { BiTransfer } from "react-icons/bi";
import {
  ERC20_ABI,
  isValidAddress,
  formatTokenAmount,
  parseTokenAmount,
} from "../../utils/tokenUtils";
//
const TokenTransferModal = ({ selectedFriend, isOpen, onClose, onSuccess }) => {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingTokenInfo, setLoadingTokenInfo] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [userBalance, setUserBalance] = useState("0");

  // Token contract reads
  const { data: tokenName } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "name",
    enabled: isValidAddress(tokenAddress),
  });

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
    enabled: isValidAddress(tokenAddress),
  });

  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
    enabled: isValidAddress(tokenAddress),
  });

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    enabled: isValidAddress(tokenAddress) && !!address,
  });

  // Contract write hooks
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Auto-select TBC token when modal opens
  useEffect(() => {
    if (isOpen && !tokenAddress) {
      setTokenAddress("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    }
  }, [isOpen, tokenAddress]);

  // Update token info when data is loaded
  useEffect(() => {
    if (tokenName && tokenSymbol && tokenDecimals !== undefined) {
      setTokenInfo({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
      });
      setLoadingTokenInfo(false);
    }
  }, [tokenName, tokenSymbol, tokenDecimals]);

  // Update balance
  useEffect(() => {
    if (balance && tokenInfo) {
      setUserBalance(formatTokenAmount(balance, tokenInfo.decimals));
    }
  }, [balance, tokenInfo]);

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Tokens sent successfully!");
      onSuccess();
      resetForm();
      onClose();
    }
  }, [isConfirmed, onSuccess, onClose]);

  const resetForm = () => {
    setTokenAddress("");
    setAmount("");
    setTokenInfo(null);
    setUserBalance("0");
    setLoadingTokenInfo(false);
  };

  const handleTokenAddressChange = (e) => {
    const newAddress = e.target.value.trim();
    setTokenAddress(newAddress);

    // Reset state
    setTokenInfo(null);
    setUserBalance("0");

    if (isValidAddress(newAddress)) {
      setLoadingTokenInfo(true);
    } else {
      setLoadingTokenInfo(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSendTokens = () => {
    if (!tokenInfo || !amount) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const amountBN = parseTokenAmount(amount, tokenInfo.decimals);
      if (amountBN.isZero()) {
        toast.error("Amount must be greater than 0");
        return;
      }

      const balanceBN = ethers.BigNumber.from(balance || "0");
      if (balanceBN.lt(amountBN)) {
        toast.error("Insufficient token balance");
        return;
      }

      // Direct token transfer to wallet address
      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [selectedFriend?.pubkey, amountBN],
      });
    } catch (error) {
      toast.error("Invalid amount");
      console.error(error);
    }
  };

  const setMaxAmount = () => {
    if (userBalance && parseFloat(userBalance) > 0) {
      setAmount(userBalance);
    }
  };

  const openTokenOnExplorer = () => {
    const explorerUrl =
      process.env.NEXT_PUBLIC_BLOCK_EXPLORER || "http://localhost:8545";
    window.open(`${explorerUrl}/address/${tokenAddress}`, "_blank");
  };

  const tryTBCToken = () => {
    setTokenAddress("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0E0B12]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0E0B12]/95 backdrop-blur-xl rounded-2xl border border-fuchsia-500/20 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-fuchsia-500/5 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-purple-600/5 to-transparent"></div>
          <div className="absolute top-10 right-10 w-3 h-3 bg-fuchsia-400/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-2 h-2 bg-purple-400/30 rounded-full animate-ping delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex justify-between items-center p-6 border-b border-fuchsia-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <BiTransfer className="text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Send Tokens</h3>
              <p className="text-sm text-gray-400">Direct wallet transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-fuchsia-500/10 hover:bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/20 transition-all duration-300 hover:scale-110"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 space-y-6">
          {/* Recipient Info */}
          <div className="bg-gradient-to-r from-fuchsia-500/10 to-purple-600/10 rounded-xl p-4 border border-fuchsia-500/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-fuchsia-500/20 rounded-lg flex items-center justify-center">
                <FiZap className="text-fuchsia-400" size={16} />
              </div>
              <span className="text-sm text-fuchsia-300">Sending to:</span>
            </div>
            <p className="font-medium text-white text-lg">
              {selectedFriend?.name}
            </p>
            <p className="text-xs text-gray-400 font-mono bg-black/20 px-2 py-1 rounded mt-2 break-all">
              {selectedFriend?.pubkey}
            </p>
          </div>

          {/* Quick TBC Token Button */}
          <div className="flex justify-center">
            <button
              onClick={tryTBCToken}
              className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 rounded-xl hover:from-blue-500/30 hover:to-cyan-600/30 transition-all duration-300 flex items-center space-x-2"
            >
              <span className="text-lg">🪙</span>
              <span className="font-medium">Use TBC Token</span>
            </button>
          </div>

          {/* Token Address Input */}
          <div>
            <label className="block text-sm font-medium text-fuchsia-300 mb-3">
              Token Contract Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={tokenAddress}
                onChange={handleTokenAddressChange}
                placeholder="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
                className="w-full px-4 py-3 bg-[#0E0B12]/60 backdrop-blur-sm border border-fuchsia-500/20 rounded-xl text-white placeholder-gray-400 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 font-mono text-sm transition-all duration-300"
              />
              {loadingTokenInfo && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="relative">
                    <FiLoader
                      className="animate-spin text-fuchsia-400"
                      size={18}
                    />
                    <div className="absolute inset-0 bg-fuchsia-400/20 rounded-full blur-sm animate-spin"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Token Info Display */}
          {tokenInfo && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FiCheck className="text-green-400" size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-300 text-lg">
                      {tokenInfo.name}
                    </h4>
                    <p className="text-green-400 text-sm">
                      ({tokenInfo.symbol})
                    </p>
                  </div>
                </div>
                <button
                  onClick={openTokenOnExplorer}
                  className="p-2 text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-all duration-300"
                >
                  <FiExternalLink size={16} />
                </button>
              </div>

              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-green-400 text-sm mb-1">Your Balance</p>
                <p className="font-medium text-white text-xl">
                  {parseFloat(userBalance).toLocaleString()} {tokenInfo.symbol}
                </p>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-fuchsia-300 mb-3">
              Amount {tokenInfo && `(${tokenInfo.symbol})`}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.0"
                className="w-full px-4 py-3 bg-[#0E0B12]/60 backdrop-blur-sm border border-fuchsia-500/20 rounded-xl text-white placeholder-gray-400 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 pr-20 transition-all duration-300"
                disabled={!tokenInfo}
              />
              {tokenInfo && userBalance && parseFloat(userBalance) > 0 && (
                <button
                  onClick={setMaxAmount}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium bg-fuchsia-500/10 hover:bg-fuchsia-500/20 px-3 py-1 rounded-lg transition-all duration-300"
                >
                  MAX
                </button>
              )}
            </div>
          </div>

          {/* Network Info */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-600/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <FiShield className="text-yellow-400" size={16} />
              </div>
              <div>
                <p className="text-yellow-300 font-medium text-sm">
                  Direct Transfer
                </p>
                <p className="text-yellow-200/80 text-xs">
                  Tokens will be sent directly to the wallet address
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#0E0B12]/60 border border-fuchsia-500/20 text-gray-300 rounded-xl hover:bg-fuchsia-500/10 hover:text-white transition-all duration-300"
            >
              Cancel
            </button>

            <button
              onClick={handleSendTokens}
              disabled={!tokenInfo || !amount || isPending || isConfirming}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-cyan-500/40"
            >
              {isPending || isConfirming ? (
                <>
                  <div className="relative mr-3">
                    <FiLoader className="animate-spin" size={16} />
                    <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-sm animate-spin"></div>
                  </div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <BiTransfer className="mr-2" size={16} />
                  <span>Send Tokens</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
          /* Custom scrollbar */
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }

          .overflow-y-auto::-webkit-scrollbar-track {
            background: rgba(14, 11, 18, 0.3);
          }

          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #d946ef, #9333ea);
            border-radius: 3px;
          }

          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #c026d3, #7c3aed);
          }

          /* Enhanced focus styles */
          input:focus {
            outline: none;
          }

          /* Animation enhancements */
          @keyframes modal-appear {
            0% {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .modal-enter {
            animation: modal-appear 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default TokenTransferModal;
