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
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import Avatar from "../Common/Avatar";

/* =========================================================================
   FriendsList — Cyberpunk Neural Network (No logic changed)
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
    <div ref={rootRef} className="relative flex h-full flex-col space-y-6 overflow-hidden">
      {/* Header */}
      {hideSection && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300">
              <span className="h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse" />
              Live
              <span className="text-gray-400">• friends • search • chat</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Friends Hub
            </h1>
            <p className="text-gray-400">Manage connections and start chats instantly.</p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search friends…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-[#0E0B12]/60 backdrop-blur-sm border border-fuchsia-500/20 rounded-xl text-white placeholder-gray-400 focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowAddFriend((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-all duration-300
              border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/20 hover:scale-105`}
            >
              {showAddFriend ? <FiX size={16} /> : <FiUserPlus size={16} />}
              {showAddFriend ? "Cancel" : "Add Friend"}
            </button>
          </div>
        </div>
      )}

      {/* Add Friends picker */}
      {showAddFriend && (
        <div className="bg-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-fuchsia-500/20 shadow-lg">
          <div className="flex items-center gap-3 border-b border-fuchsia-500/20 px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/20 flex items-center justify-center">
              <FiUserPlus className="text-fuchsia-400" size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Add New Friends</h3>
              <p className="text-sm text-gray-400">Discover and connect with users</p>
            </div>
          </div>
          
          <div className="max-h-80 space-y-3 overflow-y-auto p-6">
            {potentialFriends.length > 0 ? (
              potentialFriends.map((u) => (
                <div key={u.accountAddress} className="flex items-center justify-between rounded-xl border border-fuchsia-500/20 bg-[#0E0B12]/40 p-4 hover:bg-fuchsia-500/10 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Avatar
                      profilePicture=""
                      name={u.name}
                      address={u.accountAddress}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="font-mono text-sm text-gray-400">
                        {u.accountAddress.slice(0, 6)}…{u.accountAddress.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddFriend(u)}
                    disabled={isPending || isConfirming}
                    className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-fuchsia-300 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/20 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-500/20 border-t-fuchsia-500" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <FiCheck size={16} />
                        Add
                      </>
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full border border-crypto-border bg-crypto-panel flex items-center justify-center">
                  <FiUser className="text-crypto-text-muted" size={32} />
                </div>
                <div className="text-lg text-crypto-text">No users found</div>
                <div className="text-sm text-crypto-text-muted">Try adjusting your search or check back later.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-crypto-panel backdrop-blur-xl rounded-2xl border border-crypto-border shadow-lg flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-crypto-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-crypto-ring-2/20 border border-crypto-border flex items-center justify-center">
              <FiUsers className="text-crypto-ring-2" size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-crypto-text">Your Friends</h3>
              <p className="text-sm text-crypto-text-muted">{filteredFriends.length} connections</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-crypto-border bg-crypto-panel px-3 py-1 text-crypto-ring">
            <span className="h-2 w-2 animate-pulse rounded-full bg-crypto-ring" />
            Live
          </div>
        </div>

        {loadingProfilePics && (
          <div className="px-6 py-5 text-center">
            <div className="mx-auto inline-flex items-center gap-3 rounded-xl border border-crypto-border bg-crypto-panel px-4 py-3 text-crypto-text">
              <div className="relative">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-crypto-ring/30 border-t-crypto-ring" />
                <div className="absolute inset-0 rounded-full border-2 border-crypto-ring/10" />
              </div>
              Loading profile pictures…
            </div>
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((f) => (
              <div key={f.pubkey} className="flex items-center justify-between rounded-xl border border-crypto-border bg-black/10 p-4 hover:bg-black/20 transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      profilePicture={f.profilePicture}
                      name={f.name}
                      address={f.pubkey}
                      size="lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-crypto-ring-2 to-crypto-ring rounded-full border-2 border-crypto-bg">
                      <div className="absolute inset-0.5 bg-gradient-to-r from-crypto-ring-2 to-crypto-ring rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-lg font-medium text-crypto-text">{f.name}</p>
                    <p className="font-mono text-sm text-crypto-text-muted">
                      {f.pubkey.slice(0, 6)}…{f.pubkey.slice(-4)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-crypto-ring animate-pulse" />
                      <span className="text-xs text-crypto-ring">Online</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onStartChat(f)}
                  className="inline-flex items-center gap-2 rounded-xl border border-crypto-border bg-crypto-panel px-4 py-2 text-crypto-ring-2 hover:border-crypto-ring-2 hover:bg-crypto-ring-2/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <FiMessageCircle size={16} />
                  Chat
                </button>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full border border-crypto-border bg-crypto-panel flex items-center justify-center">
                <FiUser className="text-crypto-ring-2" size={32} />
              </div>
              <div className="text-lg text-crypto-text">No friends yet</div>
              <div className="text-sm text-crypto-text-muted">Add some friends to start chatting.</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default FriendsList;
