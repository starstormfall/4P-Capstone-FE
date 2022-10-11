import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import tdflLogo from "../Images/tdflLogo.png";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface Room {
  room: string;
}

interface ClientToServerEvents {
  hello: () => void;
  join_chatroom: (room: Room) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(backendUrl);

export default function ChatRoom() {
  const { chatroomId } = useParams();

  console.log(chatroomId);

  useEffect(() => {
    console.log("this is running");
    getMessages();
    socket.emit("join_chatroom", { room: `${chatroomId}chat` });
  }, []);

  const getMessages = async () => {
    console.log("hello");
    const response = await axios.get(
      `${backendUrl}/chats/${chatroomId}/allmessage`
    );
    // const chatLog = response.data.messages;
    // let messages = [];
    // if (chatLog) {
    //   chatLog.forEach((log) => {
    //     messages.push(JSON.parse(log));
    //   });
    //   setChatMessages(messages);
    // }
  };

  return <div>ChatRoom Page</div>;
}
