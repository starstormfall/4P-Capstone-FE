import React, { FormEvent, useEffect, useState } from "react";
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
} from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { UseApp } from "./Context";
import axios from "axios";
import { backendUrl } from "../utils";

export default function UserForm() {
  const [name, setName] = useState<string>("");
  const [nationality, setNationality] = useState<string>("");
  const [fileInputFile, setFileInputFile] = useState<File>();
  const [image, setImage] = useState<string>("");
  const { userInfo } = UseApp();

  const CLIENT_IMAGE_FOLDER_NAME = "profile pictures";
  const uploadImage = async (fileInputFile?: File) => {
    // e.preventDefault();
    const storageRefInstance = storageRef(
      storage,
      `${CLIENT_IMAGE_FOLDER_NAME}/${fileInputFile?.name}`
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
    event.preventDefault();
    let imageUrl = await uploadImage(fileInputFile);
    console.log(imageUrl);
    console.log(`uploaded to Backend db`);
    await axios.put(`${backendUrl}/users/update/${userInfo?.id}`, {
      name: name,
      nationality: nationality,
      photoLink: imageUrl,
      email: userInfo?.email,
    });
  };

  return (
    <div>
      <Title>Account Creation Form</Title>
      <Container>
        <form onSubmit={handleSubmit}>
          {/* name */}
          <Textarea
            variant="filled"
            label="Name"
            placeholder="Please enter your name"
            withAsterisk
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {/* nationality */}
          <Textarea
            variant="filled"
            label="Nationality"
            placeholder="Please enter your nationality"
            withAsterisk
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
          {/* Photo Upload */}
          <FileInput
            variant="filled"
            placeholder="pick file"
            label="Upload Profile Photo"
            withAsterisk
            value={fileInputFile}
            onChange={(e: File) => {
              console.log(e);
              setFileInputFile(e);
            }}
          />
          <button>Submit</button>
        </form>
      </Container>
    </div>
  );
}
