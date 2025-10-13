import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load components for better performance
const MessengerSidebar = lazy(() => import("./MessengerSidebar"));
const Header = lazy(() => import("./Header"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleStartChat = (friend) => {
    setSelectedFriend(friend);
    setActiveTab("chat");
    if (isMobileMenuOpen) {
      handleMobileMenuClose();
    }
  };

  return (
    <motion.div 
      className="flex h-screen bg-messenger-bg relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Messenger Sidebar */}
      <motion.div 
        className="relative z-100 flex-shrink-0"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <MessengerSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={handleMobileMenuClose}
            onStartChat={handleStartChat}
            selectedFriend={selectedFriend}
          />
        </Suspense>
      </motion.div>

      {/* Main content area */}
      <motion.div 
        className="flex-1 flex flex-col min-w-0 relative z-10"
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        {/* Fixed Header */}
        <motion.div 
          className="flex-shrink-0 sticky top-0 z-20"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Header
              onMenuClick={handleMobileMenuToggle}
              isMobileMenuOpen={isMobileMenuOpen}
              selectedFriend={selectedFriend}
              activeTab={activeTab}
            />
          </Suspense>
        </motion.div>

        {/* Scrollable Main Content */}
        <motion.main 
          className={`flex-1 bg-messenger-chat-bg ${['settings', 'dashboard', 'profile', 'transfers', 'friends'].includes(activeTab) ? 'overflow-y-auto' : 'overflow-hidden'}`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Content wrapper */}
          <div className={`${['settings', 'dashboard', 'profile', 'transfers', 'friends'].includes(activeTab) ? 'min-h-full' : 'h-full'} relative`}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                className={`relative z-10 ${['settings', 'dashboard', 'profile', 'transfers', 'friends'].includes(activeTab) ? 'min-h-full' : 'h-full'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children(activeTab, selectedFriend, handleStartChat)}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </motion.div>

      {/* Messenger Custom Styles */}
      <style jsx>{`
        /* Messenger scrollbar for main content */
        main::-webkit-scrollbar {
          width: 8px;
        }

        main::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        main::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }

        main::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        /* Ensure scrollbar is always visible when needed */
        main {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f5f9;
          scroll-behavior: smooth;
        }

        /* Enhanced focus states */
        *:focus {
          outline: 2px solid #1877f2;
          outline-offset: 2px;
        }

        /* Ensure proper height calculation */
        .flex-1 {
          min-height: 0;
        }

        /* Hide scrollbar for body to prevent double scrollbars */
        body {
          overflow: hidden;
        }

        /* Ensure content fills available space */
        .min-h-full {
          min-height: 100%;
        }
      `}</style>
    </motion.div>
  );
};

export default Layout;
