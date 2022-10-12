import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";

//create interface for the data
interface FriendDataInformation {
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
}

// interface FriendData {
//   friendDataInformation: FriendDataInformation[];
// }

type Props = {
  friendListData: FriendDataInformation[];
};

// recieve props from BeFriendPage
export default function FriendList({ friendListData }: Props) {
  const { userInfo } = UseApp();

  return (
    <div>
      FriendList Page
      {friendListData &&
        friendListData.map((user: FriendDataInformation) => (
          <div key={user.id}>
            {user.addedUserId === userInfo?.id
              ? user.initiatedUser.name
              : user.addedUser.name}
          </div>
        ))}
    </div>
  );
}
