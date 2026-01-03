import React from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const TipWidget: React.FC<{ tipPoolAddress: string }> = ({ tipPoolAddress }) => {
  const sendTip = async (amountCRO: string) => {
    if (!window.ethereum) {
      alert("Please install MetaMask or a Cronos-compatible wallet.");
      return;
    }
    try {
      // ethers v6 BrowserProvider
      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: tipPoolAddress,
        value: ethers.parseEther(amountCRO)
      });
      console.log("Tip tx sent", tx.hash);
      await tx.wait();
      alert("Tip sent: " + tx.hash);
    } catch (err: any) {
      console.error(err);
      alert("Error sending tip: " + (err?.message || err));
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, width: 260 }}>
      <h4>Tip the creator</h4>
      <button onClick={() => sendTip("0.1")}>Tip 0.1 CRO</button>
      <button onClick={() => sendTip("0.5")} style={{ marginLeft: 8 }}>Tip 0.5 CRO</button>
    </div>
  );
};

export default TipWidget;
