"use client";

import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { fetchAllDigitalAssetByOwner } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { prepareAssets } from "../../../utils";
import { BiTransfer } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";
import TransferNFTModal from "../components/TransferNFTModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function ViewAllNFTs() {
  const wallet = useWallet();
  const { publicKey }: any = useWallet();
  const { connection } = useConnection();
  const umi = createUmi(connection.rpcEndpoint)
    .use(walletAdapterIdentity(wallet))
    .use(mplTokenMetadata());
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTransferClick = (nft: any) => {
    setSelectedNFT(nft);
    setShowTransferModal(true);
  };

  const closeTransferModal = () => {
    setSelectedNFT(null);
    setShowTransferModal(false);
  };

  const handleDragStart = (e: any, index: any) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedItem === null) return;

    const updatedNfts = [...nfts];
    const [removed] = updatedNfts.splice(draggedItem, 1);
    updatedNfts.splice(index, 0, removed);

    setNfts(updatedNfts);
    setDraggedItem(null);
  };

  const fetchAssets = async () => {
    setLoading(true);
    if (!umi || !publicKey) {
      setLoading(false);
      return;
    }

    try {
      const assets: any = await fetchAllDigitalAssetByOwner(umi, publicKey);
      const result: any = await prepareAssets(assets);
      setNfts(result);
    } catch (err) {
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [publicKey]);

  const filteredNFTs = nfts.filter(
    (nft: any) =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between px-8 mb-1">
        <h1 className="text-2xl font-bold">Your NFT Space</h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NFTs"
            className="border border-gray-300 rounded-lg px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 w-full"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading && (
        <div className="h-[calc(100vh-4rem)] p-4">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center z-50">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-4xl animate-spin text-orange-400"
            />
            <p className="mt-4 text-xl text-white-600">Loading NFTs, please wait...</p>
          </div>
        </div>
      )}
      {!loading && filteredNFTs.length > 0 && (
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {filteredNFTs.map((nft: any, index) => (
              <div
                key={index}
                className="relative bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 flex flex-col items-center overflow-hidden"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {nft.image_url ? (
                  <img
                    src={nft.image_url}
                    alt={nft.name || "NFT Image"}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-lg">
                    No Image Available
                  </div>
                )}

                <div className="p-4 flex flex-col items-start w-full">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {nft.name || "Unnamed"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Description:</span>{" "}
                    {nft.description || "No Description"}
                  </p>
                  <p className="text-sm text-gray-600 mb-1 truncate">
                    <span className="font-semibold">Address:</span>{" "}
                    {nft.address || "No Address"}
                  </p>
                  <p className="text-sm text-gray-600 mb-1 truncate">
                    <span className="font-semibold">Symbol:</span>{" "}
                    {nft.symbol || "No symbol"}
                  </p>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-semibold">Image URL:</span>{" "}
                      {nft.image_url ? (
                        <a
                          href={nft.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-900 hover:underline"
                        >
                          View NFT
                        </a>
                      ) : (
                        "No URL"
                      )}
                    </p>

                    <button
                      title="Transfer NFT"
                      onClick={() => handleTransferClick(nft)}
                      className="w-10 h-10 bg-white-900 text-white rounded-full flex justify-center items-center shadow-md hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition duration-300 group"
                    >
                      <BiTransfer size={20} className="bg-blue-900 color-white" />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      window.open(
                        `https://explorer.solana.com/address/${nft.address}?cluster=devnet`,
                        "_blank"
                      )
                    }
                    className="w-full py-2 mb-2 bg-gradient-to-r from-orange-400 to-blue-900 text-white rounded-lg text-sm font-medium shadow-md hover:from-orange-400 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-300"
                  >
                    View in Solana Explorer
                  </button>
                </div>
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-blue-900"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* <div>
        {nfts.length === 0 && (
          <button
            onClick={fetchAssets}
            className="w-70 bg-blue-700 text-white p-3 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
          >
            View all NFTs
          </button>
        )}
      </div> */}

      {showTransferModal && selectedNFT && (
        <TransferNFTModal nft={selectedNFT} onClose={closeTransferModal} />
      )}
    </div>
  );
}
