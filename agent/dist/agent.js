"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const Brain_1 = require("./Brain");
const dotenv = __importStar(require("dotenv"));
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
    const provider = new ethers_1.ethers.JsonRpcProvider(RPC);
    const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
    const tipPool = new ethers_1.ethers.Contract(TIPPOOL_ADDRESS, TIPPOOL_ABI, wallet);
    console.log("Agent running as:", wallet.address);
    const brain = new Brain_1.Brain();
    console.log("Agent started polling backend for pending tips...");
    while (true) {
        try {
            console.log(`[${new Date().toLocaleTimeString()}] 💓 Heartbeat: Polling backend for tips...`);
            // 1. Fetch pending tips from backend
            const response = await fetch(`${BACKEND_URL}/tips/pending`);
            const pendingTips = await response.json();
            if (pendingTips.length > 0) {
                console.log(`Found ${pendingTips.length} pending tips.`);
                for (const tip of pendingTips) {
                    console.log(`Processing tip ID ${tip.id}: ${tip.amount} from User ${tip.from_user_id} to User ${tip.to_user_id}`);
                    // Here we would normally do on-chain stuff if needed, 
                    // but based on the prompt we just "process" them and mark them in backend.
                    // The current contract logic seems to be about distribution thresholds.
                    const bal = await tipPool.getBalance();
                    const min = await tipPool.minPayout();
                    console.log(`Contract Balance=${ethers_1.ethers.formatEther(bal)} CRO, minPayout=${ethers_1.ethers.formatEther(min)} CRO`);
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
        }
        catch (err) {
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
