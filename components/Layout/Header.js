import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { FiBell, FiSearch, FiMenu, FiZap, FiShield, FiActivity } from "react-icons/fi";
import CustomConnectButton from "./CustomConnectButton";

const Header = ({ onMenuClick, isMobileMenuOpen }) => {
  const { address, isConnected } = useAccount();

  return (
    <header className="relative bg-dark-950/95 backdrop-blur-2xl border-b border-accent-electric/30 px-4 sm:px-6 lg:px-8 py-4 shadow-2xl shadow-accent-electric/20">
      {/* Cyberpunk background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 cyber-grid-bg opacity-30"></div>
        
        {/* Floating cyber orbs */}
        <div className="absolute top-2 left-1/4 w-3 h-3 bg-accent-electric/40 rounded-full blur-sm animate-pulse shadow-cyber"></div>
        <div className="absolute top-1 right-1/3 w-2 h-2 bg-accent-plasma/40 rounded-full blur-sm animate-ping delay-1000 shadow-neon"></div>
        <div className="absolute top-3 left-1/2 w-1.5 h-1.5 bg-accent-quantum/50 rounded-full blur-sm animate-bounce-slow shadow-quantum"></div>

        {/* Energy lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-electric/60 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-plasma/40 to-transparent"></div>

        {/* Holographic overlay */}
        <div className="absolute inset-0 holographic opacity-20"></div>
      </div>

      <div className="relative z-10 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section - Mobile Menu + Search */}
        <div className="flex items-center space-x-4 flex-1 max-w-2xl">
          {/* Cyberpunk Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="
              lg:hidden p-3 
              cyber-card
              text-dark-300 hover:text-accent-electric 
              hover:border-accent-electric/60
              transition-all duration-300
              hover:scale-105 active:scale-95
              neon-glow
            "
          >
            <FiMenu
              size={18}
              className={`transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-90 text-accent-electric" : ""
              }`}
            />
          </button>

          {/* Cyberpunk Search Bar */}
          <div className="relative group flex-1 max-w-md">
            {/* Search icon with cyber styling */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-accent-electric/20 to-accent-plasma/20 group-focus-within:from-accent-electric/40 group-focus-within:to-accent-plasma/40 transition-all duration-300 border border-accent-electric/30">
                <FiSearch
                  className="text-accent-electric group-focus-within:text-accent-electric transition-colors duration-300"
                  size={16}
                />
              </div>
            </div>

            {/* Cyberpunk input field */}
            <input
              type="text"
              placeholder="Search quantum channels..."
              className="
                w-full pl-14 pr-6 py-3.5 
                cyber-input
                placeholder-dark-400
                focus:border-accent-electric focus:ring-2 focus:ring-accent-electric/20
                hover:border-accent-electric/50
                shadow-lg shadow-accent-electric/10
              "
            />

            {/* Quantum glow effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-electric/5 to-accent-plasma/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          {/* Status indicators */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-accent-electric rounded-full animate-pulse shadow-cyber"></div>
              <span className="text-xs text-dark-400 font-cyber">ONLINE</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-accent-plasma rounded-full animate-pulse delay-200 shadow-neon"></div>
              <span className="text-xs text-dark-400 font-cyber">SECURE</span>
            </div>
          </div>
        </div>

        {/* Right Section - Cyberpunk Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Quantum Notification Button */}
          <div className="relative group">
            <button
              className="
              relative p-3 
              cyber-card
              text-dark-300 hover:text-accent-electric 
              hover:border-accent-electric/60
              transition-all duration-300
              hover:scale-105 active:scale-95
              neon-glow
            "
            >
              <FiBell
                size={18}
                className="transition-all duration-300 group-hover:animate-pulse"
              />

              {/* Cyberpunk notification badge */}
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <span className="relative h-5 w-5 bg-gradient-to-r from-accent-plasma to-accent-electric rounded-full shadow-lg shadow-accent-plasma/50 animate-pulse">
                  <span className="absolute inset-0.5 bg-gradient-to-r from-accent-plasma to-accent-electric rounded-full"></span>
                  <span className="absolute inset-1 bg-dark-950 rounded-full"></span>
                </span>
              </div>
            </button>
          </div>

          {/* Network Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 cyber-card border-accent-quantum/30">
            <FiActivity className="text-accent-quantum animate-pulse" size={16} />
            <span className="text-xs font-cyber text-accent-quantum">AVAX</span>
            <div className="w-2 h-2 bg-accent-quantum rounded-full animate-pulse shadow-quantum"></div>
          </div>

          {/* Cyberpunk Connect Button Wrapper */}
          <div className="relative group">
            {/* Custom wrapper for ConnectButton styling */}
            <div
              className="
              [&>div]:bg-gradient-to-r 
              [&>div]:from-accent-electric 
              [&>div]:to-accent-plasma 
              [&>div]:hover:from-accent-electric/80 
              [&>div]:hover:to-accent-plasma/80 
              [&>div]:text-dark-950
              [&>div]:border-0
              [&>div]:rounded-lg
              [&>div]:shadow-lg
              [&>div]:shadow-accent-electric/30
              [&>div]:backdrop-blur-sm
              [&>div]:transition-all
              [&>div]:duration-300
              [&>div]:hover:scale-105
              [&>div]:active:scale-95
              [&>div]:px-4
              [&>div]:sm:[&>div]:px-6
              [&>div]:py-3
              [&>div]:font-semibold
              [&>div]:text-sm
              [&>div]:sm:[&>div]:text-base
              [&>div]:font-cyber
              [&>div]:neon-glow
            "
            >
              <CustomConnectButton />
            </div>

            {/* Quantum connection status indicator */}
            {isConnected && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-accent-crystal to-accent-electric rounded-full shadow-lg shadow-accent-crystal/50 border-2 border-dark-950">
                <div className="absolute inset-0.5 bg-gradient-to-r from-accent-crystal to-accent-electric rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cyberpunk bottom energy line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-plasma/50 to-transparent animate-pulse"></div>

      {/* Custom Cyberpunk Styles */}
      <style jsx>{`
        /* Cyberpunk input styling */
        input::placeholder {
          color: rgba(148, 163, 184, 0.8);
          font-family: 'Orbitron', monospace;
        }

        input:focus::placeholder {
          color: rgba(148, 163, 184, 0.6);
        }

        /* Cyberpunk animations */
        @keyframes cyber-pulse {
          0%, 100% { 
            box-shadow: 0 0 5px #00f5ff, 0 0 10px #00f5ff, 0 0 15px #00f5ff;
          }
          50% { 
            box-shadow: 0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff;
          }
        }

        @keyframes quantum-shift {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(5px) scale(1.02); }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .mobile-search {
            max-width: 180px;
          }
        }

        @media (max-width: 480px) {
          .mobile-search {
            max-width: 140px;
          }
        }

        /* Cyberpunk focus enhancements */
        *:focus {
          outline: 2px solid #00f5ff !important;
          outline-offset: 2px !important;
        }

        /* Matrix rain effect for background */
        @keyframes matrix-rain {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }

        /* Cyberpunk button hover effects */
        .cyber-btn-hover {
          position: relative;
          overflow: hidden;
        }

        .cyber-btn-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .cyber-btn-hover:hover::before {
          left: 100%;
        }
      `}</style>
    </header>
  );
};

export default Header;

