import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import { io, Socket } from "socket.io-client";
import {
  Button,
  Card,
  Text,
  Container,
  Textarea,
  MultiSelect,
  Stack,
  Group,
  ScrollArea,
  Avatar,
  Grid,
  createStyles,
  Box,
  Indicator,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowsDiagonalMinimize2,
  IconSend,
  IconSettings,
} from "@tabler/icons";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";

interface ServerToClientEvents {
  // noArg: () => void;
  // basicEmit: (a: number, b: string, c: Buffer) => void;
  // withAck: (d: string, callback: (e: number) => void) => void;
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
  // hello: () => void;
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
    paddingBottom: theme.spacing.sm,
  },

  bodyLeft: {
    paddingLeft: 74,
    paddingRight: 74,
    paddingBottom: theme.spacing.sm,
  },

  selfFlexEnd: {
    alignSelf: "flex-end",
  },

  justifyFlexEnd: {
    justifyContent: "flex-end",
    flexWrap: "nowrap",
  },
}));

export default function ChatRoom(props: Props) {
  const { classes, theme } = useStyles();

  const { userId, userName, userPhoto } = UseApp();
  // Obtain methods for auth0 authentication.
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  // const { chatroomId } = useParams<chatroomParams>();
  const { chatroomId } = props;
  const [allMessages, setAllMessages] = useState<LoadedMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  // const [newUser, setNewUser] = useState<friend[]>([]);
  const [allFriends, setAllFriends] = useState<Friend[]>();
  const [newUser, setNewUser] = useState<string[]>([]);
  const [active, setActive] = useState<boolean | undefined>(
    props.chatroomActive
  );
  const [allUsers, setAllUsers] = useState<AllUsers[]>();

  // useEffect for checking auth0 authentication upon load.
  useEffect(() => {
    if (isAuthenticated) {
      console.log(user);
    } else {
      loginWithRedirect();
    }
  }, []);

  // Allows users to join socket room upon load.
  useEffect(() => {
    console.log("joining chatroom running");
    socket.emit("join_chatroom", { room: `${chatroomId}` });
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
      console.log(data);
      setAllMessages(data);
    });

    getAllUsers();
  }, [newMessage]);

  console.log(allMessages);

  //Allows users to get updated chat when someone sends a message.
  useEffect(() => {
    socket.on("received_message", (data: LoadedMessage[]) => {
      console.log(data);
      setAllMessages(data);
      setAdminMessage("");
    });
  }, [newMessage]);

  //Allow remaining users to see that a user has left the chat, or that new users have been added.
  useEffect(() => {
    socket.on("received_admin_message", (data: string) => {
      console.log(data);
      setAdminMessage(data);
      getAllUsers();
    });
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
  }, [props.friendListData]);

  let allChatMessages;

  if (allMessages && allMessages !== null) {
    allChatMessages = allMessages.map((message) => {
      if (message.posterUserId === userId) {
        return (
          // <Stack p={0} spacing={2} sx={{ maxWidth: "100%" }} align="flex-end">
          //   <Card key={message.message}>
          //     <Grid>
          //       <Grid.Col span={8}>
          //         <p>{message.posterUser.name}</p>
          //         <p>{new Date(message.createdAt).toLocaleString()}</p>
          //         <p>{message.message}</p>
          //       </Grid.Col>
          //       <Grid.Col span={3}>
          //         <Avatar
          //           radius="xl"
          //           size="lg"
          //           src={message.posterUser.photoLink}
          //           alt="chat user"
          //         />
          //       </Grid.Col>
          //     </Grid>
          //   </Card>
          // </Stack>
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
          // <Stack p={0} spacing={2} sx={{ maxWidth: "100%" }} align="flex-end">
          //   <Card key={message.message}>
          //     <Grid>
          //       <Grid.Col span={3}>
          //         <Avatar
          //           radius="xl"
          //           size="lg"
          //           src={message.posterUser.photoLink}
          //           alt="chat user"
          //         />
          //       </Grid.Col>
          //       <Grid.Col span={8}>
          //         <p>{message.posterUser.name}</p>
          //         <p>{new Date(message.createdAt).toLocaleString()}</p>
          //         <p>{message.message}</p>
          //       </Grid.Col>
          //     </Grid>
          //   </Card>
          // </Stack>
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

  let allChatUsers;

  if (allUsers && allUsers !== null) {
    allChatUsers = allUsers.map((user, i) => {
      if (i === allUsers.length - 1) {
        return <>{user.user.name}. </>;
      } else return <>{user.user.name}, </>;
    });
  }

  //Change state while typing new message
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setNewMessage(e.currentTarget.value);
  };
  console.log(newMessage);

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
    console.log(event);
    console.log("this is running");
    if (userId) {
      const itemToDestroy = {
        chatroomId: Number(chatroomId),
        userId: userId,
      };

      socket.emit("leave_disconnect", itemToDestroy);

      // socket.disconnect();

      props.setOpenChatroom(false);
    }
  };

  //when host adds new users to existing chat.
  const handleAdd = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    // const newUserObj = {
    //   newUser: newUser,
    //   chatroomId: Number(chatroomId),
    // };

    //newUser is an array of strings(of userids)
    const newUserObj = newUser.map((user) => ({
      chatroomId: Number(chatroomId),
      userId: Number(user),
    }));

    socket.emit("add_newUsers", newUserObj);

    getAllUsers();

    setNewUser([]);
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
    // socket.disconnect();
  };

  console.log(newUser);

  return (
    <Container size="xl">
      <Box
        sx={(theme) => ({
          minHeight: 250,
          padding: theme.spacing.md,
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.lg,
          display: "flex",
          flexDirection: "column",
          // justifyContent: "space-between",
        })}
      >
        <Grid>
          <Grid.Col span={6}>
            <Text>ABC</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group className={classes.justifyFlexEnd}>
              <Text>ABC</Text>
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
              <UnstyledButton>
                <IconSettings size={20} color="#7491A8" />
              </UnstyledButton>
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
        <Button onClick={handleLeave}>Leave Chatroom</Button>
        {props.chatroomhostId === userId &&
        allFriends &&
        allFriends.length !== 0 ? (
          <>
            <MultiSelect
              value={newUser}
              onChange={setNewUser}
              data={allFriends}
              disabled={!active}
            />
            <Button onClick={handleAdd} disabled={!active}>
              Invite Friend to Chat
            </Button>
            <Button onClick={handleActive} disabled={!active}>
              Deactivate Room
            </Button>
          </>
        ) : null}
        <br />
        <Text>{props.chatroomTitle}</Text>
        <Text>Chat with {allChatUsers}</Text>
        <br />
        {allChatMessages}
        <br />
        {adminMessage.length !== 0 ? adminMessage : null}
        <form onSubmit={handleSubmit}>
          <br />
          <Textarea
            disabled={!active}
            placeholder="Send a new message."
            value={newMessage}
            onChange={handleChange}
          />
          <Button type="submit" disabled={!active}>
            <IconSend />
          </Button>
        </form>
      </Box>
    </Container>
  );
}
