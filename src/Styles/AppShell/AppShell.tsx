import { useState, useEffect, MouseEvent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

import { UseApp } from "../../Components/Context";
import { backendUrl } from "../../utils";

// imports for style components
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
  ActionIcon,
} from "@mantine/core";
import { LogOut, Search } from "@easy-eva-icons/react";
import { useStyles } from "./useStyles";
import tdflLogo from "../../Images/tdflLogo.png";

export default function TdflAppShell() {
  const theme = useMantineTheme();
  const { userInfo } = UseApp();
  const [opened, setOpened] = useState(false);
  const { classes, cx } = useStyles();
  const navigate = useNavigate();

  // for authentication
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const { setUserEmail, setUserInfo, setUserName, setUserPhoto, setUserId } =
    UseApp();

  const updateUser = async (user: any) => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });

    const response = await axios.post(
      `${backendUrl}/users/`,
      {
        //refer BE controller
        email: user.email,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    console.log(response.data);
    if (response) {
      setUserEmail(response.data[0].email);
    }
  };

  const getUserInfo = async () => {
    await updateUser(user);

    const response = await axios.get(`${backendUrl}/users/${user?.email}`);
    console.log(response.data);
    if (response) {
      setUserId(response.data.id);
      setUserName(response.data.name);
      setUserPhoto(response.data.photoLink);
      setUserInfo(response.data);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getUserInfo();
      console.log("user", user);
    } else {
      navigate("/");
    }
  }, [user]);

  // to check when was user last logged in and to update score if necessary
  const recordLogin = async () => {
    try {
      const loginData = axios.put(`${backendUrl}/users/${userInfo.id}/login`);
    } catch (err) {
      console.log(err);
    }
  };

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
                data={["Tokyo", "Osaka", "Hokkaido"]}
              />
              <UnstyledButton>
                <Group spacing={5} noWrap>
                  <Avatar src={userInfo.photoLink} radius="xl" />

                  <div style={{ flex: 1 }}>
                    <Text
                      className={classes.headerUser}
                      color="greyBlue"
                      size="sm"
                      weight={500}
                    >
                      {userInfo.name}
                    </Text>
                    <Text color="dimmed" size="xs">
                      Score: {userInfo.score}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
              <ActionIcon>
                <LogOut onClick={(event: MouseEvent) => logout()} />
              </ActionIcon>
            </Group>
          </Container>
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  );
}
