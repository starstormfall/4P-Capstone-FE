import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Outlet, useOutletContext } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";

import { Grid } from "@mantine/core";
import FriendList from "./FriendList";
import FriendRequestList from "./FriendRequest";
import ChatRoomList from "./ChatRoomList";
import axios from "axios";

import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import ChatRoom from "./ChatRoom";

import { ContextType } from "../Styles/AppShell/AppShell";

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

function BeFriendPage() {
  const [userLoggedIn, setUserLoggedIn] =
    useOutletContext<ContextType["key"]>();

  const [friendList, setFriendList] = useState<FriendDataInformation[]>();
  const { userInfo } = UseApp();
  const { getAccessTokenSilently } = useAuth0();

  const getFriendList = async () => {
    const response = await axios.get(
      `${backendUrl}/friends/${userInfo?.id}/allfriends`
    );

    setFriendList(response.data);
  };

  useEffect(() => {
    getFriendList();
    setUserLoggedIn(!userLoggedIn);
  }, [userInfo]);

  // useEffect(() => {

  // }, [userInfo]);

  // const useFriendList = useQuery(["friendlist"], () =>
  //   axios
  //     .get(`${backendUrl}/friends/${userInfo?.id}/allfriends`)
  //     .then((res) => res.data)
  // );

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
        <Grid.Col span={3}>
          {friendList && (
            <FriendList
              friendListData={friendList}
              setFriendList={setFriendList}
            />
          )}
          <br />
          <br />
          <br />
          {friendList && (
            <FriendRequestList
              friendListData={friendList}
              setFriendList={setFriendList}
            />
          )}
        </Grid.Col>
        <Grid.Col span={5}>
          {openChatroom ? (
            <>
              {friendList && (
                <ChatRoom
                  friendListData={friendList}
                  chatroomId={chatroomId}
                  chatroomActive={chatroomActive}
                  setOpenChatroom={setOpenChatroom}
                  openChatroom={openChatroom}
                  chatroomhostId={chatroomhostId}
                  chatroomTitle={chatroomTitle}
                />
              )}
            </>
          ) : null}
        </Grid.Col>
        <Grid.Col span={3}>
          {friendList && (
            <ChatRoomList
              friendListData={friendList}
              chatroomType="hosted"
              openChatroom={openChatroom}
              setOpenChatroom={setOpenChatroom}
              setChatroomId={setChatroomId}
              setChatroomActive={setChatroomActive}
              setChatroomHostId={setChatroomHostId}
              setChatroomTitle={setChatroomTitle}
            />
          )}
          <br />
          <br />
          <br />
          {friendList && (
            <ChatRoomList
              friendListData={friendList}
              chatroomType="invited"
              openChatroom={openChatroom}
              setOpenChatroom={setOpenChatroom}
              setChatroomId={setChatroomId}
              setChatroomActive={setChatroomActive}
              setChatroomHostId={setChatroomHostId}
              setChatroomTitle={setChatroomTitle}
            />
          )}
        </Grid.Col>
        {/* <Grid.Col span={4}>
          {friendList && (
            <FriendRequestList
              friendListData={friendList}
              setFriendList={setFriendList}
            />
          )}
        </Grid.Col> */}
      </Grid>
      <Outlet />
    </div>
  );
}

export default withAuthenticationRequired(BeFriendPage, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <div>Redirecting you to the login page...</div>,
});
