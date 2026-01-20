import { ethers } from "ethers";
import { Brain } from "./Brain";
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
  "function getRecipients() view returns (address[] memory, uint256[] memory)",
  "function setRecipients(address[] calldata _recipients, uint256[] calldata _bps)",
  "event PayoutExecuted(uint256 total, address[] recipients, uint256[] amounts)"
];

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

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

  const brain = new Brain();

  console.log("Agent started polling backend for pending tips...");

  while (true) {
    try {
      console.log(`[${new Date().toLocaleTimeString()}] 💓 Heartbeat: Polling backend for tips...`);
      // 1. Fetch pending tips from backend
      const response = await fetch(`${BACKEND_URL}/tips/pending`);
      const pendingTips: any[] = await response.json();

      if (pendingTips.length > 0) {
        console.log(`Found ${pendingTips.length} pending tips.`);

        for (const tip of pendingTips) {
          console.log(`Processing tip ID ${tip.id}: ${tip.amount} from User ${tip.from_user_id} to User ${tip.to_user_id}`);

          // Here we would normally do on-chain stuff if needed, 
          // but based on the prompt we just "process" them and mark them in backend.
          // The current contract logic seems to be about distribution thresholds.

          const bal: bigint = await tipPool.getBalance();
          const min: bigint = await tipPool.minPayout();
          console.log(`Contract Balance=${ethers.formatEther(bal)} CRO, minPayout=${ethers.formatEther(min)} CRO`);

          if (bal >= min) {
            console.log("Threshold met — consulting Brain...");

            // Get current recipients
            const [currentAddrs] = await tipPool.getRecipients();

            // Ask Brain
            const decision = await brain.decideDistribution(currentAddrs);
            console.log("Brain decision:", decision.reasoning);

            // Update Contract
            console.log("Updating contract recipients...");
            const configTx = await tipPool.setRecipients(decision.recipients, decision.bps);
            await configTx.wait();
            console.log("Contract updated.");

            // Distribute
            console.log("Calling distribute()...");
            const tx = await tipPool.distribute();
            await tx.wait();
            console.log("distribute confirmed.");
          }

          // 2. Mark tip as processed in backend
          await fetch(`${BACKEND_URL}/tips/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: tip.id })
          });
          console.log(`Tip ID ${tip.id} marked as processed.`);
        }
      }
    } catch (err: any) {
      console.error("Agent loop error:", err.message || err);
    }

    // Wait 10 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
