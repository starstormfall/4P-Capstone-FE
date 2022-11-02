import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../utils";
import { io, Socket } from "socket.io-client";
import {
  Button,
  Text,
  Container,
  Textarea,
  MultiSelect,
  Group,
  ScrollArea,
  Avatar,
  Tooltip,
  Grid,
  createStyles,
  Box,
  Indicator,
  UnstyledButton,
  Title,
  Menu,
  Modal,
} from "@mantine/core";
import {
  IconArrowsDiagonalMinimize2,
  IconSend,
  IconSettings,
  IconUserPlus,
  IconMessagesOff,
  IconDoorExit,
} from "@tabler/icons";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";

interface ServerToClientEvents {
  send_chatdata: (data: LoadedMessage[]) => void;
  received_message: (data: LoadedMessage[]) => void;
  received_admin_message: (data: string) => void;
  received_deactivation: (data: string) => void;
}

interface Room {
  room: string;
}

interface Message {
  id?: number;
  message: string;
  chatroomId: number;
  posterUserId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientToServerEvents {
  join_chatroom: (room: Room) => void;
  send_message: (newMessage: Message) => void;
  leave_disconnect: (itemToDestroy: {
    chatroomId: number;
    userId: number;
  }) => void;
  add_newUsers: (
    newUserObj: {
      chatroomId: number;
      userId: number;
    }[]
  ) => void;
  set_inactive: (inactiveChat: { chatroomId: number; active: boolean }) => void;
}

interface PosterUser {
  name: string;
  photoLink: string;
}

interface LoadedMessage {
  id?: number;
  message: string;
  chatroomId: number;
  posterUserId: number;
  createdAt: Date;
  updatedAt: Date;
  posterUser: PosterUser;
}

interface Friend {
  value: string;
  label: string;
}

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

interface AllUsers {
  id: number;
  chatroomId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    nationality: string;
    score: number;
    lastLogin: string;
    loginStreak: number;
    photoLink: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface Props {
  friendListData: FriendDataInformation[];
  chatroomId: number | undefined;
  chatroomActive: boolean | undefined;
  setOpenChatroom: React.Dispatch<React.SetStateAction<boolean>>;
  openChatroom: boolean;
  chatroomhostId: number | undefined;
  chatroomTitle: string;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(backendUrl);

const useStyles = createStyles((theme) => ({
  bodyRight: {
    textAlign: "right",
    paddingRight: 74,
    paddingLeft: 74,
    paddingBottom: theme.spacing.md,
  },

  bodyLeft: {
    paddingLeft: 74,
    paddingRight: 74,
    paddingBottom: theme.spacing.md,
  },

  selfFlexEnd: {
    alignSelf: "flex-end",
  },

  justifyFlexEnd: {
    justifyContent: "flex-end",
    flexWrap: "nowrap",
  },

  chatroomTitle: {
    placeSelf: "center",
  },

  chatNew: {
    justifyContent: "flex-end",
    padding: "15px 0px 0px",
  },
}));

export default function ChatRoom(props: Props) {
  const { classes } = useStyles();

  const { userId, userName, userPhoto } = UseApp();
  // Obtain methods for auth0 authentication.
  const { isAuthenticated, user, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const { chatroomId } = props;
  const [allMessages, setAllMessages] = useState<LoadedMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [allFriends, setAllFriends] = useState<Friend[]>();
  const [newUser, setNewUser] = useState<string[]>([]);
  const [active, setActive] = useState<boolean | undefined>(
    props.chatroomActive
  );
  const [allUsers, setAllUsers] = useState<AllUsers[]>();
  const [multiOpen, setMultiOpen] = useState(false);

  // useEffect for checking auth0 authentication upon load.
  useEffect(() => {
    if (isAuthenticated) {
      console.log(user);
    } else {
      loginWithRedirect();
    }
    // eslint-disable-next-line
  }, []);

  // Allows users to join socket room upon load.
  useEffect(() => {
    socket.emit("join_chatroom", { room: `${chatroomId}` });
    // eslint-disable-next-line
  }, [props.openChatroom]);

  const getAllUsers = async () => {
    if (chatroomId) {
      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUDIENCE,
        scope: process.env.REACT_APP_SCOPE,
      });

      const response = await axios.get(
        `${backendUrl}/chats/${userId}/${chatroomId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setAllUsers(response.data.allUsers);
    }
  };

  // Allows users to get previous chat data upon load. Allows users to see who are the other people in chat.
  useEffect(() => {
    socket.on("send_chatdata", (data: LoadedMessage[]) => {
      setAllMessages(data);
    });

    getAllUsers();
    // eslint-disable-next-line
  }, [newMessage]);

  //Allows users to get updated chat when someone sends a message.
  useEffect(() => {
    socket.on("received_message", (data: LoadedMessage[]) => {
      setAllMessages(data);
      setAdminMessage("");
    });
  }, [newMessage]);

  //Allow remaining users to see that a user has left the chat, or that new users have been added.
  useEffect(() => {
    socket.on("received_admin_message", (data: string) => {
      setAdminMessage(data);
      getAllUsers();
    });
    // eslint-disable-next-line
  }, [adminMessage]);

  useEffect(() => {
    socket.on("received_deactivation", (data: string) => {
      setActive(false);

      setAdminMessage(data);
    });
  }, [adminMessage]);

  useEffect(() => {
    let allUserFriends: Friend[] = [];

    if (props.friendListData) {
      props.friendListData.forEach((pair) => {
        if (pair.status === "confirmed") {
          if (userId === pair.addedUserId) {
            allUserFriends.push({
              value: pair.initiatedUserId.toString(),
              label: pair.initiatedUser.name,
            });
          } else {
            allUserFriends.push({
              value: pair.addedUserId.toString(),
              label: pair.addedUser.name,
            });
          }
        }
      });

      setAllFriends(allUserFriends);
    }
    // eslint-disable-next-line
  }, [props.friendListData]);

  let allChatMessages;

  if (allMessages && allMessages !== null) {
    allChatMessages = allMessages.map((message) => {
      if (message.posterUserId === userId) {
        return (
          <div>
            <Group position="right">
              <div>
                <Text size="sm" align="right">
                  {message.posterUser.name}
                </Text>
                <Text size="xs" color="dimmed" align="right">
                  {new Date(message.createdAt).toLocaleString()}
                </Text>
              </div>
              <Avatar
                src={message.posterUser.photoLink}
                alt={message.posterUser.name}
                radius="xl"
                size="lg"
              />
            </Group>
            <Text className={classes.bodyRight} size="sm">
              {message.message}
            </Text>
          </div>
        );
      } else
        return (
          <div>
            <Group>
              <Avatar
                src={message.posterUser.photoLink}
                alt={message.posterUser.name}
                radius="xl"
                size="lg"
              />
              <div>
                <Text size="sm">{message.posterUser.name}</Text>
                <Text size="xs" color="dimmed">
                  {new Date(message.createdAt).toLocaleString()}
                </Text>
              </div>
            </Group>
            <Text className={classes.bodyLeft} size="sm">
              {message.message}
            </Text>
          </div>
        );
    });
  }

  let firstThreeChatUsers;
  let allOtherChatUsers;
  let eachOtherChatUser;

  if (allUsers && allUsers !== null) {
    if (allUsers.length > 3) {
      // eachOtherChatUser = allUsers.map((user, i) => {
      //   if (i > 2) {
      //     return <div>{user.user.name}</div>;
      //   }
      // });
      eachOtherChatUser = allUsers.map((user, i) =>
        i > 2 ? <div>{user.user.name}</div> : null
      );
      // firstThreeChatUsers = allUsers.map((user, i) => {
      //   if (i < 3) {
      //     return (
      //       <Tooltip label={user.user.name} withArrow>
      //         <Avatar src={user.user.photoLink} radius="xl" />
      //       </Tooltip>
      //     );
      //   }
      // });
      firstThreeChatUsers = allUsers.map((user, i) =>
        i < 3 ? (
          <Tooltip label={user.user.name} withArrow>
            <Avatar src={user.user.photoLink} radius="xl" />
          </Tooltip>
        ) : null
      );

      allOtherChatUsers = (
        <>
          <Tooltip withArrow label={<>{eachOtherChatUser}</>}>
            <Avatar radius="xl">+{allUsers.length - 3}</Avatar>
          </Tooltip>
        </>
      );
    } else {
      // firstThreeChatUsers = allUsers.map((user, i) => {
      //   if (i < 3) {
      //     return (
      //       <Tooltip label={user.user.name} withArrow>
      //         <Avatar src={user.user.photoLink} radius="xl" />
      //       </Tooltip>
      //     );
      //   }
      // });
      firstThreeChatUsers = allUsers.map((user, i) =>
        i < 3 ? (
          <Tooltip label={user.user.name} withArrow>
            <Avatar src={user.user.photoLink} radius="xl" />
          </Tooltip>
        ) : null
      );
    }
  }

  //Change state while typing new message
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setNewMessage(e.currentTarget.value);
  };

  //Submit new message. Send to socket and update backend.
  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (userId && userName && userPhoto) {
      const newObject = {
        message: newMessage,
        chatroomId: Number(chatroomId),
        posterUserId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        posterUser: {
          name: userName,
          photoLink: userPhoto,
        },
      };

      socket.emit("send_message", newObject);

      //for the person who submitted, just call for the object to append to local state.
      setAllMessages([...allMessages, newObject]);

      setNewMessage("");
      setAdminMessage("");
    }
  };

  //When user chooses to leave the chatroom. Destroy chatroom-user row in BE.
  const handleLeave = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    if (userId) {
      const itemToDestroy = {
        chatroomId: Number(chatroomId),
        userId: userId,
      };

      socket.emit("leave_disconnect", itemToDestroy);

      props.setOpenChatroom(false);
    }
  };

  //when host adds new users to existing chat.
  const handleAdd = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    //newUser is an array of strings(of userids)
    const newUserObj = newUser.map((user) => ({
      chatroomId: Number(chatroomId),
      userId: Number(user),
    }));

    socket.emit("add_newUsers", newUserObj);

    getAllUsers();

    setNewUser([]);
    setMultiOpen(false);
  };

  const handleActive = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    setActive(false);

    const inactiveChat = {
      chatroomId: Number(chatroomId),
      active: false,
    };

    socket.emit("set_inactive", inactiveChat);
  };

  const handleMinimize = () => {
    props.setOpenChatroom(false);
  };

  const handleMultiOpen = () => {
    setMultiOpen(!multiOpen);
  };

  return (
    <Container size="xl">
      <Box
        sx={(theme) => ({
          height: "96.5vh",
          padding: theme.spacing.md,
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.lg,
          display: "flex",
          flexDirection: "column",
        })}
      >
        <Grid>
          <Grid.Col span={4}>
            <Tooltip.Group openDelay={300} closeDelay={100}>
              <Avatar.Group spacing="sm">
                {firstThreeChatUsers}
                {allOtherChatUsers !== null ? allOtherChatUsers : null}
              </Avatar.Group>
            </Tooltip.Group>
          </Grid.Col>
          <Grid.Col span={8} className={classes.chatroomTitle}>
            <Group className={classes.justifyFlexEnd}>
              <Title order={6}>{props.chatroomTitle}</Title>
              {active ? (
                <Indicator
                  color="#4EB5BA"
                  position="middle-start"
                  size={15}
                  withBorder
                  zIndex={0}
                >
                  <div></div>
                </Indicator>
              ) : (
                <Indicator
                  color="red"
                  position="middle-start"
                  size={15}
                  zIndex={0}
                  withBorder
                >
                  <div></div>
                </Indicator>
              )}
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <UnstyledButton>
                    <IconSettings size={20} color="#7491A8" />
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>CHATROOM</Menu.Label>
                  <Menu.Item
                    onClick={handleLeave}
                    icon={<IconDoorExit size={14} />}
                  >
                    Leave
                  </Menu.Item>
                  {props.chatroomhostId === userId &&
                  allFriends &&
                  allFriends.length !== 0 ? (
                    <>
                      <Menu.Item
                        onClick={handleMultiOpen}
                        icon={<IconUserPlus size={14} />}
                        disabled={!active}
                      >
                        Invite Friend
                      </Menu.Item>
                      <Menu.Label>DANGER ZONE</Menu.Label>
                      <Menu.Item
                        disabled={!active}
                        icon={<IconMessagesOff size={14} />}
                        onClick={handleActive}
                        color="red"
                      >
                        Deactivate
                      </Menu.Item>
                    </>
                  ) : (
                    <>
                      <Menu.Item disabled icon={<IconUserPlus size={14} />}>
                        Invite Friend
                      </Menu.Item>
                      <Menu.Label>DANGER ZONE</Menu.Label>
                      <Menu.Item
                        disabled
                        icon={<IconMessagesOff size={14} />}
                        onClick={handleActive}
                        color="red"
                      >
                        Deactivate
                      </Menu.Item>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>

              <UnstyledButton>
                <IconArrowsDiagonalMinimize2
                  size={20}
                  color="#7491A8"
                  onClick={handleMinimize}
                />
              </UnstyledButton>
            </Group>
          </Grid.Col>
        </Grid>

        <br />
        {props.chatroomhostId === userId &&
        allFriends &&
        allFriends.length !== 0 &&
        multiOpen ? (
          <>
            <Modal
              opened={multiOpen}
              onClose={() => setMultiOpen(false)}
              title="Invite Friends"
              radius="md"
            >
              <MultiSelect
                label="Friends"
                value={newUser}
                onChange={setNewUser}
                data={allFriends}
                disabled={!active}
              />
              <br />
              <Group className={classes.chatNew}>
                <Button disabled={!active} onClick={handleAdd}>
                  <IconUserPlus size={20} />
                </Button>
              </Group>
            </Modal>
          </>
        ) : null}
        <ScrollArea style={{ height: "70vh" }} offsetScrollbars>
          {allChatMessages}

          {adminMessage.length !== 0 ? (
            <>
              <br />
              {adminMessage}
            </>
          ) : null}
        </ScrollArea>
        <form onSubmit={handleSubmit}>
          <br />
          <Textarea
            disabled={!active}
            placeholder="Send a new message"
            value={newMessage}
            onChange={handleChange}
            radius="md"
            required
          />
          <Group className={classes.chatNew}>
            <Button type="submit" disabled={!active}>
              <IconSend size={20} />
            </Button>
          </Group>
        </form>
      </Box>
    </Container>
  );
}
