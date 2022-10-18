import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams, useAsyncError } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
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
  Select,
  Avatar,
} from "@mantine/core";
import { storage } from "../DB/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

type ThreadSingleData = {
  id: number;
  postId: number;
  threadId: number;
  createdAt: string;
  updatedAt: string;
  post: {
    id: number;
    title: string;
    photoLink: string;
    content: string;
    areaId: number;
    pinId: number;
    locationName: string;
    forumPost: boolean;
    explorePost: string;
    externalLink: string;
    likeCount: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      name: string;
      photoLink: string;
    };
  };
  thread: {
    id: number;
    topic: string;
    createdAt: string;
    updatedAt: string;
  };
};

type AllPrefectureData = {
  id: string;
  prefecture: string;
};

export default function ThreadSingle() {
  const [threadId, setThreadId] = useState<string>();
  const [singleThreadData, setSingleThreadData] =
    useState<ThreadSingleData[]>();
  const [friendModalOpen, setFriendModalOpen] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [friendAdded, setFriendAdded] = useState<number>();
  const [postId, setPostId] = useState<number>();
  const [allFriendsId, setAllFriendsId] = useState<number[]>();
  const [disablefriendButton, setDisableFriendButton] =
    useState<boolean>(false);

  const { userInfo } = UseApp();
  const { getAccessTokenSilently } = useAuth0();
  const params = useParams();
  const navigate = useNavigate();

  // get data from forum get
  const singleThread = async () => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    const response = await axios.get(`${backendUrl}/posts/thread/${threadId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setSingleThreadData(response.data);
  };

  // get friends data for user to verify existing friend.
  const currentFriends = async () => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    const response = await axios.get(
      `${backendUrl}/friends/${userInfo.id}/allfriends?thread=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    setAllFriendsId(response.data);
  };

  // have a true/false state that updates the get request. and set in the dependency array of useEffect.
  useEffect(() => {
    singleThread();
    currentFriends();
  }, []);

  console.log(singleThreadData);
  console.log(allFriendsId);

  if (threadId !== params.threadId) {
    setThreadId(params.threadId);
  }
  // handle post req for comments (to post to table)

  // Div > Container > Card > Text;

  const onFriendRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    e.preventDefault();
    console.log(`Added as Friend!`);
    console.log(`added friend id`, friendAdded);
    console.log(`current post id`, postId);
    await axios.post(
      `${backendUrl}/friends/${userInfo.id}/addfriend`,
      {
        friendId: friendAdded,
        postId: postId,
        reason: reason,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    setFriendModalOpen(false);
  };

  // check for existing friend

  // allfriends contains the array of existing friends
  // const validateExistingFriend = async () => {
  //   if (allFriends) {
  //     for (let i = 0; i < allFriends.length; i++) {
  //       // check for added friend req
  //       if (
  //         allFriends[i].addedUserId === userInfo.id ||
  //         allFriends[i].initiatedUserId === userInfo.id
  //       ) {
  //         setDisableFriendButton(true);
  //       }
  //     }
  //   }
  // };

  const allComments = [];
  if (singleThreadData) {
    for (let i = 1; i < singleThreadData.length; i++) {
      allComments.push(
        <div>
          <Container key={singleThreadData[i].id}>
            <Card>
              <Avatar
                src={singleThreadData[i].post.user.photoLink}
                alt={singleThreadData[i].post.user.name}
                radius="xl"
                size="lg"
              />
              {/* add friend button */}
              <div>
                <Modal
                  opened={friendModalOpen}
                  onClose={() => setFriendModalOpen(false)}
                  title="Tell us more in details!"
                >
                  <Container>
                    {/* update friend here */}
                    <form onSubmit={onFriendRequest}>
                      <Textarea
                        variant="filled"
                        label="Reason"
                        placeholder="Give a reason on why you are adding."
                        withAsterisk
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />

                      <button>Add as Friend!</button>
                    </form>
                  </Container>
                </Modal>

                <Group position="left">
                  {/* validate for existing friends */}
                  {/* 
                 1. get the current logged in user
                  2. get the post/comment user
                  3. check friend array if logged in user and post user for status?
                  */}
                  {allFriendsId?.includes(singleThreadData[i].post.userId) &&
                  singleThreadData[i].post.userId !== userInfo.id ? (
                    <Button
                      onClick={() => {
                        setFriendModalOpen(true);
                        setFriendAdded(singleThreadData[i].post.userId);
                        setPostId(singleThreadData[i].post.id);
                      }}
                    >
                      Add Friend
                    </Button>
                  ) : (
                    <Button disabled={true}>Existing Friend</Button>
                  )}
                </Group>
              </div>
              <Text>
                {singleThreadData[i].post.user.name} commented on{" "}
                {singleThreadData[i].post.createdAt}:
              </Text>
              <Text>{singleThreadData[i].post.content}</Text>
            </Card>
          </Container>
        </div>
      );
    }
  }
  console.log(userInfo.id);
  // states for creating comment/post
  const [forumPost, setForumPost] = useState<boolean>(true);
  const [explorePost, setExplorePost] = useState<string | null>(null);
  const [opened, setOpened] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const [fileInputFile, setFileInputFile] = useState<File>();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [areaId, setAreaId] = useState<string>();
  const [locationName, setLocationName] = useState<string>("");

  const areaIdInfo = useQuery(["areaList"], () =>
    axios.get(`${backendUrl}/info/areas`).then((res) => res.data)
  );

  // console.log(areaIdInfo.data);

  let prefectureData = [];
  if (areaIdInfo.data) {
    prefectureData = areaIdInfo.data.map(
      ({ id, prefecture }: AllPrefectureData) => {
        return {
          value: id,
          label: prefecture,
        };
      }
    );
  }

  const POST_IMAGE_FOLDER_NAME = "Post Photos";
  const uploadImage = async (fileInputFile?: File) => {
    // e.preventDefault();
    const storageRefInstance = storageRef(
      storage,
      `${POST_IMAGE_FOLDER_NAME}/${fileInputFile?.name}`
    );
    console.log(fileInputFile);
    if (fileInputFile) {
      const imageUrl = uploadBytes(storageRefInstance, fileInputFile)
        .then((snapshot) => {
          return getDownloadURL(snapshot.ref);
        })
        .then((url) => {
          console.log(url);
          return url;
        });
      return imageUrl;
    }
  };

  // HANDLE POST/THREAD
  const handleSubmit = async (event: React.FormEvent) => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    event.preventDefault();
    let imageUrl = await uploadImage(fileInputFile);
    console.log(imageUrl);
    console.log(`uploaded to Backend db`);
    await axios.post(
      `${backendUrl}/posts/create-comment/${threadId}`,
      {
        userId: userInfo.id,
        content: content,
        areaId: areaId,
        forumPost: forumPost,
        explorePost: explorePost,
        externalLink: null,
        title: title,
        photoLink: imageUrl,
        locationName: locationName,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    setOpened(false);
  };

  return (
    <div>
      <Container>
        {singleThreadData ? (
          <Card>
            <Text>Thread Title:{singleThreadData[0].thread.topic}</Text>
            <Text>Content:</Text>
            <Text>{singleThreadData[0].post.content}</Text>
            <Text>By user:</Text>
            <Text>{singleThreadData[0].post.user.name}</Text>
            <Text>Created At:</Text>
            <Text>{singleThreadData[0].createdAt}</Text>
          </Card>
        ) : null}
      </Container>
      <Container>
        {singleThreadData ? (
          allComments
        ) : (
          <div>
            <Card>
              <Text>Be the first to comment!</Text>
              {/* add comment function here*/}
              {/* creat post (forum && explore etc)*/}
            </Card>
          </div>
        )}
      </Container>
      <div>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Tell us more in details!"
        >
          <Container>
            <form onSubmit={handleSubmit}>
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
              <Select
                label="Select your prefecture"
                placeholder="Pick one"
                data={prefectureData}
                value={areaId}
                onChange={(event: string) => {
                  console.log(event);
                  setAreaId(event);
                }}
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
                checked={checked}
                onChange={(e) => {
                  setChecked(e.currentTarget.checked);
                  setExplorePost("forum");
                  setForumPost(true);
                }}
              />
              <button>Comment or Create!</button>
            </form>
          </Container>
        </Modal>

        <Group position="center">
          <Button onClick={() => setOpened(true)}>Comment or Create!</Button>
        </Group>
      </div>

      <Button onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}
