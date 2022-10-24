import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";

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
  FileInput,
  Textarea,
  Checkbox,
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
} from "@mantine/core";
import { storage } from "../DB/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { AwardOutline } from "@easy-eva-icons/react";
import { create } from "domain";

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
    paddingTop: theme.spacing.sm,
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
    console.log(`FRIENDLIST`, response.data);
    setFriendList(response.data);
  };

  // have a true/false state that updates the get request. and set in the dependency array of useEffect.
  useEffect(() => {
    singleThread();
    currentFriends();
  }, [updateComment, updateFriendRequest]);

  console.log(singleThreadData);
  // console.log(friendList);

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
    setReason("");
    setUpdateFriendRequest(!updateFriendRequest);
  };

  // check for existing friend/yourself/pending request
  const checkFriendShip = (
    friendshipStatus: string,
    userId: number,
    postId: number,
    photoLink: string,
    name: string
  ) => {
    switch (friendshipStatus) {
      case "confirmed":
        // return icon
        return (
          <Indicator inline label="Friend" size={16}>
            <Avatar src={photoLink} alt={name} radius="xl" size="lg" />
          </Indicator>
        );

      case "pending":
        return (
          <Indicator inline label="Pending" size={16}>
            <Avatar src={photoLink} alt={name} radius="xl" size="lg" />
          </Indicator>
        );

      case "myself":
        return <Avatar src={photoLink} alt={name} radius="xl" size="lg" />;
      default:
        return (
          <Group>
            <Avatar src={photoLink} alt={name} radius="xl" size="lg" />
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

  console.log(singleThreadData);

  const allComments = [];
  if (singleThreadData) {
    for (let i = 1; i < singleThreadData.length; i++) {
      allComments.push(
        <div>
          <Paper
            withBorder
            radius="md"
            className={classes.comment}
            key={singleThreadData[i].id}
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
                      friendList[singleThreadData[i].post.userId],
                      singleThreadData[i].post.userId,
                      singleThreadData[i].post.id,
                      singleThreadData[i].post.user.photoLink,
                      singleThreadData[i].post.user.name
                    )}
                </Group>
              </div>
              <div>
                <Text size="sm">{singleThreadData[i].post.user.name}</Text>
                <Text size="xs" color="dimmed">
                  commented on: {singleThreadData[i].post.createdAt}
                </Text>
              </div>
            </Group>
            <Text className={classes.body} size="sm">
              {singleThreadData[i].post.content}
            </Text>
          </Paper>
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
  const [allAreaData, setAllAreaData] = useState<AllPrefectureData[]>();
  const [externalLink, setExternalLink] = useState<string>("");
  const [exploreOpen, setExploreOpen] = useState<boolean>(false);

  // Googlemaps states for markers, and for autocomplete
  const [currentPosition, setCurrentPosition] = useState<Location>({
    lat: 35.68309653980229,
    lng: 139.7525871479461,
  });
  const [autoCompleteElem, setAutoCompleteElem] = useState<HTMLInputElement>();
  const [autoCompletePlacePos, setAutoCompletePlacePos] = useState<Location>();
  const [exactLocation, setExactLocation] = useState("");

  const getAllAreaData = async () => {
    const response = await axios.get(`${backendUrl}/info/areas`);
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

  console.log(currentPosition);
  console.log(autoCompletePlacePos);
  console.log(areaId);
  console.log(exactLocation);
  // Handle autocomplete changes. Please dont change order of autocomplete within form.
  const handleInputChange = () => {
    let searchInputField = document.getElementsByTagName("input")[3];
    const autocomplete = new google.maps.places.Autocomplete(searchInputField, {
      componentRestrictions: { country: "jp" },
    });

    autocomplete.addListener("place_changed", function () {
      let placeInfo = autocomplete.getPlace();

      console.log(placeInfo);

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
        console.log(placeInfo);
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
  };

  return (
    <div>
      <Container className={classes.borderContain}>
        {singleThreadData ? (
          <Box>
            <Card withBorder radius="md" className={classes.card}>
              <Title className={classes.cardTitle} align="left">
                {singleThreadData[0].thread.topic}
              </Title>

              <Card.Section>
                <Image
                  src={singleThreadData[0].post.photoLink}
                  alt={singleThreadData[0].post.locationName}
                  height={400}
                />
              </Card.Section>

              <Text size="sm" color="dimmed" lineClamp={4}>
                {singleThreadData[0].post.content}
              </Text>

              <br />

              <Group position="apart" className={classes.footer}>
                <Center>
                  <Avatar
                    src={singleThreadData[0].post.user.photoLink}
                    size={24}
                    radius="xl"
                    mr="xs"
                  />
                  <Text size="sm" inline>
                    {singleThreadData[0].post.user.name}
                  </Text>
                </Center>
                <Text size="sm" inline>
                  Created At: {singleThreadData[0].post.createdAt}
                </Text>
              </Group>
            </Card>
          </Box>
        ) : null}
      </Container>
      <Container>
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
                      console.log(`explore status`, explorePost);
                      console.log(`forum state`, forumPost);
                    }}
                  >
                    Add to Explore?
                  </Button>
                </Group>

                <Collapse in={exploreOpen}>
                  <Textarea
                    variant="filled"
                    label="Title"
                    placeholder="Give a title!"
                    withAsterisk
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    variant="filled"
                    label="External Link"
                    placeholder="..."
                    withAsterisk
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                  />
                  <FileInput
                    variant="filled"
                    placeholder="pick file"
                    label="Add Photo"
                    withAsterisk
                    value={fileInputFile}
                    onChange={(e: File) => {
                      console.log(e);
                      setFileInputFile(e);
                    }}
                  />
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

              <Group position="right">
                <Button type="submit">Submit</Button>
              </Group>
            </form>
          </Paper>
        </Modal>

        <Group position="center">
          <Button onClick={() => setOpened(true)}>Add Comment</Button>
        </Group>
      </div>
      <Button onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
}
