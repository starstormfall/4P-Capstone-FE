import { useState, useEffect, MouseEvent, forwardRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import axios from "axios";

import { UseApp } from "../../Components/Context";
import { backendUrl } from "../../utils";

// imports for style components
import {
  AppShell,
  Header,
  Burger,
  Image,
  Group,
  Container,
  UnstyledButton,
  Avatar,
  Text,
  ActionIcon,
  Dialog,
  Menu,
  Modal,
  Loader,
  Alert,
  MultiSelect,
  ThemeIcon,
} from "@mantine/core";

import {
  LogOut,
  Search,
  Home,
  Map,
  People,
  SmilingFace,
} from "@easy-eva-icons/react";

import {
  IconAlertCircle,
  IconBrandInstagram,
  IconBlockquote,
  IconMessages,
  IconChevronDown,
} from "@tabler/icons";

import { useStyles } from "./useStyles";
import tdflLogo from "../../Images/tdflLogo.png";

import { StreakDialog } from "./StreakDialog";
import Rewards from "../../Components/Rewards";
import UserForm from "../../Components/UserForm";

export type ContextType = {
  key: [
    userLoggedIn: boolean,
    setUserLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
    token: string,
    inputValue: string[]
  ];
};

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

function TdflAppShell() {
  const { userInfo } = UseApp();
  const { setUserEmail, setUserInfo, setUserName, setUserPhoto, setUserId } =
    UseApp();

  const { classes, cx } = useStyles();
  const navigate = useNavigate();

  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);

  const [loginScore, setLoginScore] = useState<number>(0);

  // FOR AUTOCOMPLETE DATA
  const sourceData = [
    { label: "Instagram", value: "instagram", image: <IconBrandInstagram /> },
    { label: "Review", value: "review", image: <IconBlockquote /> },
    { label: "Forum", value: "forum", image: <IconMessages /> },
  ];

  const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ image, label, description, ...others }: ItemProps, ref) => (
      <div ref={ref} {...others}>
        <Group noWrap>
          <ThemeIcon
            variant="gradient"
            gradient={{ from: "greyBlue.5", to: "greyBlue.3", deg: 105 }}
          >
            {image}
          </ThemeIcon>

          <div>
            <Text>{label}</Text>
            <Text size="xs" color="dimmed">
              {description}
            </Text>
          </div>
        </Group>
      </div>
    )
  );

  const [inputValue, setInputValue] = useState<string[]>([]);

  // render components
  const [streakDialogOn, setStreakDialogOn] = useState<boolean>(false);
  const [userFormOn, setUserFormOn] = useState<boolean>(false);
  // eslint-disable-next-line
  const [opened, setOpened] = useState(false);

  const [rewardModalVisible, setRewardModalVisible] = useState(true);
  const [rewardError, setRewardError] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const [newUserDone, setNewUserDone] = useState<boolean>(false);

  // for authentication
  const {
    isAuthenticated,
    isLoading,
    user,
    logout,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [token, setToken] = useState<string>("");

  const getUserInfo = async (user: any) => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });

    setToken(accessToken);
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
        `${backendUrl}/users/${response.data[0].id}/login`,
        { currentDate: new Date() },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
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
    // eslint-disable-next-line
  }, [isAuthenticated, newUserDone]);

  const links = [
    {
      link: "home",
      label: "Home",
      icon: <Home />,
    },
    {
      link: "/map",
      label: "Map",
      icon: <Map />,
    },
    {
      link: "/exchange",
      label: "Exchange",
      icon: <People />,
    },
    {
      link: "/befriend",
      label: "Befriend",
      icon: <SmilingFace />,
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
      <Group spacing={5}>
        {link.icon}
        {link.label}
      </Group>
    </UnstyledButton>
  ));

  const handleCloseModal = (event: MouseEvent) => {
    setNewUserDone(true);
  };

  if (isLoading) {
    return <Loader />;
  } else {
  }

  return (
    <>
      <AppShell
        styles={{
          main: {
            paddingTop: "70px",
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
                <MultiSelect
                  itemComponent={SelectItem}
                  // filter={(value, selected, item) =>
                  //   !selected && item &&
                  //   (item.label
                  //     .toLowerCase()
                  //     .includes(value.toLowerCase().trim()) ||
                  //     item.description
                  //       .toLowerCase()
                  //       .includes(value.toLowerCase().trim()))
                  // }
                  icon={<Search />}
                  data={sourceData}
                  placeholder="Search by type of post"
                  searchable
                  nothingFound="Nothing found"
                  rightSection={<IconChevronDown size={14} />}
                  styles={{ rightSection: { pointerEvents: "none" } }}
                  rightSectionWidth={30}
                  value={inputValue}
                  onChange={setInputValue}
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
                    <Rewards
                      setRewardModalVisible={setRewardModalVisible}
                      rewardModalVisible={rewardModalVisible}
                      rewardError={rewardError}
                      setRewardError={setRewardError}
                      rewardClaimed={rewardClaimed}
                      setRewardClaimed={setRewardClaimed}
                    />
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
        {userInfo && rewardClaimed ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Congratulations!"
            color="aqua"
            withCloseButton
            closeButtonLabel="Close alert"
            onClose={() => setRewardClaimed(false)}
          >
            You have successfully claimed your reward!
          </Alert>
        ) : null}
        {userInfo && rewardError ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Bummer!"
            color="aqua"
            withCloseButton
            closeButtonLabel="#C1BBD5"
            onClose={() => setRewardError(false)}
          >
            Sorry, it looks like you have not accumulated enough points yet! You
            need a minimum of 200 points to be eligible for our rewards. Please
            come back after earning more points!
          </Alert>
        ) : null}
        <Outlet context={[userLoggedIn, setUserLoggedIn, token, inputValue]} />
      </AppShell>

      <Dialog
        position={{ top: 90, right: 20 }}
        opened={streakDialogOn}
        withCloseButton
        onClose={() => setStreakDialogOn(false)}
        size="sm"
        radius="md"
        transition="pop"
      >
        <StreakDialog
          loginStreak={userInfo.loginStreak}
          loginScore={loginScore}
        />
      </Dialog>

      <Modal
        opened={userFormOn}
        withCloseButton={false}
        onClose={() => setUserFormOn(false)}
        fullScreen
      >
        <UserForm
          closeModal={handleCloseModal}
          newUserDone={newUserDone}
          setNewUserDone={setNewUserDone}
        />
      </Modal>
    </>
  );
}

export default withAuthenticationRequired(TdflAppShell, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <Loader />,
});
