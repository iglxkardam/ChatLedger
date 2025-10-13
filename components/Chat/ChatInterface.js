import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";
import { encryptTextFor, decryptTextPayload, encryptFileFor, decryptFileBlob, getOrCreateMyKeypair, getMyPublicKeyB64, getFriendMessagingKeyB64, setFriendMessagingKeyB64 } from "../../utils/crypto";
import {
  FiSend,
  FiPaperclip,
  FiDollarSign,
  FiX,
  FiMoreVertical,
  FiDownload,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import { BiTransfer } from "react-icons/bi";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import { MESSAGE_TYPES } from "../../utils/constants";
import { uploadToPinata, getIPFSUrl } from "../../utils/pinata";
import { formatTokenAmount } from "../../utils/tokenUtils";
import TokenTransferModal from "./TokenTransferModal";
import Avatar from "../Common/Avatar";

const ChatInterface = ({ selectedFriend, onBack }) => {
  const [friendKeyB64, setFriendKeyB64] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [friendKeyInput, setFriendKeyInput] = useState("");
  const [decryptedText, setDecryptedText] = useState({});
  const { address } = useAccount();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferMessage, setTransferMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Get messages
  const { data: messagesData, refetch: refetchMessages } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "readMessage",
    args: [selectedFriend?.pubkey],
    account: address,
  });

  // Contract write hooks
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Message sent!");
      setMessage("");
      setTransferAmount("");
      setTransferMessage("");
      setShowTransferModal(false);
      refetchMessages();
    }
  }, [isConfirmed, refetchMessages]);

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  // Ensure I have a messaging keypair and load friend's messaging key if present
  useEffect(() => {
    try { getOrCreateMyKeypair(); } catch (e) {}
  }, []);

  useEffect(() => {
    if (!selectedFriend?.pubkey) return;
    const k = getFriendMessagingKeyB64(selectedFriend.pubkey);
    setFriendKeyB64(k);
  }, [selectedFriend]);

  // Auto-decrypt text messages
  useEffect(() => {
    if (!messages) return;
    
    messages.forEach((msg, index) => {
      const messageType = parseInt(msg.msgType);
      if (messageType === MESSAGE_TYPES.TEXT && typeof msg.content === "string" && msg.content.startsWith("cid:")) {
        const cid = msg.content.slice(4);
        if (!decryptedText[index]) {
          fetchAndDecryptText(cid).then(t => {
            setDecryptedText(prev => ({...prev, [index]: t}));
          }).catch(e => {
            console.error("Decryption failed for message", index, e);
            setDecryptedText(prev => ({...prev, [index]: "[Decryption failed]"}));
          });
        }
      }
    });
  }, [messages, decryptedText]);
const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!friendKeyB64) { toast.error("Add friend messaging key first"); setShowKeyModal(true); return; }

    // 1) Encrypt
    const payload = encryptTextFor(friendKeyB64, message);
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const file = new File([blob], `msg-${Date.now()}.json`, { type: "application/json" });
    // 2) Upload encrypted payload to IPFS
    const up = await uploadToPinata(file);
    if (!up?.success) { toast.error("IPFS upload failed"); return; }
    const cidTag = `cid:${up.ipfsHash}`;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ChatAppABI,
      functionName: "sendMessage",
      args: [selectedFriend?.pubkey, cidTag],
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      if (!friendKeyB64) { toast.error("Add friend messaging key first"); setShowKeyModal(true); setUploading(false); return; }
      // Encrypt file on client
      const { cipherFile, meta } = await encryptFileFor(friendKeyB64, file);
      const result = await uploadToPinata(cipherFile);
      if (result.success) {
        let messageType = MESSAGE_TYPES.IMAGE;
        if (file.type.startsWith("video/")) messageType = MESSAGE_TYPES.VIDEO;
        else if (file.type.startsWith("audio/"))
          messageType = MESSAGE_TYPES.AUDIO;

        const metadata = {
          ...meta,
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
            selectedFriend?.pubkey,
            result.ipfsHash,
            messageType,
            JSON.stringify(metadata),
          ],
        });
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  
  // Decrypt a text message given a cid reference like "cid:Qm..."
  async function fetchAndDecryptText(cid, senderPubB64) {
    try {
      const url = getIPFSUrl(cid);
      const res = await fetch(url);
      const payload = await res.json();
      const text = decryptTextPayload(payload);
      return text;
    } catch (e) {
      console.error("decrypt text failed", e);
      return "[decrypt failed]";
    }
  }

  async function decryptAndOpenMedia(msg) {
    try {
      const meta = JSON.parse(msg.metadata || "{}");
      if (!meta.encrypted) {
        window.open(getIPFSUrl(msg.content), "_blank");
        return;
      }
      const res = await fetch(getIPFSUrl(msg.content));
      const buf = await res.arrayBuffer();
      const blob = await decryptFileBlob(meta, buf);
      const url = URL.createObjectURL(blob);
      // Try to open in a new tab; also provide a download fallback
      const a = document.createElement("a");
      a.href = url;
      a.download = meta.origName || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error("Media decrypt failed", e);
      toast.error("Decrypt failed");
    }
  }
const handleSendAvax = () => {
    if (!transferAmount || !transferMessage.trim()) {
      toast.error("Please enter amount and message");
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ChatAppABI,
      functionName: "sendAvaxWithMessage",
      args: [selectedFriend?.pubkey, transferMessage],
      value: ethers.utils.parseEther(transferAmount),
    });
  };

  const handleTokenTransferSuccess = () => {
    refetchMessages();
  };

  const renderMessage = (msg, index) => {
    const isOwn = msg.sender === address;
    const messageType = parseInt(msg.msgType);

    return (
      <div
        key={index}
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-6 group`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl backdrop-blur-sm border relative transition-all duration-300 hover:scale-[1.02] ${
            isOwn
              ? "cyber-card border-accent-electric/40 text-accent-electric shadow-cyber"
              : "cyber-card border-accent-plasma/30 text-dark-200 shadow-neon"
          }`}
        >
          {/* Quantum message glow effect */}
          <div
            className={`absolute inset-0 rounded-xl ${
              isOwn
                ? "bg-gradient-to-r from-accent-electric/10 to-accent-plasma/10"
                : "bg-gradient-to-r from-accent-plasma/5 to-accent-quantum/5"
            } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          ></div>

          <div className="relative z-10">
            {messageType === MESSAGE_TYPES.TEXT && (
              <p className="leading-relaxed">{(typeof msg.content === "string" && msg.content.startsWith("cid:")) ? (decryptedText[index] || "Decrypting…") : msg.content}</p>
            )}

            {messageType === MESSAGE_TYPES.IMAGE && (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-fuchsia-500/20">
                  <img
                    src={JSON.parse(msg.metadata || "{}").encrypted ? undefined : getIPFSUrl(msg.content)}
                    alt="Shared image"
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {msg.metadata && (
                  <p className="text-xs opacity-60 flex items-center">
                    <FiDownload className="mr-1" size={12} />
                    {JSON.parse(msg.metadata).filename}{JSON.parse(msg.metadata || "{}").encrypted && (
                    <button onClick={() => decryptAndOpenMedia(msg)} className="ml-2 px-2 py-1 text-xs rounded bg-fuchsia-600/30 border border-fuchsia-500/40 hover:bg-fuchsia-600/50">Decrypt & Download</button>
                  )}
                  </p>
                )}
              </div>
            )}

            {messageType === MESSAGE_TYPES.VIDEO && (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-fuchsia-500/20">
                  <video
                    src={JSON.parse(msg.metadata || "{}").encrypted ? undefined : getIPFSUrl(msg.content)}
                    controls
                    className="w-full rounded-xl"
                  />
                </div>
                {msg.metadata && (
                  <p className="text-xs opacity-60 flex items-center">
                    <FiPlay className="mr-1" size={12} />
                    {JSON.parse(msg.metadata).filename}{JSON.parse(msg.metadata || "{}").encrypted && (
                    <button onClick={() => decryptAndOpenMedia(msg)} className="ml-2 px-2 py-1 text-xs rounded bg-fuchsia-600/30 border border-fuchsia-500/40 hover:bg-fuchsia-600/50">Decrypt & Download</button>
                  )}
                  </p>
                )}
              </div>
            )}

            {messageType === MESSAGE_TYPES.AUDIO && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-fuchsia-500/10 to-purple-600/10 rounded-xl p-3 border border-fuchsia-500/20">
                  <audio
                    src={JSON.parse(msg.metadata || "{}").encrypted ? undefined : getIPFSUrl(msg.content)}
                    controls
                    className="w-full"
                  />
                </div>
                {msg.metadata && (
                  <p className="text-xs opacity-60 flex items-center">
                    <FiPlay className="mr-1" size={12} />
                    {JSON.parse(msg.metadata).filename}{JSON.parse(msg.metadata || "{}").encrypted && (
                    <button onClick={() => decryptAndOpenMedia(msg)} className="ml-2 px-2 py-1 text-xs rounded bg-fuchsia-600/30 border border-fuchsia-500/40 hover:bg-fuchsia-600/50">Decrypt & Download</button>
                  )}
                  </p>
                )}
              </div>
            )}

            {messageType === MESSAGE_TYPES.AVAX_TRANSFER && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl p-3 border border-green-500/30">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                      <FiDollarSign className="text-green-400" size={16} />
                    </div>
                    <span className="font-bold text-green-300">
                      {ethers.utils.formatEther(msg.amount)} AVAX
                    </span>
                  </div>
                  <p className="text-gray-200">{(typeof msg.content === "string" && msg.content.startsWith("cid:")) ? (decryptedText[index] || "Decrypting…") : msg.content}</p>
                </div>
              </div>
            )}

            {messageType === MESSAGE_TYPES.TOKEN_TRANSFER && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl p-3 border border-blue-500/30">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                      <BiTransfer className="text-blue-400" size={16} />
                    </div>
                    <span className="font-bold text-blue-300">
                      {formatTokenAmount(msg.amount, 18)} Tokens
                    </span>
                  </div>
                  <p className="text-gray-200 mb-2">{msg.content}</p>
                  <p className="text-xs opacity-60 font-mono bg-black/20 px-2 py-1 rounded">
                    {msg.tokenAddress.slice(0, 6)}...
                    {msg.tokenAddress.slice(-4)}
                  </p>
                </div>
              </div>
            )}

            {/* Quantum Timestamp */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-accent-electric/20">
              <p className="text-xs text-dark-400 font-cyber">
                {new Date(parseInt(msg.timestamp) * 1000).toLocaleTimeString()}
              </p>
              {isOwn && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-accent-electric/60 rounded-full animate-pulse shadow-cyber"></div>
                  <div className="w-1 h-1 bg-accent-plasma/60 rounded-full animate-pulse delay-200 shadow-neon"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedFriend) {
    return (
      <div className="flex items-center justify-center h-full glass-panel border-crypto-border">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-crypto-ring/20 to-crypto-ring-2/20 rounded-full flex items-center justify-center mx-auto border border-crypto-border neon-glow">
            <FiSend className="text-crypto-ring" size={36} />
          </div>
          <div className="space-y-2">
            <p className="text-crypto-text text-xl">
              QUANTUM CHANNEL STANDBY
            </p>
            <p className="text-crypto-text-muted text-sm">
              Select a neural network node to initiate communication
            </p>
          </div>
          <div className="flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-crypto-ring/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-crypto-ring-2/60 rounded-full animate-pulse delay-200"></div>
            <div className="w-2 h-2 bg-crypto-ring/60 rounded-full animate-pulse delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full glass-panel-cyan border-crypto-border-cyan overflow-hidden">
      {/* Crypto Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-crypto-panel via-crypto-ring-2/5 to-crypto-panel backdrop-blur-xl border-b border-crypto-border-cyan">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="lg:hidden p-2 text-crypto-text-muted hover:text-crypto-ring glass-panel border-crypto-border hover:border-crypto-ring transition-all duration-300 hover:scale-110 neon-glow"
          >
            <FiX size={20} />
          </button>

          <div className="relative">
            <Avatar
              profilePicture={selectedFriend.profilePicture}
              name={selectedFriend.name}
              address={selectedFriend.pubkey}
              size="md"
            />
            {/* Quantum status indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-crypto-ring-2 to-crypto-ring rounded-full border-2 border-crypto-bg shadow-lg shadow-crypto-ring-2/50">
              <div className="absolute inset-0.5 bg-gradient-to-r from-crypto-ring-2 to-crypto-ring rounded-full animate-pulse pulse-glow"></div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-crypto-ring text-lg font-cyber">
              {selectedFriend.name}
            </h3>
            <p className="text-sm text-crypto-text-muted font-cyber">
              {`${selectedFriend.pubkey.slice(
                0,
                6
              )}...${selectedFriend.pubkey.slice(-4)}`}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-1.5 h-1.5 bg-crypto-ring rounded-full animate-pulse pulse-glow"></div>
              <span className="text-xs font-cyber text-crypto-ring">QUANTUM LINKED</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTransferModal(true)}
            className="bg-gradient-to-r from-crypto-ring-2 to-crypto-ring hover:from-crypto-ring-2/80 hover:to-crypto-ring/80 text-white px-4 py-2 rounded-lg shadow-lg shadow-crypto-ring-2/30 flex items-center text-sm font-bold font-cyber transition-all duration-300 hover:scale-105 border border-crypto-border-cyan neon-glow-cyan"
          >
            <FiDollarSign className="mr-2" size={16} />
            <span className="hidden sm:inline">AVAX</span>
          </button>
          <button
            onClick={() => setShowTokenModal(true)}
            className="bg-gradient-to-r from-crypto-ring to-crypto-ring-2 hover:from-crypto-ring/80 hover:to-crypto-ring-2/80 text-white px-4 py-2 rounded-lg shadow-lg shadow-crypto-ring/30 flex items-center text-sm font-bold font-cyber transition-all duration-300 hover:scale-105 border border-crypto-border neon-glow"
          >
            <BiTransfer className="mr-2" size={16} />
            <span className="hidden sm:inline">TOKENS</span>
          </button>
          <button className="p-2 text-crypto-text-muted hover:text-crypto-ring glass-panel border-crypto-border hover:border-crypto-ring transition-all duration-300 hover:scale-110 neon-glow">
            <FiMoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Quantum Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative">
        {/* Crypto background pattern */}
        <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-crypto-ring/5 via-transparent to-crypto-ring-2/5 pointer-events-none"></div>

        <div className="relative z-10">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-crypto-ring/20 to-crypto-ring-2/20 rounded-full flex items-center justify-center mx-auto border border-crypto-border neon-glow">
                  <FiSend className="text-crypto-ring" size={28} />
                </div>
                <div className="space-y-2">
                  <p className="text-crypto-text font-cyber text-lg">
                    QUANTUM CHANNEL READY
                  </p>
                  <p className="text-crypto-text-muted text-sm">
                    Initiate neural communication protocol
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-crypto-ring rounded-full animate-pulse pulse-glow"></div>
                  <div className="w-2 h-2 bg-crypto-ring-2 rounded-full animate-pulse delay-200 pulse-glow"></div>
                  <div className="w-2 h-2 bg-crypto-ring rounded-full animate-pulse delay-400 pulse-glow"></div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => renderMessage(msg, index))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quantum Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 sm:p-6 bg-gradient-to-r from-crypto-panel via-crypto-ring-2/5 to-crypto-panel backdrop-blur-xl border-t border-crypto-border-cyan"
      >
        <div className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isPending || isConfirming}
            className="p-3 text-crypto-text-muted hover:text-crypto-ring glass-panel border-crypto-border hover:border-crypto-ring transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:scale-100 neon-glow"
          >
            <FiPaperclip size={18} />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Transmit quantum message..."
              className="w-full px-4 py-3 bg-black/20 border border-crypto-border rounded-lg text-crypto-text placeholder-crypto-text-muted focus:border-crypto-ring focus:ring-2 focus:ring-crypto-ring/20 shadow-lg shadow-crypto-ring/10 transition-all duration-200"
            />
            {/* Quantum input glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-crypto-ring/5 to-crypto-ring-2/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || isPending || isConfirming}
            className="p-3 bg-gradient-to-r from-crypto-ring to-crypto-ring-2 hover:from-crypto-ring/80 hover:to-crypto-ring-2/80 text-white rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-crypto-ring/30 border border-crypto-border neon-glow"
          >
            <FiSend size={18} />
          </button>
        </div>
      </form>

      {/* AVAX Transfer Modal */}
      {showTransferModal && (
        <div className="absolute inset-0 bg-crypto-bg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl border-crypto-border shadow-2xl w-full max-w-md relative overflow-hidden">
            {/* Modal background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-crypto-ring/5 to-crypto-ring-2/5"></div>

            <div className="relative z-10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                    <FiDollarSign className="text-green-400" size={16} />
                  </div>
                  Send AVAX
                </h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="p-2 text-gray-400 hover:text-white bg-fuchsia-500/10 hover:bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/20 transition-all duration-300"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-fuchsia-300 mb-3">
                    Amount (AVAX)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0E0B12]/60 backdrop-blur-sm border border-fuchsia-500/20 rounded-xl text-white placeholder-gray-400 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20"
                    placeholder="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-fuchsia-300 mb-3">
                    Message
                  </label>
                  <input
                    type="text"
                    value={transferMessage}
                    onChange={(e) => setTransferMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0E0B12]/60 backdrop-blur-sm border border-fuchsia-500/20 rounded-xl text-white placeholder-gray-400 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20"
                    placeholder="Payment for..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 px-4 py-3 bg-[#0E0B12]/60 border border-fuchsia-500/20 text-gray-300 rounded-xl hover:bg-fuchsia-500/10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendAvax}
                    disabled={isPending || isConfirming}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-green-500/30"
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
      <TokenTransferModal
        selectedFriend={selectedFriend}
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSuccess={handleTokenTransferSuccess}
      />

      {/* File Upload Loading */}
      {uploading && (
        <div className="absolute inset-0 bg-crypto-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-crypto-panel backdrop-blur-xl rounded-2xl border border-crypto-border p-8 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-ring"></div>
                <div className="absolute inset-0 rounded-full border-2 border-crypto-ring/20"></div>
              </div>
              <span className="text-crypto-text font-medium">
                Uploading to IPFS...
              </span>
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

        /* Enhanced animations */
        @keyframes message-appear {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .message-enter {
          animation: message-appear 0.3s ease-out;
        }

        /* Audio/video controls styling */
        audio,
        video {
          background: rgba(14, 11, 18, 0.8);
          border-radius: 8px;
        }

        /* Focus enhancements */
        input:focus,
        button:focus {
          outline: none;
        }
      `}</style>
    
      {/* Friend Messaging Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-crypto-bg/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-crypto-panel backdrop-blur-xl border border-crypto-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-crypto-text mb-2">Add Friend Messaging Key</h3>
            <p className="text-sm text-crypto-text-muted mb-4">Ask your friend to share their <b>Messaging Public Key</b> (base64). Paste below once.</p>
            <textarea
              value={friendKeyInput}
              onChange={(e) => setFriendKeyInput(e.target.value.trim())}
              placeholder="Base64 public key"
              className="w-full p-3 rounded-xl bg-black/20 border border-crypto-border text-crypto-text placeholder-crypto-text-muted focus:border-crypto-ring focus:ring-2 focus:ring-crypto-ring/20 mb-4"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowKeyModal(false)} className="px-4 py-2 rounded-xl bg-black/20 border border-crypto-border text-crypto-text-muted hover:bg-black/30 transition-all duration-300">Cancel</button>
              <button
                onClick={() => { setFriendMessagingKeyB64(selectedFriend?.pubkey, friendKeyInput); setFriendKeyB64(friendKeyInput); setShowKeyModal(false); toast.success('Friend key saved'); }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-crypto-ring to-crypto-ring-2 hover:from-crypto-ring/80 hover:to-crypto-ring-2/80 text-white transition-all duration-300"
              >Save</button>
            </div>
            <div className="mt-4 text-xs text-crypto-text-muted">Your Messaging PubKey (share with friends): <code className="break-all text-crypto-ring">{getMyPublicKeyB64()}</code></div>
          </div>
        </div>
      )}
</div>
  );
};

export default ChatInterface;
