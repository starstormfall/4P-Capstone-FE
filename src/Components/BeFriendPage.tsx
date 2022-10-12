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

export default function BeFriendPage() {
  const { userInfo } = UseApp();

  const useFriendList = useQuery(["friendlist"], () =>
    axios
      .get(`${backendUrl}/friends/${userInfo?.id}/allfriends`)
      .then((res) => res.data)
  );

  // use mantine loader for loading of data!

  return (
    <div>
      BeFriendPage Page
      <Grid justify="space-between" align="center">
        <Grid.Col span={4}>
          {<FriendList friendListData={useFriendList.data} />}
        </Grid.Col>
        <Grid.Col span={4}>current chatroom</Grid.Col>
        <Grid.Col span={4}>
          <ChatRoomList />
        </Grid.Col>
        <Grid.Col span={4}>
          <FriendRequestList friendListData={useFriendList.data} />
        </Grid.Col>
        <Grid.Col span={4}>invited checkroom</Grid.Col>
      </Grid>
      <Outlet />
    </div>
  );
}
