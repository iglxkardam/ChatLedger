import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  FiUser,
  FiEdit2,
  FiCopy,
  FiExternalLink,
  FiShield,
  FiActivity,
  FiCalendar,
  FiMessageCircle,
  FiUsers,
  FiGlobe,
  FiCheck,
  FiRefreshCw,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { getIPFSUrl } from "../../utils/pinata";

const Profile = () => {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState({
    totalFriends: 0,
    totalMessages: 0,
    joinDate: null,
  });

  // Get username
  const { data: username } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getUsername",
    args: [address],
    account: address,
  });

  // Get profile picture
  const { data: profilePicture, refetch: refetchProfilePicture } =
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: ChatAppABI,
      functionName: "getProfilePicture",
      args: [address],
      account: address,
    });

  // Get friends list for stats
  const { data: friendsList } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getMyFriendList",
    account: address,
  });

  useEffect(() => {
    if (friendsList) {
      setStats((prev) => ({
        ...prev,
        totalFriends: friendsList.length,
      }));
    }
  }, [friendsList]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  const openInExplorer = () => {
    const explorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER;
    window.open(`${explorerUrl}/address/${address}`, "_blank");
  };

  const handleProfilePictureUpdate = () => {
    refetchProfilePicture();
  };

  return (
    <motion.div 
      className="flex h-full flex-col bg-messenger-chat-bg overflow-y-auto profile-page-scrollbar"
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiUser className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Profile
              </h1>
              <p className="text-gray-600">Manage your ChatLedger identity</p>
            </div>
          </div>

          {/* Scroll Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const scrollContainer = document.querySelector('.profile-page-scrollbar');
                if (scrollContainer) {
                  scrollContainer.scrollBy({ top: -200, behavior: 'smooth' });
                }
              }}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
              title="Scroll up"
            >
              <FiChevronUp className="text-gray-600" size={16} />
            </button>
            <button
              onClick={() => {
                const scrollContainer = document.querySelector('.profile-page-scrollbar');
                if (scrollContainer) {
                  scrollContainer.scrollBy({ top: 200, behavior: 'smooth' });
                }
              }}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
              title="Scroll down"
            >
              <FiChevronDown className="text-gray-600" size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Profile Card */}
      <motion.div 
        className="bg-white mx-6 mt-6 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-8 lg:space-y-0 lg:space-x-8">
            {/* Profile Picture Section */}
            <div className="flex-shrink-0">
              <ProfilePictureUpload
                currentProfilePicture={profilePicture}
                userAddress={address}
                onUpdate={handleProfilePictureUpdate}
              />
            </div>

            {/* Profile Info Section */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              {/* Name and Address */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {username || (
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading...</span>
                    </div>
                  )}
                </h2>

                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                  <p className="text-gray-700 text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg">
                    {address
                      ? `${address.slice(0, 10)}...${address.slice(-8)}`
                      : ""}
                  </p>

                  <button
                    onClick={copyAddress}
                    className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="Copy address"
                  >
                    <FiCopy size={14} />
                  </button>

                  <button
                    onClick={openInExplorer}
                    className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="View on explorer"
                  >
                    <FiExternalLink size={14} />
                  </button>
                </div>

                {/* Status indicators */}
                <div className="flex items-center justify-center lg:justify-start space-x-4">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Online</span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                    <FiShield size={14} />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <button className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  <FiEdit2 size={16} />
                  <span>Edit Profile</span>
                </button>

                <button className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  <FiActivity size={16} />
                  <span>Activity</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="px-6 py-4 flex-shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-blue-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {stats.totalFriends}
            </h3>
            <p className="text-gray-600 font-medium">Friends Connected</p>
            <div className="mt-2 text-sm text-blue-600">+2 this week</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiMessageCircle className="text-green-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {stats.totalMessages}
            </h3>
            <p className="text-gray-600 font-medium">Messages Sent</p>
            <div className="mt-2 text-sm text-green-600">+15 today</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="text-purple-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </h3>
            <p className="text-gray-600 font-medium">Member Since</p>
            <div className="mt-2 text-sm text-purple-600">Early adopter</div>
          </div>
        </div>
      </motion.div>

      {/* Account Information */}
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiShield className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Account Information
                </h3>
                <p className="text-gray-600 text-sm">
                  Your blockchain identity details
                </p>
              </div>
            </div>

            {/* Scroll Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const scrollContainer = document.querySelector('.profile-scrollbar');
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
                  const scrollContainer = document.querySelector('.profile-scrollbar');
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 profile-scrollbar">
          <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FiUser size={16} />
                <span>Username</span>
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 font-medium">
                  {username || "Loading..."}
                </p>
              </div>
            </div>

            {/* Network */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FiGlobe size={16} />
                <span>Network</span>
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 font-medium">
                  {process.env.NEXT_PUBLIC_CHAIN_NAME || "Ethereum"}
                </p>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-3 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FiExternalLink size={16} />
                <span>Wallet Address</span>
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 font-mono text-sm break-all">
                  {address}
                </p>
              </div>
            </div>

            {/* Profile Picture Status */}
            <div className="space-y-3 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FiActivity size={16} />
                <span>Profile Picture Status</span>
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {profilePicture ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 font-medium">
                        ✓ Uploaded to IPFS
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-600">
                        No profile picture set
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
