# Tip Pool - Hackathon Submission Guide

**Welcome Judges!** 👋

This document serves as a map to the technical components of our submission, specifically referencing the **Cronos EVM** and **x402 Agentic Payment** requirements.

## 🔗 Key Technical Components

### 1. Smart Contracts (Cronos EVM)

* **Path**: [`contracts/contracts/TipPool.sol`](contracts/contracts/TipPool.sol)
* **Description**: The on-chain settlement layer. It holds funds and distributes them based on the AI agent's logic.
* **Deployment**:
  * See `contracts/scripts/deploy.ts` for the deployment script.
  * Run `npm run deploy` in the `contracts` folder (requires `.env` with Private Key).

### 2. AI Agent (x402 Integration)

* **Path**: [`agent/src/x402Adapter.ts`](agent/src/x402Adapter.ts)
* **Description**: The core integration with the x402 protocol. This TypeScript class allows the agent to execute autonomous payments on Cronos using standard EVM wallets.
* **Agent Logic**: [`agent/src/agent.ts`](agent/src/agent.ts) - The main loop that polls for pending off-chain tips and settles them on-chain.

### 3. Frontend (Web3 Enabled)

* **Path**: [`frontend/src/App.tsx`](frontend/src/App.tsx)
* **Feature**: "Connect Wallet" button allows users to connect their MetaMask/Rabby wallet to interact with the Cronos chain.
* **Stack**: React + Vite + Tailwind + EIP-1193 Provider.

## 🏆 Track Alignment

**Track: Agentic Finance / Agentic Payments**

* **Why**: We use an autonomous backend agent (`agent/src/agent.ts`) that listens to user intent (tips) and executes them on-chain using the x402 protocol.
* **Innovation**: Bridging Web2 user experience (instant, gasless database recording) with Web3 settlement (batch processing by agents).

## 🚀 How to Verify

1. **Inspect the Code**: Please verify `contracts/` and `agent/` directories.
2. **Run Locally**:
    * Backend: `php -S localhost:9000 -t public`
    * Frontend: `cd frontend && npm run dev`
