import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RiWallet3Line } from "react-icons/ri";

const CustomConnectButton = ({ active, childStyle }) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
                  >
                    <RiWallet3Line className="mr-2" size={18} />
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  {active && (
                    <button
                      onClick={openChainModal}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                    >
                      {chain.hasIcon && (
                        <div className="w-4 h-4">
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                        </div>
                      )}
                      <span className="text-sm">{chain.name}</span>
                    </button>
                  )}

                  <button
                    onClick={openAccountModal}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">
                      {account.displayName}
                      {account.displayBalance && ` • ${account.displayBalance}`}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
export default CustomConnectButton;
