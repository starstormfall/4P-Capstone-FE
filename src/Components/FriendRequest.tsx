import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Container,
  Image,
  Grid,
  Card,
  Text,
  Avatar,
  Group,
  ActionIcon,
} from "@mantine/core";
import { IconCheck, IconLetterX } from "@tabler/icons";

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

export default function FriendRequestList({ friendListData }: Props) {
  const { userInfo } = UseApp();
  const { getAccessTokenSilently } = useAuth0();

  return (
    <div>
      <Text>Friend Request</Text>
      {friendListData &&
        friendListData.map((user: FriendDataInformation) => (
          <div key={user.id}>
            {user.status === "pending" ? (
              <Container>
                <Card>
                  <Avatar
                    src={user.initiatedUser.photoLink}
                    alt={user.initiatedUser.name}
                    radius="xl"
                    size="lg"
                  />
                  <Text>{user.initiatedUser.name}</Text>
                  <Text>Reason:</Text>
                  <Text>{user.reason}</Text>
                  <Group position="right">
                    <ActionIcon>
                      <IconCheck
                        onClick={async () => {
                          const accessToken = await getAccessTokenSilently({
                            audience: process.env.REACT_APP_AUDIENCE,
                            scope: process.env.REACT_APP_SCOPE,
                          });
                          console.log(`Approved Friend Request`, user.id);
                          await axios.put(
                            `${backendUrl}/friends/${userInfo.id}`,
                            {
                              friendshipId: user.id,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${accessToken}`,
                              },
                            }
                          );
                        }}
                      />
                    </ActionIcon>
                    <ActionIcon>
                      <IconLetterX
                        onClick={async () => {
                          const accessToken = await getAccessTokenSilently({
                            audience: process.env.REACT_APP_AUDIENCE,
                            scope: process.env.REACT_APP_SCOPE,
                          });
                          console.log(`Deleted Friend Request`, user.id);
                          await axios.delete(
                            `${backendUrl}/friends/${userInfo.id}/removefriend`,
                            {
                              data: {
                                friendshipId: user.id,
                              },
                              headers: {
                                Authorization: `Bearer ${accessToken}`,
                              },
                            }
                          );
                        }}
                      />
                    </ActionIcon>
                  </Group>
                </Card>
                {/* accept or decline req here! */}
              </Container>
            ) : null}
          </div>
        ))}
    </div>
  );
}
