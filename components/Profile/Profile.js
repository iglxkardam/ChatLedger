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
} from "react-icons/fi";
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
    <div className="space-y-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-fuchsia-500/5 to-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-600/5 to-fuchsia-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(217,70,239,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Floating particles */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-fuchsia-400/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30">
          <FiUser className="text-fuchsia-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-400">Manage your ChatDapp identity</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-fuchsia-500/20 shadow-2xl shadow-purple-600/10 overflow-hidden">
        {/* Card background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-purple-600/5"></div>

        <div className="relative z-10 p-8">
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
                <h2 className="text-3xl font-bold text-white mb-2">
                  {username || (
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <div className="w-6 h-6 border-2 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin"></div>
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  )}
                </h2>

                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                  <p className="text-gray-300 text-sm font-mono bg-[#0E0B12]/40 px-3 py-1 rounded-lg border border-fuchsia-500/20">
                    {address
                      ? `${address.slice(0, 10)}...${address.slice(-8)}`
                      : ""}
                  </p>

                  <button
                    onClick={copyAddress}
                    className="p-2 text-gray-400 hover:text-fuchsia-300 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 rounded-lg border border-fuchsia-500/20 transition-all duration-300 hover:scale-110"
                    title="Copy address"
                  >
                    <FiCopy size={14} />
                  </button>

                  <button
                    onClick={openInExplorer}
                    className="p-2 text-gray-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/20 transition-all duration-300 hover:scale-110"
                    title="View on explorer"
                  >
                    <FiExternalLink size={14} />
                  </button>
                </div>

                {/* Status indicators */}
                <div className="flex items-center justify-center lg:justify-start space-x-4">
                  <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm">Online</span>
                  </div>

                  <div className="flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1">
                    <FiShield className="text-blue-400" size={14} />
                    <span className="text-blue-300 text-sm">Verified</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <button className="px-4 py-2 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 border border-fuchsia-500/30 text-fuchsia-300 rounded-xl hover:from-fuchsia-500/30 hover:to-purple-600/30 transition-all duration-300 flex items-center space-x-2">
                  <FiEdit2 size={16} />
                  <span>Edit Profile</span>
                </button>

                <button className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 rounded-xl hover:from-blue-500/30 hover:to-cyan-600/30 transition-all duration-300 flex items-center space-x-2">
                  <FiActivity size={16} />
                  <span>Activity</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-xl shadow-blue-600/10 p-6 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <FiUsers className="text-blue-400" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-blue-300 mb-2">
            {stats.totalFriends}
          </h3>
          <p className="text-gray-400">Friends Connected</p>
          <div className="mt-2 text-xs text-blue-400/60">+2 this week</div>
        </div>

        <div className="bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-xl shadow-green-600/10 p-6 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
            <FiMessageCircle className="text-green-400" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-green-300 mb-2">
            {stats.totalMessages}
          </h3>
          <p className="text-gray-400">Messages Sent</p>
          <div className="mt-2 text-xs text-green-400/60">+15 today</div>
        </div>

        <div className="bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-600/10 p-6 text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
            <FiCalendar className="text-purple-400" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-purple-300 mb-2">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </h3>
          <p className="text-gray-400">Member Since</p>
          <div className="mt-2 text-xs text-purple-400/60">Early adopter</div>
        </div>
      </div>

      {/* Account Information */}
      <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-fuchsia-500/20 shadow-2xl shadow-purple-600/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/5 to-purple-600/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30">
              <FiShield className="text-fuchsia-400" size={18} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Account Information
              </h3>
              <p className="text-gray-400 text-sm">
                Your blockchain identity details
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-fuchsia-300 flex items-center space-x-2">
                <FiUser size={16} />
                <span>Username</span>
              </label>
              <div className="bg-[#0E0B12]/40 border border-fuchsia-500/20 rounded-xl p-4">
                <p className="text-white font-medium">
                  {username || "Loading..."}
                </p>
              </div>
            </div>

            {/* Network */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-blue-300 flex items-center space-x-2">
                <FiGlobe size={16} />
                <span>Network</span>
              </label>
              <div className="bg-[#0E0B12]/40 border border-blue-500/20 rounded-xl p-4">
                <p className="text-white font-medium">
                  {process.env.NEXT_PUBLIC_CHAIN_NAME || "Ethereum"}
                </p>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-3 lg:col-span-2">
              <label className="block text-sm font-medium text-purple-300 flex items-center space-x-2">
                <FiExternalLink size={16} />
                <span>Wallet Address</span>
              </label>
              <div className="bg-[#0E0B12]/40 border border-purple-500/20 rounded-xl p-4">
                <p className="text-white font-mono text-sm break-all">
                  {address}
                </p>
              </div>
            </div>

            {/* Profile Picture Status */}
            <div className="space-y-3 lg:col-span-2">
              <label className="block text-sm font-medium text-green-300 flex items-center space-x-2">
                <FiActivity size={16} />
                <span>Profile Picture Status</span>
              </label>
              <div className="bg-[#0E0B12]/40 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  {profilePicture ? (
                    <>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 font-medium">
                        ✓ Uploaded to IPFS
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-400">
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

      {/* Custom Styles */}
      <style jsx>{`
        /* Enhanced hover effects */
        @keyframes profile-glow {
          0%,
          100% {
            box-shadow: 0 10px 40px -10px rgba(217, 70, 239, 0.2);
          }
          50% {
            box-shadow: 0 15px 60px -10px rgba(217, 70, 239, 0.4);
          }
        }

        .group:hover {
          animation: profile-glow 2s ease-in-out infinite;
        }

        /* Loading animation */
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
      `}</style>
    </div>
  );
};

export default Profile;
