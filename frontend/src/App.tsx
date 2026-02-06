import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Users,
  History,
  Copy,
  PlusCircle,
  Search,
  Award,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

interface User {
  id: number;
  name: string;
  email: string;
  balance?: number;
}

interface Tip {
  id: number;
  from_user_id: number;
  to_user_id: number;
  amount: number;
  status: string;
  created_at: string;
  from_name: string;
  to_name: string;
}

interface ActivityItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'market';
  text: string;
  time: string;
}


const API_URL = import.meta.env.VITE_API_URL || '';

// Add type for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

import LandingPage from './components/LandingPage';

function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'directory' | 'create-user' | 'hackathon'>('landing');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: '1', type: 'info', text: 'Agent initialized on Cronos EVM Testnet', time: new Date().toLocaleTimeString() },
    { id: '2', type: 'market', text: 'CRO/USD: $0.145 (+2.3%) - Source: CDC Market Data', time: new Date().toLocaleTimeString() }
  ]);

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [creditData, setCreditData] = useState({ userId: '', amount: '' });
  const [tipData, setTipData] = useState({ fromId: '', toId: '', amount: '' });
  const [checkId, setCheckId] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (activeTab === 'landing') return; // Don't fetch on landing

    fetchUsers();
    fetchTips();
    const interval = setInterval(() => {
      fetchTips();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchTips = async () => {
    try {
      const res = await fetch(`${API_URL}/tips`);
      const data = await res.json();
      setTips(data);
    } catch (err) {
      console.error("Failed to fetch tips", err);
    }
  };

  const addActivity = (type: ActivityItem['type'], text: string) => {
    setActivities(prev => [{ id: Math.random().toString(), type, text, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      showMessage('success', `User created with ID: ${data.user_id}`);
      addActivity('success', `New user registered: ${newUser.name} (ID: ${data.user_id})`);
      setNewUser({ name: '', email: '' });
      fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBalance = async () => {
    try {
      if (!checkId) return;
      const res = await fetch(`${API_URL}/wallets/${checkId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setBalance(Number(data.balance));
      showMessage('success', `Balance retrieved for User ${checkId}`);
    } catch {
      showMessage('error', 'User not found');
      setBalance(null);
    }
  };

  const handleCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wallets/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(creditData.userId), amount: parseFloat(creditData.amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      showMessage('success', `Credited $${creditData.amount} to User ${creditData.userId}`);
      addActivity('info', `Funds added to Wallet ${creditData.userId}: $${creditData.amount}`);
      setCreditData({ userId: '', amount: '' });
      if (checkId === creditData.userId) handleCheckBalance();
      fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: parseInt(tipData.fromId),
          to_user_id: parseInt(tipData.toId),
          amount: parseFloat(tipData.amount)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      showMessage('success', `Tip sent! Processing via x402 agent...`);
      addActivity('warning', `Tip recorded: $${tipData.amount} (Waiting for Agent processing)`);
      setTipData({ ...tipData, amount: '' });
      fetchTips();
      fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('success', 'Copied to clipboard!');
  };

  if (activeTab === 'landing') {
    return <LandingPage />;
  }

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        showMessage('success', 'Wallet Connected: ' + accounts[0].slice(0, 6) + '...');
      } catch (err) {
        showMessage('error', 'Failed to connect wallet');
      }
    } else {
      showMessage('error', 'Please install MetaMask or a Web3 Wallet');
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <img src="/assets/logo.png" alt="" className="watermark" />

      <header className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="absolute inset-0 bg-accent-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img src="/assets/logo.png" alt="Tip Pool Logo" className="w-12 h-12 relative z-10 hover-scale" />
          </div>
          <div>
            <h1 className="gradient-text font-bold">Tip Pool</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="status-badge status-online">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                x402 Facilitator Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <nav className="flex glass-panel p-1.5 gap-1 overflow-x-auto max-w-full custom-scrollbar">
            <button onClick={() => setActiveTab('dashboard')} className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}>
              <div className="flex items-center gap-2 whitespace-nowrap"><Wallet size={16} /> Dashboard</div>
            </button>
            <button onClick={() => setActiveTab('directory')} className={`nav-tab ${activeTab === 'directory' ? 'active' : ''}`}>
              <div className="flex items-center gap-2 whitespace-nowrap"><Users size={16} /> Directory</div>
            </button>
            <button onClick={() => setActiveTab('create-user')} className={`nav-tab ${activeTab === 'create-user' ? 'active' : ''}`}>
              <div className="flex items-center gap-2 whitespace-nowrap"><PlusCircle size={16} /> Register</div>
            </button>
            <button onClick={() => setActiveTab('hackathon')} className={`nav-tab ${activeTab === 'hackathon' ? 'active' : ''}`}>
              <div className="flex items-center gap-2 whitespace-nowrap"><Award size={16} /> Hackathon</div>
            </button>
          </nav>

          <button onClick={connectWallet} className="primary px-6 py-2 md:py-3 text-sm flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center">
            {walletAddress ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </>
            ) : (
              <>
                <Wallet size={16} /> Connect Wallet
              </>
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-8 right-8 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 glass-panel border-l-4 ${message.type === 'success' ? 'border-l-green-500' : 'border-l-red-500'
              }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Balance Checker */}
                <section className="glass-panel p-8 hover-scale">
                  <h3 className="text-xl mb-6 flex items-center gap-2">
                    <Search className="text-accent-cyan" size={20} /> Wallet Registry
                  </h3>
                  <div className="flex gap-3">
                    <input
                      id="checkId"
                      aria-label="User ID to check balance"
                      placeholder="Enter User ID"
                      value={checkId}
                      onChange={e => setCheckId(e.target.value)}
                    />
                    <button onClick={handleCheckBalance} className="primary px-8">View</button>
                  </div>
                  {balance !== null && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 pt-8 border-t border-glass-border text-center">
                      <p className="text-text-muted text-sm uppercase tracking-widest font-semibold mb-1">Available Liquidity</p>
                      <p className="text-5xl font-bold font-outfit">${balance.toFixed(2)}</p>
                    </motion.div>
                  )}
                </section>

                {/* Credit Funds */}
                <section className="glass-panel p-8 hover-scale">
                  <h3 className="text-xl mb-6 flex items-center gap-2">
                    <Zap className="text-green-400" size={20} /> Settlement Top-up
                  </h3>
                  <form onSubmit={handleCredit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="creditUserId">Receiver ID</label>
                        <input
                          id="creditUserId"
                          value={creditData.userId}
                          onChange={e => setCreditData({ ...creditData, userId: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="creditAmount">Amount ($)</label>
                        <input
                          id="creditAmount"
                          type="number"
                          value={creditData.amount}
                          onChange={e => setCreditData({ ...creditData, amount: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="primary w-full" disabled={loading}>
                      {loading ? 'Processing...' : 'Execute Deposit'}
                    </button>
                  </form>
                </section>
              </div>

              {/* Tipping Section */}
              <section className="glass-panel p-8 bg-gradient-to-br from-glass-bg to-bg-dark hover-scale">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl flex items-center gap-2">
                    <Globe className="text-accent-primary" size={24} /> Programmatic P2P Tipping
                  </h3>
                  <img src="https://cryptologos.cc/logos/cronos-cro-logo.png" alt="Cronos" className="h-6 opacity-50" />
                </div>
                <form onSubmit={handleTip} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div>
                    <label htmlFor="tipFromId">From ID</label>
                    <input id="tipFromId" value={tipData.fromId} onChange={e => setTipData({ ...tipData, fromId: e.target.value })} required />
                  </div>
                  <div>
                    <label htmlFor="tipToId">To ID</label>
                    <input id="tipToId" value={tipData.toId} onChange={e => setTipData({ ...tipData, toId: e.target.value })} required />
                  </div>
                  <div>
                    <label htmlFor="tipAmount">Amount ($)</label>
                    <input id="tipAmount" type="number" value={tipData.amount} onChange={e => setTipData({ ...tipData, amount: e.target.value })} required />
                  </div>
                  <button type="submit" className="primary w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Initiate Rail'}
                  </button>
                </form>
              </section>

              {/* Transaction History */}
              <section className="glass-panel p-8">
                <h3 className="text-xl mb-6 flex items-center gap-2">
                  <History className="text-accent-primary" size={20} /> Transaction History
                </h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tips.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-text-muted">No transactions found</td></tr>
                      ) : (
                        tips.map(tip => (
                          <tr key={tip.id}>
                            <td className="font-mono text-xs">{tip.id}</td>
                            <td><span className="text-white font-medium">{tip.from_name}</span> <span className="text-xs text-text-muted">#{tip.from_user_id}</span></td>
                            <td><span className="text-white font-medium">{tip.to_name}</span> <span className="text-xs text-text-muted">#{tip.to_user_id}</span></td>
                            <td className="text-green-400 font-bold">${tip.amount}</td>
                            <td>
                              <span className={`status-badge ${tip.status === 'processed' ? 'status-online' : 'status-busy'}`}>
                                {tip.status}
                              </span>
                            </td>
                            <td className="text-xs">{new Date(tip.created_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="glass-panel p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Terminal size={18} className="text-accent-cyan" />
                    Agent Live Feed
                  </h3>
                  <span className="text-xs text-text-muted uppercase">Real-time</span>
                </div>
                <div className="activity-feed flex-1">
                  {activities.map(act => (
                    <div key={act.id} className="activity-item">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${act.type === 'success' ? 'bg-green-500/10 text-green-400' :
                          act.type === 'warning' ? 'bg-orange-500/10 text-orange-400' :
                            act.type === 'market' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                          {act.type}
                        </span>
                        <span className="text-[10px] text-text-muted">{act.time}</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-snug">{act.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-panel p-6 bg-accent-cyan/5 border-accent-cyan/20">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent-cyan mb-4 flex items-center gap-2">
                  <Globe size={14} /> Market Oracle
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">CRO / USD</span>
                    <span className="font-mono text-green-400">$0.1458</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Gas Premium</span>
                    <span className="font-mono text-text-primary">1.2 Gwei</span>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === 'directory' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass-panel p-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Users className="text-accent-primary" /> Registered Identities
              </h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="font-bold text-white">{user.id}</td>
                        <td>{user.name}</td>
                        <td className="text-text-muted text-sm">{user.email}</td>
                        <td className="font-mono font-bold text-accent-cyan">${Number(user.balance).toFixed(2)}</td>
                        <td>
                          <button
                            onClick={() => copyToClipboard(user.id.toString())}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-accent-cyan"
                            title="Copy ID"
                          >
                            <Copy size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'create-user' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto mt-12">
            <div className="glass-panel p-10">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-accent-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-accent-primary/20">
                  <Users size={40} className="text-accent-primary" />
                </div>
                <h2 className="text-2xl font-bold">Register Identity</h2>
                <p className="text-text-muted mt-2">Create a new wallet on the Tip-Pool settlement layer.</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div>
                  <label htmlFor="regName">Display Name</label>
                  <input
                    id="regName"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Satoshi Nakamoto"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="regEmail">Email Link</label>
                  <input
                    id="regEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="satoshi@bitcoin.org"
                    required
                  />
                </div>
                <button type="submit" className="primary w-full py-4 mt-4" disabled={loading}>
                  {loading ? 'Provisioning...' : 'Provision Account'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'hackathon' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
            <div className="glass-panel p-10 space-y-6">
              <h2 className="text-3xl font-bold gradient-text">Cronos x402 Hackathon</h2>
              <p className="text-text-secondary leading-relaxed">
                Tip-Pool is built for the <strong>Main Track (x402 Applications)</strong> and the <strong>Agentic Finance Track</strong>.
                Our solution enables intelligent, automated tipping flows that bridge off-chain intent with on-chain settlement.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover-scale">
                  <Zap className="text-accent-primary" />
                  <div>
                    <h4 className="font-bold">x402 Agentic Finance</h4>
                    <p className="text-xs text-text-muted">Uses x402 programmatic rails for automated, batchable on-chain settlement of micro-tips.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover-scale">
                  <Globe className="text-accent-cyan" />
                  <div>
                    <h4 className="font-bold">Cronos EVM Native</h4>
                    <p className="text-xs text-text-muted">Deployed on Cronos Testnet, leveraging low fees and sub-second block times for smooth agents.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-panel p-8 bg-accent-secondary/5 border-accent-secondary/20 hover-scale">
                <h3 className="text-xl font-bold mb-4">Core Innovation</h3>
                <ul className="space-y-3 text-text-secondary text-sm">
                  <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-accent-primary" /> Agent-triggered settlement pipelines</li>
                  <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-accent-primary" /> Conditional treasury routing logic</li>
                  <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-accent-primary" /> CDC Market Data integration simulation</li>
                  <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-accent-primary" /> Dynamic recipient distribution weighting</li>
                </ul>
              </div>

              <div className="p-8 rounded-3xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-white/10 text-center">
                <p className="text-sm font-medium mb-4">Ready for Submission</p>
                <div className="flex justify-center gap-6 items-center">
                  <a href="https://dorahacks.io" target="_blank" rel="noopener noreferrer" title="DoraHacks"><ExternalLink size={20} className="opacity-60 hover:opacity-100" /></a>
                  <img src="/assets/logo.png" className="w-8 h-8 hover-scale" alt="Logo" />
                  <a href="https://crypto.com" target="_blank" rel="noopener noreferrer" title="Crypto.com"><Zap size={20} className="opacity-60 hover:opacity-100" /></a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-glass-border text-center text-text-muted text-sm">
        <p>© 2026 Tip Pool - Built for Cronos x402 Hackathon</p>
      </footer>
    </div>
  );
}

export default App;
