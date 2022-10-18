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
} from "@mantine/core";
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

export default function ChatRoomList(props: Props) {
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
    }
  };

  useEffect(() => {
    getAllChatrooms();
  }, [chatroomName, props.openChatroom]);

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
        <>
          <div>ChatRoomList Page</div>
          <Button onClick={handleAddRoom}>New Chat</Button>
          {addChatroom && allFriends && allFriends.length !== 0 ? (
            <>
              <TextInput
                placeholder="All things Japan"
                label="Chatroom Name"
                withAsterisk
                onChange={handleChange}
              />
              <Text>Friends to Add</Text>
              <MultiSelect
                value={newUser}
                onChange={setNewUser}
                data={allFriends}
              />
              <Button onClick={handleCreateRoom}>Create Chatroom</Button>
            </>
          ) : null}
          {allChatrooms ? (
            <>
              <Text>Hosted Chatrooms</Text>
              {hostedChatrooms}
            </>
          ) : null}
        </>
      ) : (
        <>
          {allChatrooms ? (
            <>
              <Text>Invited Chatrooms</Text>
              {invitedChatrooms}
            </>
          ) : null}
        </>
      )}
    </>
  );
}
