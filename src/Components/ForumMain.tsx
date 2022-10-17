import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import {
  Button,
  Container,
  Image,
  Grid,
  Card,
  Text,
  Modal,
  Group,
  NativeSelect,
  FileInput,
  Textarea,
  NumberInput,
  Checkbox,
} from "@mantine/core";
import { storage } from "../DB/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

type ThreadListData = {
  areaId: number;
  content: string;
  createdAt: string;
  explorePost: string;
  externalLink: string;
  forumPost: boolean;
  id: number;
  likeCount: number;
  locationName: string;
  photoLink: string;
  pinId: number;
  threads: {
    createdAt: string;
    id: number;
    threadPosts: {
      createdAt: string;
      postId: number;
      threadId: number;
      updatedAt: string;
    };
    topic: string;
    updatedAt: string;
  };
  title: string;
  updatedAt: string;
  userId: number;
};

export default function ForumMain() {
  // have a create post that can extend to explore page

  // get all data
  const forumList = useQuery(["threadList"], () =>
    axios.get(`${backendUrl}/posts/forum`).then((res) => res.data)
  );
  console.log(forumList.data);
  // console.log("thread ID", forumList.data[0].threads[0].id);

  const areaIdInfo = useQuery(["areaList"], () =>
    axios.get(`${backendUrl}/info/areas`).then((res) => res.data)
  );

  console.log(areaIdInfo.data);
  // map out all the threads by TOPIC (Div>Container>Link>Card>Text)
  let forumListFinal;
  if (forumList.data) {
    forumListFinal = forumList.data.map((list: ThreadListData) => {
      return (
        <div>
          {list.explorePost === "forum" && list.title ? (
            <Link to={`/exchange/${list.threads.id}`}>
              <Grid justify="center">
                <Grid.Col span={5}>
                  <Container key={list.id}>
                    <Card>
                      <Text>Thread Title:</Text>
                      {/* cant index */}
                      <Text>{list.threads.topic}</Text>
                      <Text>Content:</Text>
                      <Text>{list.content}</Text>
                      <Text>Last Updated At:</Text>
                      <Text>{list.updatedAt}</Text>
                    </Card>
                  </Container>
                </Grid.Col>
              </Grid>
            </Link>
          ) : null}
        </div>
      );
    });
  }

  // create new thread
  //setState for explorePost and forumPost UNDER CHECKBOX
  const [forumPost, setForumPost] = useState<boolean>(true);
  const [explorePost, setExplorePost] = useState<string>("");
  const [opened, setOpened] = useState<boolean>(false);
  const [fileInputFile, setFileInputFile] = useState<File>();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [areaId, setAreaId] = useState<number>();
  const [locationName, setLocationName] = useState<string>("");
  const { userInfo } = UseApp();

  const handleCreateThread = () => {};

  return (
    <div>
      <div>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Tell us more in details!"
        >
          <Container>
            <form>
              <Textarea
                variant="filled"
                label="Title"
                placeholder="Give a title!"
                withAsterisk
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                variant="filled"
                label="Content"
                placeholder="..."
                withAsterisk
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <NativeSelect
                data={["", "Vue", "Angular", "Svelte"]}
                placeholder="Pick one"
                label="Select the prefecture"
                radius="xl"
                size="md"
                withAsterisk
                value={areaId}
                onChange={(e) => setAreaId(Number(e.target.value))}
              />
              <Textarea
                variant="filled"
                label="Location Name"
                placeholder="..."
                withAsterisk
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
              <FileInput
                variant="filled"
                placeholder="pick file"
                label="Upload Photo if any!"
                withAsterisk
                value={fileInputFile}
                onChange={(e: File) => {
                  console.log(e);
                  setFileInputFile(e);
                }}
              />
              {/* Con render explore/forum post */}
              <Checkbox
                label="Display in Explore?"
                description="it will be seen in the explore feed."
                color="indigo"
                radius="xl"
              />
              <button>Submit!</button>
            </form>
          </Container>
        </Modal>

        <Group position="center">
          <Button onClick={() => setOpened(true)}>Create Post!</Button>
        </Group>
      </div>
      {handleCreateThread}
      {forumListFinal}
    </div>
  );
}
