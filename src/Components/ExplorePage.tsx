import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import tdflLogo from "../Images/tdflLogo.png";
import { useAuth0 } from "@auth0/auth0-react";

import { Button, Image, Grid, Box, Title } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

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
        <Grid.Col xs={2}>
          <Image
            height="31vh"
            fit="cover"
            radius="md"
            src={allPhotos[0]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={4}>
          <Image
            fit="cover"
            height="31vh"
            radius="md"
            src={allPhotos[1]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="31vh"
            radius="md"
            src={allPhotos[2]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={4}>
          <Image
            fit="cover"
            height="31vh"
            radius="md"
            src={allPhotos[3]}
            alt="japan"
          />
        </Grid.Col>

        {/* row 2 */}
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="33vh"
            radius="md"
            src={allPhotos[4]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height="33vh"
            radius="md"
            src={allPhotos[5]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Image src={tdflLogo} fit="contain" height="29vh" alt="logo" />
          <Button onClick={handleLogin}>
            <Title order={5}>LOGIN | SIGNUP</Title>
          </Button>
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height="33vh"
            radius="md"
            src={allPhotos[6]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="33vh"
            radius="md"
            src={allPhotos[7]}
            alt="japan"
          />
        </Grid.Col>

        {/* row 3 */}
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height="31vh"
            radius="md"
            src={allPhotos[8]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height="31vh"
            radius="md"
            src={allPhotos[9]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={4}>
          <Image
            fit="cover"
            height="31vh"
            radius="md"
            src={allPhotos[10]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={3}>
          <Image
            fit="cover"
            height="31vh"
            radius="md"
            src={allPhotos[11]}
            alt="japan"
          />
        </Grid.Col>
        <Grid.Col xs={2}>
          <Image
            fit="cover"
            height="31vh"
            radius="md"
            src={allPhotos[12]}
            alt="japan"
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
