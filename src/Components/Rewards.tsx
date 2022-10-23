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
  Image,
  Badge,
  Center,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import JNTO from "../Images/JNTO.png";

interface Props {
  setRewardModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  rewardModalVisible: boolean;
  rewardError: boolean;
  setRewardError: React.Dispatch<React.SetStateAction<boolean>>;
  rewardClaimed: boolean;
  setRewardClaimed: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  imageSection: {
    padding: theme.spacing.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  label: {
    marginBottom: theme.spacing.xs,
    lineHeight: 1,
    fontWeight: 700,
    fontSize: theme.fontSizes.xs,
    letterSpacing: -0.25,
    textTransform: "uppercase",
  },

  section: {
    padding: theme.spacing.md,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  sectionWithoutBorder: {
    padding: theme.spacing.md,
  },

  sectionFooter: {
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  labelFooter: {
    marginTop: theme.spacing.xs,
    lineHeight: 1,
    fontWeight: 700,
    fontSize: theme.fontSizes.xs,
    letterSpacing: -0.25,
    // textTransform: "uppercase",
  },

  groupNoMargin: {
    marginTop: 0,
  },

  icon: {
    marginRight: 5,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[5],
  },
}));

// Rewards currently sitting as a child of ExplorePage.tsx. To shift to avatar later. Props being passed are useState pair of rewardModalVisible.
export default function Rewards(props: Props) {
  const navigate = useNavigate();

  const { classes } = useStyles();

  const {
    setRewardModalVisible,
    rewardModalVisible,
    rewardError,
    setRewardError,
    rewardClaimed,
    setRewardClaimed,
  } = props;

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

  const [newUserScore, setNewUserScore] = useState(0);
  // const [modalVisible, setModalVisible] = useState(true);

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
      <Modal
        opened={true}
        onClose={() => setRewardModalVisible(false)}
        radius="md"
        size="sm"
        withCloseButton
      >
        <Card withBorder radius="md" className={classes.card}>
          <Card.Section className={classes.imageSection}>
            <Paper radius="md">
              <Avatar
                src={userInfo.photoLink}
                size={120}
                radius={120}
                mx="auto"
              />
              <Text align="center" size="lg" weight={500} mt="md">
                {userInfo.name}
              </Text>
              <Text align="center" color="dimmed" size="sm">
                {userInfo.score} Points
              </Text>
            </Paper>
          </Card.Section>
          <br />
          <Text size="sm" color="dimmed" className={classes.label}>
            Japan National Tourism Organization
          </Text>
          <Anchor
            href="https://www.japan.travel/en/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={JNTO}
              alt="Japan National Tourism Organization"
              height="20vh"
              fit="contain"
            />
          </Anchor>
          <Card.Section className={classes.section} mt="md">
            <Group position="apart" className={classes.groupNoMargin}>
              <div>
                <Text weight={500}>An Attraction of Your Choice</Text>
                <Text size="xs" color="dimmed">
                  * Terms & Conditions Apply
                </Text>
              </div>
              <Badge variant="outline">10% OFF</Badge>
            </Group>
            <br />
            <Group spacing={30}>
              <div>
                <Text size="xl" weight={700} sx={{ lineHeight: 1 }}>
                  200
                </Text>
                <Text
                  size="sm"
                  color="dimmed"
                  weight={500}
                  sx={{ lineHeight: 1 }}
                  mt={3}
                >
                  points
                </Text>
              </div>

              <Button radius="xl" style={{ flex: 1 }} onClick={handleExchange}>
                Claim now
              </Button>
            </Group>
            <Text size="sm" color="dimmed" className={classes.labelFooter}>
              More rewards coming. Stay tuned and keep stacking!
            </Text>
          </Card.Section>
          <Card.Section className={classes.sectionFooter}></Card.Section>
        </Card>
      </Modal>
    </>
  );
}
