import { useState, useEffect, MouseEvent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import axios from "axios";

import { UseApp } from "../../Components/Context";
import { backendUrl } from "../../utils";

// imports for style components
import {
  AppShell,
  Navbar,
  Header,
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
  Dialog,
  Menu,
  Modal,
  Loader,
} from "@mantine/core";
import { LogOut, Search } from "@easy-eva-icons/react";
import { useStyles } from "./useStyles";
import tdflLogo from "../../Images/tdflLogo.png";

import { StreakDialog } from "../../Components/StreakDialog";
import Rewards from "../../Components/Rewards";
import UserForm from "../../Components/UserForm";

export type ContextType = {
  key: [
    userLoggedIn: boolean,
    setUserLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
  ];
};

function TdflAppShell() {
  const theme = useMantineTheme();
  const { userInfo } = UseApp();
  const { setUserEmail, setUserInfo, setUserName, setUserPhoto, setUserId } =
    UseApp();

  const { classes, cx } = useStyles();
  const navigate = useNavigate();

  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);

  const [loginScore, setLoginScore] = useState<number>(0);

  // render components
  const [streakDialogOn, setStreakDialogOn] = useState<boolean>(false);
  const [userFormOn, setUserFormOn] = useState<boolean>(false);
  const [opened, setOpened] = useState(false);

  // for authentication
  const {
    isAuthenticated,
    user,
    logout,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();

  const getUserInfo = async (user: any) => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });

    // findOrCreate user in model
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

    // if user is newly created, show user creation form
    if (response.data[1]) {
      setUserFormOn(true);

      // get updated user data and setState after account creation
      // also set loginStreak = 1 and log lastLogin date
      const userData = await axios.get(
        `${backendUrl}/users/${response.data[0].email}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setUserId(userData.data.id);
      setUserName(userData.data.name);
      setUserPhoto(userData.data.photoLink);
      setUserInfo(userData.data);
      setUserEmail(userData.data.email);
    } else {
      // check when was user last logged in and to update score if necessary
      const loginData = await axios.put(
        `${backendUrl}/users/${response.data[0].id}/login`
      );
      switch (loginData.data.status) {
        case "added streak":
          setStreakDialogOn(true);
          break;
        case "reset streak":
          setStreakDialogOn(true);
          break;
        default:
          setStreakDialogOn(false);
      }
      // set user info data
      setUserId(loginData.data.updatedInfo.id);
      setUserName(loginData.data.updatedInfo.name);
      setUserPhoto(loginData.data.updatedInfo.photoLink);
      setUserInfo(loginData.data.updatedInfo);
      setLoginScore(loginData.data.scoreAdded);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      getUserInfo(user);
    } else {
      loginWithRedirect();
    }
  }, []);

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

  const handleCloseModal = (event: MouseEvent) => {
    setUserFormOn(false);
  };

  return (
    <>
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
              <Group
                position="left"
                className={classes.headerLinks}
                spacing={5}
              >
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
                <Menu>
                  <Menu.Target>
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
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Rewards />
                  </Menu.Dropdown>
                </Menu>
                <ActionIcon>
                  <LogOut onClick={(event: MouseEvent) => logout()} />
                </ActionIcon>
              </Group>
            </Container>
          </Header>
        }
      >
        <Outlet context={[userLoggedIn, setUserLoggedIn]} />
      </AppShell>

      <Dialog
        position={{ top: 90, right: 20 }}
        opened={streakDialogOn}
        withCloseButton
        onClose={() => setStreakDialogOn(false)}
        size="md"
        radius="md"
      >
        <StreakDialog
          loginStreak={userInfo.loginStreak}
          loginScore={loginScore}
        />
      </Dialog>

      <Modal
        opened={userFormOn}
        // withCloseButton={false}
        onClose={() => setUserFormOn(false)}
        fullScreen
      >
        <UserForm closeModal={handleCloseModal} />
      </Modal>
    </>
  );
}

export default withAuthenticationRequired(TdflAppShell, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <Loader />,
});
