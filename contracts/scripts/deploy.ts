import { ethers } from 'hardhat';

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // USDC.e on Cronos testnet
  const usdcAddress = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";
  // Min payout: 1 USDC.e (6 decimals, so 1e6)
  const minPayout = ethers.parseUnits("1", 6);

  const TipPool = await ethers.getContractFactory("TipPool");
  const tipPool = await TipPool.deploy(usdcAddress, minPayout);

  await tipPool.waitForDeployment();
  console.log("TipPool deployed to:", await tipPool.getAddress());

  console.log(`Payment Token: USDC.e (${usdcAddress})`);
  console.log(`Min Payout set to ${ethers.formatUnits(minPayout, 6)} USDC.e`);

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
