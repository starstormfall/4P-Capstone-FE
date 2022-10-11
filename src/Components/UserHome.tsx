import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0, User } from "@auth0/auth0-react";
import axios from "axios";
import { backendUrl } from "../utils";
import { Button, Text } from "@mantine/core";
import { UseApp } from "./Context";

export default function HomePage() {
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const { setUser } = UseApp();

  const handleLogin = () => {
    console.log("Client logging in!");
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
    setUser(response.data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      updateUser(user);
      console.log("user", user);
    }
  });
  return (
    <div>
      Home Page
      <Text color="blue">Welcome to Mantine!</Text>
      <Button radius="md" color="aqua">
        BUTTON 1
      </Button>
      <Button color="blue">BUTTON 2</Button>
      <Button color="greyBlue">BUTTON 3</Button>
      <Button color="green">BUTTON 1</Button>
      <Button color="purple">BUTTON 1</Button>
      <Button color="beige">BUTTON 1</Button>
      <Button onClick={handleLogin}>LOGIN BUTTON</Button>
      <Button onClick={() => logout()}>LOG OUT BUTTON</Button>
    </div>
  );
}
