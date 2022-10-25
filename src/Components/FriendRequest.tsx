import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { isError, useQuery } from "@tanstack/react-query";
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
  Box,
  ScrollArea,
  Title,
  ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconLetterX } from "@tabler/icons";

import {
  PersonDoneOutline,
  PersonDeleteOutline,
  PersonAddOutline,
  PersonRemoveOutline,
} from "@easy-eva-icons/react";

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
  setFriendList: React.Dispatch<
    React.SetStateAction<FriendDataInformation[] | undefined>
  >;
};

export default function FriendRequestList({
  friendListData,
  setFriendList,
}: Props) {
  const [updateRequest, setUpdateRequest] = useState<boolean>(false);
  const { userInfo } = UseApp();
  const { getAccessTokenSilently } = useAuth0();

  const getFriendList = async () => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    const response = await axios.get(
      `${backendUrl}/friends/${userInfo?.id}/allfriends`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    setFriendList(response.data);
  };

  useEffect(() => {
    getFriendList();
  }, [updateRequest]);

  return (
    <div>
      <Container
        sx={(theme) => ({
          minHeight: 250,
          padding: theme.spacing.md,
          backgroundColor: theme.white,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.lg,
          display: "flex",
          flexDirection: "column",
        })}
      >
        <Group position="center" mb="md" mt="xs">
          <ThemeIcon variant="light" size={30}>
            <PersonAddOutline />
          </ThemeIcon>
          <Title align="center" order={5}>
            Friend Request
          </Title>
        </Group>

        <Container>
          <ScrollArea
            style={{ height: 600 }}
            offsetScrollbars
            scrollbarSize={6}
            scrollHideDelay={0}
          >
            {friendListData &&
              friendListData.map((user: FriendDataInformation) => (
                <div key={user.id}>
                  {user.status === "pending" &&
                  user.initiatedUserId !== userInfo.id ? (
                    <Box
                      sx={() => ({
                        minHeight: 90,
                        display: "flex",
                        flexDirection: "column",
                      })}
                    >
                      <Group>
                        <Avatar
                          src={user.initiatedUser.photoLink}
                          alt={user.initiatedUser.name}
                          radius="xl"
                          size="lg"
                        />
                        <div style={{ flex: 1 }}>
                          <Text size="sm" weight={500}>
                            {user.initiatedUser.name}
                          </Text>
                          <Text color="dimmed" size="xs">
                            Reason: {user.reason}
                          </Text>
                        </div>
                        <Group position="right">
                          <ActionIcon>
                            <IconCheck
                              onClick={async () => {
                                const accessToken =
                                  await getAccessTokenSilently({
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
                                setUpdateRequest(!updateRequest);
                              }}
                            />
                          </ActionIcon>
                          <ActionIcon>
                            <IconLetterX
                              onClick={async () => {
                                const accessToken =
                                  await getAccessTokenSilently({
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
                                setUpdateRequest(!updateRequest);
                              }}
                            />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Box>
                  ) : null}
                </div>
              ))}
          </ScrollArea>
        </Container>
      </Container>
    </div>
  );
}
