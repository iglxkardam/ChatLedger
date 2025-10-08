import { useState } from "react";
import {
  FiSettings,
  FiShield,
  FiBell,
  FiHelpCircle,
  FiVolume2,
  FiVolumeX,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiDownload,
  FiGlobe,
  FiLock,
  FiInfo,
  FiChevronRight,
} from "react-icons/fi";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [encryptMessages, setEncryptMessages] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // Custom toggle component
  const Toggle = ({ checked, onChange, disabled = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`
        relative w-14 h-7 rounded-full transition-all duration-300
        ${
          checked
            ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/30"
            : "bg-gray-600 border border-gray-500"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        peer-focus:ring-2 peer-focus:ring-fuchsia-500/20
      `}
      >
        <div
          className={`
          absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg
          ${checked ? "translate-x-7" : "translate-x-0"}
          flex items-center justify-center
        `}
        >
          {checked && (
            <div className="w-2 h-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full"></div>
          )}
        </div>
      </div>
    </label>
  );

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
      <div className="relative z-10 flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30">
          <FiSettings className="text-fuchsia-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400">Customize your ChatDapp experience</p>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl shadow-blue-600/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-cyan-600/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <FiBell className="text-blue-400" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Notifications
              </h2>
              <p className="text-gray-400 text-sm">
                Manage your alert preferences
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
                <FiBell className="text-green-400" size={18} />
              </div>
              <div>
                <p className="font-medium text-white">Push Notifications</p>
                <p className="text-sm text-gray-400">
                  Receive notifications for new messages
                </p>
              </div>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-violet-600/20 rounded-xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                {soundEnabled ? (
                  <FiVolume2 className="text-purple-400" size={18} />
                ) : (
                  <FiVolumeX className="text-purple-400" size={18} />
                )}
              </div>
              <div>
                <p className="font-medium text-white">Sound Effects</p>
                <p className="text-sm text-gray-400">
                  Play sound when receiving messages
                </p>
              </div>
            </div>
            <Toggle checked={soundEnabled} onChange={setSoundEnabled} />
          </div>

          <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                {showOnlineStatus ? (
                  <FiEye className="text-orange-400" size={18} />
                ) : (
                  <FiEyeOff className="text-orange-400" size={18} />
                )}
              </div>
              <div>
                <p className="font-medium text-white">Show Online Status</p>
                <p className="text-sm text-gray-400">
                  Let friends see when you're online
                </p>
              </div>
            </div>
            <Toggle checked={showOnlineStatus} onChange={setShowOnlineStatus} />
          </div>
        </div>
      </div>

      {/* Privacy & Security Section */}
      <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-2xl shadow-green-600/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-600/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <FiShield className="text-green-400" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Privacy & Security
              </h2>
              <p className="text-gray-400 text-sm">
                Your data protection settings
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Security Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-pink-600/20 rounded-xl flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform duration-300">
                  <FiLock className="text-red-400" size={18} />
                </div>
                <div>
                  <p className="font-medium text-white">
                    End-to-End Encryption
                  </p>
                  <p className="text-sm text-gray-400">
                    Encrypt all messages for maximum security
                  </p>
                </div>
              </div>
              <Toggle checked={encryptMessages} onChange={setEncryptMessages} />
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <FiRefreshCw className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="font-medium text-white">Auto Backup</p>
                  <p className="text-sm text-gray-400">
                    Automatically backup your data to IPFS
                  </p>
                </div>
              </div>
              <Toggle checked={autoBackup} onChange={setAutoBackup} />
            </div>
          </div>

          {/* Network Information */}
          <div className="space-y-4 pt-4 border-t border-green-500/20">
            <div className="bg-gradient-to-r from-[#0E0B12]/40 to-[#0E0B12]/20 backdrop-blur-sm rounded-xl border border-green-500/20 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <FiGlobe className="text-green-400" size={16} />
                <h3 className="font-medium text-green-300">Contract Address</h3>
              </div>
              <p className="text-sm text-gray-300 font-mono bg-black/20 p-3 rounded-lg border border-green-500/10 break-all">
                {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1234...5678"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-[#0E0B12]/40 to-[#0E0B12]/20 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <h3 className="font-medium text-blue-300">Network</h3>
                </div>
                <p className="text-sm text-gray-300">
                  {process.env.NEXT_PUBLIC_CHAIN_NAME || "Ethereum"} (Chain ID:{" "}
                  {process.env.NEXT_PUBLIC_CHAIN_ID || "1"})
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#0E0B12]/40 to-[#0E0B12]/20 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                  <h3 className="font-medium text-purple-300">RPC URL</h3>
                </div>
                <p className="text-sm text-gray-300 font-mono truncate">
                  {process.env.NEXT_PUBLIC_RPC_URL ||
                    "https://mainnet.infura.io/..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Support Section */}
      <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-600/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-violet-600/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-violet-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <FiHelpCircle className="text-purple-400" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Help & Support
              </h2>
              <p className="text-gray-400 text-sm">
                Get help and learn how to use ChatDapp
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {[
            {
              title: "How to add friends?",
              description: "Learn how to connect with other users",
              icon: FiBell,
              color:
                "from-blue-500/20 to-cyan-600/20 border-blue-500/30 text-blue-400",
            },
            {
              title: "Sending media files",
              description: "Upload and share images, videos, and audio",
              icon: FiDownload,
              color:
                "from-green-500/20 to-emerald-600/20 border-green-500/30 text-green-400",
            },
            {
              title: "AVAX and Token transfers",
              description: "Send cryptocurrency through chat",
              icon: FiShield,
              color:
                "from-orange-500/20 to-yellow-600/20 border-orange-500/30 text-orange-400",
            },
            {
              title: "Privacy & Security Guide",
              description: "Understanding ChatDapp's security features",
              icon: FiLock,
              color:
                "from-red-500/20 to-pink-600/20 border-red-500/30 text-red-400",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="w-full group bg-gradient-to-r from-[#0E0B12]/40 to-[#0E0B12]/20 backdrop-blur-sm rounded-xl border border-white/5 hover:border-purple-500/20 p-4 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <FiChevronRight
                    className="text-gray-400 group-hover:text-purple-400 transition-colors duration-300"
                    size={16}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* App Information */}
      <div className="relative z-10 bg-gradient-to-br from-[#0E0B12]/80 to-[#0E0B12]/60 backdrop-blur-xl rounded-2xl border border-fuchsia-500/20 shadow-2xl shadow-purple-600/10 overflow-hidden">
        <div className="p-6 border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/5 to-purple-600/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-fuchsia-500/30">
              <FiInfo className="text-fuchsia-400" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                App Information
              </h2>
              <p className="text-gray-400 text-sm">Version and build details</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-fuchsia-300">v0.0.0</p>
            <p className="text-gray-400 text-sm">Version</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-300">IGLxKARDAM</p>
            <p className="text-gray-400 text-sm">sachin</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-300">2025</p>
            <p className="text-gray-400 text-sm">Year</p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Enhanced toggle animations */
        @keyframes toggle-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(217, 70, 239, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(217, 70, 239, 0.5);
          }
        }

        .toggle-active {
          animation: toggle-glow 2s ease-in-out infinite;
        }

        /* Section hover effects */
        @keyframes section-glow {
          0%,
          100% {
            box-shadow: 0 10px 40px -10px rgba(217, 70, 239, 0.2);
          }
          50% {
            box-shadow: 0 15px 60px -10px rgba(217, 70, 239, 0.4);
          }
        }

        .section:hover {
          animation: section-glow 2s ease-in-out infinite;
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

        /* Focus enhancements */
        button:focus,
        input:focus {
          outline: 2px solid rgba(217, 70, 239, 0.6);
          outline-offset: 2px;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .mobile-stack {
            flex-direction: column;
            align-items: flex-start;
            space-y: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
