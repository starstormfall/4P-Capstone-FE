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
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import JNTO from "../Images/JNTO.png";

export default function Rewards() {
  const navigate = useNavigate();

  // Usage of Context to obtain userId and userInfo.
  const { userId, userInfo } = UseApp();

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

      setRewardClaimed(true);
    } else {
      setRewardError(true);
      setRewardClaimed(false);
    }
  };

  return (
    <>
      <Text>Rewards Page</Text>
      {userInfo && rewardClaimed ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Congratulations!"
          color="aqua"
        >
          You have successfully claimed your reward! You have {newUserScore}{" "}
          points now!
        </Alert>
      ) : null}
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
        Exchange your points for rewards here with our official partner Japan
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
      <Text>10% discount coupon on an attraction!</Text>
      <Text>*Terms and Conditions apply</Text>
      <Button onClick={handleExchange}>EXCHANGE FOR 200 POINTS</Button>

      {userInfo && rewardError ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Bummer!"
          color="aqua"
        >
          Sorry, it looks like you have not accumulated enough points yet! You
          need a minimum of 200 points to be eligible for our rewards. Please
          come back after earning more points!
        </Alert>
      ) : null}
      <br />
      <br />
      <Text>
        Other rewards coming your way soon. Stay tuned and keep stacking!
      </Text>
    </>
  );
}
