import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ethers } from "ethers";
import {
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiActivity,
  FiTrendingUp,
  FiFilter,
  FiDownload,
} from "react-icons/fi";
import { BiTransfer } from "react-icons/bi";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import { MESSAGE_TYPES } from "../../utils/constants";
import { formatTokenAmount } from "../../utils/tokenUtils";

const TransferHistory = () => {
  const { address } = useAccount();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // all, avax, token
  const [filterDirection, setFilterDirection] = useState("all"); // all, sent, received

  // Get friends list
  const { data: friendsList } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getMyFriendList",
    account: address,
  });

  // Create individual hooks for each friend's transfer data
  // We'll use a different approach to fetch transfer data
  useEffect(() => {
    const fetchAllTransfers = async () => {
      if (!friendsList || friendsList.length === 0) {
        setTransfers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const allTransfers = [];

      try {
        // We'll fetch transfers using the readContract approach instead of hooks in async
        for (const friend of friendsList) {
          try {
            // For now, we'll get all messages and filter them
            const allMessages = await window.ethereum?.request({
              method: "eth_call",
              params: [
                {
                  to: CONTRACT_ADDRESS,
                  data: getReadMessageCallData(friend.pubkey, address),
                },
                "latest",
              ],
            });

            // This is a simplified approach - in reality you'd need to properly decode the response
            // For now, let's use a simpler approach with state management
          } catch (error) {
            console.error(
              `Error fetching transfers for ${friend.name}:`,
              error
            );
          }
        }

        setTransfers(allTransfers);
      } catch (error) {
        console.error("Error fetching transfer history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransfers();
  }, [friendsList, address]);

  // Alternative approach: Use multiple useReadContract hooks for each friend
  // This is more React-friendly but less efficient for many friends
  const FriendTransfers = ({ friend, onTransfersLoaded }) => {
    const { data: allMessages } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: ChatAppABI,
      functionName: "readMessage",
      args: [friend.pubkey],
      account: address,
    });

    useEffect(() => {
      if (allMessages) {
        const transfers = allMessages
          .filter((msg) => {
            const messageType = parseInt(msg.msgType);
            return (
              messageType === MESSAGE_TYPES.AVAX_TRANSFER ||
              messageType === MESSAGE_TYPES.TOKEN_TRANSFER
            );
          })
          .map((msg) => ({
            ...msg,
            friendName: friend.name,
            type:
              parseInt(msg.msgType) === MESSAGE_TYPES.AVAX_TRANSFER
                ? "AVAX"
                : "TOKEN",
            isReceived: msg.sender !== address,
          }));

        onTransfersLoaded(friend.pubkey, transfers);
      }
    }, [allMessages, friend, onTransfersLoaded]);

    return null; // This component doesn't render anything
  };

  // State to collect transfers from all friends
  const [friendTransfers, setFriendTransfers] = useState({});

  const handleTransfersLoaded = (friendKey, transfers) => {
    setFriendTransfers((prev) => ({
      ...prev,
      [friendKey]: transfers,
    }));
  };

  // Combine all transfers and sort by timestamp
  useEffect(() => {
    const allTransfers = Object.values(friendTransfers)
      .flat()
      .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

    setTransfers(allTransfers);
    setLoading(false);
  }, [friendTransfers]);

  const formatAmount = (transfer) => {
    if (transfer.type === "AVAX") {
      return `${ethers.utils.formatEther(transfer.amount)} AVAX`;
    } else {
      return `${formatTokenAmount(transfer.amount, 18)} Tokens`;
    }
  };

  // Filter transfers based on selected filters
  const filteredTransfers = transfers.filter((transfer) => {
    const typeMatch =
      filterType === "all" ||
      (filterType === "avax" && transfer.type === "AVAX") ||
      (filterType === "token" && transfer.type === "TOKEN");

    const directionMatch =
      filterDirection === "all" ||
      (filterDirection === "sent" && !transfer.isReceived) ||
      (filterDirection === "received" && transfer.isReceived);

    return typeMatch && directionMatch;
  });

  if (loading) {
    return (
      <div className="space-y-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-fuchsia-500/5 to-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-600/5 to-fuchsia-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30">
            <BiTransfer className="text-fuchsia-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              Transfer History
            </h1>
            <p className="text-gray-400">Loading your transaction history...</p>
          </div>
        </div>

        <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-fuchsia-500/20 shadow-2xl shadow-purple-600/10 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BiTransfer
                  className="text-fuchsia-400 animate-pulse"
                  size={20}
                />
              </div>
            </div>
            <span className="ml-4 text-white font-medium">
              Loading transfer history...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-fuchsia-500/5 to-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-600/5 to-fuchsia-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(217,70,239,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-fuchsia-400/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30">
            <BiTransfer className="text-fuchsia-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              Transfer History
            </h1>
            <p className="text-gray-400">
              Track your AVAX and token transactions
            </p>
          </div>
        </div>

        {/* Export button */}
        <button className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 rounded-xl hover:from-blue-500/30 hover:to-cyan-600/30 transition-all duration-300 flex items-center space-x-2">
          <FiDownload size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Hidden components to fetch data for each friend */}
      {friendsList?.map((friend) => (
        <FriendTransfers
          key={friend.pubkey}
          friend={friend}
          onTransfersLoaded={handleTransfersLoaded}
        />
      ))}

      {/* Transfer Statistics */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-red-500/20 shadow-xl shadow-red-600/10 p-6 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500/20 to-pink-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30 group-hover:scale-110 transition-transform duration-300">
            <FiArrowUpRight className="text-red-400" size={28} />
          </div>
          <p className="text-3xl font-bold text-red-300 mb-2">
            {transfers.filter((t) => !t.isReceived && t.type === "AVAX").length}
          </p>
          <p className="text-gray-400">AVAX Sent</p>
          <div className="mt-2 text-xs text-red-400/60">
            {transfers
              .filter((t) => !t.isReceived && t.type === "AVAX")
              .reduce(
                (sum, t) =>
                  sum + parseFloat(ethers.utils.formatEther(t.amount)),
                0
              )
              .toFixed(4)}{" "}
            AVAX Total
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-xl shadow-green-600/10 p-6 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
            <FiArrowDownLeft className="text-green-400" size={28} />
          </div>
          <p className="text-3xl font-bold text-green-300 mb-2">
            {transfers.filter((t) => t.isReceived && t.type === "AVAX").length}
          </p>
          <p className="text-gray-400">AVAX Received</p>
          <div className="mt-2 text-xs text-green-400/60">
            {transfers
              .filter((t) => t.isReceived && t.type === "AVAX")
              .reduce(
                (sum, t) =>
                  sum + parseFloat(ethers.utils.formatEther(t.amount)),
                0
              )
              .toFixed(4)}{" "}
            AVAX Total
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-xl shadow-blue-600/10 p-6 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <BiTransfer className="text-blue-400" size={28} />
          </div>
          <p className="text-3xl font-bold text-blue-300 mb-2">
            {process.env.NEXT_PUBLIC_NETWORK}
          </p>
          <p className="text-gray-400">Network</p>
          <div className="mt-2 text-xs text-blue-400/60">Blockchain</div>
        </div>

        <div className="bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-600/10 p-6 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
            <BiTransfer className="text-purple-400" size={28} />
          </div>
          <p className="text-3xl font-bold text-purple-300 mb-2">TBC</p>
          <p className="text-gray-400">Native Tokens </p>
          <div className="mt-2 text-xs text-purple-400/60">Various tokens</div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400" size={16} />
          <span className="text-gray-300 text-sm">Filter by:</span>
        </div>

        <div className="flex space-x-2">
          {[
            { id: "all", label: "All Types" },
            { id: "avax", label: "AVAX Only" },
            { id: "token", label: "Tokens Only" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                filterType === type.id
                  ? "bg-gradient-to-r from-fuchsia-500/30 to-purple-600/30 border border-fuchsia-500/50 text-white"
                  : "bg-[#0E0B12]/40 border border-fuchsia-500/20 text-gray-400 hover:text-white hover:border-fuchsia-500/40"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          {[
            { id: "all", label: "All" },
            { id: "sent", label: "Sent" },
            { id: "received", label: "Received" },
          ].map((direction) => (
            <button
              key={direction.id}
              onClick={() => setFilterDirection(direction.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                filterDirection === direction.id
                  ? "bg-gradient-to-r from-blue-500/30 to-cyan-600/30 border border-blue-500/50 text-white"
                  : "bg-[#0E0B12]/40 border border-blue-500/20 text-gray-400 hover:text-white hover:border-blue-500/40"
              }`}
            >
              {direction.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer List */}
      <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-fuchsia-500/20 shadow-2xl shadow-purple-600/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/5 to-purple-600/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30">
                <FiActivity className="text-fuchsia-400" size={18} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Recent Transfers
                </h2>
                <p className="text-gray-400 text-sm">
                  {filteredTransfers.length} transactions
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-lg px-3 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm">Live</span>
            </div>
          </div>
        </div>

        {/* Transfer items */}
        <div className="p-6 max-h-96 overflow-y-auto space-y-4">
          {filteredTransfers.length > 0 ? (
            filteredTransfers.map((transfer, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-[#0E0B12]/40 to-[#0E0B12]/20 backdrop-blur-sm rounded-xl border border-white/5 hover:border-fuchsia-500/20 transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${
                      transfer.isReceived
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-green-500/30"
                        : "bg-gradient-to-r from-red-500/20 to-pink-600/20 border-red-500/30"
                    }`}
                  >
                    {transfer.isReceived ? (
                      <FiArrowDownLeft className="text-green-400" size={20} />
                    ) : (
                      <FiArrowUpRight className="text-red-400" size={20} />
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      {transfer.isReceived ? "Received from" : "Sent to"}{" "}
                      <span className="text-fuchsia-300">
                        {transfer.friendName}
                      </span>
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      {transfer.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(
                        parseInt(transfer.timestamp) * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    {transfer.type === "AVAX" ? (
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                        <FiDollarSign className="text-orange-400" size={14} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                        <BiTransfer className="text-blue-400" size={14} />
                      </div>
                    )}
                    <span
                      className={`font-bold text-lg ${
                        transfer.isReceived ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {transfer.isReceived ? "+" : "-"}
                      {formatAmount(transfer)}
                    </span>
                  </div>
                  {transfer.type === "TOKEN" && (
                    <p className="text-xs text-gray-500 font-mono bg-black/20 px-2 py-1 rounded">
                      {transfer.tokenAddress?.slice(0, 6)}...
                      {transfer.tokenAddress?.slice(-4)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-fuchsia-500/30">
                <BiTransfer className="text-fuchsia-400" size={40} />
              </div>
              <p className="text-gray-400 text-lg mb-2">No transfers found</p>
              <p className="text-gray-500 text-sm">
                Start sending AVAX or tokens to see your history!
              </p>
              <div className="flex space-x-1 justify-center mt-4">
                <div className="w-2 h-2 bg-fuchsia-400/40 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400/40 rounded-full animate-pulse delay-200"></div>
                <div className="w-2 h-2 bg-fuchsia-400/40 rounded-full animate-pulse delay-400"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Summary */}
      {transfers.length > 0 && (
        <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-fuchsia-500/20 shadow-2xl shadow-purple-600/10 overflow-hidden">
          <div className="p-6 border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/5 to-purple-600/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30">
                <FiTrendingUp className="text-fuchsia-400" size={18} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Transfer Summary
                </h2>
                <p className="text-gray-400 text-sm">
                  Your transaction overview
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AVAX Summary */}
            <div className="bg-gradient-to-r from-[#0E0B12]/40 to-[#0E0B12]/20 backdrop-blur-sm rounded-xl border border-orange-500/20 p-4">
              <h3 className="font-medium text-orange-300 mb-4 flex items-center">
                <FiDollarSign className="mr-2" size={16} />
                AVAX Transfers
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Sent:</span>
                  <span className="font-medium text-red-300">
                    {transfers
                      .filter((t) => !t.isReceived && t.type === "AVAX")
                      .reduce(
                        (sum, t) =>
                          sum + parseFloat(ethers.utils.formatEther(t.amount)),
                        0
                      )
                      .toFixed(4)}{" "}
                    AVAX
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Received:</span>
                  <span className="font-medium text-green-300">
                    {transfers
                      .filter((t) => t.isReceived && t.type === "AVAX")
                      .reduce(
                        (sum, t) =>
                          sum + parseFloat(ethers.utils.formatEther(t.amount)),
                        0
                      )
                      .toFixed(4)}{" "}
                    AVAX
                  </span>
                </div>
                <div className="pt-2 border-t border-orange-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Net Balance:</span>
                    <span className="font-bold text-orange-300">
                      {(
                        transfers
                          .filter((t) => t.isReceived && t.type === "AVAX")
                          .reduce(
                            (sum, t) =>
                              sum +
                              parseFloat(ethers.utils.formatEther(t.amount)),
                            0
                          ) -
                        transfers
                          .filter((t) => !t.isReceived && t.type === "AVAX")
                          .reduce(
                            (sum, t) =>
                              sum +
                              parseFloat(ethers.utils.formatEther(t.amount)),
                            0
                          )
                      ).toFixed(4)}{" "}
                      AVAX
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Summary */}
            <div className="bg-gradient-to-r from-[#0E0B12]/40 to-[#0E0B12]/20 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4">
              <h3 className="font-medium text-blue-300 mb-4 flex items-center">
                <BiTransfer className="mr-2" size={16} />
                Token Transfers
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tokens Sent:</span>
                  <span className="font-medium text-red-300">
                    {
                      transfers.filter(
                        (t) => !t.isReceived && t.type === "TOKEN"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tokens Received:</span>
                  <span className="font-medium text-green-300">
                    {
                      transfers.filter(
                        (t) => t.isReceived && t.type === "TOKEN"
                      ).length
                    }
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Transactions:</span>
                    <span className="font-bold text-blue-300">
                      {transfers.filter((t) => t.type === "TOKEN").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        /* Staggered animations */
        @keyframes slide-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .group {
          animation: slide-in-up 0.6s ease-out forwards;
        }

        /* Enhanced hover effects */
        @keyframes transfer-glow {
          0%,
          100% {
            box-shadow: 0 10px 40px -10px rgba(217, 70, 239, 0.2);
          }
          50% {
            box-shadow: 0 15px 60px -10px rgba(217, 70, 239, 0.4);
          }
        }

        .group:hover {
          animation: transfer-glow 2s ease-in-out infinite;
        }

        /* Filter button animations */
        @keyframes filter-pulse {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        .filter-active {
          animation: filter-pulse 2s ease-in-out infinite;
        }

        /* Loading shimmer effect */
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .loading-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(217, 70, 239, 0.1),
            transparent
          );
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }

        /* Focus enhancements */
        button:focus {
          outline: 2px solid rgba(217, 70, 239, 0.6);
          outline-offset: 2px;
        }

        /* Transfer amount animations */
        @keyframes amount-highlight {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .amount-animate {
          animation: amount-highlight 0.3s ease-in-out;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .mobile-stack {
            flex-direction: column;
            align-items: flex-start;
          }

          .mobile-full {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TransferHistory;
