// components/Dashboard/Dashboard.js
"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  FiUsers,
  FiMessageCircle,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiArrowUpRight,
  FiArrowDownRight,
  FiSend,
  FiCpu,
  FiZap,
  FiShield,
  FiActivity,
} from "react-icons/fi";
import { ChatAppABI, CONTRACT_ADDRESS } from "../../contracts/ChatApp";
import { ethers } from "ethers";

/**
 * Cyberpunk Neural Dashboard:
 * - Quantum energy panels with holographic effects
 * - Neural network connections and data streams
 * - Cyberpunk aesthetics with neon accents
 * - Matrix-style animations and particle effects
 * - ZERO logic changes - pure visual transformation
 */

export default function Dashboard() {
  const { address } = useAccount();
  const [stats, setStats] = useState({
    totalFriends: 0,
    totalMessages: 0,
    totalAvaxReceived: "0",
    totalUsers: 0,
  });

  // Reads (same logic)
  const { data: friendsList } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getMyFriendList",
    args: [],
    query: { enabled: Boolean(address) },
  });

  const { data: allUsers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getAllAppUser",
    args: [],
    query: { enabled: true },
  });

  useEffect(() => {
    if (friendsList) {
      setStats((prev) => ({ ...prev, totalFriends: friendsList.length || 0 }));
    }
  }, [friendsList]);

  useEffect(() => {
    if (allUsers) {
      setStats((prev) => ({ ...prev, totalUsers: allUsers.length || 0 }));
    }
  }, [allUsers]);

  // Cyberpunk activity data
  const recentActivities = [
    { id: 1, icon: FiMessageCircle, user: "Alice Johnson", action: "transmitted quantum message", time: "2 minutes ago", type: "message" },
    { id: 2, icon: FiArrowDownRight, user: "Bob Smith", action: "initiated AVAX transfer", time: "15 minutes ago", type: "transfer" },
    { id: 3, icon: FiUsers, user: "Carol Davis", action: "established neural link", time: "1 hour ago", type: "connection" },
    { id: 4, icon: FiSend, user: "David Wilson", action: "uploaded data stream", time: "2 hours ago", type: "file" },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-crypto-bg text-crypto-text relative">
      {/* Cyberpunk background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-fuchsia-500/10 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent"></div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-7xl px-5 pt-8 relative z-10">
        <header className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <FiCpu className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                ChatLedger
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-fuchsia-300">Network Active</span>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-lg">
            Monitor your chat activity and network status
          </p>
        </header>
      </div>

      {/* Cyberpunk Content */}
      <div className="mx-auto max-w-7xl px-5 pb-10 relative z-10">
        {/* Quantum Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <QuantumMetricCard 
            label="Neural Nods" 
            value={stats.totalFriends} 
            icon={<FiUsers size={20} />} 
            color="accent-electric"
            subtitle="Connected"
          />
          <QuantumMetricCard 
            label="Data Streams" 
            value={stats.totalMessages} 
            icon={<FiMessageCircle size={20} />} 
            color="accent-plasma"
            subtitle="Transmitted"
          />
          <QuantumMetricCard
            label="AVAX Received"
            value={`${parseFloat(ethers.utils.formatEther(stats.totalAvaxReceived || "0")).toFixed(2)} AVAX`}
            icon={<FiDollarSign size={20} />}
            color="accent-crystal"
            subtitle="Quantum Value"
          />
          <QuantumMetricCard 
            label="Network Size" 
            value={stats.totalUsers} 
            icon={<FiTrendingUp size={20} />} 
            color="accent-quantum"
            subtitle="Total Users"
          />
        </section>

        {/* Cyberpunk Two-column Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Neural Activity Feed */}
          <CyberpunkPanel title="Neural Activity Feed" className="lg:col-span-2">
            <div className="relative pl-6">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-accent-electric via-accent-plasma to-accent-quantum"></div>
              <ul className="space-y-4">
                {recentActivities.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <li
                      key={a.id}
                      className="relative flex items-start gap-4 cyber-card border-accent-electric/20 px-5 py-4
                                 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cyber"
                      style={{ animation: `quantum-rise .6s ease ${i * 100}ms both` }}
                    >
                      <span className="absolute -left-[11px] top-5 h-3 w-3 rounded-full bg-accent-electric shadow-cyber animate-pulse" />
                      <div className="mt-1 h-10 w-10 grid place-items-center rounded-lg bg-gradient-to-r from-accent-electric/20 to-accent-plasma/20 border border-accent-electric/30">
                        <Icon size={18} className="text-accent-electric" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">
                          <span className="font-bold font-cyber text-accent-electric">{a.user}</span>{" "}
                          <span className="text-dark-300">{a.action}</span>
                        </div>
                        <div className="mt-2 text-xs text-dark-400 flex items-center gap-2">
                          <FiClock size={12} className="text-accent-plasma" />
                          <span className="font-cyber">{a.time}</span>
                          <div className="ml-auto flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-accent-electric rounded-full animate-pulse"></div>
                            <span className="text-xs font-cyber text-accent-electric">{a.type.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="cyber-card border-accent-electric/30 px-3 py-2 text-accent-electric hover:text-accent-plasma transition-all duration-300 hover:scale-105"
                        title="View Details"
                      >
                        <FiArrowUpRight size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CyberpunkPanel>

          {/* Right: System Status & Network */}
          <div className="space-y-8">
            <CyberpunkPanel title="System Status">
              <div className="space-y-4">
                <SystemKV label="Neural Network" value={<QuantumStatus text="OPTIMAL" status="online" />} />
                <SystemKV label="Quantum Sync" value="99.7%" />
                <SystemKV label="Data Integrity" value="100%" />
                <SystemKV label="Security Level" value={<QuantumStatus text="MAXIMUM" status="secure" />} />
              </div>
            </CyberpunkPanel>

            <CyberpunkPanel title="Network Metrics">
              <div className="space-y-4">
                <SystemKV label="Connection" value={<QuantumStatus text="STABLE" status="online" />} />
                <SystemKV label="Gas Price" value="12 gwei" />
                <SystemKV label="Block Height" value="18,550,123" />
                <SystemKV label="Latency" value="47ms" />
              </div>
            </CyberpunkPanel>
          </div>
        </section>
      </div>

      {/* Cyberpunk Styles */}
      <style jsx>{`
        @keyframes quantum-rise {
          from { 
            opacity: 0; 
            transform: translateY(12px) scale(0.95);
            filter: blur(4px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

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
    </div>
  );
}

/* ======= Cyberpunk UI Components ======= */

function QuantumMetricCard({ label, value, icon, color, subtitle }) {
  const colorClasses = {
    'accent-electric': 'border-accent-electric/30 text-accent-electric shadow-cyber',
    'accent-plasma': 'border-accent-plasma/30 text-accent-plasma shadow-neon',
    'accent-crystal': 'border-accent-crystal/30 text-accent-crystal shadow-plasma',
    'accent-quantum': 'border-accent-quantum/30 text-accent-quantum shadow-quantum',
  };

  return (
    <div
      className={`
        group cyber-card ${colorClasses[color]} px-6 py-5
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:shadow-glow
        relative overflow-hidden
      `}
    >
      {/* Holographic background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-electric/5 via-transparent to-accent-plasma/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider font-cyber text-dark-400">{label}</div>
        <div className="h-10 w-10 grid place-items-center rounded-lg bg-gradient-to-r from-accent-electric/20 to-accent-plasma/20 border border-accent-electric/30">
          <span className={`text-${color}`}>{icon}</span>
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-bold font-cyber tabular-nums mb-1">{value}</div>
        <div className="text-xs font-cyber text-dark-400">{subtitle}</div>
      </div>
      
      {/* Quantum pulse indicator */}
      <div className="absolute top-3 right-3 w-2 h-2 bg-accent-electric rounded-full animate-pulse shadow-cyber"></div>
    </div>
  );
}

function CyberpunkPanel({ title, children, className = "" }) {
  return (
    <section className={`cyber-card border-accent-electric/30 shadow-cyber ${className}`}>
      <div className="px-6 py-4 border-b border-accent-electric/30 bg-gradient-to-r from-dark-950/80 via-accent-electric/5 to-dark-950/80 flex items-center justify-between">
        <h2 className="text-sm font-bold font-cyber text-accent-electric tracking-wider">
          {title}
        </h2>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-accent-electric rounded-full animate-pulse shadow-cyber"></div>
          <span className="text-xs font-cyber text-accent-electric">LIVE</span>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

function SystemKV({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-sm border-b border-accent-electric/10 last:border-b-0">
      <span className="text-dark-300 font-cyber">{label}</span>
      <span className="text-dark-100 font-cyber">{value}</span>
    </div>
  );
}

function QuantumStatus({ text, status }) {
  const statusColors = {
    'online': 'bg-accent-electric',
    'secure': 'bg-accent-crystal',
    'warning': 'bg-accent-plasma',
    'error': 'bg-red-500',
  };

  return (
    <span className="inline-flex items-center gap-2 cyber-card border-accent-electric/30 px-3 py-1 text-xs">
      <span className={`h-2 w-2 rounded-full ${statusColors[status]} animate-pulse`} />
      <span className="font-cyber text-accent-electric">{text}</span>
    </span>
  );
}

