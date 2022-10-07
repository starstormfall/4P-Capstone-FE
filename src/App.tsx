import React from "react";
// import logo from './logo.svg';
import "./App.css";
import { BrowserRouter, Route, Link } from "react-router-dom";
import ExplorePage from "./Components/ExplorePage";
import HomePage from "./Components/UserHome";
import UserForm from "./Components/UserForm";
import UserFavourites from "./Components/UserFavourites";
import ForumMain from "./Components/ForumMain";
import ThreadSingle from "./Components/TheadSingle";
import BeFriendPage from "./Components/BeFriendPage";
import FriendList from "./Components/FriendList";
import ChatRoomList from "./Components/ChatRoomList";
import ChatRoom from "./Components/ChatRoom";
import Map from "./Components/Map";
import PinMap from "./Components/PinMap";

import { MantineProvider, Text, Button } from "@mantine/core";
import { tdflTheme } from "./Styles/theme";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
<MantineProvider theme={tdflTheme} withGlobalStyles withNormalizeCSS>
        {/* Main page that does NOT require sign in*/}
        <Route path="/" element={<ExplorePage />} />
        {/* Account creation page */}
        <Route path="/createaccount" element={<UserForm />} />
        {/* Logged in user homepage (explorepage) */}
        <Route path="/home" element={<HomePage />} />
        {/* User's Favourites page */}
        <Route path="/favourite" element={<UserFavourites />} />
        {/* Forum page */}
        <Route path="/forum" element={<ForumMain />} />
        {/* Individual Forum Thread (need forum creation page? or modal) */}
        <Route path="/forum/:threadId" element={<ThreadSingle />} />

        {/* Befriend page that house <friendList/> and <Chatrooms/> */}
        <Route path="/befriend" element={<BeFriendPage />}>
          {/* Befriend (friend list in Befriend) */}
          <Route path="/befriend/friendlist" element={<FriendList />} />
          {/* Befriend (all user's chatrooms) */}
          <Route path="/befriend/chatroom" element={<ChatRoomList />} />
          <Route path="/befriend/chatroom/:chatroomId" element={<ChatRoom />} />
        </Route>

        {/* Map homepage */}
        <Route path="/map" element={<Map />} />
        <Route path="/map/:pinId" element={<PinMap />} />
</MantineProvider>
      </BrowserRouter>

 <Text color="blue">Welcome to Mantine!</Text>
      <Button radius="md" color="aqua">
        BUTTON 1
      </Button>
      <Button color="blue">BUTTON 2</Button>
      <Button color="greyBlue">BUTTON 3</Button>
      <Button color="green">BUTTON 1</Button>
      <Button color="purple">BUTTON 1</Button>
      <Button color="beige">BUTTON 1</Button>
    </div>
  );
}

export default App;
