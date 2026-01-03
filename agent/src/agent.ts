import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const RPC = process.env.CRONOS_RPC_URL || "http://localhost:8545";
const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "";
const TIPPOOL_ADDRESS = process.env.TIPPOOL_ADDRESS || "";

const TIPPOOL_ABI = [
  "event TipReceived(address indexed from, uint256 amount)",
  "function getBalance() view returns (uint256)",
  "function minPayout() view returns (uint256)",
  "function distribute()",
  "event PayoutExecuted(uint256 total, address[] recipients, uint256[] amounts)"
];

async function main() {
  if (!PRIVATE_KEY) {
    console.error("Set AGENT_PRIVATE_KEY in .env");
    process.exit(1);
  }
  if (!TIPPOOL_ADDRESS) {
    console.error("Set TIPPOOL_ADDRESS in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const tipPool = new ethers.Contract(TIPPOOL_ADDRESS, TIPPOOL_ABI, wallet);

  console.log("Agent running as:", wallet.address);

  // On chain event listener
  tipPool.on("TipReceived", async (from: string, amount: bigint, event: any) => {
    console.log(`TipReceived from=${from} amount=${ethers.formatEther(amount)} CRO`);
    try {
      const bal: bigint = await tipPool.getBalance();
      const min: bigint = await tipPool.minPayout();
      console.log(`Balance=${ethers.formatEther(bal)} minPayout=${ethers.formatEther(min)}`);

      if (bal >= min) {
        console.log("Threshold met — calling distribute()");
        const tx = await tipPool.distribute();
        console.log("distribute tx sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("distribute confirmed txHash:", receipt.transactionHash);
      } else {
        console.log("Threshold not met — waiting for more tips");
      }
    } catch (err: any) {
      console.error("Agent error:", err.message || err);
    }
  });

  tipPool.on("PayoutExecuted", (total: bigint, recipients: string[], amounts: bigint[]) => {
    console.log(`PayoutExecuted total=${ethers.formatEther(total)} CRO`);
    recipients.forEach((r, i) => {
      console.log(` -> ${r} received ${ethers.formatEther(amounts[i])} CRO`);
    });
  });

  console.log("Agent listening for TipReceived events...");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
