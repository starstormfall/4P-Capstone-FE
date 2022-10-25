import React, { useState, useRef } from "react";
import { storage } from "../DB/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import {
  Title,
  Container,
  Textarea,
  Button,
  Group,
  Paper,
  FileButton,
  Text,
  Image,
  Stack,
  Box,
  Autocomplete,
  Space,
  Alert,
  Center,
} from "@mantine/core";
import { CloudUploadOutline, Trash2Outline } from "@easy-eva-icons/react";

import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { backendUrl, nationalities } from "../utils";

type Props = {
  closeModal: (event: React.MouseEvent<HTMLButtonElement>) => void;
  newUserDone: boolean;
  setNewUserDone: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function UserForm({
  closeModal,
  newUserDone,
  setNewUserDone,
}: Props) {
  const [name, setName] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [fileInputFile, setFileInputFile] = useState<File>();
  const [image, setImage] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const { userInfo } = UseApp();
  const { getAccessTokenSilently } = useAuth0();

  const PROFILE_IMAGE_FOLDER_NAME = "profile pictures";
  const uploadImage = async (fileInputFile?: File) => {
    // e.preventDefault();
    const storageRefInstance = storageRef(
      storage,
      `${PROFILE_IMAGE_FOLDER_NAME}/${fileInputFile?.name}`
    );

    if (fileInputFile) {
      const imageUrl = uploadBytes(storageRefInstance, fileInputFile)
        .then((snapshot) => {
          return getDownloadURL(snapshot.ref);
        })
        .then((url) => {
          setImage(url);
          return url;
        });
      return imageUrl;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    event.preventDefault();
    let imageUrl = await uploadImage(fileInputFile);

    await axios.put(
      `${backendUrl}/users/update/${userInfo?.id}`,
      {
        name: name,
        nationality: nationality,
        photoLink: imageUrl,
        email: userInfo?.email,
        loginStreak: 1,
        lastLogin: new Date(),
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    setNewUserDone(true);
  };

  const resetRef = useRef<() => void>(null);

  const clearFile = () => {
    setFileInputFile(undefined);
    resetRef.current?.();
  };

  return (
    <div>
      <Title order={2} size="h1" weight={900} align="center" mb="md">
        Account Details
      </Title>
      <Space h="md" />

      {newUserDone ? (
        <>
          <Alert color="aqua">
            <Text align="center">Account created successfully! 😁</Text>
            <Space h="xs" />
            <Center>
              <Button
                component="a"
                href="http://localhost:3001/home"
                variant="outline"
              >
                Go Back Home
              </Button>
            </Center>
          </Alert>
        </>
      ) : null}
      <Space h="md" />

      <Container>
        <Paper radius="lg" p="lg" shadow="md" withBorder>
          <form onSubmit={handleSubmit}>
            {/* name */}
            <Textarea
              size="md"
              variant="filled"
              label="Name"
              placeholder="Please enter your name"
              withAsterisk
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={newUserDone}
            />
            {/* nationality */}
            <Autocomplete
              label="Nationality"
              placeholder="Choose your nationality"
              data={nationalities}
              withAsterisk
              value={nationality}
              onChange={setNationality}
              my="lg"
              size="md"
              variant="filled"
              disabled={newUserDone}
            />

            <Group position="center" mt="xl">
              <FileButton
                resetRef={resetRef}
                onChange={(e: File) => {
                  setFileInputFile(e);
                  setPhotoPreview(URL.createObjectURL(e));
                }}
                accept="image/png,image/jpeg"
                disabled={newUserDone}
              >
                {(props) => (
                  <Button {...props} leftIcon={<CloudUploadOutline />}>
                    Upload Profile Picture
                  </Button>
                )}
              </FileButton>
            </Group>
            <Stack spacing={2} align="center" mt="lg">
              {fileInputFile && (
                <Box
                  sx={(theme) => ({
                    textAlign: "center",
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.xl,
                    borderColor: theme.colors.aqua[9],
                    cursor: "pointer",
                  })}
                >
                  <Text size="sm" align="center" mt="sm">
                    Chosen file: {fileInputFile.name}
                  </Text>

                  <Image
                    src={photoPreview}
                    alt={`Image`}
                    width={600}
                    height={300}
                    fit="contain"
                    mt="md"
                    radius="md"
                    caption="Profile photo preview"
                  />
                  <Group position="center" mt="md">
                    <Button
                      disabled={!fileInputFile}
                      color="red"
                      onClick={clearFile}
                      leftIcon={<Trash2Outline />}
                    >
                      Reset
                    </Button>
                  </Group>
                </Box>
              )}
            </Stack>

            <Group position="center" mt="xl">
              <Button
                disabled={newUserDone}
                radius="xl"
                size="md"
                type="submit"
              >
                Submit
              </Button>
            </Group>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
