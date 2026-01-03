import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const TIPPOOL_ABI = [
  "function getBalance() view returns (uint256)",
  "function getRecipients() view returns (address[], uint256[])",
  "event TipReceived(address indexed from, uint256 amount)",
  "event PayoutExecuted(uint256 total, address[] recipients, uint256[] amounts)"
];

export default function CreatorDashboard({ tipPoolAddress }: { tipPoolAddress: string }) {
  const [balance, setBalance] = useState<string>("0");
  const [recipients, setRecipients] = useState<{ addr: string; bps: number }[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider((window as any).__CRONOS_RPC__ || "https://evm-cronos-testnet.example");
    const contract = new ethers.Contract(tipPoolAddress, TIPPOOL_ABI, provider);

    async function load() {
      try {
        const b = await contract.getBalance();
        setBalance(ethers.formatEther(b));
        const [addrs, bps] = await contract.getRecipients();
        const merged = addrs.map((a: string, i: number) => ({ addr: a, bps: Number(bps[i]) }));
        setRecipients(merged);
      } catch (err) {
        console.warn(err);
      }
    }

    load();

    contract.on("TipReceived", (from: string, amount: any) => {
      setLogs((s) => [`Tip ${ethers.formatEther(amount)} from ${from}`, ...s].slice(0, 50));
      load();
    });

    contract.on("PayoutExecuted", (total: any, addrs: string[], amounts: any[]) => {
      setLogs((s) => [`Payout ${ethers.formatEther(total)} executed`, ...s].slice(0, 50));
      load();
    });

    return () => {
      contract.removeAllListeners("TipReceived");
      contract.removeAllListeners("PayoutExecuted");
    };
  }, [tipPoolAddress]);

  return (
    <div style={{ padding: 12 }}>
      <h3>Creator Dashboard</h3>
      <p>Contract: {tipPoolAddress}</p>
      <p>Balance: {balance} CRO</p>
      <h4>Recipients</h4>
      <ul>
        {recipients.map((r) => <li key={r.addr}>{r.addr} — {r.bps / 100}%</li>)}
      </ul>
      <h4>Logs</h4>
      <div style={{ maxHeight: 240, overflow: "auto", border: "1px solid #eee", padding: 8 }}>
        {logs.map((l, i) => <div key={i} style={{ marginBottom: 6 }}>{l}</div>)}
      </div>
    </div>
  );
}
