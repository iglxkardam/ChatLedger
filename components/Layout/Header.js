import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { FiMenu } from "react-icons/fi";
import CustomConnectButton from "./CustomConnectButton";
import Avatar from "../Common/Avatar";
import ThemeToggle from "./ThemeToggle";

const Header = ({ onMenuClick, isMobileMenuOpen, selectedFriend, activeTab }) => {
  const { address, isConnected } = useAccount();

  return (
    <header className="bg-messenger-panel border-b border-messenger px-4 py-3 messenger-shadow">
      <div className="flex items-center justify-between">
        {/* Left Section - Mobile Menu + Contact Info */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-messenger-muted hover:text-messenger rounded-full hover-messenger transition-colors"
          >
            <FiMenu
              size={20}
              className={`transition-transform duration-200 ${
                isMobileMenuOpen ? "rotate-90" : ""
              }`}
            />
          </button>

          {/* Contact Info - Only show when in chat tab AND friend is selected */}
          {activeTab === "chat" && selectedFriend ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar
                  profilePicture={selectedFriend.profilePicture}
                  name={selectedFriend.name}
                  address={selectedFriend.pubkey}
                  size="md"
                />
                <div className="online-indicator"></div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-messenger">
                  {selectedFriend.name}
                </h2>
                <p className="text-sm text-messenger-muted">Active now</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-messenger-sidebar rounded-full flex items-center justify-center">
                <span className="text-messenger-muted text-sm font-semibold">
                  {activeTab === "chat" ? "💬" : activeTab === "dashboard" ? "📊" : "⚙️"}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-messenger">
                  {activeTab === "chat" ? "Select a conversation" : 
                   activeTab === "dashboard" ? "Dashboard" : 
                   activeTab === "friends" ? "Friends" : 
                   activeTab === "profile" ? "Profile" : 
                   activeTab === "settings" ? "Settings" : "ChatLedger"}
                </h2>
                <p className="text-sm text-messenger-muted">
                  {activeTab === "chat" ? "Choose a friend to start chatting" : 
                   activeTab === "dashboard" ? "Monitor your activity" : 
                   activeTab === "friends" ? "Manage your connections" : 
                   activeTab === "profile" ? "Your profile information" : 
                   activeTab === "settings" ? "App preferences" : "Welcome to ChatLedger"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Connect Button Only */}
        <div className="flex items-center">
          <ThemeToggle />
          <CustomConnectButton />
        </div>
      </div>

    </header>
  );
};

export default Header;

