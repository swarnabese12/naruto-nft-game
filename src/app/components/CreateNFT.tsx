"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import {
  createNft,
  fetchDigitalAsset,
  fetchAllDigitalAssetByOwner,
} from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { uploadFile } from "../../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { price } from "thirdweb/extensions/farcaster/bundler";

interface CreateNFTProps {
  onClose: () => void;
}

export default function CreateNFT({ onClose }: CreateNFTProps) {
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [file, setFile] = useState<Buffer | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const wallet = useWallet();
  const { publicKey }: any = useWallet();
  const { connection } = useConnection();
  const umi = createUmi(connection.rpcEndpoint)
    .use(walletAdapterIdentity(wallet))
    .use(mplTokenMetadata());

  const handleFileInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const arrayBuffer = await selectedFile.arrayBuffer();
      setFile(Buffer.from(arrayBuffer));
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const createNFT = async () => {
    if (!name || !symbol || !description || !file) {
      toast.error("All fields are required!");
      return;
    }
    try {
      setLoading(true);

      const tokenURL: any = await uploadFile(name, description, price, file);
      const tokenURL2 = `https://ipfs.io/ipfs/${tokenURL.split("ipfs://")[1]}`;
      console.log("Token URL:", tokenURL2);

      const mint = generateSigner(umi);
      const createTx: any = await createNft(umi, {
        mint,
        name,
        symbol,
        uri: tokenURL2,
        sellerFeeBasisPoints: percentAmount(5),
      }).sendAndConfirm(umi);

      if (createTx && createTx.meta && createTx.meta.err) {
        throw new Error("Minting transaction failed");
      }

      const asset = await fetchDigitalAsset(umi, mint.publicKey);
      console.log("Asset:", asset);
      toast.success("NFT successfully minted!");

      const assets: any = await fetchAllDigitalAssetByOwner(umi, publicKey);
      console.log("User's NFTs:", assets);

      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to mint NFT. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 rounded-xl">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl text-orange-400 animate-spin"
              />
              <p className="text-orange-400 text-lg font-semibold mt-4">
                Minting in progress, please wait...
              </p>
            </div>
          </div>
        )}
        <div className="px-12 py-10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
            Create Your NFT
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2 text-left">
              Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
              placeholder="Enter NFT Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2 text-left">
              Symbol
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
              placeholder="Enter NFT Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2 text-left">
              Price in SOL
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
              placeholder="Enter NFT Price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
              step="1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2 text-left">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
              placeholder="Enter NFT Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2 text-left">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
          <button
            onClick={createNFT}
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded-lg shadow-md hover:from-orange-400 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-orange-400 disabled:opacity-50"
          >
            {loading ? "Minting..." : "Mint NFT"}
          </button>
        </div>
      </div>
    </div>
  );
}
