"use client";
import { PuzzleWalletProvider } from "@puzzlehq/sdk";

export default function PuzzleProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PuzzleWalletProvider>{children}</PuzzleWalletProvider>;
}
