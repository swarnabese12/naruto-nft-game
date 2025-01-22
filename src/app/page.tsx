"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import "./globals.css";
import TopBar from "../app/components/TopBar";
import ViewAllNFTs from "./components/ViewAllNfts";
import { useEffect, useState } from "react";
import naruto from "../app/images/naruto.jpg";

function HomeComponent() {
  return (
    <div
      className="relative h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${naruto.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative flex items-center justify-center h-full text-white text-3xl font-bold">
        Welcome to Naruto RPS Game!
      </div>
    </div>
  );
}

export default function Home() {
  const { publicKey }: any = useWallet();
  const [isClient, setIsClient] = useState(false);
  const [selectedView, setSelectedView] = useState("home");

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <main className="h-screen items-center justify-center font-game">
      <TopBar onSelect={(view) => setSelectedView(view)} />
      <div>
        {selectedView === "home" && <HomeComponent />}
        {selectedView === "viewNFTs" && <ViewAllNFTs />}
      </div>
    </main>
  );
}
