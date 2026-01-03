import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // 1 CRO min payout
  const minPayout = ethers.parseEther("1.0");

  const TipPool = await ethers.getContractFactory("TipPool");
  const tipPool = await TipPool.deploy(minPayout);

  await tipPool.waitForDeployment(); // Updated for Ethers v6/Hardhat
  console.log("TipPool deployed to:", await tipPool.getAddress());

  console.log(`Min Payout set to ${ethers.formatEther(minPayout)} CRO`);

  // Optional: Set default recipients for demo
  // 50% to deployer, 50% to a random address
  const recipients = [deployer.address, "0x000000000000000000000000000000000000dEaD"];
  const bps = [5000, 5000]; // 5000 bps = 50%

  const tx = await tipPool.setRecipients(recipients, bps);
  await tx.wait();
  console.log("Default recipients configured (50/50 split)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
