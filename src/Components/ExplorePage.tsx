import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import tdflLogo from "../Images/tdflLogo.png";

import {
  Text,
  Button,
  Title,
  Container,
  Group,
  Image,
  Grid,
} from "@mantine/core";

export default function ExplorePage() {
  const [allPhotos, setAllPhotos] = useState([]);

  // get a certain number of photos based on number query
  const getPhotos = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/posts/explore?photos=true&number=7`
      );

      setAllPhotos(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPhotos();
  }, []);

  const photoDisplay = allPhotos.map((photoUrl, index) => (
    <Image
      key={index}
      width={500}
      height={300}
      fit="contain"
      radius="md"
      src={photoUrl}
      alt="japan"
    />
  ));

  return (
    <Container size="xl">
      <Image src={tdflLogo} fit="contain" height={300} alt="logo" />

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
