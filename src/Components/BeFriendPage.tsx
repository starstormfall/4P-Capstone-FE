import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Grid } from "@mantine/core";
import FriendList from "./FriendList";
import FriendRequestList from "./FriendRequest";
import ChatRoomList from "./ChatRoomList";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import ChatRoom from "./ChatRoom";

//create interface for the data
type FriendDataInformation = {
  addedUser: {
    name: string;
    photoLink: string;
  };
  addedUserId: number;
  createdAt: string;
  id: number;
  initiatedUser: {
    name: string;
    photoLink: string;
  };
  initiatedUserId: number;
  post: {
    content: string;
  };
  postId: number;
  reason: string;
  status: string;
  updatedAt: string;
};

export default function BeFriendPage() {
  const { userInfo } = UseApp();
  const { getAccessTokenSilently } = useAuth0();

  const useFriendList = useQuery(["friendlist"], () =>
    axios
      .get(`${backendUrl}/friends/${userInfo?.id}/allfriends`)
      .then((res) => res.data)
  );

  const [openChatroom, setOpenChatroom] = useState(false);
  const [chatroomId, setChatroomId] = useState<number>();
  const [chatroomActive, setChatroomActive] = useState<boolean>();
  const [chatroomhostId, setChatroomHostId] = useState<number>();
  const [chatroomTitle, setChatroomTitle] = useState("");

  console.log(openChatroom);

  return (
    <div>
      BeFriendPage Page
      <Grid justify="space-between" align="start">
        <Grid.Col span={4}>
          {<FriendList friendListData={useFriendList.data} />}
        </Grid.Col>
        <Grid.Col span={4}>
          {openChatroom ? (
            <>
              <ChatRoom
                friendListData={useFriendList.data}
                chatroomId={chatroomId}
                chatroomActive={chatroomActive}
                setOpenChatroom={setOpenChatroom}
                openChatroom={openChatroom}
                chatroomhostId={chatroomhostId}
                chatroomTitle={chatroomTitle}
              />
            </>
          ) : null}
        </Grid.Col>
        <Grid.Col span={4}>
          <ChatRoomList
            friendListData={useFriendList.data}
            chatroomType="hosted"
            openChatroom={openChatroom}
            setOpenChatroom={setOpenChatroom}
            setChatroomId={setChatroomId}
            setChatroomActive={setChatroomActive}
            setChatroomHostId={setChatroomHostId}
            setChatroomTitle={setChatroomTitle}
          />
          <br />
          <br />
          <br />
          <ChatRoomList
            friendListData={useFriendList.data}
            chatroomType="invited"
            openChatroom={openChatroom}
            setOpenChatroom={setOpenChatroom}
            setChatroomId={setChatroomId}
            setChatroomActive={setChatroomActive}
            setChatroomHostId={setChatroomHostId}
            setChatroomTitle={setChatroomTitle}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <FriendRequestList friendListData={useFriendList.data} />
        </Grid.Col>
        <Grid.Col span={4}>
          {/* <ChatRoomList
            friendListData={useFriendList.data}
            chatroomType="invited"
            openChatroom={openChatroom}
            setOpenChatroom={setOpenChatroom}
            setChatroomId={setChatroomId}
            setChatroomActive={setChatroomActive}
            setChatroomHostId={setChatroomHostId}
            setChatroomTitle={setChatroomTitle}
          /> */}
        </Grid.Col>
      </Grid>
      <Outlet />
    </div>
  );
}
