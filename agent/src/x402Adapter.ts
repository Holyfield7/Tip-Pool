import { ethers } from "ethers";

// x402 Protocol Interface for Cronos Agentic Payments
// x402 enables AI agents to autonomously execute micropayments on Cronos EVM

export interface X402Payment {
  from: string;
  to: string;
  amount: string; // in CRO
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

  // x402 Protocol ABI (simplified for TipPool integration)
  private x402ABI = [
    "function receivePayment(address to, uint256 amount, string reason) payable",
    "function getPaymentHistory(address agent) view returns (tuple(uint256 amount, string reason, uint256 timestamp)[])",
    "event PaymentExecuted(address indexed from, address indexed to, uint256 amount, string reason)"
  ];

  constructor(
    rpcUrl: string,
    privateKey: string,
    tipPoolAddress: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.tipPoolContract = new ethers.Contract(tipPoolAddress, this.x402ABI, this.wallet);
  }

  /**
   * Execute an x402 payment
   * Agents use this to pay for services autonomously
   */
  async executePayment(payment: X402Payment): Promise<X402Receipt> {
    try {
      console.log(`🔄 x402 Payment: ${payment.amount} CRO from ${payment.from} to ${payment.to} for ${payment.reason}`);

      // Convert amount to wei
      const amountWei = ethers.parseEther(payment.amount);

      // Execute payment via x402 protocol (using TipPool as x402 gateway)
      const tx = await this.tipPoolContract.receivePayment(
        payment.to,
        amountWei,
        payment.reason,
        { value: amountWei }
      );

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
      const balance = await this.provider.getBalance(this.wallet.address);
      const required = ethers.parseEther(amount);
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