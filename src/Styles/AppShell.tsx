import { useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  MediaQuery,
  Burger,
  useMantineTheme,
} from "@mantine/core";
import { Outlet } from "react-router-dom";

import TdflNavbar from "./Navbar/Navbar";
import TdflHeader from "./Navbar/Header";

export default function TdflAppShell() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="xl"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="xl"
          hidden={!opened}
          width={{ sm: 300, lg: 300 }}
        >
          <TdflNavbar />
        </Navbar>
      }
      header={
        <Header height={70} p="md">
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <MediaQuery largerThan="xl" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <TdflHeader
              links={[{ link: "wwww.example.com", label: "example" }]}
            />
          </div>
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  );
}
