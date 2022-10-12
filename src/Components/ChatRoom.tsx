import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import tdflLogo from "../Images/tdflLogo.png";
import { io, Socket } from "socket.io-client";
import {
  Button,
  Card,
  Text,
  Container,
  Textarea,
  MultiSelect,
} from "@mantine/core";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  send_chatdata: (data: loadedMessage[]) => void;
  received_message: (data: loadedMessage[]) => void;
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
  hello: () => void;
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

type chatroomParams = {
  chatroomId: string;
};

interface posterUser {
  name: string;
  photoLink: string;
}

interface loadedMessage {
  id?: number;
  message: string;
  chatroomId: number;
  posterUserId: number;
  createdAt: Date;
  updatedAt: Date;
  posterUser: posterUser;
}

interface friend {
  value: string;
  label: string;
}

interface props {
  active: boolean;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(backendUrl);

//to pass props down to this chatroom if current active status is true or false
export default function ChatRoom(props: props) {
  const { chatroomId } = useParams<chatroomParams>();
  const [allMessages, setAllMessages] = useState<loadedMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  // const [newUser, setNewUser] = useState<friend[]>([]);
  const [newUser, setNewUser] = useState<string[]>([]);
  // const [active, setActive] = useState<boolean>(props.active);
  const [active, setActive] = useState<boolean>(true);
  const navigate = useNavigate();

  console.log(chatroomId);

  // Allows users to join socket room upon load.
  useEffect(() => {
    //Maybe want to qualify if current logged in user is within the chatroom id to allow them to join the chatrooms and get the messages.

    socket.emit("join_chatroom", { room: `${chatroomId}` });
  }, []);

  // Allows users to get previous chat data upon load.
  useEffect(() => {
    //Maybe want to qualify if current logged in user is within the chatroom id to allow them to join the chatrooms and get the messages.
    socket.on("send_chatdata", (data: loadedMessage[]) => {
      console.log(data);
      setAllMessages(data);
    });
  }, [newMessage]);

  console.log(allMessages);

  //Allows users to get updated chat when someone sends a message.
  useEffect(() => {
    socket.on("received_message", (data: loadedMessage[]) => {
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
    });
  }, [adminMessage]);

  useEffect(() => {
    socket.on("received_deactivation", (data: string) => {
      setActive(false);

      setAdminMessage(data);
    });
  }, [adminMessage]);

  let allChatMessages;

  if (allMessages && allMessages !== null) {
    allChatMessages = allMessages.map((message) => {
      return (
        <div key={message.message}>
          <li>
            <ol>
              <img src={message.posterUser.photoLink} alt="chat user"></img>
              <p>{message.posterUser.name}</p>
              <p>{new Date(message.createdAt).toLocaleString()}</p>
              <p>{message.message}</p>
            </ol>
          </li>
        </div>
      );
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

    //HARDCODED userId and posterUser FOR NOW
    const newObject = {
      message: newMessage,
      chatroomId: Number(chatroomId),
      posterUserId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      posterUser: {
        name: "Sam",
        photoLink:
          "https://firebasestorage.googleapis.com/v0/b/project4-capstone-tdfl.appspot.com/o/users%2Fseed%2Fsamo.jpg?alt=media&token=c6292add-1536-417e-8aca-1e1ef5be218f",
      },
    };

    socket.emit("send_message", newObject);

    //for the person who submitted, just call for the object to append to local state.
    setAllMessages([...allMessages, newObject]);

    setNewMessage("");
    setAdminMessage("");
  };

  //When user chooses to leave the chatroom. Destroy chatroom-user row in BE.
  const handleLeave = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    console.log(event);

    //HARDCODED userId FOR NOW
    const itemToDestroy = {
      chatroomId: Number(chatroomId),
      userId: 2,
    };

    socket.emit("leave_disconnect", itemToDestroy);

    socket.disconnect();

    navigate("../chatroom");
  };

  //when host adds new users to existing chat. Currently following mantine multi-select component required format . To implement further when friends list and user data is set. TO DO LATER!!!
  const handleAdd = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    // const newUserObj = {
    //   newUser: newUser,
    //   chatroomId: Number(chatroomId),
    // };

    const newUserObj = newUser.map((user) => ({
      chatroomId: Number(chatroomId),
      userId: Number(user),
    }));

    socket.emit("add_newUsers", newUserObj);
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

  return (
    <>
      <div>ChatRoom Page</div>
      <Button onClick={handleLeave}>Leave Chatroom</Button>

      {/* if logged in user is host of chatroom, multiselect and button to add friends to chat will appear. TO DO LATER!!*/}
      <MultiSelect value={newUser} onChange={setNewUser} data={[]} />
      <Button onClick={handleAdd}>Invite Friend to Chat</Button>
      <Button onClick={handleActive}>Deactivate Room</Button>

      {allChatMessages}
      {/* <Button onClick={handleBack}>Back to ChatroomList</Button> */}
      <br />
      {adminMessage.length !== 0 ? adminMessage : null}
      <form onSubmit={handleSubmit}>
        <br />
        <Textarea
          // type="textarea"
          disabled={!active}
          placeholder="Send a new message."
          value={newMessage}
          onChange={handleChange}
        />
        <Button type="submit" disabled={!active}>
          Submit
        </Button>
      </form>
    </>
  );
}
