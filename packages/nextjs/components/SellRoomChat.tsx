"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ethers } from "ethers";
import { Address as AddressType, type Hex, formatEther, parseAbi, parseEther } from "viem";
import { type BaseError, useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const SellRoomChat = ({ roomId, connectedAddress, messages, tradeId, pushMessage, newMessage, setNewMessage }: any) => {
  const [userRole, setUserRole] = useState<boolean | null>(null); // true = seller, false = buyer
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e: any) => setInputValue(e.target.value);

  const [inputValue2, setInputValue2] = useState(""); //for addresss
  const handleInputChange2 = (e: any) => setInputValue(e.target.value);

  //used for tnxid
  const [inputValue3, setInputValue3] = useState(""); //for addresss
  const handleInputChange3 = (e: any) => setInputValue(e.target.value);

  const [inputValue4, setInputValue4] = useState(""); //for addresss
  const handleInputChange4 = (e: any) => setInputValue(e.target.value);
  const router = useRouter();

  const { address } = useAccount();
  const { isConnected } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("offRampBased");

  useEffect(() => {
    if (connectedAddress) {
      (async function setRole() {
        try {
          const response = await axios.post("/api/sellerroom", {
            eoa: connectedAddress,
          });

          const data = response.data;
          setUserRole(data.sellerOrBuyer);
        } catch (error) {
          console.error("Error setting role:", error);
        }
      })();
    }
  }, [connectedAddress]);

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
        hour12: false,
      });
    }
    return "";
  };

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
          className={`flex-1 rounded-3xl mx-auto lg:ml-[2vw] lg:mr-[1vw] lg:my-[5vh] bg-blue-300 gap-4 p-5 h-[80vh] flex flex-col items-center justify-center`}
        >
          {userRole === true && (
            <>
              {connectedAddress}
              <div>
                <input
                  type="text"
                  className="text-center"
                  placeholder="Enter eth how much to exchange"
                  value={inputValue}
                  onChange={handleInputChange}
                />
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await writeYourContractAsync({
                        functionName: "doubleDeposit",
                        args: [tradeId, BigInt(ethers.utils.parseUnits(inputValue, "ether").toString())],
                      });
                    } catch (e) {
                      console.error("Error setting greeting:", e);
                    }
                  }}
                >
                  deposit Double
                </button>
              </div>

              <div>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await writeYourContractAsync({
                        functionName: "startRound",
                        args: [tradeId],
                        value: BigInt(ethers.utils.parseUnits((2 * Number(inputValue)).toString(), "ether").toString()),
                      });
                    } catch (e) {
                      console.error("Error setting greeting:", e);
                    }
                  }}
                >
                  start trade
                </button>
              </div>
              <div>
                <input
                  type="text"
                  className="text-center"
                  placeholder="Enter private TnxId"
                  value={inputValue3}
                  onChange={handleInputChange3}
                />
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await writeYourContractAsync({
                        functionName: "confirmBySeller",
                        args: [tradeId, inputValue3 as `0x${string}`],
                      });
                    } catch (e) {
                      console.error("Error setting greeting:", e);
                    }
                  }}
                >
                  confirm-by-seller
                </button>
              </div>
            </>
          )}

          {userRole === false && (
            <>
              <div>
                <input
                  type="text"
                  className="enter your oppo address"
                  placeholder="Enter address to send"
                  value={inputValue2}
                  onChange={handleInputChange2}
                />
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await writeYourContractAsync({
                        functionName: "confirmOffRamp",
                        args: [inputValue2 as AddressType, tradeId, "0x77"],
                      });
                    } catch (e) {
                      console.error("Error setting greeting:", e);
                    }
                  }}
                >
                  Confirm-Ramp(enter address-sellers)
                </button>
              </div>

              <div>
                <input
                  type="number"
                  className="text-center"
                  placeholder="verify payment by buyer through zkemail"
                  value={inputValue4}
                  onChange={handleInputChange4}
                />
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await writeYourContractAsync({
                        functionName: "sendVerifyByBuyer",
                        args: [tradeId, BigInt(inputValue4)],
                      });
                    } catch (e) {
                      console.error("Error setting greeting:", e);
                    }
                  }}
                >
                  Send Verify
                </button>
              </div>

              <div>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await writeYourContractAsync({
                        functionName: "ClaimByBuyer",
                        args: [tradeId],
                      });
                    } catch (e) {
                      console.error("Error setting greeting:", e);
                    }
                  }}
                >
                  Claim Crypto
                </button>
              </div>
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
        <button onClick={() => console.log(connectedAddress)}>helloworld</button>
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
