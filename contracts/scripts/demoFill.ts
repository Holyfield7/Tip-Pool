import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
  // Use first signer or private key from env
  const wallet = process.env.PRIVATE_KEY
    ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    : (await ethers.getSigners())[0];

  const tipPoolAddress = process.env.TIPPOOL_ADDRESS;
  if (!tipPoolAddress) {
    console.error("Set TIPPOOL_ADDRESS in .env");
    process.exit(1);
  }

  // --- Send CRO tip ---
  // Just a simple transfer now
  console.log(`Sending 2.0 CRO to ${tipPoolAddress} from ${wallet.address}...`);
  const tx = await wallet.sendTransaction({
    to: tipPoolAddress,
    value: ethers.parseEther("2.0"),
  });
  await tx.wait();
  console.log("Sent 2.0 CRO to TipPool");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
