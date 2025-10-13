import { useState, useEffect, useRef, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
  useWalletClient,
  usePublicClient,
} from "wagmi";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiPaperclip,
  FiDollarSign,
  FiX,
  FiMoreVertical,
  FiDownload,
  FiPlay,
  FiPause,
  FiSmile,
  FiImage,
  FiFile,
  FiAlertTriangle,
  FiZap,
  FiExternalLink,
} from "react-icons/fi";
import { BiTransfer } from "react-icons/bi";
import { ChatAppABI, CONTRACT_ADDRESS, MESSAGE_TYPES } from "../../contracts/ChatApp";
import { uploadToPinata, getIPFSUrl } from "../../utils/pinata";
import TokenTransferModal from "./TokenTransferModal";
import Avatar from "../Common/Avatar";

const MessengerChatInterface = ({ selectedFriend, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  const [tempMessage, setTempMessage] = useState(null);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const [showGasWarning, setShowGasWarning] = useState(false);
  const [gasBalance, setGasBalance] = useState(null);
  const [autoConfirmEnabled, setAutoConfirmEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get wallet client for automatic signing
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  // State for automatic transaction handling
  const [autoTxHash, setAutoTxHash] = useState(null);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState(null);

  // Get user's gas balance (AVAX)
  const { data: balance } = useBalance({
    address: address,
  });

  // Check if user has enough gas for transactions
  const hasEnoughGas = useCallback(() => {
    if (!balance) return false;
    // Minimum 0.001 AVAX for gas fees (using viem format)
    const minGas = BigInt("1000000000000000"); // 0.001 AVAX in wei
    return balance.value >= minGas;
  }, [balance]);

  // Update gas balance state
  useEffect(() => {
    if (balance) {
      setGasBalance(balance.formatted);
      if (!hasEnoughGas()) {
        setShowGasWarning(true);
      }
    }
  }, [balance, hasEnoughGas]);

  // Helper function to encode contract function calls
  const encodeContractCall = useCallback((functionName, args) => {
    try {
      // Create contract interface for encoding
      const iface = new ethers.utils.Interface(ChatAppABI);
      return iface.encodeFunctionData(functionName, args);
    } catch (error) {
      console.error("Error encoding contract call:", error);
      return null;
    }
  }, []);

  // Function to send transaction automatically without MetaMask popup
  const sendAutoTransaction = useCallback(async (to, data, gas, gasPrice) => {
    try {
      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

      // Get current nonce using public client
      let nonce;
      try {
        if (publicClient) {
          nonce = await publicClient.getTransactionCount({ 
            address: address,
            blockTag: 'pending'
          });
        } else if (walletClient && walletClient.getTransactionCount) {
          nonce = await walletClient.getTransactionCount({ 
            address: address,
            blockTag: 'pending'
          });
        } else {
          throw new Error("No client available for nonce");
        }
      } catch (nonceError) {
        console.warn("Failed to get nonce, using 0:", nonceError);
        nonce = 0; // Fallback to 0 if nonce fetch fails
      }
      
      // Create transaction object
      const transaction = {
        to,
        data,
        gas,
        gasPrice,
        nonce,
        value: BigInt(0), // No ETH being sent
      };

      console.log("Sending automatic transaction:", transaction);

      // Send transaction directly through wallet client
      const hash = await walletClient.sendTransaction(transaction);
      
      console.log("Automatic transaction sent:", hash);
      setAutoTxHash(hash);
      
      toast.success("Message sent! Processing in background...");
      return hash;
      
    } catch (error) {
      console.error("Automatic transaction failed:", error);
      toast.error(`Failed to send message: ${error.message}`);
      throw error;
    }
  }, [walletClient, publicClient, address]);

  // Get friend address (support both pubkey and address properties)
  const friendAddress = selectedFriend?.pubkey || selectedFriend?.address;

  // Get messages from blockchain - only when a friend is selected
  const { data: messagesData, refetch: refetchMessages } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "readMessage",
    args: friendAddress ? [friendAddress] : undefined,
    account: address,
    query: {
      enabled: !!friendAddress && !!address, // Only fetch when both addresses are available
      refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
      refetchIntervalInBackground: true // Continue polling even when tab is not active
    }
  });

  // Debug contract and transaction status
  useEffect(() => {
    console.log("Contract info:", {
      contractAddress: CONTRACT_ADDRESS,
      address: address,
      selectedFriend: selectedFriend?.address,
      friendAddress: friendAddress
    });
  }, [selectedFriend, address, friendAddress]);

  // Debug messages data
  useEffect(() => {
    console.log("Messages data:", {
      messagesData,
      friendAddress,
      messagesCount: messagesData?.length || 0
    });
  }, [messagesData, friendAddress]);

  // Debug current messages state
  useEffect(() => {
    console.log("Current messages state:", {
      totalMessages: messages.length,
      tempMessages: messages.filter(m => m.isTemp).length,
      permanentMessages: messages.filter(m => !m.isTemp).length,
      messages: messages.map(m => ({ content: m.content, isTemp: m.isTemp, sender: m.sender }))
    });
  }, [messages]);

  useEffect(() => {
    console.log("Transaction status:", {
      hash,
      isPending,
      error,
      isConfirming,
      isConfirmed
    });
  }, [hash, isPending, error, isConfirming, isConfirmed]);

  // Get friend's profile picture
  const { data: friendProfilePicture } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getProfilePicture",
    args: friendAddress ? [friendAddress] : undefined,
    account: address,
  });

  // Get friend's username
  const { data: friendUsername } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getUsername",
    args: friendAddress ? [friendAddress] : undefined,
    account: address,
  });

  // Clear messages and state when switching to a different friend
  useEffect(() => {
    setMessages([]);
    setTempMessage(null);
    setUploading(false);
    setNewMessage("");
    setConfirmedTxHash(null); // Clear confirmed transaction hash
    console.log("Cleared messages for friend switch:", friendAddress);
  }, [friendAddress]);

  // Update messages when data changes (with deduplication for performance)
  useEffect(() => {
    if (messagesData && Array.isArray(messagesData) && friendAddress) {
      console.log("Updating messages with blockchain data:", messagesData.length, "messages");
      
      // Debug: Log message types
      messagesData.forEach((msg, index) => {
        console.log(`Message ${index}:`, {
          sender: msg.sender,
          content: msg.content,
          msgType: msg.msgType,
          timestamp: msg.timestamp,
          amount: msg.amount,
          messageTypeName: Object.keys(MESSAGE_TYPES).find(key => MESSAGE_TYPES[key] === parseInt(msg.msgType))
        });
      });
      
      setMessages(prev => {
        console.log("Previous messages count:", prev.length);
        
        // Keep all existing permanent messages
        const permanentMessages = prev.filter(msg => !msg.isTemp);
        
        // Keep temporary messages that haven't been confirmed yet
        const tempMessages = prev.filter(tempMsg => {
          if (!tempMsg.isTemp) return false;
          
          // Check if this temporary message has been confirmed by blockchain
          const isConfirmed = messagesData.some(blockchainMsg => 
            blockchainMsg.sender === tempMsg.sender &&
            blockchainMsg.content === tempMsg.content &&
            Math.abs((typeof blockchainMsg.timestamp === 'bigint' ? Number(blockchainMsg.timestamp) : blockchainMsg.timestamp) - tempMsg.timestamp) < 60
          );
          
          return !isConfirmed; // Keep temp message only if not confirmed
        });
        
        // Add new blockchain messages that don't already exist
        const newMessages = messagesData.filter(blockchainMsg => {
          return !permanentMessages.some(permanentMsg => 
            permanentMsg.sender === blockchainMsg.sender &&
            permanentMsg.content === blockchainMsg.content &&
            Math.abs((typeof permanentMsg.timestamp === 'bigint' ? Number(permanentMsg.timestamp) : permanentMsg.timestamp) - (typeof blockchainMsg.timestamp === 'bigint' ? Number(blockchainMsg.timestamp) : blockchainMsg.timestamp)) < 60
          );
        });
        
        // Combine all messages
        const allMessages = [...permanentMessages, ...tempMessages, ...newMessages];
        
        console.log("Final message counts:", {
          permanent: permanentMessages.length,
          temp: tempMessages.length,
          new: newMessages.length,
          total: allMessages.length
        });
        
        // Sort by timestamp
        return allMessages.sort((a, b) => {
          const timestampA = typeof a.timestamp === 'bigint' ? Number(a.timestamp) : a.timestamp;
          const timestampB = typeof b.timestamp === 'bigint' ? Number(b.timestamp) : b.timestamp;
          return timestampA - timestampB;
        });
      });
    }
  }, [messagesData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time updates are now handled by refetchInterval in useReadContract
  // This ensures automatic polling every 2 seconds for new messages

  // Handle successful transaction (both manual and automatic)
  useEffect(() => {
    if (isConfirmed || autoTxHash) {
      if (isConfirmed) {
        toast.success("Message sent successfully!");
        setConfirmedTxHash(hash || autoTxHash); // Track confirmed transaction
      }
      setNewMessage("");
      setUploading(false);
      setTransferAmount("");
      setTransferMessage("");
      setShowTransferModal(false);
      
      // Don't remove temporary messages immediately - let them persist until blockchain data arrives
      // This prevents the flicker effect
      setIsProcessingMessage(false);
      setIsAutoSending(false);
      
      // Refetch messages to get the latest from blockchain
      setTimeout(() => {
        refetchMessages();
      }, 1000); // Small delay to ensure blockchain has updated
    }
  }, [isConfirmed, autoTxHash, hash, refetchMessages]);

  // Handle transaction error (both manual and automatic)
  useEffect(() => {
    if (error) {
      toast.error("Failed to send message");
      setUploading(false);
      setTempMessage(null);
      setIsProcessingMessage(false);
      setIsAutoSending(false);
    }
  }, [error]);

  // Cleanup effect when friend changes
  useEffect(() => {
    // Clear temporary messages when switching friends
    setTempMessage(null);
    setUploading(false);
  }, [friendAddress]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || isPending) return;

    // Check gas balance before sending
    if (!hasEnoughGas()) {
      setShowGasWarning(true);
      toast.error("Insufficient gas balance. Please add AVAX to your wallet.");
      return;
    }

    console.log("Sending message:", {
      message: newMessage.trim(),
      selectedFriend: selectedFriend?.pubkey || selectedFriend?.address,
      address: address,
      contractAddress: CONTRACT_ADDRESS,
      messageType: MESSAGE_TYPES.TEXT,
      gasBalance: gasBalance
    });

    const messageText = newMessage.trim();
    setNewMessage("");
    
    // Add temporary message for optimistic UI
    const tempMsg = {
      id: Date.now(),
      sender: address,
      content: messageText,
      msgType: MESSAGE_TYPES.TEXT,
      timestamp: Math.floor(Date.now() / 1000),
      isTemp: true
    };
    setTempMessage(tempMsg);
    setMessages(prev => [...prev, tempMsg]);

    try {
      if (!CONTRACT_ADDRESS) {
        throw new Error("Contract address is not defined");
      }
      
      const friendAddress = selectedFriend?.pubkey || selectedFriend?.address;
      if (!friendAddress) {
        throw new Error("Selected friend address is not defined");
      }
      
      if (!address) {
        throw new Error("User address is not defined");
      }
      
      setIsProcessingMessage(true);
      
      // Try automatic transaction first, fallback to regular writeContract
      try {
        setIsAutoSending(true);
        
        // Encode the contract call data for automatic transaction
        const callData = encodeContractCall("sendMessage", [friendAddress, messageText]);
        if (!callData) {
          throw new Error("Failed to encode contract call");
        }
        
        // Send transaction automatically without MetaMask popup
        await sendAutoTransaction(
          CONTRACT_ADDRESS,
          callData,
          BigInt(200000), // Fixed gas limit for chat messages
          BigInt("1000000000") // 1 gwei gas price for faster confirmation
        );
        
        console.log("Automatic transaction sent successfully");
      } catch (autoError) {
        console.warn("Automatic transaction failed, falling back to regular writeContract:", autoError);
        setIsAutoSending(false);
        
        // Fallback to regular writeContract (will show MetaMask popup)
        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: ChatAppABI,
          functionName: 'sendMessage',
          args: [friendAddress, messageText],
        });
        
        console.log("Regular writeContract sent successfully");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(`Failed to send message: ${error.message}`);
      setTempMessage(null);
      setMessages(prev => prev.filter(msg => msg.id !== tempMsg.id));
      setIsProcessingMessage(false);
      setIsAutoSending(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !selectedFriend || isPending) return;

    setUploading(true);
    
    try {
      // Upload file to IPFS
      const result = await uploadToPinata(file);
      
      if (result.success) {
        // Add temporary message for optimistic UI
        const tempMsg = {
          id: Date.now(),
          sender: address,
          content: result.ipfsHash,
          msgType: file.type.startsWith('image/') ? MESSAGE_TYPES.IMAGE : MESSAGE_TYPES.FILE,
          timestamp: Math.floor(Date.now() / 1000),
          isTemp: true,
          fileName: file.name,
          fileSize: file.size
        };
        setTempMessage(tempMsg);
        setMessages(prev => [...prev, tempMsg]);

        // Send message with IPFS hash
        const friendAddress = selectedFriend?.pubkey || selectedFriend?.address;
        
        let messageType = MESSAGE_TYPES.IMAGE;
        if (file.type.startsWith("video/")) messageType = MESSAGE_TYPES.VIDEO;
        else if (file.type.startsWith("audio/")) messageType = MESSAGE_TYPES.AUDIO;

        const metadata = {
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        };

        writeContract({
          address: CONTRACT_ADDRESS,
          abi: ChatAppABI,
          functionName: "sendMediaMessage",
          args: [
            friendAddress,
            result.ipfsHash,
            messageType,
            JSON.stringify(metadata),
          ],
        });
      } else {
        toast.error("Failed to upload file");
        setUploading(false);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendEth = () => {
    if (!transferAmount || !transferMessage.trim()) {
      toast.error("Please enter amount and message");
      return;
    }

    const friendAddress = selectedFriend?.pubkey || selectedFriend?.address;
    
    // Add temporary message for optimistic UI
    const tempMsg = {
      id: Date.now(),
      sender: address,
      content: transferMessage.trim(),
      msgType: MESSAGE_TYPES.ETH_TRANSFER,
      amount: transferAmount,
      message: transferMessage.trim(),
      timestamp: Math.floor(Date.now() / 1000),
      isTemp: true
    };
    setTempMessage(tempMsg);
    setMessages(prev => [...prev, tempMsg]);
    
    // Clear the transfer modal
    setTransferAmount("");
    setTransferMessage("");
    setShowTransferModal(false);
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ChatAppABI,
      functionName: "sendEthWithMessage",
      args: [friendAddress, transferMessage],
      value: ethers.utils.parseEther(transferAmount),
    });
  };


  const formatTime = (timestamp) => {
    const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    const date = new Date(timestampNum * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    const date = new Date(timestampNum * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = useCallback((msg, index) => {
    const isOwn = msg.sender === address;
    const messageType = parseInt(msg.msgType);
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDate = !prevMessage || formatDate(msg.timestamp) !== formatDate(prevMessage.timestamp);
    const showAvatar = !prevMessage || prevMessage.sender !== msg.sender || formatDate(msg.timestamp) !== formatDate(prevMessage.timestamp);
    
    // Performance optimization: only render visible messages
    if (msg.isTemp && !msg.content) return null;

    return (
      <div key={msg.id || index}>
        {showDate && (
          <div className="flex justify-center my-4">
            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatDate(msg.timestamp)}
            </span>
          </div>
        )}
        
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
          <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {!isOwn && showAvatar && (
              <Avatar
                profilePicture={friendProfilePicture}
                name={friendUsername || selectedFriend?.address}
                address={selectedFriend?.address}
                size="sm"
              />
            )}
            
            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-3 rounded-2xl max-w-xs lg:max-w-md transition-all duration-200 ${
                  isOwn
                    ? 'message-bubble-sender rounded-br-md ml-auto'
                    : 'message-bubble-receiver rounded-bl-md'
                } ${msg.isTemp && !confirmedTxHash ? 'opacity-70' : msg.isTemp && confirmedTxHash ? 'opacity-85' : ''}`}
              >
                {messageType === MESSAGE_TYPES.TEXT && (
                  <p className={`text-sm break-words leading-relaxed ${
                    isOwn ? 'message-text-sender' : 'message-text-receiver'
                  }`}>{msg.content}</p>
                )}
                
                {messageType === MESSAGE_TYPES.IMAGE && (
                  <div className="max-w-xs">
                    <img
                      src={getIPFSUrl(msg.content)}
                      alt="Shared image"
                      className="rounded-lg max-w-full h-auto shadow-sm"
                      onError={(e) => {
                        e.target.src = "/logo.png";
                      }}
                    />
                  </div>
                )}
                
                {messageType === MESSAGE_TYPES.FILE && (
                  <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                    isOwn 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100'
                  }`}>
                    <FiFile className={isOwn ? 'text-white' : 'text-gray-600'} size={20} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isOwn ? 'text-white' : 'text-gray-800'
                      }`}>
                        {msg.fileName || "File"}
                      </p>
                      <p className={`text-xs ${
                        isOwn ? 'text-white opacity-75' : 'text-gray-500'
                      }`}>
                        {(msg.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <a
                      href={getIPFSUrl(msg.content)}
                      download={msg.fileName}
                      className={`p-1 rounded transition-colors ${
                        isOwn 
                          ? 'hover:bg-white hover:bg-opacity-20' 
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      <FiDownload className={isOwn ? 'text-white' : 'text-gray-600'} size={16} />
                    </a>
                  </div>
                )}

                {messageType === MESSAGE_TYPES.ETH_TRANSFER && (
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isOwn 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      isOwn ? 'bg-white bg-opacity-20' : 'bg-green-100'
                    }`}>
                      <FiDollarSign className={isOwn ? 'text-white' : 'text-green-600'} size={20} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isOwn ? 'text-white' : 'text-gray-800'
                      }`}>
                        AVAX Transfer
                      </p>
                      <p className={`text-sm ${
                        isOwn ? 'text-white opacity-90' : 'text-gray-600'
                      }`}>
                        {isOwn ? 'Sent' : 'Received'} <span className="transfer-amount">{msg.amount ? (typeof msg.amount === 'bigint' ? (Number(msg.amount) / 1e18).toFixed(4) : parseFloat(msg.amount).toFixed(4)) : '0'} AVAX</span>
                      </p>
                      {(msg.message || msg.content) && (
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-white opacity-75' : 'text-gray-500'
                        }`}>
                          "{msg.message || msg.content}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {messageType === MESSAGE_TYPES.TOKEN_TRANSFER && (
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isOwn 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      isOwn ? 'bg-white bg-opacity-20' : 'bg-blue-100'
                    }`}>
                      <FiDollarSign className={isOwn ? 'text-white' : 'text-blue-600'} size={20} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isOwn ? 'text-white' : 'text-gray-800'
                      }`}>
                        Token Transfer
                      </p>
                      <p className={`text-sm ${
                        isOwn ? 'text-white opacity-90' : 'text-gray-600'
                      }`}>
                        {isOwn ? 'Sent' : 'Received'} <span className="transfer-amount">{msg.amount || '0'} {msg.tokenSymbol || 'Tokens'}</span>
                      </p>
                      {(msg.message || msg.content) && (
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-white opacity-75' : 'text-gray-500'
                        }`}>
                          "{msg.message || msg.content}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`flex items-center space-x-1 mt-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <span className={`text-xs ${
                  isOwn ? 'timestamp-sender' : 'timestamp-receiver'
                }`}>
                  {formatTime(msg.timestamp)}
                </span>
                {isOwn && (
                  <div className="flex items-center space-x-1">
                    {msg.isTemp ? (
                      <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse"></div>
                    ) : (
                      <div className="w-2 h-2 bg-white bg-opacity-80 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [address, friendProfilePicture, friendUsername, selectedFriend, messages]);

  if (!selectedFriend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-messenger-chat-bg">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSmile className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to ChatLedger
          </h3>
          <p className="text-gray-600">
            Select a friend to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col h-full bg-messenger-chat-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
            <Avatar
              profilePicture={friendProfilePicture}
              name={friendUsername || friendAddress || "Unknown User"}
              address={friendAddress || ""}
              size="md"
            />
            <div>
              <h2 className="font-semibold text-gray-900">
                {friendUsername || (friendAddress ? 
                  friendAddress.slice(0, 6) + "..." + friendAddress.slice(-4) : 
                  "Unknown User"
                )}
              </h2>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Gas Balance Indicator */}
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
              hasEnoughGas() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <FiZap size={14} />
              <span>{gasBalance || "0.00"} AVAX</span>
            </div>
            
            <button
              onClick={() => setShowTransferModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Send ETH"
            >
              <FiDollarSign size={20} />
            </button>
            <button
              onClick={() => setShowTokenModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Send Token"
            >
              <BiTransfer size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <FiMoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-1">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderMessage(msg, index)}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div
          className={`flex items-end space-x-3 p-3 border-2 rounded-2xl transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || uploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <FiPaperclip size={20} />
          </button>
          
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none border-none bg-transparent outline-none text-gray-900 placeholder-gray-500 max-h-32"
            rows={1}
            disabled={isPending || uploading}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isPending || uploading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <FiSend size={20} />
          </button>
        </div>
        
        {uploading && (
          <div className="mt-2 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {/* AVAX Transfer Modal */}
      {showTransferModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <FiDollarSign className="text-green-600" size={16} />
                  </div>
                  Send AVAX
                </h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Amount (AVAX)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Message
                  </label>
                  <input
                    type="text"
                    value={transferMessage}
                    onChange={(e) => setTransferMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Payment for..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEth}
                    disabled={isPending || isConfirming}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isPending || isConfirming ? "Sending..." : "Send AVAX"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Transfer Modal */}
      {showTokenModal && (
        <TokenTransferModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          recipient={friendAddress || ""}
          recipientName={friendUsername || friendAddress || "Unknown User"}
        />
      )}

      {/* Gas Warning Popup */}
      <AnimatePresence>
        {showGasWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowGasWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <FiZap className="text-red-600" size={32} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Insufficient Gas Balance
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                You need more AVAX in your wallet to send messages. Your current balance is{" "}
                <span className="font-semibold">{gasBalance || "0"} AVAX</span>.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FiAlertTriangle className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How to add AVAX:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Buy AVAX from an exchange</li>
                      <li>Transfer AVAX to your wallet address</li>
                      <li>Use a bridge to transfer from another network</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowGasWarning(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowGasWarning(false);
                    // Open external link to buy AVAX
                    window.open("https://www.coinbase.com/buy/avalanche", "_blank");
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FiExternalLink className="mr-2" size={16} />
                  Buy AVAX
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MessengerChatInterface;