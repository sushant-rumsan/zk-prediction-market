"use client";
import React, { StrictMode, useMemo } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
import { PuzzleWalletAdapter } from "aleo-adapters";
import { BLOCKCHAIN } from "@/constants/blockchain";

export default function DemoxProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const wallets = useMemo(
    () => [
      new PuzzleWalletAdapter({
        programIdPermissions: {
          [WalletAdapterNetwork.TestnetBeta]: [BLOCKCHAIN.PROGRAM_ID],
        },
        appName: "ZK prediction Maket",
        appDescription: "A privacy-focused Prediction Market",
      }),
    ],
    []
  );

  return (
    <StrictMode>
      <WalletProvider
        wallets={wallets}
        decryptPermission={DecryptPermission.UponRequest}
        network={WalletAdapterNetwork.TestnetBeta}
        autoConnect
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </StrictMode>
  );
}
