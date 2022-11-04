import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl, redirectUriHome } from "../utils";
import tdflLogo from "../Images/tdflLogo.png";
import { useAuth0 } from "@auth0/auth0-react";

import {
  Button,
  Image,
  Grid,
  Box,
  Text,
  Title,
  Paper,
  Divider,
  List,
  Blockquote,
  Center,
  Space,
  ScrollArea,
  ThemeIcon,
} from "@mantine/core";

import {
  IconGlobe,
  IconAd2,
  IconStars,
  IconAffiliate,
  IconMapPins,
  IconReportMoney,
} from "@tabler/icons";
import { LogIn } from "@easy-eva-icons/react";

export default function ExplorePage() {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const [allPhotos, setAllPhotos] = useState([]);

  // get a certain number of photos based on number query
  const getPhotos = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/photos?number=13`);

      setAllPhotos(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      loginWithRedirect({
        redirectUri: redirectUriHome,
      });
    }
  };

  useEffect(() => {
    getPhotos();
  }, []);

  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing.xs,
        borderRadius: theme.radius.md,
      })}
    >
      <Grid columns={15} grow>
        {/* row 1 */}
        <Grid.Col xs={4}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[0]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[1]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[2]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[3]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[4]}
            alt="japan"
          />
        </Grid.Col>
        {/* row 3 */}

        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="34vh"
            radius="md"
            src={allPhotos[5]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Paper shadow="md" radius="md">
            <Box
              sx={(theme) => ({
                backgroundColor: "#92C0D5",
                padding: theme.spacing.md,
                borderRadius: theme.radius.md,
                cursor: "pointer",
                height: "34vh",

                "&:hover": {
                  backgroundColor: "#C3DCE8",
                },
              })}
            >
              <ScrollArea style={{ height: "29vh" }}>
                <Blockquote
                  color="greyBlue.7"
                  cite={
                    <Text color="greyBlue.7">- Founders of TDFL: R,M,B</Text>
                  }
                  icon={<IconGlobe size={30} />}
                >
                  <Text size="md">
                    TDFL aims to provide a space for travelers and locals to
                    share and exchange ideas & inspiring places throughout
                    Japan, thereby fostering a community that thrives on
                    positive feedback.
                  </Text>
                </Blockquote>
                <Divider size="sm" />
                <Space h="sm" />
                <Text align="center" italic size="xs" color="white">
                  hint: refresh for more sneak peek of our content!
                </Text>
              </ScrollArea>
            </Box>
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Image src={tdflLogo} fit="contain" height="27vh" alt="logo" />
          <Center>
            <Button
              size="sm"
              color="aqua.4"
              leftIcon={<LogIn />}
              onClick={handleLogin}
            >
              <Title order={6}>LOGIN | SIGNUP</Title>
            </Button>
          </Center>
        </Grid.Col>
        <Grid.Col xs={3}>
          <Paper shadow="md" radius="md">
            <Box
              sx={(theme) => ({
                backgroundColor: "#B4ADCC",
                padding: theme.spacing.xl,
                borderRadius: theme.radius.md,
                cursor: "pointer",
                height: "34vh",

                "&:hover": {
                  backgroundColor: "#D7D4E4",
                },
              })}
            >
              <Title align="center" order={3}>
                What To Expect
              </Title>
              <Space h="xs" />
              <Divider />
              <Space h="xs" />
              <ScrollArea style={{ height: "24vh" }}>
                <List size="md" spacing="sm">
                  <List.Item
                    icon={
                      <ThemeIcon color="purple.6" size={24} radius="xl">
                        <IconAd2 size={16} />
                      </ThemeIcon>
                    }
                  >
                    Curated posts from popular instagram accounts & reviews &
                    users
                  </List.Item>
                  <List.Item
                    icon={
                      <ThemeIcon color="purple.6" size={24} radius="xl">
                        <IconStars size={16} />
                      </ThemeIcon>
                    }
                  >
                    Liking and saving personal favourites
                  </List.Item>
                  <List.Item
                    icon={
                      <ThemeIcon color="purple.6" size={24} radius="xl">
                        <IconMapPins size={16} />
                      </ThemeIcon>
                    }
                  >
                    Live crowd density feedback & recommendation of nearby
                    similar places
                  </List.Item>
                  <List.Item
                    icon={
                      <ThemeIcon color="purple.6" size={24} radius="xl">
                        <IconAffiliate size={16} />
                      </ThemeIcon>
                    }
                  >
                    Connect and exchange tips in chatrooms & forums
                  </List.Item>
                  <List.Item
                    icon={
                      <ThemeIcon color="purple.6" size={24} radius="xl">
                        <IconReportMoney size={16} />
                      </ThemeIcon>
                    }
                  >
                    Rewards system for travel vouchers
                  </List.Item>
                </List>
              </ScrollArea>
            </Box>
          </Paper>
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="34vh"
            radius="md"
            src={allPhotos[6]}
            alt="japan"
          />
        </Grid.Col>

        {/* row 5 */}
        <Grid.Col xs={2}>
          <Image
            height="32vh"
            fit="cover"
            radius="md"
            src={allPhotos[7]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[8]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[9]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={5}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[10]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height="32vh"
            radius="md"
            src={allPhotos[11]}
            alt="japan"
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
