import { useState } from "react";
import {
  FiMessageCircle,
  FiUsers,
  FiSettings,
  FiHome,
  FiSend,
  FiMenu,
  FiX,
  FiUser,
  FiZap,
  FiShield,
  FiActivity,
  FiCpu,
} from "react-icons/fi";
import { BiTransfer } from "react-icons/bi";

const Sidebar = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  onMobileMenuClose,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Quantum Hub", icon: FiHome, color: "accent-electric" },
    { id: "chat", label: "Neural Chat", icon: FiMessageCircle, color: "accent-plasma" },
    { id: "friends", label: "Network Nodes", icon: FiUsers, color: "accent-quantum" },
    { id: "transfers", label: "Data Streams", icon: BiTransfer, color: "accent-crystal" },
    { id: "profile", label: "Identity Matrix", icon: FiUser, color: "accent-neon" },
    { id: "settings", label: "System Config", icon: FiSettings, color: "cyber-500" },
  ];

  const handleMenuItemClick = (itemId) => {
    setActiveTab(itemId);
    // Close mobile menu when item is selected
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  return (
    <>
      {/* Cyberpunk Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 z-50 left-0 z-40 w-80 h-screen
        bg-dark-950/95 backdrop-blur-2xl border-r border-accent-electric/30 
        transform transition-all duration-500 ease-out
        flex flex-col
        shadow-2xl shadow-accent-electric/20
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Cyberpunk background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated cyber grid */}
          <div className="absolute inset-0 cyber-grid-bg opacity-20"></div>
          
          {/* Energy gradients */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-accent-electric/10 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-accent-plasma/10 via-transparent to-transparent"></div>

          {/* Floating cyber particles */}
          <div className="absolute top-20 left-8 w-2 h-2 bg-accent-electric/60 rounded-full animate-pulse shadow-cyber"></div>
          <div className="absolute top-40 right-12 w-1 h-1 bg-accent-plasma/60 rounded-full animate-ping delay-1000 shadow-neon"></div>
          <div className="absolute bottom-32 left-12 w-1.5 h-1.5 bg-accent-quantum/60 rounded-full animate-pulse delay-500 shadow-quantum"></div>
          <div className="absolute top-60 left-16 w-1 h-1 bg-accent-crystal/50 rounded-full animate-bounce-slow shadow-plasma"></div>

          {/* Holographic overlay */}
          <div className="absolute inset-0 holographic opacity-10"></div>
        </div>

        {/* Cyberpunk Header Section */}
        <div className="relative z-10 flex items-center justify-between h-24 bg-gradient-to-r from-dark-950/80 via-accent-electric/5 to-dark-950/80 border-b border-accent-electric/30 px-6 flex-shrink-0">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-electric to-accent-plasma flex items-center justify-center shadow-cyber">
                <FiCpu className="text-dark-950" size={16} />
              </div>
              <h1 className="text-2xl font-bold font-cyber quantum-text tracking-wider">
                CHATLEDGER
              </h1>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-0.5 bg-gradient-to-r from-accent-electric to-accent-plasma rounded-full"></div>
              <span className="text-xs font-cyber text-accent-electric">v2.0.1</span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-accent-plasma to-accent-electric rounded-full"></div>
            </div>
            <div className="mt-2 flex items-center justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-accent-electric rounded-full animate-pulse shadow-cyber"></div>
              <span className="text-xs font-cyber text-dark-400">QUANTUM ACTIVE</span>
              <div className="w-1.5 h-1.5 bg-accent-electric rounded-full animate-pulse delay-200 shadow-cyber"></div>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileMenuClose}
            className="lg:hidden p-2 text-dark-400 hover:text-accent-electric cyber-card border-accent-electric/30 hover:border-accent-electric/60 transition-all duration-300 hover:scale-110 neon-glow"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Cyberpunk Navigation Menu */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-8 px-4 space-y-3 relative z-10 pb-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`
                      w-full flex items-center px-6 py-4 text-left rounded-xl transition-all duration-300 relative overflow-hidden
                      ${
                        isActive
                          ? "cyber-card border-accent-electric/60 text-accent-electric shadow-cyber neon-glow"
                          : "cyber-card border-accent-electric/20 text-dark-300 hover:text-accent-electric hover:border-accent-electric/40 hover:shadow-cyber"
                      }
                    `}
                  >
                    {/* Active quantum indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-electric to-accent-plasma rounded-r-full shadow-cyber"></div>
                    )}

                    {/* Cyberpunk icon container */}
                    <div
                      className={`mr-4 p-2.5 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-accent-electric/30 to-accent-plasma/30 shadow-cyber"
                          : "group-hover:bg-accent-electric/10 border border-accent-electric/20"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "text-accent-electric"
                            : "group-hover:text-accent-electric"
                        }`}
                      />
                    </div>

                    {/* Cyberpunk label */}
                    <span
                      className={`font-medium font-cyber transition-all duration-300 ${
                        isActive ? "text-accent-electric" : "group-hover:text-accent-electric"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Quantum connection indicator */}
                    {isActive && (
                      <div className="ml-auto flex items-center space-x-1">
                        <div className="w-2 h-2 bg-accent-electric rounded-full animate-pulse shadow-cyber"></div>
                        <span className="text-xs font-cyber text-accent-electric">ACTIVE</span>
                      </div>
                    )}

                    {/* Holographic hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-electric/5 to-accent-plasma/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                    {/* Quantum ripple effect on click */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-electric/20 to-accent-plasma/20 opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-xl"></div>
                  </button>

                  {/* Cyberpunk connecting lines */}
                  {index < menuItems.length - 1 && (
                    <div className="ml-12 h-6 w-px bg-gradient-to-b from-accent-electric/20 via-accent-plasma/20 to-accent-electric/20 opacity-40"></div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Cyberpunk Bottom Section */}
        <div className="relative z-10 p-6 flex-shrink-0">
          {/* System status */}
          <div className="cyber-card border-accent-quantum/30 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-cyber text-accent-quantum">SYSTEM STATUS</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent-quantum rounded-full animate-pulse shadow-quantum"></div>
                <span className="text-xs font-cyber text-accent-quantum">ONLINE</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-dark-400">Neural Network:</span>
                <span className="text-accent-crystal font-cyber">OPTIMAL</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-400">Quantum Sync:</span>
                <span className="text-accent-electric font-cyber">99.7%</span>
              </div>
            </div>
          </div>

          {/* Energy line */}
          <div className="h-px bg-gradient-to-r from-transparent via-accent-electric/40 to-transparent mb-4"></div>
          
          {/* Cyberpunk footer */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-electric rounded-full animate-pulse shadow-cyber"></div>
              <div className="w-2 h-2 bg-accent-plasma rounded-full animate-pulse delay-200 shadow-neon"></div>
              <div className="w-2 h-2 bg-accent-quantum rounded-full animate-pulse delay-400 shadow-quantum"></div>
              <div className="w-2 h-2 bg-accent-crystal rounded-full animate-pulse delay-600 shadow-plasma"></div>
            </div>
            <div className="mt-2 text-xs font-cyber text-dark-500">
              QUANTUM CHANNEL SECURED
            </div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Custom Styles */}
      <style jsx>{`
        /* Cyberpunk scrollbar for navigation */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00f5ff, #ff0080);
          border-radius: 3px;
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #ff0080, #8b5cf6);
          box-shadow: 0 0 15px rgba(255, 0, 128, 0.6);
        }

        /* Enhanced focus states */
        button:focus {
          outline: 2px solid #00f5ff;
          outline-offset: 2px;
        }

        /* Ensure sidebar takes full height */
        .h-screen {
          height: 100vh;
          height: 100dvh; /* Dynamic viewport height for mobile */
        }

        /* Cyberpunk slide animations */
        @keyframes cyber-slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
            filter: blur(10px);
          }
          to {
            transform: translateX(0);
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes cyber-slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
            filter: blur(0);
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
            filter: blur(10px);
          }
        }

        /* Enhanced mobile responsiveness */
        @media (max-width: 1024px) {
          .sidebar-mobile {
            width: 320px;
          }
        }

        @media (max-width: 640px) {
          .sidebar-mobile {
            width: 100vw;
            max-width: 360px;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          button {
            min-height: 52px;
          }
        }

        /* Cyberpunk glow effects */
        .cyber-glow {
          box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
        }

        .neon-glow {
          box-shadow: 0 0 30px rgba(255, 0, 128, 0.4);
        }

        /* Quantum pulse animation */
        @keyframes quantum-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        .quantum-pulse {
          animation: quantum-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
