"use client";

import React, { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  Transaction,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { BLOCKCHAIN } from "@/constants/blockchain";

export default function InitializePage() {
  const { publicKey, requestTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const initializeProgram = async () => {
    if (!publicKey || !requestTransaction) {
      setError("Wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);

    try {
      const tx = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.TestnetBeta,
        BLOCKCHAIN.PROGRAM_ID,
        "initialize",
        [publicKey, "10000000u64"],
        1_000_000
      );

      const transactionId = await requestTransaction(tx);
      setTxId(transactionId);
      console.log("Initialize Tx ID:", transactionId);
    } catch (err) {
      setError(
        `Failed to initialize: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <button onClick={initializeProgram}>Initialize program</button>
    </div>
  );
}
