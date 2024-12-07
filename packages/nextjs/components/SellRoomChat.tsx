"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { type Hex, formatEther, parseAbi, parseEther } from "viem";
import { type BaseError, useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";

const SellRoomChat = ({ roomId, messages, tradeId, pushMessage, newMessage, setNewMessage }: any) => {
  const [userRole, setUserRole] = useState<boolean | null>(null); // true = seller, false = buyer
  const [inputValue, setInputValue] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [inputValue4, setInputValue4] = useState("");

  const router = useRouter();

  const { address } = useAccount();
  const { isConnected } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  async function setRole() {
    const response = await axios.post("/api/sellerroom", {
      eoa: address,
    });
    const data = await response.data;
    setUserRole(data.sellerOrBuyer);
  }

  useEffect(() => {
    setRole();
  }, []);

  async function handleContract(address: any, abi: any, functionName: string, args: any[]): Promise<void> {
    try {
      const result = writeContract({
        address,
        abi,
        functionName,
        args,
      });
    } catch (error) {
      console.error("Error executing contract function:", error);
    }
  }

  const sendMessage = async (text: string) => {
    pushMessage(text);
  };
  let lastMessageDate: any = null;

  const formatDate = (timestamp: any) => {
    if (timestamp && timestamp.seconds && timestamp.nanoseconds) {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleDateString();
    }
    return "";
  };
  const formatTimestamp = (timestamp: any) => {
    if (timestamp && timestamp.seconds && timestamp.nanoseconds) {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Ensures 24-hour format
      });
    }
    return "";
  };
  console.log("mef", messages);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    pushMessage(newMessage);
    setNewMessage("");
  }

  return (
    <main className="min-h-screen pt-[10vh] custom-bg bg-sky-300 min-w-screen flex flex-col lg:flex-row items-start">
      {isConnected && (
        <div
          className={`flex-1 rounded-3xl mx-auto lg:ml-[2vw] lg:mr-[1vw] lg:my-[5vh] bg-white gap-4 p-5 h-[80vh] flex flex-col items-center justify-center`}
        >
          {userRole === true && (
            <>
              <input
                className="lg:w-3/4 w-full rounded-full p-3 px-5 outline-none focus:outline-none fo ring-2 focus:ring-neutral-400 ring-neutral-300"
                placeholder="enter how many eth value want to sell"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              <input
                className="lg:w-3/4 w-full rounded-full p-3 px-5 outline-none focus:outline-none fo ring-2 focus:ring-neutral-400 ring-neutral-300"
                placeholder="Send each other messages to complete the trade"
                type="number"
                step="any"
                value={inputValue4}
                onChange={e => setInputValue4(e.target.value)}
              />
              <button
                disabled={isPending}
                className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                onClick={() => {
                  writeContract({
                    address: "0x6057525fbEAd7eC2924B46885C570745a60c4126",
                    abi: parseAbi(["function submitProposalOffRAMP(uint256 tradeId,uint256 tradeETH)"]),
                    functionName: "submitProposalOffRAMP",
                    args: [BigInt(14), BigInt((Number(inputValue4) * 1e18).toFixed())],
                    //@ts-ignore
                    value: parseEther(inputValue4),
                  });
                }}
              >
                {isPending ? "Sending..." : "Submit Proposal"}
              </button>
              {isConfirming && <div>Waiting for confirmation...</div>}
              {isConfirmed && (
                <div>
                  Transaction confirmed - Send to your Buyer
                  <button
                    className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                    onClick={() =>
                      sendMessage(`Tnx confirmed successfullySent-> https://sepolia.arbiscan.io/tx/${hash}`)
                    }
                  >
                    Send
                  </button>
                </div>
              )}
              <button
                disabled={isPending}
                className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                onClick={() => {
                  const ethAmount = parseFloat(inputValue);
                  if (!isNaN(ethAmount)) {
                    handleContract(
                      "0x6057525fbEAd7eC2924B46885C570745a60c4126",
                      parseAbi(["function startRound(uint256 tradeId)"]),
                      "startRound",
                      [tradeId],
                    );
                  } else {
                    console.error(" something went wrong");
                  }
                }}
              >
                {isPending ? "Locking..." : "locking your ETH"}
              </button>
              {isConfirming && <div>Waiting for confirmation...</div>}
              {isConfirmed && (
                <div>
                  Transaction confirmed - Send to your Buyer
                  <button
                    className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                    onClick={() =>
                      sendMessage(`Tnx confirmed locked ETH successfully Sent-> https://sepolia.arbiscan.io/tx/${hash}`)
                    }
                  >
                    Send
                  </button>
                </div>
              )}
            </>
          )}

          {userRole === false && (
            <>
              here i am buyer dude
              <input
                className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                placeholder="Anything want to say to seller via attestation"
                value={inputValue2}
                onChange={e => setInputValue2(e.target.value)}
              />
              <button
                disabled={isPending}
                className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                onClick={() => {
                  const ethAmount = parseFloat(inputValue);
                  if (!isNaN(ethAmount)) {
                    handleContract(
                      "0x6057525fbEAd7eC2924B46885C570745a60c4126",
                      parseAbi(["function confirmOffRamp(address sellerAddress, uint256 tradeId,bytes memory _data)"]),
                      "confirmOffRamp",
                      ["0x8a0d290b2ee35efde47810ca8ff057e109e4190b", 13, inputValue2],
                    );
                  } else {
                    console.error("error ");
                  }
                }}
              >
                {isPending ? "Sending..." : "Accept Proposal"}
              </button>
              <div className=" ">
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isConfirmed && (
                  <div>
                    Transaction confirmed - Send to your Seller
                    <button
                      className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                      onClick={() =>
                        sendMessage(`Tnx confirmed successfullySent-> https://sepolia.arbiscan.io/tx/${hash}`)
                      }
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
              <div>
                <button
                  disabled={isPending}
                  className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                  onClick={() => {
                    const ethAmount = parseFloat(inputValue);
                    if (!isNaN(ethAmount)) {
                      handleContract(
                        "0x6057525fbEAd7eC2924B46885C570745a60c4126",
                        parseAbi([
                          "function sendRequest( uint256 tradeId, uint64 subscriptionId, string[] calldata args)",
                        ]),
                        "sendRequest",
                        [tradeId, 166, ["accesstoken", "messageId"]],
                      );
                    } else {
                      console.error("error ");
                    }
                  }}
                >
                  {isPending ? "Sending to Oracle..." : "confirming Request"}
                </button>
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isConfirmed && (
                  <div>
                    Transaction confirmed - Send to your Seller
                    <button
                      className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                      onClick={() =>
                        sendMessage(
                          `Tnx confirmed successfully paid to seller, Sent-> https://sepolia.arbiscan.io/tx/${hash}`,
                        )
                      }
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
              <button
                disabled={isPending}
                className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                onClick={() => {
                  const ethAmount = parseFloat(inputValue);
                  if (!isNaN(ethAmount)) {
                    handleContract(
                      "0x6057525fbEAd7eC2924B46885C570745a60c4126",
                      parseAbi(["function claim( uint256 tradeId)"]),
                      "claim",
                      [tradeId],
                    );
                  } else {
                    console.error("error you are not authroized to claim");
                  }
                }}
              >
                {isPending ? "claiming ETH ..." : "claim your ETH"}
              </button>
              {isConfirming && <div>Waiting for confirmation...</div>}
              {isConfirmed && (
                <div>
                  Transaction confirmed - Send to your Seller
                  <button
                    className="lg:w-3/4 w-full rounded-full bg-violet-950 hover:bg-violet-900 px-5 text-white p-3 outline-none focus:outline-none"
                    onClick={() =>
                      sendMessage(
                        `Tnx confirmed successfully paid to seller, Sent-> https://sepolia.arbiscan.io/tx/${hash}`,
                      )
                    }
                  >
                    Send
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div
        className={`h-[80vh] my-[5vh] rounded-3xl bg-neutral-50 ${
          isConnected ? "flex-1 mr-[2vw] ml-[1vw]" : "w-4/5 lg:w-3/4 mr-auto ml-auto"
        } flex flex-col`}
      >
        <div className="flex flex-col h-[80vh] p-4 space-y-2 overflow-y-auto">
          {messages.map((message: any) => {
            const messageDate = formatDate(message.createdAt);
            const isNewDate = lastMessageDate !== messageDate;
            lastMessageDate = messageDate;

            return (
              <>
                {isNewDate && <div className="text-center my-4 text-sm text-gray-500">{messageDate}</div>}
                <div key={message.id} className={`flex ${message.email === address ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`relative group ${
                      message.email === address ? "bg-neutral-800 text-white" : "bg-gray-200 text-black"
                    } p-3 px-4 rounded-full max-w-xs cursor-pointer`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className="absolute bottom-[-25px] right-0 bg-black text-white text-xs z-50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {formatTimestamp(message.createdAt)}
                    </span>
                  </div>
                </div>
              </>
            );
          })}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-row items-center gap-3 py-5 px-5">
          <input
            type="text"
            value={newMessage}
            onChange={event => setNewMessage(event.target.value)}
            className="w-full rounded-full p-3 px-5 outline-none focus:outline-none fo ring-2 focus:ring-neutral-400 ring-neutral-300"
            placeholder="Type your message here..."
          />
          <button
            type="submit"
            className="rounded-full bg-black text-white flex items-center justify-center p-2.5 hover:bg-neutral-900"
          >
            <SendButton />
          </button>
        </form>
      </div>
    </main>
  );
};

function SendButton() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="right-0.5 top-0.5 relative"
    >
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}

export default SellRoomChat;
