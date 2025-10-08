const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Check if we're on Mainnet network
  const network = await hre.ethers.provider.getNetwork();
  //TOKEN ICO CONTRACT

  // Deploy CHAT_DAPP Contract
  console.log("\nDeploying CHAT_DAPP contract...");
  const ChatApp = await hre.ethers.getContractFactory("ChatApp");
  const chatApp = await ChatApp.deploy();

  await chatApp.deployed();

  // Deploy TOKEN Contract
  console.log("\nDeploying TOKEN contract...");
  const TheBlockchainCoders = await hre.ethers.getContractFactory(
    "TheBlockchainCoders"
  );
  const theBlockchainCoders = await TheBlockchainCoders.deploy();
  await theBlockchainCoders.deployed();

  console.log("\nDeployment Successful!");
  console.log("------------------------");
  console.log("NEXT_PUBLIC_OWNER_ADDRESS:", deployer.address);
  console.log("NEXT_PUBLIC_CHAT_DAPP_ADDRESS:", chatApp.address);
  console.log("NEXT_PUBLIC_THEBLOCKCHAINCODERS:", theBlockchainCoders.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
