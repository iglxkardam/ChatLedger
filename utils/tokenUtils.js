import { ethers } from "ethers";
import ABI from "../web3/artifacts/contracts/TheBlockchainCoders.sol/TheBlockchainCoders.json";

// Enhanced ERC20 ABI with all standard functions
export const ERC20_ABI = ABI.abi;

// Alternative minimal ABI for testing
export const MINIMAL_ERC20_ABI = ABI.abi;

// Validate if address is a valid contract address
export const isValidAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

// Format token amount for display
export const formatTokenAmount = (amount, decimals = 18) => {
  try {
    if (!amount) return "0";
    return ethers.utils.formatUnits(amount.toString(), decimals);
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return "0";
  }
};

// Parse token amount for transactions
export const parseTokenAmount = (amount, decimals = 18) => {
  try {
    if (!amount || amount === "") return ethers.BigNumber.from(0);
    return ethers.utils.parseUnits(amount.toString(), decimals);
  } catch (error) {
    console.error("Error parsing token amount:", error);
    return ethers.BigNumber.from(0);
  }
};

// Debug function to test contract
export const debugTokenContract = async (tokenAddress, provider) => {
  try {
    console.log("🔍 Debugging token contract:", tokenAddress);

    // Check if address is valid
    if (!isValidAddress(tokenAddress)) {
      console.error("❌ Invalid address format");
      return { success: false, error: "Invalid address format" };
    }

    // Check if there's code at the address
    const code = await provider.getCode(tokenAddress);
    console.log("📄 Contract code length:", code.length);

    if (code === "0x") {
      console.error("❌ No contract found at address");
      return { success: false, error: "No contract deployed at this address" };
    }

    // Try to create contract instance
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    // Test each function individually
    const results = {};

    try {
      results.name = await contract.name();
      console.log("✅ Name:", results.name);
    } catch (error) {
      console.error("❌ Name failed:", error.message);
      results.nameError = error.message;
    }

    try {
      results.symbol = await contract.symbol();
      console.log("✅ Symbol:", results.symbol);
    } catch (error) {
      console.error("❌ Symbol failed:", error.message);
      results.symbolError = error.message;
    }

    try {
      results.decimals = await contract.decimals();
      console.log("✅ Decimals:", results.decimals);
    } catch (error) {
      console.error("❌ Decimals failed:", error.message);
      results.decimalsError = error.message;
    }

    return { success: true, results };
  } catch (error) {
    console.error("🚨 Debug failed:", error);
    return { success: false, error: error.message };
  }
};
