import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Container,
  Image,
  Card,
  Text,
  Modal,
  Group,
  Textarea,
  Select,
  Avatar,
  Indicator,
  createStyles,
  Box,
  Title,
  Paper,
  Center,
  Divider,
  Collapse,
  TextInput,
  Grid,
  Space,
  FileButton,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { storage } from "../DB/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import {
  AwardOutline,
  CloudUploadOutline,
  Trash2Outline,
} from "@easy-eva-icons/react";

// Googlemaps Api
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  LoadScript,
  Autocomplete,
} from "@react-google-maps/api";

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
    quotedExplore: boolean;
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

type newThreadSingleData = {
  id: number;
  postId: number;
  threadId: number;
  createdAt: Date;
  updatedAt: string;
  post: {
    id: number;
    title: string;
    photoLink: string;
    content: string;
    areaId: number;
    pinId: number;
    quotedExplore: boolean;
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

type prefectureDataType = {
  value: string;
  label: string;
};

type friendListData = {
  [key: number]: string;
};

// Googlemaps type for position/marker
type Location = {
  lat: number;
  lng: number;
};

const useStyles = createStyles((theme) => ({
  comment: {
    padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
  },

  body: {
    paddingLeft: 25,
    paddingTop: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
  },

  contentComment: {
    "& > p:last-child": {
      marginBottom: 0,
    },
  },

  title: {
    // fontSize: 20,
    fontWeight: 500,
    [theme.fn.smallerThan("sm")]: {
      fontSize: 24,
    },
  },

  borderContain: {
    backgroundColor: "aliceblue",
  },
  content: {
    backgroundColor: "white",
  },

  card: {
    position: "relative",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  rating: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs + 2,
    pointerEvents: "none",
  },

  cardTitle: {
    display: "block",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs / 2,
  },
  footer: {
    marginTop: theme.spacing.md,
  },
}));

export default function ThreadSingle() {
  const [threadId, setThreadId] = useState<string>();
  const [singleThreadData, setSingleThreadData] =
    useState<ThreadSingleData[]>();
  const [newThreadData, setNewThreadData] = useState<newThreadSingleData[]>();
  const [friendModalOpen, setFriendModalOpen] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [friendAdded, setFriendAdded] = useState<number>();
  const [postId, setPostId] = useState<number>();
  const [friendList, setFriendList] = useState<friendListData>();
  const [updateComment, setUpdateComment] = useState<boolean>(false);
  const [updateFriendRequest, setUpdateFriendRequest] =
    useState<boolean>(false);
  const { classes } = useStyles();

  const { userInfo } = UseApp();
  const { getAccessTokenSilently } = useAuth0();
  const params = useParams();
  const navigate = useNavigate();

  // Google map library and API definition
  const [libraries] = useState<
    ("visualization" | "places" | "drawing" | "geometry" | "localContext")[]
  >(["visualization", "places"]);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  // get data from forum get
  const singleThread = async () => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    const response = await axios.get(`${backendUrl}/posts/thread/${threadId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const newData = response.data.map((obj: any) => {
      return { ...obj, createdAt: new Date(obj.post.createdAt) };
    });

    const sortedData = [...newData].sort(
      (objA, objB) => objA.createdAt.getTime() - objB.createdAt.getTime()
    );
    setNewThreadData(sortedData);

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

    setFriendList(response.data);
  };

  // have a true/false state that updates the get request. and set in the dependency array of useEffect.
  useEffect(() => {
    singleThread();
    currentFriends();
  }, [updateComment, updateFriendRequest]);

  if (threadId !== params.threadId) {
    setThreadId(params.threadId);
  }

  // handle post req for comments (to post to table)
  const onFriendRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    e.preventDefault();

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
    setReason("");
    setUpdateFriendRequest(!updateFriendRequest);
  };

  // check for existing friend/yourself/pending request
  const checkFriendShip = (
    friendshipStatus: string,
    userId: number,
    postId: number,
    photoLink: string,
    name: string,
    createdAt: string
  ) => {
    switch (friendshipStatus) {
      case "confirmed":
        // return icon
        return (
          <>
            <Indicator inline label="Friend" size={16}>
              <Avatar src={photoLink} alt={name} radius="xl" size="lg" />
            </Indicator>
            <Stack spacing={0}>
              <Text size="sm">{name}</Text>
              <Text size="xs" color="dimmed">
                commented on: {createdAt}
              </Text>
            </Stack>
          </>
        );

      case "pending":
        return (
          <>
            <Indicator inline label="Pending" size={16}>
              <Avatar src={photoLink} alt={name} radius="xl" size="lg" />
            </Indicator>
            <Stack spacing={0}>
              <Text size="sm">{name}</Text>
              <Text size="xs" color="dimmed">
                commented on: {createdAt}
              </Text>
            </Stack>
          </>
        );

      case "myself":
        return (
          <>
            <Avatar src={photoLink} alt={name} radius="xl" size="lg" />
            <Stack spacing={0}>
              <Text size="sm">{name}</Text>
              <Text size="xs" color="dimmed">
                commented on: {createdAt}
              </Text>
            </Stack>
          </>
        );
      default:
        return (
          <Group>
            <Avatar src={photoLink} alt={name} radius="xl" size="lg" />
            <Stack spacing={0}>
              <Text size="sm">{name}</Text>
              <Text size="xs" color="dimmed">
                commented on: {createdAt}
              </Text>
            </Stack>

            <Button
              onClick={() => {
                setFriendModalOpen(true);
                setFriendAdded(userId);
                setPostId(postId);
              }}
              leftIcon={<AwardOutline />}
            >
              Add Friend
            </Button>
          </Group>
        );
    }
  };

  // sort the data by date first before mapping
  const allComments = [];
  if (
    newThreadData &&
    newThreadData.length > 1 &&
    newThreadData[1].post.quotedExplore === true
  ) {
    for (let i = 2; i < newThreadData.length; i++) {
      allComments.push(
        <div>
          <Paper
            withBorder
            radius="md"
            className={classes.comment}
            key={newThreadData[i].id}
          >
            <Group>
              <div>
                <Modal
                  opened={friendModalOpen}
                  onClose={() => setFriendModalOpen(false)}
                  title="Reason for Adding?"
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

                      <Button type="submit">Add as Friend!</Button>
                    </form>
                  </Container>
                </Modal>

                <Group position="left">
                  {friendList &&
                    checkFriendShip(
                      friendList[newThreadData[i].post.userId],
                      newThreadData[i].post.userId,
                      newThreadData[i].post.id,
                      newThreadData[i].post.user.photoLink,
                      newThreadData[i].post.user.name,
                      newThreadData[i].post.createdAt
                    )}
                </Group>
              </div>
              {/* <div>
                <Text size="sm">{newThreadData[i].post.user.name}</Text>
                <Text size="xs" color="dimmed">
                  commented on: {newThreadData[i].post.createdAt}
                </Text>
              </div> */}
            </Group>
            <SimpleGrid cols={2}>
              <div>
                <Text className={classes.body} size="sm" pl="lg">
                  {newThreadData[i].post.content}
                </Text>
              </div>
              {newThreadData[i].post.photoLink ? (
                <div>
                  <Image
                    src={newThreadData[i].post.photoLink}
                    alt={newThreadData[i].post.locationName}
                    height={200}
                    width="100%"
                    radius="md"
                  />
                </div>
              ) : null}
            </SimpleGrid>
          </Paper>
        </div>
      );
    }
  } else if (newThreadData) {
    for (let i = 1; i < newThreadData.length; i++) {
      allComments.push(
        <div>
          <Paper
            withBorder
            radius="md"
            className={classes.comment}
            key={newThreadData[i].id}
          >
            <Group>
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

                      <Button type="submit">Add as Friend!</Button>
                    </form>
                  </Container>
                </Modal>

                <Group position="left">
                  {friendList &&
                    checkFriendShip(
                      friendList[newThreadData[i].post.userId],
                      newThreadData[i].post.userId,
                      newThreadData[i].post.id,
                      newThreadData[i].post.user.photoLink,
                      newThreadData[i].post.user.name,
                      newThreadData[i].post.createdAt
                    )}
                </Group>
              </div>
              {/* <div>
                <Text size="sm">{newThreadData[i].post.user.name}</Text>
                <Text size="xs" color="dimmed">
                  commented on: {newThreadData[i].post.createdAt}
                </Text>
              </div> */}
            </Group>
            <Group position="apart">
              <Text className={classes.body} size="sm">
                {newThreadData[i].post.content}
              </Text>
              {newThreadData[i].post.photoLink ? (
                <Box>
                  <Image
                    src={newThreadData[i].post.photoLink}
                    alt={newThreadData[i].post.locationName}
                    height={200}
                    radius="md"
                  />
                </Box>
              ) : null}
            </Group>
          </Paper>
        </div>
      );
    }
  }

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
  const [allAreaData, setAllAreaData] = useState<AllPrefectureData[]>();
  const [externalLink, setExternalLink] = useState<string>("");
  const [exploreOpen, setExploreOpen] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Googlemaps states for markers, and for autocomplete
  const [currentPosition, setCurrentPosition] = useState<Location>({
    lat: 35.68309653980229,
    lng: 139.7525871479461,
  });
  const [autoCompleteElem, setAutoCompleteElem] = useState<HTMLInputElement>();
  const [autoCompletePlacePos, setAutoCompletePlacePos] = useState<Location>();
  const [exactLocation, setExactLocation] = useState("");

  const getAllAreaData = async () => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });
    const response = await axios.get(`${backendUrl}/info/areas`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setAllAreaData(response.data);
  };

  useEffect(() => {
    getAllAreaData();
  }, []);

  let prefectureData: prefectureDataType[] = [];
  if (allAreaData) {
    prefectureData = allAreaData.map(
      ({ id, prefecture }: AllPrefectureData) => {
        return {
          value: id,
          label: prefecture,
        };
      }
    );
  }

  // Handle autocomplete changes. Please dont change order of autocomplete within form.
  const handleInputChange = () => {
    let searchInputField = document.getElementsByTagName("input")[3];
    const autocomplete = new google.maps.places.Autocomplete(searchInputField, {
      componentRestrictions: { country: "jp" },
    });

    autocomplete.addListener("place_changed", function () {
      let placeInfo = autocomplete.getPlace();

      if (
        placeInfo &&
        placeInfo.geometry &&
        placeInfo.geometry.location &&
        placeInfo.name
      ) {
        setAutoCompletePlacePos({
          lat: placeInfo.geometry.location.lat(),
          lng: placeInfo.geometry.location.lng(),
        });
        setCurrentPosition({
          lat: placeInfo.geometry.location.lat(),
          lng: placeInfo.geometry.location.lng(),
        });
        setExactLocation(placeInfo.name);
      }
    });

    if (searchInputField !== null) {
      setAutoCompleteElem(searchInputField);
    }
  };

  const handlePlaceChanged = () => {
    if (autoCompleteElem) {
      const autocomplete = new google.maps.places.Autocomplete(
        autoCompleteElem,
        {
          componentRestrictions: { country: "jp" },
        }
      );

      autocomplete.addListener("place_changed", function () {
        let placeInfo = autocomplete.getPlace();

        if (
          placeInfo &&
          placeInfo.geometry &&
          placeInfo.geometry.location &&
          placeInfo.name
        ) {
          setAutoCompletePlacePos({
            lat: placeInfo.geometry.location.lat(),
            lng: placeInfo.geometry.location.lng(),
          });
          setCurrentPosition({
            lat: placeInfo.geometry.location.lat(),
            lng: placeInfo.geometry.location.lng(),
          });
          setExactLocation(placeInfo.name);
        }
      });
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

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

    let pinId;
    if (currentPosition.lat !== 35.68309653980229) {
      // Comment to the thread with recommendation by clicking on the map or by using autocomplete to give exact location.

      await axios.post(
        `${backendUrl}/posts/create-comment/${threadId}`,
        {
          userId: userInfo.id,
          content: content,
          areaId: areaId,
          forumPost: forumPost,
          explorePost: explorePost,
          externalLink: externalLink,
          title: title,
          photoLink: imageUrl,
          locationName: locationName,
          oldPinId: null,
          newPin: currentPosition,
          exactLocation: exactLocation,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } else {
      // User wants to share to explore page. User opens collapsed portion but did not click map.
      if (explorePost === "forum") {
        if (Number(areaId) === 1) {
          pinId = 41;
        } else if (Number(areaId) === 2) {
          pinId = 42;
        } else {
          pinId = 43;
        }

        await axios.post(
          `${backendUrl}/posts/create-comment/${threadId}`,
          {
            userId: userInfo.id,
            content: content,
            areaId: areaId,
            forumPost: forumPost,
            explorePost: explorePost,
            externalLink: externalLink,
            title: title,
            photoLink: imageUrl,
            locationName: locationName,
            oldPinId: pinId,
            newPin: null,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      } else {
        // Normal comment without any recommendation.

        if (singleThreadData) {
          const threadAreaId = singleThreadData[0].post.areaId;
          await axios.post(
            `${backendUrl}/posts/create-comment/${threadId}`,
            {
              userId: userInfo.id,
              content: content,
              areaId: threadAreaId,
              forumPost: forumPost,
              explorePost: explorePost,
              externalLink: externalLink,
              title: title,
              photoLink: imageUrl,
              locationName: locationName,
              oldPinId: null,
              newPin: null,
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
        }
      }
    }

    setOpened(false);
    setUpdateComment(!updateComment);
    setCurrentPosition({
      lat: 35.68309653980229,
      lng: 139.7525871479461,
    });
    setAutoCompleteElem(undefined);
    setAutoCompletePlacePos(undefined);
    setExactLocation("");
    setContent("");
    setAreaId("");
    setExplorePost("");
    setTitle("");
    setLocationName("");
    setChecked(false);
    setExternalLink("");
    setExploreOpen(false);
    setFileInputFile(undefined);
  };

  const resetRef = useRef<() => void>(null);

  const clearFile = () => {
    setFileInputFile(undefined);
    resetRef.current?.();
  };

  return (
    <div>
      <Space h="lg" />
      <Container>
        {/* render from */}
        {newThreadData ? (
          newThreadData.length > 1 &&
          newThreadData[1].post.quotedExplore === true ? (
            // thread created from instagram and review
            <Box>
              <Card withBorder radius="md" className={classes.card}>
                <Title className={classes.cardTitle} align="left">
                  {newThreadData[1].thread.topic}
                </Title>
                <Divider my="md"></Divider>
                {/* add explore photo and description*/}
                {/* {newThreadData[1].post.photoLink && ( */}
                <Grid justify="center" align="center">
                  <Grid.Col span={5}>
                    <Stack spacing={0}>
                      <Box
                        sx={(theme) => ({
                          backgroundColor: theme.colors.aqua[1],
                          textAlign: "center",
                          padding: theme.spacing.md,
                          borderRadius: theme.radius.sm,
                          borderColor: theme.colors.aqua[9],
                        })}
                      >
                        <Text size="md" color="dimmed" lineClamp={4}>
                          Original Post
                        </Text>
                        <Image
                          src={newThreadData[0].post.photoLink}
                          alt={newThreadData[0].post.locationName}
                          height={300}
                          radius="md"
                        />
                        <Text size="md" color="dimmed" lineClamp={4} mt="md">
                          {newThreadData[0].post.content}
                        </Text>
                      </Box>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={7}>
                    <Stack spacing={0}>
                      <Box>
                        <Paper
                          withBorder
                          radius="md"
                          className={classes.comment}
                        >
                          <Group mb="md">
                            <Avatar
                              src={newThreadData[1].post.user.photoLink}
                              alt={newThreadData[1].post.user.name}
                              radius="xl"
                            />
                            <div>
                              <Text size="sm">
                                {newThreadData[1].post.user.name}
                              </Text>
                              <Text size="xs" color="dimmed">
                                {newThreadData[1].post.createdAt}
                              </Text>
                            </div>
                          </Group>
                          <Image
                            src={newThreadData[1].post.photoLink}
                            alt={newThreadData[1].post.locationName}
                            height={300}
                            radius="md"
                          />
                          <Text size="md" color="dimmed" lineClamp={4} mt="md">
                            {newThreadData[1].post.content}
                          </Text>
                        </Paper>
                      </Box>
                    </Stack>
                  </Grid.Col>
                </Grid>
                {/* )} */}

                {/* <Space h="sm" /> */}

                {/* <Group position="apart" className={classes.footer}>
                  <Center>
                    <Avatar
                      src={newThreadData[1].post.user.photoLink}
                      size={24}
                      radius="xl"
                      mr="xs"
                    />
                    <Text size="sm" inline>
                      {newThreadData[1].post.user.name}
                    </Text>
                  </Center>
                  <Text size="sm" inline>
                    Created At: {newThreadData[1].post.createdAt}
                  </Text>
                </Group> */}
              </Card>
            </Box>
          ) : (
            <Box>
              <Card withBorder radius="md" className={classes.card}>
                <Title className={classes.cardTitle} align="left">
                  {newThreadData[0].thread.topic}
                </Title>
                <Divider my="md"></Divider>
                {newThreadData[0].post.photoLink && (
                  <Card.Section>
                    <Image
                      src={newThreadData[0].post.photoLink}
                      alt={newThreadData[0].post.locationName}
                      height={500}
                    />
                  </Card.Section>
                )}

                <Text size="md" color="dimmed" lineClamp={4} mt="md">
                  {newThreadData[0].post.content}
                </Text>

                <Space h="sm" />

                <Group position="apart" className={classes.footer}>
                  <Center>
                    <Avatar
                      src={newThreadData[0].post.user.photoLink}
                      size={24}
                      radius="xl"
                      mr="xs"
                    />
                    <Text size="sm" inline>
                      {newThreadData[0].post.user.name}
                    </Text>
                  </Center>
                  <Text size="sm" inline>
                    Created At: {newThreadData[0].post.createdAt}
                  </Text>
                </Group>
              </Card>
            </Box>
          )
        ) : null}
      </Container>
      <Container mt="sm">
        {singleThreadData ? (
          allComments
        ) : (
          <div>
            <Card>
              <Title order={4}>Be the first to comment!</Title>
            </Card>
          </div>
        )}
      </Container>
      <div>
        <Modal
          opened={opened}
          onClose={() => {
            setOpened(false);
            setCurrentPosition({
              lat: 35.68309653980229,
              lng: 139.7525871479461,
            });
            setAutoCompleteElem(undefined);
            setAutoCompletePlacePos(undefined);
            setExactLocation("");
          }}
          title="Share your thoughts"
        >
          <Paper radius="md" p="xl" withBorder>
            <form onSubmit={handleSubmit}>
              <Divider
                label="Add your comment!"
                labelPosition="center"
                my="xs"
              />
              <Textarea
                variant="filled"
                label="Content/Comment"
                placeholder="..."
                withAsterisk
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <br />
              {/* <Divider
                label="Share it on the explore page!"
                labelPosition="center"
                my="xs"
              /> */}
              <>
                <Group position="left">
                  <Button
                    onClick={() => {
                      setExplorePost("forum");
                      setExploreOpen((o) => !o);
                      setForumPost(true);
                      if (exploreOpen) {
                        setExplorePost("");
                      }
                    }}
                  >
                    Add to Explore?
                  </Button>
                </Group>

                <Collapse in={exploreOpen}>
                  <Textarea
                    my="md"
                    variant="filled"
                    label="Title"
                    placeholder="Give a title!"
                    withAsterisk
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <Select
                    mb="md"
                    label="Select your prefecture"
                    placeholder="Pick one"
                    data={prefectureData}
                    value={areaId}
                    onChange={(event: string) => {
                      setAreaId(event);
                    }}
                  />
                  <Textarea
                    mb="md"
                    variant="filled"
                    label="Location Name"
                    placeholder="..."
                    withAsterisk
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                  <Autocomplete onPlaceChanged={handlePlaceChanged}>
                    <TextInput
                      ref={(thisInput) => thisInput as HTMLInputElement}
                      type="text"
                      label="Exact Location"
                      placeholder="Input place if any"
                      className="place"
                      onChange={handleInputChange}
                    />
                  </Autocomplete>
                  {isLoaded && (
                    <GoogleMap
                      onClick={(e) => {
                        if (e.latLng && e.latLng.lat && e.latLng?.lng) {
                          setCurrentPosition({
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                          });
                        }
                      }}
                      center={currentPosition}
                      zoom={15}
                      mapContainerStyle={{ width: "350px", height: "30vh" }}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                      }}
                    >
                      {currentPosition &&
                        currentPosition.lat !== 35.68309653980229 && (
                          <MarkerF
                            key={`current pin`}
                            position={currentPosition}
                          />
                        )}
                    </GoogleMap>
                  )}
                  <br />

                  <Textarea
                    mb="md"
                    variant="filled"
                    label="External Link"
                    placeholder="..."
                    withAsterisk
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                  />

                  <Group position="left" mt="lg">
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
                          Upload Image
                        </Button>
                      )}
                    </FileButton>
                  </Group>
                  {fileInputFile && (
                    <Box>
                      <Text size="sm" align="left" mt="sm">
                        Picked file: {fileInputFile.name}
                      </Text>
                      <Image
                        src={photoPreview}
                        alt={`Image`}
                        // width="75%"
                        mt="md"
                        radius="lg"
                        caption="image preview"
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
                  {/* Con render explore/forum post */}
                  {/* <Checkbox
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
                  /> */}
                </Collapse>
              </>
              <Divider my="lg"></Divider>
              <Group position="right">
                <Button type="submit">Submit</Button>
              </Group>
            </form>
          </Paper>
        </Modal>

        <Group position="center" mt="lg">
          <Button onClick={() => setOpened(true)}>Add Comment</Button>
        </Group>
      </div>
      <Button onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}
