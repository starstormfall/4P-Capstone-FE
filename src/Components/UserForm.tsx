import React, { FormEvent, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../DB/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import {
  Card,
  Title,
  Container,
  NativeSelect,
  FileInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Paper,
  FileButton,
  Text,
  Image,
  Stack,
  Box,
} from "@mantine/core";
import { CloudUploadOutline, Trash2Outline } from "@easy-eva-icons/react";

import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { backendUrl } from "../utils";

type Props = {
  closeModal: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function UserForm({ closeModal }: Props) {
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
    console.log(fileInputFile);
    if (fileInputFile) {
      const imageUrl = uploadBytes(storageRefInstance, fileInputFile)
        .then((snapshot) => {
          return getDownloadURL(snapshot.ref);
        })
        .then((url) => {
          console.log(url);
          setImage(url);
          return url;
        });
      return imageUrl;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    console.log("CLICKED");
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    event.preventDefault();
    let imageUrl = await uploadImage(fileInputFile);
    console.log(imageUrl);
    console.log(`uploaded to Backend db`);
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
            />
            {/* nationality */}
            <Textarea
              my="lg"
              size="md"
              variant="filled"
              label="Nationality"
              placeholder="Please enter your nationality"
              withAsterisk
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            />
            {/* Photo Upload */}
            {/* <FileInput
              variant="filled"
              placeholder="pick file"
              label="Upload Profile Photo"
              withAsterisk
              value={fileInputFile}
              onChange={(e: File) => {
                console.log(e);
                setFileInputFile(e);
              }}
            /> */}
            <Group position="center" mt="xl">
              <FileButton
                resetRef={resetRef}
                onChange={(e: File) => {
                  setFileInputFile(e);
                  setPhotoPreview(URL.createObjectURL(e));
                  console.log(e);
                }}
                accept="image/png,image/jpeg"
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
                // sx={(theme) => ({
                //   backgroundColor: theme.colors.aqua[1],
                //   textAlign: "center",
                //   padding: theme.spacing.xs,
                //   borderRadius: theme.radius.xl,
                //   borderColor: theme.colors.aqua[9],
                //   cursor: "pointer",

                //   "&:hover": {
                //     backgroundColor: theme.colors.aqua[4],
                //   },
                // })}
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
                radius="xl"
                size="md"
                type="submit"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                  closeModal(event)
                }
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
