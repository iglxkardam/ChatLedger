import { useState } from "react";
import { motion } from "framer-motion";
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
            ? "bg-blue-500 shadow-lg shadow-blue-500/30"
            : "bg-gray-300"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        peer-focus:ring-2 peer-focus:ring-blue-500/20
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
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
      </div>
    </label>
  );

  // Setting row component
  const SettingRow = ({ icon, title, description, checked, onChange, color }) => {
    const colorClasses = {
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      blue: "bg-blue-100 text-blue-600",
    };

    return (
      <div className="flex items-center justify-between group">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
    );
  };

  return (
    <motion.div 
      className="min-h-full bg-messenger-chat-bg text-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
          {/* Header */}
          <motion.header 
            className="mb-8"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <FiSettings className="text-white" size={24} />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-4xl sm:text-5xl font-bold text-gray-900"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Settings
                </motion.h1>
                <motion.div 
                  className="flex items-center space-x-2 mt-2"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Customize your ChatDapp experience</span>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Notifications Section */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiBell className="text-blue-600" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Manage your alert preferences
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">ACTIVE</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <SettingRow
                icon={<FiBell size={18} />}
                title="Push Notifications"
                description="Receive notifications for new messages"
                checked={notifications}
                onChange={setNotifications}
                color="green"
              />

              <SettingRow
                icon={soundEnabled ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}
                title="Sound Effects"
                description="Play sound when receiving messages"
                checked={soundEnabled}
                onChange={setSoundEnabled}
                color="purple"
              />

              <SettingRow
                icon={showOnlineStatus ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                title="Show Online Status"
                description="Let friends see when you're online"
                checked={showOnlineStatus}
                onChange={setShowOnlineStatus}
                color="orange"
              />
            </div>
          </motion.section>

          {/* Privacy & Security Section */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiShield className="text-green-600" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Privacy & Security
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Your data protection settings
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">SECURE</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <SettingRow
                icon={<FiLock size={18} />}
                title="End-to-End Encryption"
                description="Encrypt all messages for maximum security"
                checked={encryptMessages}
                onChange={setEncryptMessages}
                color="red"
              />

              <SettingRow
                icon={<FiRefreshCw size={18} />}
                title="Auto Backup"
                description="Automatically backup your data to IPFS"
                checked={autoBackup}
                onChange={setAutoBackup}
                color="blue"
              />

              {/* Network Information */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiGlobe className="text-gray-600" size={16} />
                    <h3 className="font-medium text-gray-900">Contract Address</h3>
                  </div>
                  <p className="text-sm text-gray-600 font-mono bg-white p-3 rounded-lg border border-gray-200 break-all">
                    {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1234...5678"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <h3 className="font-medium text-gray-900">Network</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {process.env.NEXT_PUBLIC_CHAIN_NAME || "Ethereum"} (Chain ID:{" "}
                      {process.env.NEXT_PUBLIC_CHAIN_ID || "1"})
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                      <h3 className="font-medium text-gray-900">RPC URL</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-mono truncate">
                      {process.env.NEXT_PUBLIC_RPC_URL ||
                        "https://mainnet.infura.io/..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Help & Support Section */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FiHelpCircle className="text-purple-600" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Help & Support
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Get help and learn how to use ChatDapp
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">ONLINE</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {[
                {
                  title: "How to add friends?",
                  description: "Learn how to connect with other users",
                  icon: FiBell,
                  color: "blue",
                },
                {
                  title: "Sending media files",
                  description: "Upload and share images, videos, and audio",
                  icon: FiDownload,
                  color: "green",
                },
                {
                  title: "AVAX and Token transfers",
                  description: "Send cryptocurrency through chat",
                  icon: FiShield,
                  color: "orange",
                },
                {
                  title: "Privacy & Security Guide",
                  description: "Understanding ChatDapp's security features",
                  icon: FiLock,
                  color: "red",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                const colorClasses = {
                  blue: "bg-blue-100 text-blue-600",
                  green: "bg-green-100 text-green-600",
                  orange: "bg-orange-100 text-orange-600",
                  red: "bg-red-100 text-red-600",
                };
                return (
                  <button
                    key={index}
                    className="w-full group bg-white hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 p-4 transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${colorClasses[item.color]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <FiChevronRight
                        className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
                        size={16}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.section>

          {/* App Information */}
          <motion.section 
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <FiInfo className="text-cyan-600" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    App Information
                  </h2>
                  <p className="text-gray-500 text-sm">Version and build details</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">LATEST</span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">v0.0.0</p>
                <p className="text-gray-500 text-sm">Version</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">IGLxKARDAM</p>
                <p className="text-gray-500 text-sm">Developer</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-600">2025</p>
                <p className="text-gray-500 text-sm">Year</p>
              </div>
            </div>
          </motion.section>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Settings page scrollbar */
        .settings-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .settings-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .settings-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }

        .settings-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        /* Ensure settings scrollbar is always visible when needed */
        .settings-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f5f9;
        }

        /* Enhanced toggle animations */
        @keyframes toggle-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
          }
        }

        .toggle-active {
          animation: toggle-glow 2s ease-in-out infinite;
        }

        /* Focus enhancements */
        button:focus,
        input:focus {
          outline: 2px solid rgba(59, 130, 246, 0.6);
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
    </motion.div>
  );
};

export default Settings;
