# Tip-Pool 🎱

**Agentic Creator Tip & Payout Router**

> **Hackathon Submission 2026**
> Category: Payments / Web3 Infrastructure / AI Agents

Tip-Pool is a lightweight payment platform design for content creators and teams. It allows for seamless wallet management and instant tipping, with a roadmap evolving towards **AI-driven automated automated distribution** on the Cronos blockchain.

## 🚀 Vision

Currently, managing micropayments and tips for a team is chaotic. Tip-Pool solves this by creating a centralized "Pool" that can be:
1.  **Funded** (Tips/Credits)
2.  **Routed** (P2P Tipping)
3.  **Automated** (Future: AI Agents distributing funds based on on-chain rules)

## 🛠 Tech Stack

*   **Backend**: PHP 8.2 (Vanilla, High Performance)
*   **Database**: MySQL
*   **Environment**: XAMPP / Localhost
*   **Architecture**: MVC (Model-View-Controller)
*   **Future**: Solidity (Cronos EVM), Node.js AI Agents

## ⚡ Quick Start

### 1. Requirements
*   PHP 8.0+
*   MySQL

### 2. Installation
```bash
# Clone the repo
git clone https://github.com/yourusername/tip-pool.git

# Navigate to folder
cd tip-pool
```

### 3. Database Setup
Import the following SQL logic (or let the app auto-create):
```sql
CREATE DATABASE tip_pool;
-- (See database.php for table schemas)
```

### 4. Run Server
```bash
php -S localhost:9000 -t public
```
The API is now live at `http://localhost:9000`.

## 🔌 API Endpoints

### 1. Create User
**POST** `/users`
```json
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

### 2. Credit Wallet
**POST** `/wallets/credit`
```json
{
  "user_id": 1,
  "amount": 100
}
```

### 3. Send Tip 💸
**POST** `/tips`
```json
{
  "from_user_id": 1,
  "to_user_id": 2,
  "amount": 25
}
```

### 4. Check Balance
**GET** `/wallets/1`

## 🔮 Roadmap (Hackathon Phase)

*   [x] **Phase 1: Payment Core**: Users, Wallets, and Off-chain ledger (PHP/MySQL).
*   [ ] **Phase 2: The Agent**: Integrate an AI Agent to listen to the ledger and execute payout logic.
*   [ ] **Phase 3: On-Chain Settlement**: Deploy `TipPool.sol` to Cronos Testnet to settle final balances weekly.

---
*Built with ❤️ for the Cronos Hackathon.*
