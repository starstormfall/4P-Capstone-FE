import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import {
  Button,
  Card,
  Text,
  Container,
  Textarea,
  MultiSelect,
  Stack,
  Group,
  ScrollArea,
  Avatar,
  Grid,
  createStyles,
  Alert,
  Anchor,
  Paper,
  Modal,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import JNTO from "../Images/JNTO.png";

export default function Rewards() {
  const navigate = useNavigate();

  // Usage of Context to obtain userId and userInfo.
  const { userId, userInfo, setUserInfo } = UseApp();

  // Obtain methods for auth0 authentication.
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [rewardError, setRewardError] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [newUserScore, setNewUserScore] = useState(0);

  // useEffect for checking auth0 authentication upon load.
  useEffect(() => {
    if (isAuthenticated) {
      console.log(user);
      setNewUserScore(userInfo.score);
      setRewardError(false);
      setRewardClaimed(false);
    } else {
      loginWithRedirect();
    }
  }, []);
  console.log(userInfo);

  const handleExchange = async () => {
    setRewardError(false);

    if (userInfo && Number(userInfo.score) >= 200) {
      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUDIENCE,
        scope: process.env.REACT_APP_SCOPE,
      });

      const newUserScoreObj = {
        email: userInfo.email,
        score: Number(userInfo.score - 200),
        name: userInfo.name,
        nationality: userInfo.nationality,
        lastLogin: userInfo.lastLogin,
        photoLink: userInfo.photoLink,
        loginStreak: userInfo.loginStreak,
      };

      await axios.put(`${backendUrl}/users/update/${userId}`, newUserScoreObj, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setNewUserScore(newUserScoreObj.score);
      setUserInfo({ ...userInfo, score: newUserScoreObj.score });

      setRewardClaimed(true);
    } else {
      setRewardError(true);
      setRewardClaimed(false);
    }
  };

  return (
    <>
      {userInfo && rewardClaimed ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Congratulations!"
          color="aqua"
          withCloseButton
          closeButtonLabel="Close alert"
          onClose={() => setRewardClaimed(false)}
        >
          You have successfully claimed your reward! You have {newUserScore}{" "}
          points now!
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
      <Modal
      // opened={checkIn}
      // onClose={() => setCheckIn(false)}
      // radius="md"
      // size="auto"
      // withCloseButton={false}
      >
        <Paper
          radius="md"
          withBorder
          p="lg"
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
          })}
        >
          <Avatar src={userInfo.photoLink} size={120} radius={120} mx="auto" />
          <Text align="center" size="lg" weight={500} mt="md">
            {userInfo.name}
          </Text>
          <Text align="center" color="dimmed" size="sm">
            {userInfo.score} Points
          </Text>

          {/* <Button variant="default" fullWidth mt="md">
          Send message
        </Button> */}
        </Paper>
      </Modal>
      {/* 
      <Avatar
        src={userInfo.photoLink}
        alt={userInfo.name}
        radius="xl"
        size="xl"
      />
      <Text>
        Hi {userInfo.name}, your current points is {userInfo.score}.
      </Text>
      <br />
      <Text>
        Exchange points for rewards here with our official partner Japan
        National Tourism Organization!{" "}
      </Text>
      <br />
      <Anchor
        href="https://www.japan.travel/en/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={JNTO}
          alt="Japan National Tourism Organization"
          height="15%"
        />
      </Anchor>
      <br />
      <Text>10% discount coupon on an attraction of your choice!</Text>
      <Text>*Terms and Conditions apply</Text>
      <Button onClick={handleExchange}>EXCHANGE FOR 200 POINTS</Button>

      <br />
      <br />
      <Text>
        Other rewards coming your way soon. Stay tuned and keep stacking!
      </Text> */}
    </>
  );
}
