"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { useAccount } from "wagmi";
import SellRoomChat from "~~/components/SellRoomChat";
import { db } from "~~/lib/firebase";

interface PageParams {
  params: {
    room: string;
    counter: number;
  };
}

export default function page({ params }: PageParams) {
  const { room } = params;
  console.log("roomid ", room);
  const { address: connectedAddress } = useAccount();
  const [newMessage, setNewMessage] = useState<string>("");

  const messagesRef = collection(db, "messages");

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const queryMessages = query(messagesRef, where("roomId", "==", room), orderBy("createdAt"));
    const unsuscribe = onSnapshot(queryMessages, snapshot => {
      const messages: any[] = [];
      snapshot.forEach(doc => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    return () => unsuscribe();
  }, []);

  async function pushMessage(text: string) {
    if (text === "") return;
    let eoa = "";
    while (eoa === undefined) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    await addDoc(messagesRef, {
      text,
      createdAt: serverTimestamp(),
      eoa,
      roomId: room,
    });

    setNewMessage("");
  }

  return (
    <SellRoomChat
      setNewMessage={setNewMessage}
      connectedAddress={connectedAddress}
      newMessage={newMessage}
      messages={messages}
      pushMessage={pushMessage}
    />
  );
}
