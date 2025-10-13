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
  FiSend,
  FiReceive,
  FiCalendar,
  FiRefreshCw,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { BiTransfer } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
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
      <motion.div 
        className="flex h-full flex-col bg-messenger-chat-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BiTransfer className="text-blue-600" size={24} />
          </div>
          <div>
              <h1 className="text-3xl font-bold text-gray-900">
              Transfer History
            </h1>
              <p className="text-gray-600">Loading your transaction history...</p>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Loading transfers...</p>
              <p className="text-gray-600">Please wait while we fetch your transaction history</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex h-full flex-col bg-messenger-chat-bg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className="bg-white border-b border-gray-200 px-6 py-6 flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BiTransfer className="text-blue-600" size={24} />
          </div>
          <div>
              <h1 className="text-3xl font-bold text-gray-900">
              Transfer History
            </h1>
              <p className="text-gray-600">
              Track your AVAX and token transactions
            </p>
          </div>
        </div>

        {/* Export button */}
          <button className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200">
          <FiDownload size={16} />
          <span>Export CSV</span>
        </button>
      </div>
      </motion.div>

      {/* Hidden components to fetch data for each friend */}
      {friendsList?.map((friend) => (
        <FriendTransfers
          key={friend.pubkey}
          friend={friend}
          onTransfersLoaded={handleTransfersLoaded}
        />
      ))}

      {/* Transfer Statistics */}
      <motion.div 
        className="px-6 py-4 flex-shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiArrowUpRight className="text-red-600" size={24} />
          </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
            {transfers.filter((t) => !t.isReceived && t.type === "AVAX").length}
          </p>
            <p className="text-gray-600 font-medium">AVAX Sent</p>
            <div className="mt-2 text-sm text-red-600">
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

          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiArrowDownLeft className="text-green-600" size={24} />
          </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
            {transfers.filter((t) => t.isReceived && t.type === "AVAX").length}
          </p>
            <p className="text-gray-600 font-medium">AVAX Received</p>
            <div className="mt-2 text-sm text-green-600">
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

          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BiTransfer className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {process.env.NEXT_PUBLIC_NETWORK || "Ethereum"}
            </p>
            <p className="text-gray-600 font-medium">Network</p>
            <div className="mt-2 text-sm text-blue-600">Blockchain</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BiTransfer className="text-purple-600" size={24} />
        </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">TBC</p>
            <p className="text-gray-600 font-medium">Native Tokens</p>
            <div className="mt-2 text-sm text-purple-600">Various tokens</div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="px-6 py-2 flex-shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" size={16} />
            <span className="text-gray-700 text-sm font-medium">Filter by:</span>
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterType === type.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterDirection === direction.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {direction.label}
            </button>
          ))}
        </div>
      </div>
      </motion.div>

      {/* Transfer List */}
      <motion.div 
        className="flex-1 bg-white mx-6 mb-6 rounded-xl border border-gray-200 overflow-hidden min-h-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiActivity className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Transfers
                </h2>
                <p className="text-gray-600 text-sm">
                  {filteredTransfers.length} transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Scroll Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const scrollContainer = document.querySelector('.transfer-scrollbar');
                    if (scrollContainer) {
                      scrollContainer.scrollBy({ top: -100, behavior: 'smooth' });
                    }
                  }}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                  title="Scroll up"
                >
                  <FiChevronUp className="text-gray-600" size={16} />
                </button>
                <button
                  onClick={() => {
                    const scrollContainer = document.querySelector('.transfer-scrollbar');
                    if (scrollContainer) {
                      scrollContainer.scrollBy({ top: 100, behavior: 'smooth' });
                    }
                  }}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                  title="Scroll down"
                >
                  <FiChevronDown className="text-gray-600" size={16} />
                </button>
              </div>

              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer items */}
        <div className="flex-1 overflow-y-auto min-h-0 transfer-scrollbar">
          <div className="p-6 space-y-4">
          {filteredTransfers.length > 0 ? (
            filteredTransfers.map((transfer, index) => (
                <motion.div
                key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-4">
                  <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      transfer.isReceived
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transfer.isReceived ? (
                        <FiArrowDownLeft size={20} />
                    ) : (
                        <FiArrowUpRight size={20} />
                    )}
                  </div>

                  <div>
                      <p className="font-medium text-gray-900">
                      {transfer.isReceived ? "Received from" : "Sent to"}{" "}
                        <span className="text-blue-600">
                        {transfer.friendName}
                      </span>
                    </p>
                      <p className="text-sm text-gray-600 mt-1">
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
                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FiDollarSign className="text-orange-600" size={14} />
                      </div>
                    ) : (
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BiTransfer className="text-blue-600" size={14} />
                      </div>
                    )}
                    <span
                      className={`font-bold text-lg ${
                          transfer.isReceived ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transfer.isReceived ? "+" : "-"}
                      {formatAmount(transfer)}
                    </span>
                  </div>
                  {transfer.type === "TOKEN" && (
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {transfer.tokenAddress?.slice(0, 6)}...
                      {transfer.tokenAddress?.slice(-4)}
                    </p>
                  )}
                </div>
                </motion.div>
            ))
          ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BiTransfer className="text-gray-400" size={40} />
              </div>
                <p className="text-gray-900 text-lg font-medium mb-2">No transfers found</p>
                <p className="text-gray-600 text-sm">
                Start sending AVAX or tokens to see your history!
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default TransferHistory;
