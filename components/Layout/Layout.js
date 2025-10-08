import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Simple3DBackground = dynamic(() => import('../FX/Simple3DBackground'), {
  ssr: false,
  loading: () => null
});

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-black relative overflow-hidden">
      {/* Simple 3D Background */}
      <Simple3DBackground />
      
      {/* Simple background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle glow orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Fixed Cyberpunk Sidebar */}
      <div className="relative z-100 flex-shrink-0">
        {/* Desktop Sidebar - Always visible and fixed */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobileMenuOpen={false}
            onMobileMenuClose={handleMobileMenuClose}
          />
        </div>

        {/* Mobile Sidebar - Overlay when open */}
        <div className="lg:hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={handleMobileMenuClose}
          />
        </div>

        {/* Cyberpunk mobile sidebar backdrop */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-dark-950/90 backdrop-blur-xl transition-opacity duration-300"
            onClick={handleMobileMenuClose}
          >
            {/* Backdrop effects */}
            <div className="absolute inset-0 cyber-grid-bg opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent-electric/5 via-transparent to-accent-plasma/5"></div>
          </div>
        )}
      </div>

      {/* Main content area - Cyberpunk styled */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Fixed Cyberpunk Header */}
        <div className="flex-shrink-0 sticky top-0 z-20">
          <Header
            onMenuClick={handleMobileMenuToggle}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Full scrollable content area with cyberpunk styling */}
          <div className="min-h-full p-4 sm:p-6 lg:p-8 relative">
            {/* Content wrapper with quantum effects */}
            <div className="min-h-full relative">
              {/* Subtle content glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-electric/5 via-transparent to-accent-plasma/5 opacity-50 pointer-events-none"></div>
              <div className="relative z-10">{children(activeTab)}</div>
            </div>
          </div>
        </main>
      </div>

      {/* Cyberpunk Custom Styles */}
      <style jsx>{`
        /* Cyberpunk scrollbar for main content */
        main::-webkit-scrollbar {
          width: 8px;
        }

        main::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 4px;
        }

        main::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00f5ff, #ff0080);
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }

        main::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #ff0080, #8b5cf6);
          box-shadow: 0 0 15px rgba(255, 0, 128, 0.6);
        }

        /* Smooth scrolling */
        main {
          scroll-behavior: smooth;
        }

        /* Enhanced focus states */
        *:focus {
          outline: 2px solid #00f5ff;
          outline-offset: 2px;
        }

        /* Ensure proper height calculation */
        .flex-1 {
          min-height: 0;
        }

        /* Cyberpunk mobile menu animations */
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

        .mobile-menu-enter {
          animation: cyber-slide-in 0.4s ease-out;
        }

        .mobile-menu-exit {
          animation: cyber-slide-out 0.3s ease-in;
        }

        /* Hide scrollbar for body to prevent double scrollbars */
        body {
          overflow: hidden;
        }

        /* Ensure content fills available space */
        .min-h-full {
          min-height: 100%;
        }

        /* Cyberpunk glow effects */
        .shadow-glow {
          box-shadow: 0 0 50px rgba(0, 245, 255, 0.3);
        }

        /* Quantum particle effects */
        @keyframes quantum-float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
          }
        }

        .quantum-float {
          animation: quantum-float 8s ease-in-out infinite;
        }

        /* Matrix rain animation */
        @keyframes matrix-rain {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }

        .animate-matrix-rain {
          animation: matrix-rain 20s linear infinite;
        }

        /* Cyberpunk backdrop blur */
        .cyber-backdrop {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }
      `}</style>
    </div>
  );
};

export default Layout;
