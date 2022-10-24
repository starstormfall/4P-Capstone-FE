import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  Button,
  Card,
  Text,
  Container,
  MultiSelect,
  TextInput,
  Group,
  Box,
  Collapse,
  ThemeIcon,
  UnstyledButton,
  createStyles,
  ScrollArea,
  Modal,
  Title,
  Alert,
} from "@mantine/core";
import {
  TablerIcon,
  IconCalendarStats,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleOff,
  IconUser,
  IconUsers,
  IconSquarePlus,
  IconMessages,
  IconMessageDots,
  IconAlertCircle,
} from "@tabler/icons";
// import {CheckmarkCircle} from "@easy-eva-icons/react"

import { backendUrl } from "../utils";

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
  chatroomType: string;
  setOpenChatroom: React.Dispatch<React.SetStateAction<boolean>>;
  openChatroom: boolean;
  setChatroomId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setChatroomActive: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setChatroomHostId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setChatroomTitle: React.Dispatch<React.SetStateAction<string>>;
};

interface Friend {
  value: string;
  label: string;
}

interface ChatroomInformation {
  id: number;
  chatroomId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  chatroom: {
    id: number;
    roomName: string;
    active: boolean;
    hostUserId: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

const useStyles = createStyles((theme) => ({
  control: {
    fontWeight: 500,
    display: "block",
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    fontSize: theme.fontSizes.sm,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  link: {
    fontWeight: 500,
    display: "block",
    // textDecoration: "none",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    paddingLeft: 31,
    marginLeft: 30,
    fontSize: theme.fontSizes.sm,
    // color:
    //   theme.colorScheme === "dark"
    //     ? theme.colors.dark[0]
    //     : theme.colors.gray[7],
    borderLeft: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  chevron: {
    transition: "transform 200ms ease",
  },

  chatNew: {
    // alignSelf: "self-end",
    justifyContent: "flex-end",
    padding: "10px 12px",
  },

  roomNew: {
    // alignSelf: "self-end",
    justifyContent: "flex-end",
    padding: "10px 0px 0px 374px",
  },

  // modal: {
  //   display: "flex",
  //   flexDirection: "column",
  //   justifyContent: "space-between",
  // },
}));

interface Links {
  label: string;
  link: string;
  chatroomId: number;
  active: boolean;
  hostUserId: number;
}

export default function ChatRoomList(props: Props) {
  const { classes, theme } = useStyles();
  // const [links, setLinks] = useState<Links[]>([]);
  let links: Links[] = [];
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(false);
  const ChevronIcon = theme.dir === "ltr" ? IconChevronRight : IconChevronLeft;

  const { userId } = UseApp();
  // Obtain methods for auth0 authentication.
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [newUser, setNewUser] = useState<string[]>([]);
  const [allFriends, setAllFriends] = useState<Friend[]>();
  const [addChatroom, setAddChatroom] = useState(false);
  const [chatroomName, setChatroomName] = useState("");
  const [allChatrooms, setAllChatrooms] = useState<ChatroomInformation[]>([]);
  // const [openChatroom, setOpenChatroom] = useState(false);

  // useEffect for checking auth0 authentication upon load.
  useEffect(() => {
    if (isAuthenticated) {
      console.log(user);
    } else {
      loginWithRedirect();
    }
  }, []);

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

  console.log(props.friendListData);
  // console.log("userId", userId);
  // console.log(allFriends);

  const getAllChatrooms = async () => {
    if (userId) {
      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUDIENCE,
        scope: process.env.REACT_APP_SCOPE,
      });

      const response = await axios.get(
        `${backendUrl}/chats/${userId}/allchat`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setAllChatrooms(response.data.allChatrooms);
      console.log(response.data.allChatrooms);

      // response.data.allChatrooms.forEach((chatroom: ChatroomInformation) => {
      //   setLinks([...links, { label: chatroom.chatroom.roomName, link: "./" }]);
      // });
    }
  };

  useEffect(() => {
    getAllChatrooms();
  }, [chatroomName, props.openChatroom, props.friendListData]);

  // let links: Links[] = [];
  if (allChatrooms.length > 0) {
    allChatrooms.forEach((chatroom) => {
      const newObj = {
        label: chatroom.chatroom.roomName,
        link: "./",
        chatroomId: chatroom.chatroomId,
        active: chatroom.chatroom.active,
        hostUserId: chatroom.chatroom.hostUserId,
      };

      links.push(newObj);

      // setLinks([...links, { label: chatroom.chatroom.roomName, link: "./" }]);
    });
  }

  const hostedRooms = links.map((link) => {
    if (links.length > 0 && userId && userId === link.hostUserId) {
      return (
        <>
          {link.active ? (
            <Text<"a">
              component="a"
              className={classes.link}
              color={theme.colors.gray[7]}
              href={link.link}
              key={link.label}
              onClick={(event) =>
                handleChatroom(
                  event,
                  link.chatroomId,
                  link.active,
                  link.hostUserId,
                  link.label
                )
              }
            >
              <IconCircleCheck size={15} color="#599EBF" /> {link.label}
            </Text>
          ) : (
            <Text<"a">
              component="a"
              className={classes.link}
              // strikethrough
              color="#B4ADCC"
              href={link.link}
              key={link.label}
              onClick={(event) =>
                handleChatroom(
                  event,
                  link.chatroomId,
                  link.active,
                  link.hostUserId,
                  link.label
                )
              }
            >
              <IconCircleOff size={15} color="#C1BBD5" /> {link.label}
            </Text>
          )}
        </>
      );
    }
  });

  const invitedRooms = links.map((link) => {
    if (links.length > 0 && userId && userId !== link.hostUserId) {
      return (
        <>
          {link.active ? (
            <Text<"a">
              component="a"
              className={classes.link}
              color={theme.colors.gray[7]}
              href={link.link}
              key={link.label}
              onClick={(event) =>
                handleChatroom(
                  event,
                  link.chatroomId,
                  link.active,
                  link.hostUserId,
                  link.label
                )
              }
            >
              <IconCircleCheck size={15} color="#599EBF" /> {link.label}
            </Text>
          ) : (
            <Text<"a">
              component="a"
              className={classes.link}
              // strikethrough
              color="#B4ADCC"
              href={link.link}
              key={link.label}
              onClick={(event) =>
                handleChatroom(
                  event,
                  link.chatroomId,
                  link.active,
                  link.hostUserId,
                  link.label
                )
              }
            >
              <IconCircleOff size={15} color="#C1BBD5" /> {link.label}
            </Text>
          )}
        </>
      );
    }
  });

  // useEffect(() => {
  //   if (allChatrooms.length > 0) {
  //     allChatrooms.forEach((chatroom) => {
  //       setLinks([...links, { label: chatroom.chatroom.roomName, link: "./" }]);
  //     });
  //   }
  // }, [allChatrooms]);

  const handleAddRoom = () => {
    setAddChatroom(!addChatroom);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setChatroomName(e.currentTarget.value);
  };
  console.log(chatroomName);
  console.log(newUser);

  const handleCreateRoom = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (userId) {
      const usersToAdd = [...newUser, userId.toString()];

      const objectBody = {
        roomName: chatroomName,
        hostUserId: userId,
        usersToAdd: usersToAdd,
      };

      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUDIENCE,
        scope: process.env.REACT_APP_SCOPE,
      });

      await axios.post(`${backendUrl}/chats/createchatroom`, objectBody, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      //response.data.newRoom.id
      //response.data.newRoom.roomName
      //response.data.newRoom.updatedAt
      //To set these in chatlist if needed.

      setChatroomName("");
      setNewUser([]);
      setAddChatroom(false);
    }
  };

  const handleChatroom = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    chatroomId: number,
    active: boolean,
    hostUserId: number,
    roomName: string
  ): void => {
    e.preventDefault();
    if (props.setOpenChatroom) {
      props.setChatroomId(Number(chatroomId));
      props.setOpenChatroom(!props.openChatroom);
      props.setChatroomActive(active);
      props.setChatroomHostId(hostUserId);
      props.setChatroomTitle(roomName);
    }
  };

  console.log(allChatrooms);

  const hostedChatrooms = allChatrooms.map((chatroom) => {
    if (userId && userId === chatroom.chatroom.hostUserId) {
      return (
        <div key={chatroom.chatroomId}>
          {/* <Button value={chatroom.chatroomId} onClick={handleChatroom}> */}
          <Container key={chatroom.chatroomId}>
            <Link
              onClick={(
                event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
              ) =>
                handleChatroom(
                  event,
                  chatroom.chatroomId,
                  chatroom.chatroom.active,
                  chatroom.chatroom.hostUserId,
                  chatroom.chatroom.roomName
                )
              }
              to="./"
            >
              <Card>
                <p>{chatroom.chatroom.roomName}</p>
                <p>
                  Last Message:{" "}
                  {new Date(chatroom.chatroom.updatedAt).toLocaleString()}
                </p>
                {chatroom.chatroom.active ? <p>ACTIVE</p> : <p>DEACTIVATED</p>}
              </Card>
            </Link>
          </Container>
          {/* </Button> */}
        </div>
      );
    } else return null;
  });

  const invitedChatrooms = allChatrooms.map((chatroom) => {
    if (userId && userId !== chatroom.chatroom.hostUserId) {
      return (
        <div key={chatroom.chatroomId}>
          {/* <Button value={chatroom.chatroomId} onClick={handleChatroom}> */}
          <Container key={chatroom.chatroomId}>
            <Link
              onClick={(
                event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
              ) =>
                handleChatroom(
                  event,
                  chatroom.chatroomId,
                  chatroom.chatroom.active,
                  chatroom.chatroom.hostUserId,
                  chatroom.chatroom.roomName
                )
              }
              to="./"
            >
              <Card>
                <p>{chatroom.chatroom.roomName}</p>
                <p>
                  Last Message:{" "}
                  {new Date(chatroom.chatroom.updatedAt).toLocaleString()}
                </p>
                {chatroom.chatroom.active ? <p>ACTIVE</p> : <p>DEACTIVATED</p>}
              </Card>
            </Link>
          </Container>
          {/* </Button> */}
        </div>
      );
    } else return null;
  });

  return (
    <>
      {props.chatroomType === "hosted" ? (
        <div align-self="flex-start">
          {allChatrooms ? (
            <>
              <Box
                sx={(theme) => ({
                  minHeight: props.openChatroom ? 250 : 580,
                  padding: theme.spacing.md,
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.white,
                  borderRadius: theme.radius.lg,
                  boxShadow: theme.shadows.lg,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                })}
              >
                {/* {hostedChatrooms} */}
                <>
                  <UnstyledButton
                    onClick={() => setOpened((o) => !o)}
                    className={classes.control}
                  >
                    <Group position="apart" spacing={0}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ThemeIcon variant="light" size={30}>
                          <IconUser size={18} />
                        </ThemeIcon>
                        <Box ml="md">
                          <Title order={6}>HOSTED CHATROOMS</Title>
                        </Box>
                      </Box>

                      {hasLinks && (
                        <ChevronIcon
                          className={classes.chevron}
                          size={14}
                          stroke={1.5}
                          style={{
                            transform: opened
                              ? `rotate(${theme.dir === "rtl" ? -90 : 90}deg)`
                              : "none",
                          }}
                        />
                      )}
                    </Group>
                  </UnstyledButton>
                  {hasLinks ? (
                    <Collapse in={opened}>
                      <ScrollArea
                        style={{ height: props.openChatroom ? 120 : 450 }}
                      >
                        {hostedRooms}
                      </ScrollArea>
                    </Collapse>
                  ) : null}
                  <UnstyledButton>
                    <Group className={classes.chatNew}>
                      <IconSquarePlus
                        onClick={handleAddRoom}
                        size={26}
                        color="#7491A8"
                      />
                    </Group>
                  </UnstyledButton>
                </>
              </Box>
            </>
          ) : null}
          {addChatroom ? (
            allFriends && allFriends.length !== 0 ? (
              <>
                <Modal
                  opened={addChatroom}
                  onClose={() => setAddChatroom(false)}
                  title="New Chatroom"
                  radius="md"
                >
                  <TextInput
                    placeholder="All things Japan"
                    label="Title"
                    withAsterisk
                    required
                    onChange={handleChange}
                    // className={classes.modal}
                  />
                  <br />
                  <Text size="sm">Friends to Add</Text>
                  <MultiSelect
                    value={newUser}
                    onChange={setNewUser}
                    data={allFriends}
                  />
                  <br />
                  <UnstyledButton>
                    <Group className={classes.roomNew}>
                      <IconMessageDots
                        onClick={handleCreateRoom}
                        size={26}
                        color="#7491A8"
                      />
                    </Group>
                  </UnstyledButton>
                  {/* <Button onClick={handleCreateRoom}>Create Chatroom</Button> */}
                </Modal>
              </>
            ) : (
              <>
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Bummer!"
                  color="#C1BBD5"
                  withCloseButton
                  closeButtonLabel="Close alert"
                  onClose={() => setAddChatroom(false)}
                >
                  Sorry, it seems that you currently do not have any friends
                  yet. Please add friends to start a new chatroom!
                </Alert>
              </>
            )
          ) : null}
        </div>
      ) : (
        <>
          {allChatrooms ? (
            <div align-self="flex-start">
              <Box
                sx={(theme) => ({
                  minHeight: props.openChatroom ? 250 : 580,
                  padding: theme.spacing.md,
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.white,
                  borderRadius: theme.radius.lg,
                  boxShadow: theme.shadows.lg,
                })}
              >
                {/* {invitedChatrooms} */}
                <>
                  <UnstyledButton
                    onClick={() => setOpened((o) => !o)}
                    className={classes.control}
                  >
                    <Group position="apart" spacing={0}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ThemeIcon variant="light" size={30}>
                          <IconUsers size={18} />
                        </ThemeIcon>
                        <Box ml="md">
                          <Title order={6}>INVITED CHATROOMS</Title>
                        </Box>
                      </Box>
                      {hasLinks && (
                        <ChevronIcon
                          className={classes.chevron}
                          size={14}
                          stroke={1.5}
                          style={{
                            transform: opened
                              ? `rotate(${theme.dir === "rtl" ? -90 : 90}deg)`
                              : "none",
                          }}
                        />
                      )}
                    </Group>
                  </UnstyledButton>
                  {hasLinks ? (
                    <Collapse in={opened}>
                      <ScrollArea
                        style={{ height: props.openChatroom ? 140 : 470 }}
                      >
                        {invitedRooms}
                      </ScrollArea>
                    </Collapse>
                  ) : null}
                </>
              </Box>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
