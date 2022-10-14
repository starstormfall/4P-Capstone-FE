import { useState, MouseEvent } from "react";
import {
  AppShell,
  Navbar,
  Header,
  MediaQuery,
  Burger,
  useMantineTheme,
  Image,
  Group,
  Autocomplete,
  Container,
  UnstyledButton,
  Avatar,
  Text,
} from "@mantine/core";
import { Outlet } from "react-router-dom";

import { LogOut, Search } from "@easy-eva-icons/react";
import { UseApp } from "../../Components/Context";
import tdflLogo from "../../Images/tdflLogo.png";
import { useNavigate } from "react-router-dom";

import { useStyles } from "./useStyles";

// interface Props {
//   // links: { link: string; label: string }[];
//   items: JSX.Element[];
//   // active: string;
// }

export default function TdflAppShell() {
  const theme = useMantineTheme();
  const { userInfo } = UseApp();
  const [opened, setOpened] = useState(false);
  const { classes, cx } = useStyles();
  const navigate = useNavigate();

  const links = [
    {
      link: "home",
      label: "Home",
    },
    {
      link: "/map",
      label: "Map",
    },
    {
      link: "/exchange",
      label: "Exchange",
    },
    {
      link: "/befriend",
      label: "Befriend",
    },
    {
      link: "/favourite",
      label: "Inspo",
    },
  ];

  const [active, setActive] = useState(links[0].link);

  const items = links.map((link, index) => (
    <UnstyledButton
      key={link.label}
      className={cx(classes.headerLink, {
        [classes.headerLinkActive]: active === link.link,
      })}
      onClick={(event: MouseEvent) => {
        setActive(link.link);
        navigate(link.link);
      }}
    >
      {link.label}
    </UnstyledButton>
  ));

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
      // do when got time for styling
      // navbarOffsetBreakpoint={3000}
      // navbar={
      //   <Navbar
      //     p="md"
      //     hiddenBreakpoint={3000}
      //     hidden={!opened}
      //     width={{ sm: 300, lg: 300 }}
      //   >
      //     <TdflNavbar />
      //   </Navbar>
      // }
      header={
        <Header height={70} p="xs">
          <Container px="0" fluid className={classes.headerInner}>
            <Burger
              opened={opened}
              // onClick={toggle}
              size="sm"
              className={classes.headerBurger}
            />
            <Group position="left" className={classes.headerLinks} spacing={5}>
              {items}
            </Group>

            <Image src={tdflLogo} height={50} width={100} />

            <Group
              className={classes.headerRight}
              position="right"
              noWrap
              spacing="xs"
            >
              <Autocomplete
                placeholder="Search prefectures, categories, hashtags"
                icon={<Search />}
                data={[
                  "React",
                  "Angular",
                  "Vue",
                  "Next.js",
                  "Riot.js",
                  "Svelte",
                  "Blitz.js",
                ]}
              />
              <UnstyledButton onClick={() => navigate("/")}>
                <Group spacing={5} noWrap>
                  <Avatar src={userInfo.photoLink} radius="xl" />
                  <Text
                    className={classes.headerUser}
                    color="greyBlue"
                    size="sm"
                    weight={500}
                  >
                    {userInfo.name}
                  </Text>
                  <LogOut />
                </Group>
              </UnstyledButton>
            </Group>
          </Container>
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  );
}
