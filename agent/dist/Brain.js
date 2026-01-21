"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brain = void 0;
class Brain {
    /**
     * The Brain decides who gets paid.
     * In a real AI implementation, this would call an LLM (e.g., OpenAI)
     * with context about recent activity, contribution quality, etc.
     */
    async decideDistribution(currentRecipients) {
        console.log("🧠 Brain is thinking...");
        // SIMULATION: 
        // We will simulate a changing decision to prove the agent is "alive".
        // In reality, this would be: `const decision = await openai.chat.completions.create(...)`
        // Mock addresses for demonstration
        const mockUsers = [
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Alice
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Bob
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Charlie
        ];
        // Randomly pick 2 winners
        const winners = mockUsers.sort(() => 0.5 - Math.random()).slice(0, 2);
        // Split 50/50 (5000 bps each)
        const recipientAddresses = winners;
        const bps = [5000, 5000];
        return {
            recipients: recipientAddresses,
            bps: bps,
            reasoning: `Selected ${winners.length} active contributors based on recent activity logs.`
        };
    }
}
exports.Brain = Brain;
