import React, { useEffect, useState } from "react";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import {
  Text,
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
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleOff,
  IconUser,
  IconUsers,
  IconSquarePlus,
  IconMessageDots,
  IconAlertCircle,
} from "@tabler/icons";

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
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    paddingLeft: 31,
    marginLeft: 30,
    fontSize: theme.fontSizes.sm,
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
    justifyContent: "flex-end",
    padding: "10px 12px",
  },

  roomNew: {
    justifyContent: "flex-end",
    padding: "10px 0px 0px 374px",
  },
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
  let links: Links[] = [];
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(false);
  const ChevronIcon = theme.dir === "ltr" ? IconChevronRight : IconChevronLeft;

  const { userId } = UseApp();
  // Obtain methods for auth0 authentication.
  const { isAuthenticated, user, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [newUser, setNewUser] = useState<string[]>([]);
  const [allFriends, setAllFriends] = useState<Friend[]>();
  const [addChatroom, setAddChatroom] = useState(false);
  const [chatroomName, setChatroomName] = useState("");
  const [allChatrooms, setAllChatrooms] = useState<ChatroomInformation[]>([]);

  // useEffect for checking auth0 authentication upon load.
  useEffect(() => {
    if (isAuthenticated) {
      console.log(user);
    } else {
      loginWithRedirect();
    }
    // eslint-disable-next-line
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
    // eslint-disable-next-line
  }, [props.friendListData]);

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
    }
  };

  useEffect(() => {
    getAllChatrooms();
    // eslint-disable-next-line
  }, [chatroomName, props.openChatroom, props.friendListData]);

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
    });
  }

  const hostedRooms = links.map((link) =>
    links.length > 0 && userId && userId === link.hostUserId ? (
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
    ) : null
  );

  const invitedRooms = links.map((link) =>
    links.length > 0 && userId && userId !== link.hostUserId ? (
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
    ) : null
  );

  const handleAddRoom = () => {
    setAddChatroom(!addChatroom);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setChatroomName(e.currentTarget.value);
  };

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

  return (
    <>
      {props.chatroomType === "hosted" ? (
        <div align-self="flex-start">
          {allChatrooms ? (
            <>
              <Box
                sx={(theme) => ({
                  height: props.openChatroom ? "46vh" : "100vh",
                  // minHeight: props.openChatroom ? 250 : 580,
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
                        style={{ height: props.openChatroom ? "28vh" : "82vh" }}
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
                  height: props.openChatroom ? "46vh" : "100vh",
                  padding: theme.spacing.md,
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.white,
                  borderRadius: theme.radius.lg,
                  boxShadow: theme.shadows.lg,
                })}
              >
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
                        style={{ height: props.openChatroom ? "34vh" : "88vh" }}
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
