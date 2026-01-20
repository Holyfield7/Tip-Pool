import { useState } from 'react';
import './index.css';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ActivityItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'market';
  text: string;
  time: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create-user' | 'hackathon'>('dashboard');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: '1', type: 'info', text: 'Agent initialized on Cronos EVM Testnet', time: new Date().toLocaleTimeString() },
    { id: '2', type: 'market', text: 'CRO/USD: $0.145 (+2.3%) - Source: CDC Market Data', time: new Date().toLocaleTimeString() }
  ]);

  // Users State
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  // Wallet State
  const [checkId, setCheckId] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  // Transaction State
  const [creditData, setCreditData] = useState({ userId: '', amount: '' });
  const [tipData, setTipData] = useState({ fromId: '', toId: '', amount: '' });

  const addActivity = (type: ActivityItem['type'], text: string) => {
    setActivities(prev => [{ id: Math.random().toString(), type, text, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setCreatedUser({ id: data.user_id, name: newUser.name, email: newUser.email });
      showMessage('success', `User created with ID: ${data.user_id}`);
      addActivity('success', `New user registered: ${newUser.name} (ID: ${data.user_id})`);
      setNewUser({ name: '', email: '' });
    } catch (err: unknown) {
      if (err instanceof Error) showMessage('error', err.message);
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
    } catch (err: unknown) {
      if (err instanceof Error) showMessage('error', err.message);
    }
  };

  const handleTip = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setTipData({ fromId: '', toId: '', amount: '' });
    } catch (err: unknown) {
      if (err instanceof Error) showMessage('error', err.message);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-primary blur-2xl opacity-20"></div>
            <img src="/assets/logo.png" alt="Tip Pool Logo" className="w-16 h-16 relative z-10" />
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

        <nav className="flex glass-panel p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('create-user')}
            className={`nav-tab ${activeTab === 'create-user' ? 'active' : ''}`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('hackathon')}
            className={`nav-tab ${activeTab === 'hackathon' ? 'active' : ''}`}
          >
            Hackathon
          </button>
        </nav>
      </header>

      {message && (
        <div
          className={`fixed top-8 right-8 p-4 rounded-2xl shadow-2xl animate-fade-in z-50 flex items-center gap-3 glass-panel border-l-4 ${message.type === 'success' ? 'border-l-green-500' : 'border-l-red-500'
            }`}
        >
          <span className="text-xl">{message.type === 'success' ? '✨' : '⚠️'}</span>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <main>
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Left Column: Actions */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Balance Checker */}
                <section className="glass-panel p-8">
                  <h3 className="text-xl mb-6 flex items-center gap-2">
                    <span className="text-accent-cyan">💳</span> Wallet Registry
                  </h3>
                  <div className="flex gap-3">
                    <input
                      placeholder="Enter User ID"
                      value={checkId}
                      onChange={e => setCheckId(e.target.value)}
                    />
                    <button onClick={handleCheckBalance} className="primary px-8">View</button>
                  </div>
                  {balance !== null && (
                    <div className="mt-8 pt-8 border-t border-glass-border text-center">
                      <p className="text-text-muted text-sm uppercase tracking-widest font-semibold mb-1">Available Liquidity</p>
                      <p className="text-5xl font-bold font-outfit">${balance.toFixed(2)}</p>
                    </div>
                  )}
                </section>

                {/* Credit Funds */}
                <section className="glass-panel p-8">
                  <h3 className="text-xl mb-6 flex items-center gap-2">
                    <span className="text-green-400">⚡</span> Settlement Top-up
                  </h3>
                  <form onSubmit={handleCredit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label>Receiver ID</label>
                        <input
                          value={creditData.userId}
                          onChange={e => setCreditData({ ...creditData, userId: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label>Amount ($)</label>
                        <input
                          type="number"
                          value={creditData.amount}
                          onChange={e => setCreditData({ ...creditData, amount: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="primary w-full">Execute Deposit</button>
                  </form>
                </section>
              </div>

              {/* Tipping Section */}
              <section className="glass-panel p-8 bg-gradient-to-br from-glass-bg to-bg-dark">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl flex items-center gap-2">
                    <span className="text-accent-primary text-2xl">🌍</span> Programmatic P2P Tipping
                  </h3>
                  <img src="https://cryptologos.cc/logos/cronos-cro-logo.png" alt="Cronos" className="h-6 opacity-50" />
                </div>
                <form onSubmit={handleTip} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div>
                    <label>From ID</label>
                    <input value={tipData.fromId} onChange={e => setTipData({ ...tipData, fromId: e.target.value })} required />
                  </div>
                  <div>
                    <label>To ID</label>
                    <input value={tipData.toId} onChange={e => setTipData({ ...tipData, toId: e.target.value })} required />
                  </div>
                  <div>
                    <label>Amount ($)</label>
                    <input type="number" value={tipData.amount} onChange={e => setTipData({ ...tipData, amount: e.target.value })} required />
                  </div>
                  <button type="submit" className="primary w-full">Initiate Rail</button>
                </form>
                <p className="mt-4 text-xs text-text-muted italic">
                  Powered by x402: Tips are recorded off-chain and settled on Cronos EVM by the Tip-Pool Agent.
                </p>
              </section>
            </div>

            {/* Right Column: Activity Feed */}
            <div className="space-y-8">
              <section className="glass-panel p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_10px_var(--accent-cyan)]"></span>
                    Agent Live Feed
                  </h3>
                  <span className="text-xs text-text-muted uppercase">Real-time</span>
                </div>
                <div className="activity-feed flex-1">
                  {activities.map(act => (
                    <div key={act.id} className="activity-item animate-fade-in">
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

              {/* CDC Market Data Section */}
              <section className="glass-panel p-6 bg-accent-cyan/5 border-accent-cyan/20">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent-cyan mb-4 flex items-center gap-2">
                  <img src="https://crypto.com/favicon.ico" className="w-4 h-4" /> Market Oracle
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
          </div>
        )}

        {activeTab === 'create-user' && (
          <div className="max-w-xl mx-auto animate-fade-in mt-12">
            <div className="glass-panel p-10">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-accent-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-accent-primary/20">
                  <span className="text-4xl text-accent-primary">👤</span>
                </div>
                <h2 className="text-2xl font-bold">Register Identity</h2>
                <p className="text-text-muted mt-2">Create a new wallet on the Tip-Pool settlement layer.</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div>
                  <label>Display Name</label>
                  <input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Satoshi Nakamoto"
                    required
                  />
                </div>
                <div>
                  <label>Email Link</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="satoshi@bitcoin.org"
                    required
                  />
                </div>
                <button type="submit" className="primary w-full py-4 mt-4">
                  Provision Account
                </button>
              </form>

              {createdUser && (
                <div className="mt-10 p-6 bg-accent-cyan/10 rounded-2xl border border-accent-cyan/20 animate-fade-in">
                  <p className="text-xs text-accent-cyan font-bold uppercase tracking-widest mb-2 text-center">Identity Created Successfully</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-text-muted text-sm italic">Allocated ID:</span>
                    <span className="text-4xl font-mono font-black text-white">{createdUser.id}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hackathon' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in max-w-5xl mx-auto mt-12">
            <div className="glass-panel p-10 space-y-6">
              <h2 className="text-3xl font-bold gradient-text">Cronos x402 Hackathon</h2>
              <p className="text-text-secondary leading-relaxed">
                Tip-Pool is built for the <strong>Main Track (x402 Applications)</strong> and the <strong>Agentic Finance Track</strong>.
                Our solution enables intelligent, automated tipping flows that bridge off-chain intent with on-chain settlement.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h4 className="font-bold">x402 Agentic Finance</h4>
                    <p className="text-xs text-text-muted">Uses x402 programmatic rails for automated, batchable on-chain settlement of micro-tips.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <h4 className="font-bold">Cronos EVM Native</h4>
                    <p className="text-xs text-text-muted">Deployed on Cronos Testnet, leveraging low fees and sub-second block times for smooth agents.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-panel p-8 bg-accent-secondary/5 border-accent-secondary/20">
                <h3 className="text-xl font-bold mb-4">Core Innovation</h3>
                <ul className="space-y-3 text-text-secondary text-sm">
                  <li className="flex gap-2"><span className="text-accent-primary">✔</span> Agent-triggered settlement pipelines</li>
                  <li className="flex gap-2"><span className="text-accent-primary">✔</span> Conditional treasury routing logic</li>
                  <li className="flex gap-2"><span className="text-accent-primary">✔</span> CDC Market Data integration simulation</li>
                  <li className="flex gap-2"><span className="text-accent-primary">✔</span> Dynamic recipient distribution weighting</li>
                </ul>
              </div>

              <div className="p-8 rounded-3xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-white/10 text-center">
                <p className="text-sm font-medium mb-4">Ready for Submission</p>
                <div className="flex justify-center gap-4">
                  <img src="https://dorahacks.io/favicon.ico" className="w-8 h-8 opacity-60" />
                  <img src="/assets/logo.png" className="w-8 h-8" />
                  <img src="https://crypto.com/favicon.ico" className="w-8 h-8 opacity-60" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-glass-border text-center text-text-muted text-sm">
        <p>© 2026 Tip Pool - Built for Cronos x402 Hackathon</p>
      </footer>
    </div>
  );
}

export default App;
