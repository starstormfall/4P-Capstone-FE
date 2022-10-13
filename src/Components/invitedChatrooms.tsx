import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

interface ChatRoomDataInformation {
  chatroom: {
    active: false;
    createdAt: string;
    hostUserId: number;
    id: number;
    roomName: string;
    updatedAt: string;
  };
  chatroomId: number;
  createdAt: string;
  id: number;
  updatedAt: string;
  userId: number;
}

type Props = {
  chatroomListData: ChatRoomDataInformation[];
};

export default function InvitedChatRoomList({ chatroomListData }: Props) {
  // console.log(chatroomListData);
  return <div>Invited Chatrooms Page</div>;
}
