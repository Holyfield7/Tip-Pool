import * as dotenv from 'dotenv';
import { ethers } from 'hardhat';

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.CRONOS_RPC_URL || "http://127.0.0.1:8545");
  // Use first signer or private key from env
  const wallet = process.env.DEPLOYER_PRIVATE_KEY
    ? new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider)
    : (await ethers.getSigners())[0];

  const tipPoolAddress = process.env.TIPPOOL_ADDRESS;
  if (!tipPoolAddress) {
    console.error("Set TIPPOOL_ADDRESS in .env");
    process.exit(1);
  }

  const usdcAddress = process.env.USDC_ADDRESS;
  if (!usdcAddress) {
    console.error("Set USDC_ADDRESS in .env");
    process.exit(1);
  }

  // Get USDC contract
  const usdcAbi = ["function transfer(address to, uint256 amount)", "function approve(address spender, uint256 amount)"];
  const usdc = new ethers.Contract(usdcAddress, usdcAbi, wallet);

  // Approve and tip 2 USDC
  console.log(`Approving and tipping 2.0 USDC to ${tipPoolAddress} from ${wallet.address}...`);
  const approveTx = await usdc.approve(tipPoolAddress, ethers.parseUnits("2", 6));
  await approveTx.wait();
  console.log("Approved 2 USDC");

  // Now tip
  const tipPoolAbi = ["function tip(uint256 amount)"];
  const tipPool = new ethers.Contract(tipPoolAddress, tipPoolAbi, wallet);
  const tipTx = await tipPool.tip(ethers.parseUnits("2", 6));
  await tipTx.wait();
  console.log("Tipped 2.0 USDC to TipPool");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
