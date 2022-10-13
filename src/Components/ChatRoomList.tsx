import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function ChatRoomList({ chatroomListData }: Props) {
  console.log(chatroomListData);
  // let chatRoomsList
  // if(chatroomListData && chatroomListData.length !== 0) {
  //   chatRoomsList = chatroomListData.map((details)=>{

  //   })
  // }
  return <div>ChatRoomList Page</div>;
}
