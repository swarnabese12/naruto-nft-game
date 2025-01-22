"use client";
import type { NextPage } from "next";
import { useWallet } from "@solana/wallet-adapter-react";

import { WalletButtonImport } from "./WalletContextProvider";

const WalletButton: NextPage = () => {
  const { publicKey } = useWallet();
  return (
      <div className="mt-2 rounded">
        <WalletButtonImport>
          {publicKey
            ? publicKey.toBase58().substring(0, 6) + "..."
            : "Connect!"}
        </WalletButtonImport>
      </div>
  );
};
export default WalletButton;
