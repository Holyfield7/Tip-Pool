import { ethers } from 'ethers';

// x402 Protocol Interface for Cronos Agentic Payments
// x402 enables AI agents to autonomously execute micropayments on Cronos EVM

export interface X402Payment {
  from: string;
  to: string;
  amount: string; // in USDC.e (6 decimals)
  reason: string;
  agentId: string;
}

export interface X402Receipt {
  txHash: string;
  success: boolean;
  amount: string;
  timestamp: number;
}

export class X402Adapter {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private tipPoolContract: ethers.Contract;
  private usdcContract: ethers.Contract;

  // USDC.e ABI
  private usdcABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
  ];

  // x402 Protocol ABI (simplified for TipPool integration)
  private x402ABI = [
    "function tip(uint256 amount)",
    "function getBalance() view returns (uint256)",
    "function getPaymentHistory(address agent) view returns (tuple(uint256 amount, string reason, uint256 timestamp)[])",
    "event PaymentExecuted(address indexed from, address indexed to, uint256 amount, string reason)"
  ];

  constructor(
    rpcUrl: string,
    privateKey: string,
    tipPoolAddress: string,
    usdcAddress: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.tipPoolContract = new ethers.Contract(tipPoolAddress, this.x402ABI, this.wallet);
    this.usdcContract = new ethers.Contract(usdcAddress, this.usdcABI, this.wallet);
  }

  /**
   * Execute an x402 payment
   * Agents use this to pay for services autonomously
   */
  async executePayment(payment: X402Payment): Promise<X402Receipt> {
    try {
      console.log(`🔄 x402 Payment: ${payment.amount} USDC.e from ${payment.from} to ${payment.to} for ${payment.reason}`);

      // Convert amount to USDC.e units (6 decimals)
      const amountUnits = ethers.parseUnits(payment.amount, 6);

      // Approve TipPool to spend USDC.e
      const approveTx = await this.usdcContract.approve(this.tipPoolContract.target, amountUnits);
      await approveTx.wait();

      // Execute tip via x402 protocol
      const tx = await this.tipPoolContract.tip(amountUnits);
      const receipt = await tx.wait();

      console.log(`✅ x402 Payment successful: ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        success: true,
        amount: payment.amount,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`❌ x402 Payment failed:`, error);
      return {
        txHash: "",
        success: false,
        amount: payment.amount,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get payment history for an agent
   */
  async getPaymentHistory(agentAddress: string): Promise<any[]> {
    try {
      const history = await this.tipPoolContract.getPaymentHistory(agentAddress);
      return history.map((item: any) => ({
        amount: ethers.formatEther(item.amount),
        reason: item.reason,
        timestamp: Number(item.timestamp)
      }));
    } catch (error) {
      console.error("Failed to get x402 payment history:", error);
      return [];
    }
  }

  /**
   * Check if agent has sufficient balance for x402 payment
   */
  async hasSufficientBalance(amount: string): Promise<boolean> {
    try {
      const balance = await this.usdcContract.balanceOf(this.wallet.address);
      const required = ethers.parseUnits(amount, 6);
      return balance >= required;
    } catch (error) {
      console.error("Failed to check balance:", error);
      return false;
    }
  }

  /**
   * Get agent address
   */
  getAgentAddress(): string {
    return this.wallet.address;
  }
}