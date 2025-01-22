"use client";
import WalletButton from "../components/WalletButton";
import CreateNFT from "./CreateNFT";
import GameComponent from "./GameComponent";
import { useState } from "react";
import Image from "next/image";
import uzumaki from "../images/uzumaki.jpg";

export default function TopBar({ onSelect }: { onSelect: (view: string) => void }) {
  const [showCreateNFT, setShowCreateNFT] = useState(false);
  const [showGame, setShowGame] = useState(false);

  return (
    <nav className="bg-blue-900 p-1 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-white text-xl font-bold px-6">
          <Image
            src={uzumaki}
            alt="Uzumaki"
            width={40}
            height={40}
            className="rounded-full mr-2"
          />
          Naruto RPS Game
        </div>

        <ul className="flex space-x-6 text-white text-lg font-medium">
          <li
            className="cursor-pointer hover:text-orange-400 transition"
            onClick={() => onSelect("home")}
          >
            Home
          </li>
          <li
            className="cursor-pointer hover:text-orange-400 transition"
            onClick={() => setShowCreateNFT(!showCreateNFT)}
          >
            {showCreateNFT ? "Close Create NFT" : "Create NFT"}
          </li>
          <li
            className="cursor-pointer hover:text-orange-400 transition"
            onClick={() => setShowGame(!showGame)}
          >
            {showGame ? "Close Game" : "Start Game"}
          </li>
          <li
            className="cursor-pointer hover:text-orange-400 transition"
            onClick={() => onSelect("viewNFTs")}
          >
            View My NFTs
          </li>
        </ul>

        <div className="px-6">
          <WalletButton />
        </div>
      </div>

      {showCreateNFT && (
        <div className="mt-4">
          <CreateNFT onClose={() => setShowCreateNFT(false)} />
        </div>
      )}

      {showGame && (
        <div className="mt-4">
          <GameComponent onClose={() => setShowGame(false)} />
        </div>
      )}
    </nav>
  );
}
