# ChatLedger - Wallet Connection Implementation Guide

## Overview

This document provides a comprehensive guide to implementing wallet connection functionality in Web3 applications, based on the ChatLedger project. The implementation uses **RainbowKit** and **Wagmi** libraries to provide a seamless, user-friendly wallet connection experience.

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Dependencies Installation](#dependencies-installation)
3. [Environment Configuration](#environment-configuration)
4. [Core Implementation](#core-implementation)
5. [Usage Examples](#usage-examples)
6. [Key Features](#key-features)
7. [Best Practices](#best-practices)

---

## Project Architecture

### Technology Stack

- **Frontend Framework**: Next.js 13.4.19
- **Web3 Libraries**:
  - Wagmi v2.12.17 - React hooks for Ethereum
  - Viem v2.21.19 - TypeScript interface for Ethereum
  - RainbowKit v2.1.7 - Wallet connection UI
- **State Management**: @tanstack/react-query v5.59.0
- **Smart Contract Interaction**: Ethers.js v5.7.2

### Project Structure

```
├── config/
│   └── wagmi.js                  # Wagmi configuration & chain setup
├── components/
│   └── Layout/
│       ├── CustomConnectButton.js # Custom wallet button UI
│       └── Header.js              # Header with wallet integration
├── pages/
│   ├── _app.js                   # App wrapper with providers
│   └── app.js                    # Main application logic
├── hooks/
│   └── useChatApp.js             # Custom hook for contract interactions
└── contracts/
    └── ChatApp.js                # Contract ABI and address
```

---

## Dependencies Installation

### Step 1: Install Required Packages

```bash
npm install @rainbow-me/rainbowkit wagmi viem @tanstack/react-query ethers react-hot-toast react-icons
```

### Package Details

```json
{
  "dependencies": {
    "@rainbow-me/rainbowkit": "^2.1.7",
    "@tanstack/react-query": "^5.59.0",
    "ethers": "^5.7.2",
    "react-hot-toast": "^2.5.2",
    "react-icons": "^5.5.0",
    "viem": "^2.21.19",
    "wagmi": "^2.12.17"
  }
}
```

---

## Environment Configuration

### Step 2: Setup Environment Variables

Create a `.env.local` file in your project root:

```env
# WalletConnect Project ID (Get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Blockchain Network Configuration
NEXT_PUBLIC_RPC_URL=https://your-rpc-endpoint.com
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_CHAIN_NAME=Avalanche Fuji
NEXT_PUBLIC_CHAIN_SYMBOL=AVAX
NEXT_PUBLIC_NETWORK=fuji

# Block Explorer
NEXT_PUBLIC_BLOCK_EXPLORER=https://testnet.snowtrace.io
NEXT_PUBLIC_BLOCK_EXPLORER_NAME=SnowTrace

# Application Info
NEXT_PUBLIC_PLATFORM_NAME=ChatLedger
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
```

### Example Networks

**Avalanche Fuji Testnet:**

```env
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_CHAIN_NAME=Avalanche Fuji
NEXT_PUBLIC_CHAIN_SYMBOL=AVAX
```

**Ethereum Sepolia:**

```env
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME=Sepolia
NEXT_PUBLIC_CHAIN_SYMBOL=ETH
```

**Polygon Mumbai:**

```env
NEXT_PUBLIC_RPC_URL=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_CHAIN_NAME=Polygon Mumbai
NEXT_PUBLIC_CHAIN_SYMBOL=MATIC
```

---

## Core Implementation

### Step 3: Create Wagmi Configuration (`config/wagmi.js`)

```javascript
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Load environment variables
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID);
const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME;
const CHAIN_SYMBOL = process.env.NEXT_PUBLIC_CHAIN_SYMBOL;
const BLOCK_EXPLORER = process.env.NEXT_PUBLIC_BLOCK_EXPLORER;
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK;
const BLOCK_EXPLORER_NAME = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_NAME;

// Define custom blockchain network
const customChain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  network: NETWORK_NAME,
  nativeCurrency: {
    name: CHAIN_SYMBOL,
    symbol: CHAIN_SYMBOL,
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
    public: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: BLOCK_EXPLORER_NAME,
      url: BLOCK_EXPLORER,
    },
  },
});

// Export Wagmi configuration
export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_PLATFORM_NAME,
  projectId: PROJECT_ID,
  chains: [customChain],
  ssr: true, // Enable Server-Side Rendering support
  walletConnectOptions: {
    projectId: PROJECT_ID,
  },
});
```

### Step 4: Create Custom Connect Button (`components/Layout/CustomConnectButton.js`)

```javascript
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
              // State 1: Not Connected
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

              // State 2: Wrong Network
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

              // State 3: Connected & Correct Network
              return (
                <div className="flex items-center gap-3">
                  {/* Optional: Network Display */}
                  {active && (
                    <button
                      onClick={openChainModal}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span className="text-sm">{chain.name}</span>
                    </button>
                  )}

                  {/* Account Button */}
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
```

### Step 5: Setup Application Wrapper (`pages/_app.js`)

```javascript
import Head from "next/head";
import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import { config } from "../config/wagmi";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
        <title>ChatLedger - Web3 Chat DApp</title>
      </Head>

      {/* Wagmi Provider - Core Web3 functionality */}
      <WagmiConfig config={config}>
        {/* React Query Provider - Data fetching & caching */}
        <QueryClientProvider client={queryClient}>
          {/* RainbowKit Provider - Wallet UI */}
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#D345EF",
              accentColorForeground: "white",
              borderRadius: "small",
              fontStack: "system",
              overlayBlur: "small",
            })}
          >
            <Component {...pageProps} />

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
              }}
            />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;
```

---

## Usage Examples

### Example 1: Basic Component Usage

```javascript
import { useAccount } from "wagmi";
import CustomConnectButton from "../components/Layout/CustomConnectButton";

const MyComponent = () => {
  const { address, isConnected } = useAccount();

  return (
    <div>
      <CustomConnectButton />

      {isConnected ? (
        <div>
          <p>Connected Wallet: {address}</p>
          <p>Welcome to the DApp!</p>
        </div>
      ) : (
        <p>Please connect your wallet to continue</p>
      )}
    </div>
  );
};

export default MyComponent;
```

### Example 2: Contract Interaction with Wallet

```javascript
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, ChatAppABI } from "../contracts/ChatApp";

const UserProfile = () => {
  const { address, isConnected } = useAccount();

  // Read user's name from smart contract
  const { data: username } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "getUsername",
    args: [address],
    query: {
      enabled: Boolean(isConnected && address),
    },
  });

  return <div>{username && <h2>Welcome back, {username}!</h2>}</div>;
};

export default UserProfile;
```

### Example 3: Write to Contract (Transaction)

```javascript
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACT_ADDRESS, ChatAppABI } from "../contracts/ChatApp";
import { toast } from "react-hot-toast";

const CreateAccount = () => {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCreateAccount = async (username) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ChatAppABI,
        functionName: "createAccount",
        args: [username],
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Transaction failed");
    }
  };

  if (isSuccess) {
    toast.success("Account created successfully!");
  }

  return (
    <button
      onClick={() => handleCreateAccount("MyUsername")}
      disabled={isConfirming}
    >
      {isConfirming ? "Creating..." : "Create Account"}
    </button>
  );
};

export default CreateAccount;
```

### Example 4: Checking User Existence

```javascript
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, ChatAppABI } from "../contracts/ChatApp";

const App = () => {
  const { address, isConnected } = useAccount();
  const [userExists, setUserExists] = useState(false);

  const {
    data: userExistsData,
    refetch: refetchUserExists,
    isFetching,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ChatAppABI,
    functionName: "checkUserExists",
    args: [address],
    query: {
      enabled: Boolean(isConnected && address),
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    if (userExistsData !== undefined) {
      setUserExists(Boolean(userExistsData));
    }
  }, [userExistsData]);

  if (!isConnected) {
    return <LandingPage />;
  }

  if (isFetching) {
    return <LoadingScreen />;
  }

  if (!userExists) {
    return <OnboardingScreen onAccountCreated={() => refetchUserExists()} />;
  }

  return <MainApp />;
};

export default App;
```

---

## Key Features

### 1. **Multi-Wallet Support**

RainbowKit provides out-of-the-box support for:

- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow
- Trust Wallet
- And many more...

### 2. **Network Switching**

Automatically detects and prompts users to switch to the correct network:

```javascript
if (chain.unsupported) {
  return <button onClick={openChainModal}>Switch to {CHAIN_NAME}</button>;
}
```

### 3. **Account Display**

Shows truncated address with ENS support and balance:

```javascript
{
  account.displayName;
} // Shows ENS or truncated address
{
  account.displayBalance;
} // Shows wallet balance
```

### 4. **Responsive Design**

The connect button adapts to different states:

- **Disconnected**: "Connect Wallet" button
- **Wrong Network**: "Wrong Network" warning
- **Connected**: Display address and balance

### 5. **Server-Side Rendering (SSR) Support**

Wagmi configuration includes SSR support for Next.js:

```javascript
export const config = getDefaultConfig({
  // ...
  ssr: true,
});
```

---

## Best Practices

### 1. **Always Check Connection State**

```javascript
const { address, isConnected } = useAccount();

// Enable queries only when connected
query: {
  enabled: Boolean(isConnected && address),
}
```

### 2. **Handle Loading States**

```javascript
const { data, isFetching, isFetched } = useReadContract({...});

if (isFetching) return <Spinner />;
if (!data) return <EmptyState />;
```

### 3. **Provide User Feedback**

```javascript
import { toast } from "react-hot-toast";

// Success
toast.success("Transaction confirmed!");

// Error
toast.error("Transaction failed");

// Loading
toast.loading("Processing transaction...");
```

### 4. **Secure Environment Variables**

Never commit sensitive keys:

```gitignore
.env
.env.local
.env*.local
```

### 5. **Error Handling**

```javascript
try {
  await writeContract({...});
} catch (error) {
  if (error.code === 4001) {
    toast.error("Transaction rejected by user");
  } else {
    toast.error("Transaction failed: " + error.message);
  }
}
```

### 6. **Optimize Re-renders**

```javascript
query: {
  enabled: Boolean(isConnected && address),
  refetchOnWindowFocus: false, // Disable unnecessary refetches
  staleTime: 60000, // Cache for 1 minute
}
```

### 7. **Validate User Input**

```javascript
const handleCreateAccount = (username) => {
  if (!username || username.length < 3) {
    toast.error("Username must be at least 3 characters");
    return;
  }
  // Proceed with transaction
};
```

---

## Advanced Topics

### Custom Chain Configuration

For multiple chains:

```javascript
import { mainnet, polygon, optimism } from "wagmi/chains";

export const config = getDefaultConfig({
  chains: [mainnet, polygon, optimism, customChain],
  // ...
});
```

### Custom Styling

Override RainbowKit theme:

```javascript
<RainbowKitProvider
  theme={darkTheme({
    accentColor: "#7b3fe4",
    accentColorForeground: "white",
    borderRadius: "medium",
    fontStack: "system",
  })}
>
```

### Programmatic Connection

```javascript
const { connect, connectors } = useConnect();

// Connect to specific wallet
const metamask = connectors.find((c) => c.id === "metaMask");
if (metamask) {
  connect({ connector: metamask });
}
```

---

## Troubleshooting

### Common Issues

**1. "Module not found: @rainbow-me/rainbowkit"**

```bash
npm install @rainbow-me/rainbowkit wagmi viem
```

**2. "Unsupported chain" error**

- Verify `NEXT_PUBLIC_CHAIN_ID` matches your network
- Check RPC URL is accessible
- Ensure wallet is on correct network

**3. "Project ID required" warning**

- Get a free Project ID from https://cloud.walletconnect.com/
- Add to `.env.local` as `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

**4. SSR hydration errors**

- Ensure RainbowKit styles are imported in `_app.js`
- Use `ssr: true` in wagmi config

---

## Resources

- **RainbowKit Documentation**: https://www.rainbowkit.com/
- **Wagmi Documentation**: https://wagmi.sh/
- **Viem Documentation**: https://viem.sh/
- **WalletConnect Cloud**: https://cloud.walletconnect.com/
- **Ethereum JSON-RPC**: https://ethereum.org/en/developers/docs/apis/json-rpc/

---

## License

This implementation guide is based on the ChatLedger project and is provided as-is for educational purposes.

---

## Support

For issues or questions:

1. Check the official documentation
2. Review the example implementations
3. Consult the troubleshooting section
4. Open an issue on GitHub

---

**Last Updated**: October 27, 2025
