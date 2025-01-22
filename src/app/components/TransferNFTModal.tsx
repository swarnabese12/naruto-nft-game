import { useState } from "react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { toast } from "react-toastify";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./WalletContextProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

interface TransferNFTModalProps {
  nft: any;
  onClose: () => void;
}

export default function TransferNFTModal({
  nft,
  onClose,
}: TransferNFTModalProps) {
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const { publicKey }: any = useWallet();
  const { connection }: any = useConnection();
  const program = useProgram();

  const transferNFT = async (mintAddress: string, recipient: string) => {
    try {
      const senderPublicKey = wallet.publicKey;

      if (!senderPublicKey) {
        throw new Error("Wallet not connected!");
      }

      const mintPublicKey = new PublicKey(mintAddress);
      const recipientPublicKey = new PublicKey(recipient);

      console.log("Mint Address:", mintPublicKey.toString());
      console.log("Recipient Address:", recipientPublicKey.toString());

      const senderTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        senderPublicKey
      );
      const recipientTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        recipientPublicKey
      );

      console.log("senderTokenAccount====>", senderTokenAccount.toString());
      console.log(
        "recipientTokenAccount===>",
        recipientTokenAccount.toString()
      );

      const recipientTokenAccountInfo = await connection.getAccountInfo(
        recipientTokenAccount
      );
      if (!recipientTokenAccountInfo) {
        console.log("Recipient token account does not exist. Creating...");
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            senderPublicKey,
            recipientTokenAccount,
            recipientPublicKey,
            mintPublicKey
          )
        );
        const txSignature = await wallet.sendTransaction(
          transaction,
          connection
        );
        await connection.confirmTransaction(txSignature, "processed");
        console.log("Recipient token account created:", txSignature);
      }

      const txSignature = await program.methods
        .transferSpecificNft(new anchor.BN(1))
        .accounts({
          sender: senderPublicKey,
          senderNftAccount: senderTokenAccount,
          receiverNftAccount: recipientTokenAccount,
          nftMint: mintPublicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log(
        "NFT transferred successfully. Transaction signature:",
        txSignature
      );
      toast.success("NFT transferred successfully!");
      return txSignature;
    } catch (error) {
      console.error("Error transferring NFT:", error);
      throw error;
    }
  };

  const handleTransfer = async () => {
    if (!recipient) {
      toast.error("Recipient address is required!");
      return;
    }
    try {
      setLoading(true);
      await transferNFT(nft.address, recipient);
      onClose();
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error("Failed to transfer NFT. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="max-w-lg w-full bg-blue-900 rounded-xl shadow-lg overflow-hidden p-6 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-600 bg-opacity-75 rounded-xl z-10">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-4xl text-orange-400 animate-spin"
            />
            <p className="mt-4 text-orange-400 font-bold text-lg">
              Transfering NFT, please wait...
            </p>
          </div>
        )}
        <div
          className={`flex justify-between items-center mb-4 ${
            loading ? "opacity-50" : ""
          }`}
        >
          <h2 className="text-xl font-bold text-white">Transfer NFT</h2>
          {nft.image_url && (
            <img
              src={nft.image_url}
              alt="NFT"
              className="w-12 h-12 rounded-md border border-blue-300"
            />
          )}
        </div>
        <p
          className={`text-sm text-gray-200 mb-2 ${
            loading ? "opacity-50" : ""
          }`}
        >
          <span className="font-semibold">NFT Name:</span> {nft.name}
        </p>
        <p
          className={`text-sm text-gray-200 mb-4 ${
            loading ? "opacity-50" : ""
          }`}
        >
          <span className="font-semibold">Mint Address:</span> {nft.address}
        </p>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter the recipient wallet address"
          className={`w-full border border-blue-300 rounded-lg px-4 py-2 mb-4 bg-blue-100 text-blue-900 placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            loading ? "opacity-50" : ""
          }`}
          disabled={loading}
        />
        <div
          className={`flex justify-end space-x-4 ${
            loading ? "opacity-50" : ""
          }`}
        >
          <button
            onClick={onClose}
            className="bg-blue-200 px-4 py-2 rounded-lg text-blue-800 hover:bg-blue-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="bg-blue-500 px-4 py-2 rounded-lg text-white hover:bg-blue-600 disabled:opacity-50 border-2 border-white"
          >
            {loading ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}
