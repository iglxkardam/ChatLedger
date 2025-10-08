import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'

const AppShellMinimal = ({ children, activeTab = 'dashboard', setActiveTab }) => {
  const { address, isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat', label: 'Chat' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-crypto-bg text-crypto-text relative overflow-hidden">
      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Left Sidebar */}
        <motion.aside 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="w-80 glass-panel m-4 flex flex-col"
        >
          {/* User Profile Section */}
          <div className="p-6 border-b border-crypto-border">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-crypto-ring to-crypto-ring-2 flex items-center justify-center neon-glow">
                <span className="text-white text-xl">💰</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">ChatLedger</h2>
                <p className="text-sm text-crypto-text-muted">Quantum Messenger</p>
              </div>
            </div>
            
            {/* Connect Button */}
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-gradient-to-r from-crypto-ring to-crypto-ring-2 text-white rounded-lg hover:opacity-80 transition-opacity">
                {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-black/20 border border-crypto-border rounded-lg text-crypto-text placeholder-crypto-text-muted focus:border-crypto-ring focus:ring-1 focus:ring-crypto-ring transition-all duration-200"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">
            <ul className="space-y-2">
              {navigationItems.map((item, index) => (
                <motion.li 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.button
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-crypto-ring/20 border border-crypto-ring neon-glow'
                        : 'hover:bg-black/20 hover:border-crypto-border border border-transparent'
                    }`}
                  >
                    <span>{item.label}</span>
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </nav>
        </motion.aside>

        {/* Main Content Area */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col m-4 mr-0"
        >
          {/* Chat Area */}
          <div className="flex-1 glass-panel flex flex-col">
            <div className="flex-1">
              {children}
            </div>
          </div>
        </motion.main>

        {/* Right Panel */}
        <motion.aside
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.1 }}
          className="w-80 glass-panel-cyan m-4 ml-0 flex flex-col"
        >
          {/* Network Status */}
          <div className="p-6 border-b border-crypto-border-cyan">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-crypto-ring-2 to-crypto-ring flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold">Network Status</h3>
                <p className="text-sm text-crypto-text-muted">Ethereum Mainnet</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-crypto-text-muted">Connection</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
                  <span className="text-sm text-green-400">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}

export default AppShellMinimal
