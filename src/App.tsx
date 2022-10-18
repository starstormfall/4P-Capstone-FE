import { BrowserRouter, Route, Routes } from "react-router-dom";

// imports for components
import TdflAppShell from "./Styles/AppShell/AppShell";
import NothingFound from "./Components/NothingFound/NothingFound";
import ExplorePage from "./Components/ExplorePage";
import HomePage from "./Components/UserHome/HomePage";
import UserForm from "./Components/UserForm";
import UserFavourites from "./Components/Favourites/UserFavourites";
import ForumMain from "./Components/ForumMain";
import ThreadSingle from "./Components/TheadSingle";
import BeFriendPage from "./Components/BeFriendPage";
import FriendList from "./Components/FriendList";
import ChatRoomList from "./Components/ChatRoomList";
import ChatRoom from "./Components/ChatRoom";
import Map from "./Components/Map";
import { AppContextProvider } from "./Components/Context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//imports for styling
import { MantineProvider } from "@mantine/core";
import { tdflTheme } from "./Styles/theme";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <BrowserRouter>
          <MantineProvider theme={tdflTheme} withGlobalStyles withNormalizeCSS>
            {/* Main page that does NOT require sign in*/}
            <Routes>
              <Route index element={<ExplorePage />} />
              <Route path="/" element={<TdflAppShell />}>
                {/* Account creation page */}
                <Route path="/createaccount" element={<UserForm />} />
                {/* Logged in user homepage (explorepage) */}
                <Route path="/home" element={<HomePage />} />

                {/* User's Favourites page */}
                <Route path="/favourite" element={<UserFavourites />} />
                {/* Forum page */}
                <Route path="/exchange" element={<ForumMain />} />
                {/* Individual Forum Thread (need forum creation page? or modal) */}
                <Route path="/exchange/:threadId" element={<ThreadSingle />} />

                {/* Befriend page that house <friendList/> and <Chatrooms/> */}
                <Route path="/befriend" element={<BeFriendPage />}>
                  {/* Befriend (friend list in Befriend) */}
                  {/* <Route path="/befriend/friendlist" element={<FriendList />} /> */}
                  {/* Befriend (all user's chatrooms) */}
                  {/* <Route path="/befriend/chatroom" element={<ChatRoomList />} /> */}
                  {/* <Route
                    path="/befriend/chatroom/:chatroomId"
                    element={<ChatRoom active={true} />}
                  /> */}
                </Route>

                {/* Map homepage */}
                <Route path="/map" element={<Map />} />
                {/* Put Pinmap as a child component of explore page post? and no route here*/}
                {/* <Route path="/map/:pinId" element={<PinMap />} /> */}
              </Route>
              <Route path="*" element={<NothingFound />} />
            </Routes>
          </MantineProvider>
        </BrowserRouter>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
