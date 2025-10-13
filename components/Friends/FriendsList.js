import { useState, useEffect, useMemo, useRef } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "react-hot-toast";
import {
  FiUserPlus,
  FiUser,
  FiMessageCircle,
  FiSearch,
  FiUsers,
  FiX,
  FiCheck,
  FiStar,
  FiZap,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import Avatar from "../Common/Avatar";

/* =========================================================================
   FriendsList — Messenger.com Style Design
   ========================================================================= */

const FriendsList = ({ onStartChat, hideSection }) => {
  const { address } = useAccount();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendsWithProfilePics, setFriendsWithProfilePics] = useState([]);
  const [loadingProfilePics, setLoadingProfilePics] = useState(false);

  // Reads
  const { data: friendsList, refetch: refetchFriends } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getMyFriendList",
    account: address,
  });

  const { data: allUsers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getAllAppUser",
  });

  // Add friend
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Friend added successfully!");
      setShowAddFriend(false);
      refetchFriends();
    }
  }, [isConfirmed, refetchFriends]);

  /* ---------------- Profile pictures (kept intact) ---------------- */
  useEffect(() => {
    const fetchFriendsWithProfilePics = async () => {
      if (!friendsList || friendsList.length === 0) {
        setFriendsWithProfilePics([]);
        return;
      }
      setLoadingProfilePics(true);
      try {
        const friendsWithPics = await Promise.all(
          friendsList.map(async (friend) => {
            try {
              const response = await fetch("/api/getProfilePicture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  address: friend.pubkey,
                  contractAddress: CONTRACT_ADDRESS,
                }),
              });
              if (response.ok) {
                const data = await response.json();
                return { ...friend, profilePicture: data.profilePicture || "" };
              } else {
                return { ...friend, profilePicture: "" };
              }
            } catch (err) {
              console.error(`Error fetching profile for ${friend.name}:`, err);
              return { ...friend, profilePicture: "" };
            }
          })
        );
        setFriendsWithProfilePics(friendsWithPics);
      } catch (e) {
        console.error("Error fetching friends profile pictures:", e);
        setFriendsWithProfilePics(
          friendsList.map((f) => ({ ...f, profilePicture: "" }))
        );
      } finally {
        setLoadingProfilePics(false);
      }
    };
    fetchFriendsWithProfilePics();
  }, [friendsList]);

  // Lightweight fallback (unchanged logic)
  useEffect(() => {
    if (friendsList && friendsList.length > 0) {
      const withEmptyPics = friendsList.map((f) => ({
        ...f,
        profilePicture: "",
      }));
      setFriendsWithProfilePics(withEmptyPics);
    }
  }, [friendsList]);

  const handleAddFriend = (user) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ChatAppABI,
      functionName: "addFriend",
      args: [user.accountAddress, user.name],
    });
  };

  /* ------------------- Derived UI collections ------------------- */
  const filteredFriends = useMemo(() => {
    const list = friendsWithProfilePics || [];
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((f) => f.name.toLowerCase().includes(q));
  }, [friendsWithProfilePics, searchTerm]);

  const potentialFriends = useMemo(() => {
    const users = allUsers || [];
    const q = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.accountAddress !== address &&
        !friendsList?.some((f) => f.pubkey === u.accountAddress) &&
        u.name.toLowerCase().includes(q)
    );
  }, [allUsers, friendsList, address, searchTerm]);

  /* ------------------- Reveal on scroll (3D) ------------------- */
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll(".reveal3d"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("revealed");
        }),
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <motion.div 
      ref={rootRef} 
      className="flex h-full flex-col bg-messenger-chat-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      {hideSection && (
        <motion.div 
          className="bg-white border-b border-gray-200 px-6 py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="space-y-6">
            {/* Title Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Live</span>
                <span className="text-gray-500">•</span>
                <span>Friends</span>
                <span className="text-gray-500">•</span>
                <span>Connect</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">
                Friends
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Connect with friends and start conversations instantly
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
            </div>

            {/* Add Friend Button */}
            <div className="text-center">
              <button
                onClick={() => setShowAddFriend((v) => !v)}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {showAddFriend ? <FiX size={18} /> : <FiUserPlus size={18} />}
                {showAddFriend ? "Cancel" : "Add Friend"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Friends Section */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div 
            className="bg-white border-b border-gray-200 px-6 py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUserPlus className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New Friends</h3>
                  <p className="text-sm text-gray-600">Discover and connect with users</p>
                </div>
              </div>
              
              <div className="max-h-80 space-y-2 overflow-y-auto p-6">
                {potentialFriends.length > 0 ? (
                  potentialFriends.map((u, index) => (
                    <motion.div 
                      key={u.accountAddress} 
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          profilePicture=""
                          name={u.name}
                          address={u.accountAddress}
                          size="md"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-sm text-gray-500 font-mono">
                            {u.accountAddress.slice(0, 6)}…{u.accountAddress.slice(-4)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddFriend(u)}
                        disabled={isPending || isConfirming}
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                      >
                        {isPending || isConfirming ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <FiCheck size={16} />
                            Add
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiUser className="text-gray-400" size={32} />
                    </div>
                    <div className="text-lg text-gray-900 font-medium">No users found</div>
                    <div className="text-sm text-gray-500">Try adjusting your search or check back later</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friends List */}
      <motion.div 
        className="flex-1 bg-white flex flex-col min-h-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Friends</h3>
              <p className="text-sm text-gray-600">{filteredFriends.length} connections</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Online
          </div>
        </div>

        {loadingProfilePics && (
          <div className="px-6 py-8 text-center flex-shrink-0">
            <div className="inline-flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-xl">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
              <span className="text-gray-700 font-medium">Loading profile pictures...</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 friends-scrollbar">
          <div className="p-6 space-y-3">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((f, index) => (
                <motion.div 
                  key={f.pubkey} 
                  className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 rounded-lg p-4 transition-colors duration-200 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar
                        profilePicture={f.profilePicture}
                        name={f.name}
                        address={f.pubkey}
                        size="lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                        <div className="w-full h-full bg-green-500 rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <p className="text-lg font-medium text-gray-900">{f.name}</p>
                      <p className="text-sm text-gray-500 font-mono">
                        {f.pubkey.slice(0, 6)}…{f.pubkey.slice(-4)}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartChat(f)}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <FiMessageCircle size={16} />
                    Chat
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiUser className="text-gray-400" size={40} />
                </div>
                <div className="text-xl text-gray-900 font-medium mb-2">No friends yet</div>
                <div className="text-gray-600">Add some friends to start chatting</div>
                <div className="mt-4">
                  <button
                    onClick={() => setShowAddFriend(true)}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    <FiUserPlus size={18} />
                    Find Friends
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FriendsList;
