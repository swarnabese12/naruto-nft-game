import { useState, useEffect } from "react";
import Image from "next/image";
import zabuza from "../images/zabuza.jpg";
import gara from "../images/gara-image.jpg";
import raikage from "../images/raikage.jpeg";
import { FaHandRock } from "react-icons/fa";
import { FaHandPaper } from "react-icons/fa";
import { FaHandScissors } from "react-icons/fa";
import { RiComputerFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { FaHandshakeSimple } from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import { IoMdRefresh } from "react-icons/io";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import {
  createNft,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { uploadFile } from "../../../utils";
import html2canvas from "html2canvas";

const jutsuTitles = [
  "The Shadow Clone Jutsu",
  "The Rasengan Jutsu",
  "The Chidori Jutsu",
  "The Amaterasu Jutsu",
  "The Summoning Jutsu",
  "The Fireball Jutsu",
  "The Water Dragon Jutsu",
  "The Earth Style: Mud Wall Jutsu",
  "The Lightning Blade Jutsu",
  "The Flying Raijin Jutsu",
  "The Byakugan Jutsu",
  "The Sharingan Jutsu",
  "The Chibaku Tensei Jutsu",
  "The Susanoo Jutsu",
  "The Gentle Fist Jutsu",
  "The Eight Gates Jutsu",
  "The Reanimation Jutsu",
  "The Wind Style: Rasenshuriken Jutsu",
  "The Tailed Beast Bomb Jutsu",
  "The Wood Style: Deep Forest Emergence Jutsu",
  "The Particle Style: Atomic Dismantling Jutsu",
  "The Sand Coffin Jutsu",
  "The Shikigami Dance Jutsu",
  "The Kirigakure Jutsu",
  "The Infinite Tsukuyomi Jutsu",
  "The Sage Mode Jutsu",
  "The Totsuka Blade Jutsu",
  "The Izanagi Jutsu",
  "The Izanami Jutsu",
  "The Kirin Jutsu",
  "The Yasaka Magatama Jutsu",
  "The Boruto Stream Jutsu",
];

export default function GameComponent({ onClose }: any) {
  const [loading, setLoading] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const [round, setRound] = useState<number>(1);
  const [chancesLeft, setChancesLeft] = useState<number>(3);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [computerScore, setComputerScore] = useState<number>(0);
  const [drawScore, setDrawScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const wallet = useWallet();
  const { publicKey }: any = useWallet();
  const { connection } = useConnection();
  const umi = createUmi(connection.rpcEndpoint)
    .use(walletAdapterIdentity(wallet))
    .use(mplTokenMetadata());

  const choices = ["rock", "paper", "scissors"];
  const imageMap: any = {
    rock: raikage,
    paper: gara,
    scissors: zabuza,
  };
  const iconMap: any = {
    rock: <FaHandRock size={34} className="text-blue-400" />,
    paper: <FaHandPaper size={34} className="text-green-700" />,
    scissors: <FaHandScissors size={34} className="text-red-700" />,
  };
  const iconMapForHover: any = {
    rock: <FaHandRock size={84} className="text-blue-400" />,
    paper: <FaHandPaper size={84} className="text-green-700" />,
    scissors: <FaHandScissors size={84} className="text-red-700" />,
  };

  const playGame = async (player: string) => {
    if (gameOver) return;

    const computer = choices[Math.floor(Math.random() * choices.length)];
    setPlayerChoice(player);
    setComputerChoice(computer);

    let roundResult: string;

    if (player === computer) {
      roundResult = "It's a tie!";
      setDrawScore((prev) => prev + 1);
    } else if (
      (player === "rock" && computer === "scissors") ||
      (player === "scissors" && computer === "paper") ||
      (player === "paper" && computer === "rock")
    ) {
      roundResult = "You win this chance!";
      setPlayerScore((prev) => prev + 1);
    } else {
      roundResult = "Computer wins this chance!";
      setComputerScore((prev) => prev + 1);
    }

    setResult(roundResult);
    setShowResult(true);

    setTimeout(() => setShowResult(false), 2000);

    setChancesLeft((prev) => prev - 1);

    if (chancesLeft - 1 === 0) {
      setRound((prev) => prev + 1);
      setChancesLeft(3);

      if (round === 3) {
        setGameOver(true);
        const finalWinner =
          playerScore > computerScore
            ? "You have the strength of a Hokage! You win!"
            : computerScore > playerScore
            ? "The computer outsmarted you! Better luck next time!"
            : "It's a tie! Rivalry reborn!";
        setResult(finalWinner);
        setShowResult(true);

        if (playerScore > computerScore) {
          console.log("You WON...you WON...you WON....");
          await handleMintNFT();
        }
        return;
      }
    }
  };

  const handleMintNFT = async () => {
    try {
      setLoading(true);
      const canvas = await html2canvas(document.body);
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      let file: any = new File([blob], "screenshot.png", { type: "image/png" });

      const title = jutsuTitles[Math.floor(Math.random() * jutsuTitles.length)];
      const price = 0.5;
      const currentDateTime = new Date().toLocaleString();
      const description = `Congratulations! You've won ${title}. This NFT was minted on ${currentDateTime}.`;

      const tokenURL: any = await uploadFile(title, description, price, file);
      const tokenURL2 = `https://ipfs.io/ipfs/${tokenURL.split("ipfs://")[1]}`;
      console.log("Token URL:", tokenURL2);

      const mint = generateSigner(umi);
      const createTx: any = await createNft(umi, {
        mint,
        name: title,
        symbol: "JUTSU",
        uri: tokenURL2,
        sellerFeeBasisPoints: percentAmount(5),
      }).sendAndConfirm(umi);

      if (createTx && createTx.meta && createTx.meta.err) {
        throw new Error("Minting transaction failed");
      }
      setLoading(false);
      const asset = await fetchDigitalAsset(umi, mint.publicKey);
      console.log("Asset:", asset);
      toast.success(
        `Congratulations! You've won ${title}, NFT successfully minted! 🥳`
      );
    } catch (error) {
      setLoading(false);
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT.");
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setRound(1);
    setChancesLeft(3);
    setPlayerScore(0);
    setComputerScore(0);
    setDrawScore(0);
    setGameOver(false);
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="max-w-5xl w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl shadow-2xl overflow-hidden">
        <div className="relative p-6 text-white">
          <div className="flex justify-end space-x-2 mb-2">
            <button
              className="flex items-center justify-center bg-blue-700 text-white text-sm hover:bg-blue-900 px-3 py-1 rounded shadow-md"
              onClick={resetGame}
            >
              <IoMdRefresh className="mr-1" />
              Play Again
            </button>
            <button
              className="flex items-center justify-center bg-orange-400 text-white text-sm hover:bg-red-600 px-3 py-1 rounded shadow-md"
              onClick={onClose}
            >
              <FiX className="mr-1" />
              Exit
            </button>
          </div>
          {showResult && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <p
                className={`text-4xl font-extrabold text-center animate-bounce ${
                  result?.includes("win")
                    ? "text-green-500"
                    : result?.includes("tie")
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {result}
                {result?.includes("win") && (
                  <span role="img" aria-label="celebrate" className="ml-2">
                    🥳🥳🥳
                  </span>
                )}
                {result?.includes("tie") && (
                  <span role="img" aria-label="celebrate" className="ml-2">
                    🤝
                  </span>
                )}
              </p>
            </div>
          )}
          {gameOver ? (
            <div className="text-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-6xl text-blue-700 animate-spin mb-4"
                  />
                  <p className="text-blue-700 text-xl font-bold">
                    You have won a Jutsu NFT, Miniting in progress please wait...
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-4xl font-extrabold mb-4 animate-pulse">
                    {result}
                  </p>
                  <button
                    className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-orange-400 transition text-xl"
                    onClick={resetGame}
                  >
                    Play Again
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center mb-8 bg-blue-700 relative p-6 rounded-md shadow-lg border-4 border-orange-400">
                <h1 className="text-4xl font-bold text-white flex items-center cracky-text">
                  Round - <span className="text-orange-400 ml-2">{round}</span>
                  /3
                  <span className="ml-4 text-xl font-semibold text-white">
                    (Chances Left:{" "}
                    <span className="text-orange-400 font-bold">
                      {chancesLeft}
                    </span>
                    )
                  </span>
                </h1>
                <div className="absolute inset-0 border-t-[4px] border-b-[4px] border-dashed border-orange-400"></div>
              </div>

              <div className="flex justify-around mb-6 items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FaUser className="text-white text-2xl" />
                    <p className="text-lg font-bold text-white ml-2">
                      Your Score
                    </p>
                  </div>
                  <div className="flex items-center justify-center bg-blue-700 rounded-full shadow-md w-14 h-14">
                    <p className="text-2xl font-extrabold text-white">
                      {playerScore}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <RiComputerFill className="text-white text-2xl" />
                    <p className="text-lg font-bold text-white ml-2">
                      Computer Score
                    </p>
                  </div>
                  <div className="flex items-center justify-center bg-blue-700 rounded-full shadow-md w-14 h-14">
                    <p className="text-2xl font-extrabold text-white">
                      {computerScore}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FaHandshakeSimple className="text-white text-2xl" />
                    <p className="text-lg font-bold text-white ml-2">Draws</p>
                  </div>
                  <div className="flex items-center justify-center bg-blue-700 rounded-full shadow-md w-14 h-14">
                    <p className="text-2xl font-extrabold text-white">
                      {drawScore}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-6">
                {choices.map((choice) => (
                  <div
                    key={choice}
                    className="flex flex-col items-center bg-gray-100 rounded-lg shadow-lg overflow-hidden transition hover:shadow-xl hover:scale-105 relative"
                    onClick={() => playGame(choice)}
                  >
                    <div className="relative w-full h-64 flex items-center justify-center group">
                      <Image
                        src={imageMap[choice]}
                        alt={choice}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                      <div className="absolute inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 opacity-0 group-hover:opacity-100 transition duration-200">
                        <div className="text-white text-4xl">
                          {iconMapForHover[choice]}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => playGame(choice)}
                      className="w-full px-6 py-4 bg-blue-700 text-white font-bold text-lg rounded-b-lg hover:bg-blue-800 transition flex justify-center items-center"
                    >
                      <span className="mr-2">{iconMap[choice]}</span>
                      {choice.charAt(0).toUpperCase() + choice.slice(1)}
                    </button>
                  </div>
                ))}
              </div>

              {playerChoice && computerChoice && (
                <div className="text-center mt-6">
                  <p className="text-2xl">
                    You chose: <span className="font-bold">{playerChoice}</span>
                  </p>
                  <p className="text-2xl">
                    Computer chose:{" "}
                    <span className="font-bold">{computerChoice}</span>
                  </p>
                  <p
                    className="text-2xl font-bold mt-4 text-blue-700"
                    style={{
                      WebkitTextStroke: "1px orange",
                      WebkitTextFillColor: "blue",
                      color: "blue",
                    }}
                  >
                    {result}
                    {result?.includes("win") && (
                      <span role="img" aria-label="celebrate" className="ml-2">
                        🥳🥳🥳
                      </span>
                    )}
                    {result?.includes("tie") && (
                      <span role="img" aria-label="celebrate" className="ml-2">
                        🤝
                      </span>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
