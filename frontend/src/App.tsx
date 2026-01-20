import { useState } from 'react';
import './index.css';

interface User {
  id: number;
  name: string;
  email: string;
}

const API_URL = 'http://localhost:9000';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create-user'>('dashboard');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Users State
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  // Wallet State
  const [checkId, setCheckId] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  // Transaction State
  const [creditData, setCreditData] = useState({ userId: '', amount: '' });
  const [tipData, setTipData] = useState({ fromId: '', toId: '', amount: '' });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handeCreateUser = async (e: React.FormEvent) => {
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
      setNewUser({ name: '', email: '' });
    } catch (err: any) {
      showMessage('error', err.message);
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
    } catch (err: any) {
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
      setCreditData({ userId: '', amount: '' });
      if (checkId === creditData.userId) handleCheckBalance();
    } catch (err: any) {
      showMessage('error', err.message);
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

      showMessage('success', `Sent $${tipData.amount} from User ${tipData.fromId} to User ${tipData.toId}`);
      setTipData({ fromId: '', toId: '', amount: '' });
    } catch (err: any) {
      showMessage('error', err.message);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎱</span>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Tip Pool
            </h1>
            <p className="text-text-muted">Agentic Payout Router</p>
          </div>
        </div>

        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('create-user')}
            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'create-user' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            Create User
          </button>
        </nav>
      </header>

      {message && (
        <div
          className={`fixed top-6 right-6 p-4 rounded-lg shadow-xl flex items-center gap-2 z-50 ${message.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'}`}
        >
          {message.type === 'success' ? '✅' : '⚠️'}
          {message.text}
        </div>
      )}

      <main>
        {activeTab === 'create-user' ? (
          <div className="glass-panel p-8 max-w-xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6 text-indigo-400">
              <span className="text-2xl">👤</span>
              <h2 className="text-xl">Register New User</h2>
            </div>
            <form onSubmit={handeCreateUser} className="space-y-4">
              <div>
                <label>Full Name</label>
                <input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Alice Wonderland"
                  required
                />
              </div>
              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="alice@example.com"
                  required
                />
              </div>
              <button type="submit" className="primary w-full flex justify-center items-center gap-2">
                <span>Create Account</span>
                <span>➕</span>
              </button>
            </form>

            {createdUser && (
              <div className="mt-6 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <p className="text-sm text-indigo-300">New User ID for testing:</p>
                <p className="text-3xl font-mono font-bold text-white">{createdUser.id}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Wallet Checker */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-4 text-purple-400">
                <span className="text-2xl">💳</span>
                <h2 className="text-xl">Check Wallet</h2>
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="User ID"
                  value={checkId}
                  onChange={e => setCheckId(e.target.value)}
                  className="max-w-[120px]"
                />
                <button onClick={handleCheckBalance} className="primary">Check</button>
              </div>

              {balance !== null && (
                <div className="mt-6 text-center">
                  <p className="text-text-muted">Current Balance</p>
                  <p className="text-4xl font-bold text-white mt-1">${balance.toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Credit Wallet */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-4 text-green-400">
                <span className="text-2xl">💸</span>
                <h2 className="text-xl">Credit Wallet</h2>
              </div>
              <form onSubmit={handleCredit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label>User ID</label>
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
                <button type="submit" className="primary w-full">Add Funds</button>
              </form>
            </div>

            {/* Send Tip */}
            <div className="glass-panel p-6 md:col-span-2 bg-gradient-to-br from-[#1e293b]/70 to-[#0f172a]/70">
              <div className="flex items-center gap-3 mb-4 text-pink-400">
                <span className="text-2xl">🚀</span>
                <h2 className="text-xl">Send P2P Tip</h2>
              </div>
              <form onSubmit={handleTip} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label>From User ID</label>
                  <input
                    value={tipData.fromId}
                    onChange={e => setTipData({ ...tipData, fromId: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1 w-full">
                  <label>To User ID</label>
                  <input
                    value={tipData.toId}
                    onChange={e => setTipData({ ...tipData, toId: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1 w-full">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    value={tipData.amount}
                    onChange={e => setTipData({ ...tipData, amount: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="primary w-full md:w-auto min-w-[120px] flex items-center justify-center gap-2">
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
