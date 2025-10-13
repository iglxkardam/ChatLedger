import { useState, useEffect } from "react";
import {
  FiSearch,
  FiMessageCircle,
  FiMoreVertical,
  FiSettings,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { BiTransfer } from "react-icons/bi";
import { useAccount, useReadContract } from "wagmi";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import Avatar from "../Common/Avatar";

const MessengerSidebar = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  onMobileMenuClose,
  onStartChat,
  selectedFriend,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [friendsWithProfilePics, setFriendsWithProfilePics] = useState([]);
  const [loadingProfilePics, setLoadingProfilePics] = useState(false);
  const { address } = useAccount();

  // Get user's profile picture and username
  const { data: userProfilePicture } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getProfilePicture",
    args: [address],
    account: address,
  });

  const { data: username } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getUsername",
    args: [address],
    account: address,
  });

  // Get friends list from contract
  const { data: friendsList, refetch: refetchFriends } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getMyFriendList",
    account: address,
  });

  // Fetch friends with profile pictures
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

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FiUser },
    { id: "chat", label: "Chat", icon: FiMessageCircle },
    { id: "friends", label: "Friends", icon: FiUser },
    { id: "transfers", label: "Transfers", icon: BiTransfer },
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  const handleMenuItemClick = (itemId) => {
    setActiveTab(itemId);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const filteredFriends = friendsWithProfilePics.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Messenger Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 z-50 left-0 z-40 w-80 h-screen
        bg-white border-r border-gray-200 
        transform transition-all duration-300 ease-out
        flex flex-col
        shadow-lg
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FiMessageCircle className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 font-messenger">
              ChatLedger
            </h1>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileMenuClose}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto messenger-scrollbar">
          <nav className="px-2 py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors duration-150
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`mr-3 ${
                      isActive ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Friends List */}
          {activeTab === "chat" && (
            <div className="px-2 py-2 border-t border-gray-200">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Conversations
                </h3>
              </div>
              <div className="space-y-1">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <div
                      key={friend.pubkey}
                      className={`
                        flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-150
                        ${
                          selectedFriend?.pubkey === friend.pubkey
                            ? "bg-blue-50"
                            : "hover:bg-gray-100"
                        }
                      `}
                      onClick={() => onStartChat(friend)}
                    >
                      <div className="relative mr-3">
                        <Avatar
                          profilePicture={friend.profilePicture}
                          name={friend.name}
                          address={friend.pubkey}
                          size="md"
                        />
                        <div className="online-indicator"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {friend.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {friend.pubkey.slice(0, 6)}...{friend.pubkey.slice(-4)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <FiMoreVertical className="text-gray-400" size={16} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <FiMessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-500">No conversations yet</p>
                    <p className="text-xs text-gray-400">Start a new chat with friends</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar
              profilePicture={userProfilePicture}
              name={username || "Your Account"}
              address={address}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {username || "Your Account"}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("settings")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Settings"
            >
              <FiSettings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={onMobileMenuClose}
        />
      )}
    </>
  );
};

export default MessengerSidebar;
