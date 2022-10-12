import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";

//create interface for the data

export default function FriendRequestList() {
  const { userId } = UseApp();

  const { isLoading, error, data, isFetching } = useQuery(
    ["friendrequest"],
    () =>
      axios
        .get(`${backendUrl}/friends/${userId}/allfriends`)
        .then((res) => res.data)
  );
  useEffect(() => {
    console.log(data);
  }, []);

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>An Error has occured</div>;
  return (
    <div>
      Friend Request Page
      {data &&
        data.map((user?: any) => (
          <div key={user.id}>
            {user.status === "pending" ? user.initiatedUser.name : null}
          </div>
        ))}
    </div>
  );
}
