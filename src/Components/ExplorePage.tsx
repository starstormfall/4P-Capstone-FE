import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
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
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

import { LogIn } from "@easy-eva-icons/react";

export default function ExplorePage() {
  const navigate = useNavigate();
  const { height, width } = useViewportSize();
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
      loginWithRedirect();
    }
  };

  useEffect(() => {
    getPhotos();
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated]);

  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing.xs,
        borderRadius: theme.radius.md,
        textAlign: "center",
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
                textAlign: "center",
                padding: theme.spacing.lg,
                borderRadius: theme.radius.md,
                cursor: "pointer",
                height: "34vh",

                "&:hover": {
                  backgroundColor: "#C3DCE8",
                },
              })}
            >
              <Title order={5}>Introducing</Title>
              <Divider />
            </Box>
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Image src={tdflLogo} fit="contain" height="27vh" alt="logo" />
          <Button
            size="sm"
            color="aqua.4"
            leftIcon={<LogIn />}
            onClick={handleLogin}
          >
            <Title order={6}>LOGIN | SIGNUP</Title>
          </Button>
        </Grid.Col>
        <Grid.Col xs={3}>
          <Paper shadow="md" radius="md">
            <Box
              sx={(theme) => ({
                backgroundColor: "#B4ADCC",
                textAlign: "center",
                padding: theme.spacing.lg,
                borderRadius: theme.radius.md,
                cursor: "pointer",
                height: "34vh",

                "&:hover": {
                  backgroundColor: "#D7D4E4",
                },
              })}
            >
              <Title order={5}>Our Platform</Title>
              <Divider />
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
