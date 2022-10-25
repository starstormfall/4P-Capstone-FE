import { Route, Routes } from "react-router-dom";

// imports for components
import TdflAppShell from "./Styles/AppShell/AppShell";
import NothingFound from "./Components/NothingFound/NothingFound";
import ExplorePage from "./Components/ExplorePage";
import HomePage from "./Components/UserHome/HomePage";
import ForumMain from "./Components/ForumMain";
import ThreadSingle from "./Components/TheadSingle";
import BeFriendPage from "./Components/BeFriendPage";
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
        <MantineProvider theme={tdflTheme} withGlobalStyles withNormalizeCSS>
          <Routes>
            {/* Main page that does NOT require sign in*/}
            <Route index element={<ExplorePage />} />
            <Route path="/" element={<TdflAppShell />}>
              {/* Logged in user homepage (explorepage) */}
              <Route path="/home" element={<HomePage />} />
              {/* Forum page */}
              <Route path="/exchange" element={<ForumMain />} />
              {/* Individual Forum Thread (need forum creation page? or modal) */}
              <Route path="/exchange/:threadId" element={<ThreadSingle />} />
              {/* Befriend page that house <friendList/> and <Chatrooms/> */}
              <Route path="/befriend" element={<BeFriendPage />} />
              {/* Map homepage */}
              <Route path="/map" element={<Map />} />
            </Route>
            <Route path="*" element={<NothingFound />} />
          </Routes>
        </MantineProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
