// components/Chat/Chat.js
"use client";

import { useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { FiMessageCircle, FiUsers, FiZap, FiShield, FiCpu } from "react-icons/fi";
import FriendsList from "../Friends/FriendsList";
import ChatInterface from "./ChatInterface";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";

/**
 * Cyberpunk Neural Chat Interface:
 * - Quantum energy panels with holographic effects
 * - Neural network connections and data streams
 * - Cyberpunk aesthetics with neon accents
 * - Matrix-style animations and particle effects
 * - ZERO logic changes - pure visual transformation
 */
const Chat = () => {
  const { address } = useAccount();
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleStartChat = (friend) => setSelectedFriend(friend);
  const handleBackToFriends = () => setSelectedFriend(null);

  return (
    <div className="relative h-full overflow-hidden bg-crypto-bg text-crypto-text">
      {/* Crypto Header */}
      <div className="border-b border-crypto-border bg-crypto-panel backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-crypto-ring to-crypto-ring-2 flex items-center justify-center neon-glow">
                  <FiMessageCircle className="text-white" size={16} />
                </div>
                <h1 className="text-lg font-bold font-cyber text-crypto-ring tracking-wider">
                  QUANTUM CHAT
                </h1>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-crypto-ring rounded-full animate-pulse pulse-glow"></div>
                <span className="text-xs font-cyber text-crypto-ring">QUANTUM ACTIVE</span>
                <div className="w-2 h-2 bg-crypto-ring rounded-full animate-pulse delay-200 pulse-glow"></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-1 bg-gradient-to-r from-crypto-ring via-crypto-ring-2 to-crypto-ring rounded-full"></div>
              <span className="text-xs font-cyber text-crypto-ring-2">v2.0.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile ===== */}
      <div className="lg:hidden relative z-10 h-[calc(100vh-64px)]">
        <div className="h-full relative">
          {/* Mobile background effects */}
          <div className="absolute inset-0 bg-cyber-grid opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-crypto-ring/5 via-transparent to-crypto-ring-2/5"></div>
          
          {selectedFriend ? (
            <div className="h-full animate-cyber-fade-in relative z-10">
              <ChatInterface selectedFriend={selectedFriend} onBack={handleBackToFriends} />
            </div>
          ) : (
            <div className="h-full animate-cyber-fade-in relative z-10">
              <FriendsList onStartChat={handleStartChat} />
            </div>
          )}
        </div>
      </div>

      {/* ===== Desktop ===== */}
      <div className="hidden lg:block relative z-10 h-[calc(100vh-64px)]">
        <div className="mx-auto flex h-full max-w-7xl gap-6 px-5 py-5">
          {/* Left panel: Neural Network Nodes */}
          <aside className="relative w-[24rem] xl:w-[28rem] flex-shrink-0 glass-panel border-crypto-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-cyber">
            {/* Quantum energy spine */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-crypto-ring via-crypto-ring-2 to-crypto-ring shadow-cyber"></div>
            
            {/* Cyberpunk corner indicators */}
            <div className="absolute right-4 top-4 w-3 h-3 border border-crypto-ring/50 rotate-45 bg-crypto-ring/20 shadow-cyber"></div>
            <div className="absolute right-4 bottom-4 w-3 h-3 border border-crypto-ring-2/50 rotate-45 bg-crypto-ring-2/20 shadow-neon"></div>

            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-crypto-border px-6 py-4 bg-gradient-to-r from-crypto-panel via-crypto-ring/5 to-crypto-panel">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-crypto-ring/30 to-crypto-ring-2/30 flex items-center justify-center">
                  <FiUsers className="text-crypto-ring" size={14} />
                </div>
                <h2 className="text-sm font-bold font-cyber text-crypto-ring tracking-wider">
                  NETWORK NODES
                </h2>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-crypto-ring rounded-full animate-pulse pulse-glow"></div>
                <span className="text-xs font-cyber text-crypto-ring">ONLINE</span>
              </div>
            </div>

            {/* Panel content */}
            <div className="relative z-10 h-[calc(100%-60px)]">
              <FriendsList onStartChat={handleStartChat} hideSection={false} />
            </div>
          </aside>

          {/* Right panel: Quantum Chat Interface */}
          <main className="relative min-w-0 flex-1 glass-panel-cyan border-crypto-border-cyan overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-neon">
            {/* Quantum energy rails */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-crypto-ring/60 to-transparent shadow-cyber"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-crypto-ring-2/40 to-transparent shadow-neon"></div>
            </div>

            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-crypto-border-cyan px-6 py-4 bg-gradient-to-r from-crypto-panel via-crypto-ring-2/5 to-crypto-panel">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-crypto-ring-2/30 to-crypto-ring/30 flex items-center justify-center">
                  <FiMessageCircle className="text-crypto-ring-2" size={14} />
                </div>
                <h2 className="text-sm font-bold font-cyber text-crypto-ring-2 tracking-wider">
                  QUANTUM CHANNEL
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-crypto-ring-2 rounded-full animate-pulse pulse-glow"></div>
                <span className="text-xs font-cyber text-crypto-ring-2">SECURED</span>
                <div className="w-1.5 h-1.5 bg-crypto-ring rounded-full animate-pulse delay-200 pulse-glow"></div>
              </div>
            </div>

            {/* Chat content */}
            <div className="relative z-10 h-[calc(100%-60px)] animate-cyber-fade-in">
              <ChatInterface selectedFriend={selectedFriend} />
            </div>
          </main>
        </div>
      </div>

      {/* Cyberpunk Styles */}
      <style jsx>{`
        .animate-cyber-fade-in {
          animation: cyber-fade-in 0.5s ease-out;
        }
        
        @keyframes cyber-fade-in {
          from { 
            opacity: 0; 
            transform: translateY(12px) scale(0.98);
            filter: blur(4px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        /* Quantum particle effects */
        .quantum-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .quantum-particles::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 20% 20%, rgba(0, 245, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          animation: quantum-shift 8s ease-in-out infinite;
        }

        @keyframes quantum-shift {
          0%, 100% { 
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          25% { 
            transform: translateX(10px) translateY(-5px) rotate(90deg);
          }
          50% { 
            transform: translateX(-5px) translateY(10px) rotate(180deg);
          }
          75% { 
            transform: translateX(-10px) translateY(-5px) rotate(270deg);
          }
        }

        /* Cyberpunk hover effects */
        .cyber-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cyber-hover:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 20px 40px rgba(0, 245, 255, 0.2);
        }

        /* Matrix-style data streams */
        .data-stream {
          position: absolute;
          width: 2px;
          height: 100%;
          background: linear-gradient(to bottom, 
            transparent 0%, 
            rgba(0, 245, 255, 0.8) 20%, 
            rgba(255, 0, 128, 0.8) 50%, 
            rgba(139, 92, 246, 0.8) 80%, 
            transparent 100%
          );
          animation: data-flow 3s linear infinite;
        }

        @keyframes data-flow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-cyber-fade-in { 
            animation: none; 
            opacity: 1;
            transform: none;
            filter: none;
          }
          .cyber-hover:hover { 
            transform: none !important; 
          }
          .quantum-particles::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;

