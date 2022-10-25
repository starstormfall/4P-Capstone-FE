import React, { useEffect, useState } from "react";

import axios from "axios";

import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Container,
  Text,
  Avatar,
  Group,
  ActionIcon,
  Box,
  ScrollArea,
  Title,
  ThemeIcon,
} from "@mantine/core";
import { IconLetterX } from "@tabler/icons";
import { PersonDoneOutline } from "@easy-eva-icons/react";

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

type Props = {
  friendListData: FriendDataInformation[];
  setFriendList: React.Dispatch<
    React.SetStateAction<FriendDataInformation[] | undefined>
  >;
};

// recieve props from BeFriendPage
export default function FriendList({ friendListData, setFriendList }: Props) {
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
          height: "100vh",
          padding: theme.spacing.md,
          backgroundColor: theme.white,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.lg,
          display: "flex",
          flexDirection: "column",
        })}
      >
        {" "}
        <Group position="center" mb="xl" mt="xs">
          <ThemeIcon variant="light" size={30}>
            <PersonDoneOutline />
          </ThemeIcon>

          <Title align="center" order={5}>
            Friend List
          </Title>
        </Group>
        <Container>
          <ScrollArea
            style={{ height: 700 }}
            offsetScrollbars
            scrollbarSize={6}
            scrollHideDelay={0}
          >
            {friendListData &&
              friendListData.map((user: FriendDataInformation) => {
                if (user.status === "confirmed") {
                  return (
                    <div key={user.id}>
                      {user.addedUserId === userInfo?.id ? (
                        <Box
                          sx={() => ({
                            minHeight: 90,
                            display: "flex",
                            flexDirection: "column",
                            border: "round",
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

                            <ActionIcon>
                              <IconLetterX
                                onClick={async () => {
                                  const accessToken =
                                    await getAccessTokenSilently({
                                      audience: process.env.REACT_APP_AUDIENCE,
                                      scope: process.env.REACT_APP_SCOPE,
                                    });
                                  console.log(
                                    `Deleted Friend Request`,
                                    user.id
                                  );
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
                        </Box>
                      ) : (
                        <Box
                          sx={() => ({
                            minHeight: 90,
                            display: "flex",
                            flexDirection: "column",
                          })}
                        >
                          <Group>
                            <Avatar
                              src={user.addedUser.photoLink}
                              alt={user.addedUser.name}
                              radius="xl"
                              size="lg"
                            />
                            <div style={{ flex: 1 }}>
                              <Text size="sm" weight={500}>
                                {user.addedUser.name}
                              </Text>
                              <Text color="dimmed" size="xs">
                                Reason: {user.reason}
                              </Text>
                            </div>

                            <ActionIcon>
                              <IconLetterX
                                onClick={async () => {
                                  const accessToken =
                                    await getAccessTokenSilently({
                                      audience: process.env.REACT_APP_AUDIENCE,
                                      scope: process.env.REACT_APP_SCOPE,
                                    });
                                  console.log(
                                    `Deleted Friend Request`,
                                    user.id
                                  );
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
                        </Box>
                      )}
                    </div>
                  );
                }
              })}
          </ScrollArea>
        </Container>
      </Container>
    </div>
  );
}
