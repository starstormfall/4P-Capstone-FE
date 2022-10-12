import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import tdflLogo from "../Images/tdflLogo.png";
import { useAuth0 } from "@auth0/auth0-react";
import { UseApp } from "./Context";

import { Button, Container, Image, Grid } from "@mantine/core";

export default function ExplorePage() {
  const navigate = useNavigate();

  const [allPhotos, setAllPhotos] = useState([]);

  // get a certain number of photos based on number query
  const getPhotos = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/photos?number=7`);

      setAllPhotos(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const { setUserEmail, setUserId } = UseApp();

  const handleLogin = () => {
    console.log("User logging in!");
    loginWithRedirect();
  };

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
    console.log(response.data.id);
    if (response) {
      setUserId(response.data.id);
    }
  };

  useEffect(() => {
    getPhotos();
    if (isAuthenticated) {
      getUserInfo();
      console.log("user", user);
    }
  }, [user]);

  return (
    <Container size="xl">
      <Image src={tdflLogo} fit="contain" height={300} alt="logo" />
      <Button onClick={() => navigate("/home")}> Home </Button>
      <Button onClick={handleLogin}>LOGIN BUTTON</Button>
      <Button onClick={() => logout()}>LOG OUT BUTTON</Button>
      <Button onClick={() => navigate("/befriend")}>nav to befriend</Button>
      <Grid>
        <Grid.Col xs={4}>
          <Image
            height={700}
            fit="cover"
            radius="md"
            src={allPhotos[0]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={8}>
          <Image
            fit="cover"
            height={700}
            radius="md"
            src={allPhotos[1]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={8}>
          <Image
            fit="cover"
            height={700}
            radius="md"
            src={allPhotos[2]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={4}>
          <Image
            fit="cover"
            height={700}
            radius="md"
            src={allPhotos[3]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height={700}
            radius="md"
            src={allPhotos[4]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height={700}
            radius="md"
            src={allPhotos[5]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={6}>
          <Image
            fit="cover"
            height={700}
            radius="md"
            src={allPhotos[6]}
            alt="japan"
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
