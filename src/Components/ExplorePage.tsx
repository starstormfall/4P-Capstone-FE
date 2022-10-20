import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import tdflLogo from "../Images/tdflLogo.png";
import { useAuth0 } from "@auth0/auth0-react";
import { UseApp } from "./Context";

import { Button, Container, Image, Grid, Box, Title } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

export default function ExplorePage() {
  const navigate = useNavigate();
  const { height, width } = useViewportSize();

  const [allPhotos, setAllPhotos] = useState([]);

  // get a certain number of photos based on number query
  const getPhotos = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/photos?number=9`);

      setAllPhotos(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const { loginWithRedirect, isAuthenticated, user } = useAuth0();

  // const { setUserEmail, setUserInfo, setUserName, setUserPhoto, setUserId } =
  //   UseApp();

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      loginWithRedirect();
    }
  };

  // const updateUser = async (user: any) => {
  //   const accessToken = await getAccessTokenSilently({
  //     audience: process.env.REACT_APP_AUDIENCE,
  //     scope: process.env.REACT_APP_SCOPE,
  //   });

  //   const response = await axios.post(
  //     `${backendUrl}/users/`,
  //     {
  //       //refer BE controller
  //       email: user.email,
  //     },
  //     {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //     }
  //   );
  //   console.log(response.data);
  //   if (response) {
  //     setUserEmail(response.data[0].email);
  //   }
  // };

  // const getUserInfo = async () => {
  //   await updateUser(user);

  //   const response = await axios.get(`${backendUrl}/users/${user?.email}`);
  //   console.log(response.data);
  //   if (response) {
  //     setUserId(response.data.id);
  //     setUserName(response.data.name);
  //     setUserPhoto(response.data.photoLink);
  //     setUserInfo(response.data);
  //   }
  // };

  useEffect(() => {
    getPhotos();
    // if (isAuthenticated) {
    //   navigate("/home");
    // }
  }, [user]);

  return (
    <Box
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        textAlign: "center",
        padding: theme.spacing.lg,
        borderRadius: theme.radius.md,
        height: height,
      })}
    >
      <Grid grow>
        {/* row 1 */}
        <Grid.Col xs={3}>
          <Image
            height={270}
            fit="cover"
            radius="md"
            src={allPhotos[0]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={7}>
          <Image
            fit="cover"
            height={270}
            radius="md"
            src={allPhotos[1]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height={270}
            radius="md"
            src={allPhotos[2]}
            alt="japan"
          />
        </Grid.Col>

        {/* row 2 */}
        <Grid.Col xs={4}>
          <Image
            fit="cover"
            height={270}
            radius="md"
            src={allPhotos[3]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Image src={tdflLogo} fit="contain" height={220} alt="logo" />
          <Button onClick={handleLogin}>
            <Title order={5}>LOGIN | SIGNUP</Title>
          </Button>
        </Grid.Col>
        <Grid.Col xs={4}>
          <Image
            fit="cover"
            height={270}
            radius="md"
            src={allPhotos[4]}
            alt="japan"
          />
        </Grid.Col>

        {/* row 3 */}
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height={270}
            radius="md"
            src={allPhotos[5]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height={270}
            radius="md"
            src={allPhotos[6]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height={270}
            radius="md"
            src={allPhotos[7]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={5}>
          <Image
            fit="cover"
            height={270}
            radius="md"
            src={allPhotos[8]}
            alt="japan"
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
