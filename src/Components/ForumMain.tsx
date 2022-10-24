import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Container,
  Grid,
  Card,
  Text,
  Modal,
  Group,
  FileInput,
  Textarea,
  Checkbox,
  Select,
  TextInput,
  Title,
  Paper,
  createStyles,
  Space,
} from "@mantine/core";
import { storage } from "../DB/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { PersonOutline, EditOutline } from "@easy-eva-icons/react";

// Googlemaps Api
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  LoadScript,
  Autocomplete,
} from "@react-google-maps/api";

type ThreadListData = {
  id: number;
  lastPost: string;
  lastPostCreatedAt: string;
  lastPostUserId: number;
  lastPostUserName: string;
  postsCount: number;
  topic: string;
  usersCount: number;
};

type AllPrefectureData = {
  id: string;
  prefecture: string;
};

// Googlemaps type for position/marker
type Location = {
  lat: number;
  lng: number;
};

type prefectureDataType = {
  value: string;
  label: string;
};

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  footer: {
    padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
    marginTop: theme.spacing.md,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },
}));

export default function ForumMain() {
  // have a create post that can extend to explore page
  const [forumList, setForumList] = useState<ThreadListData[]>();
  const [updateForum, setUpdateForum] = useState<boolean>(false);
  const { getAccessTokenSilently } = useAuth0();
  const [allAreaData, setAllAreaData] = useState<AllPrefectureData[]>();
  const { classes, theme } = useStyles();
  const navigate = useNavigate();

  // Google map library and API definition
  const [libraries] = useState<
    ("visualization" | "places" | "drawing" | "geometry" | "localContext")[]
  >(["visualization", "places"]);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  const getForumData = async () => {
    const response = await axios.get(`${backendUrl}/posts/thread`);

    setForumList(response.data);
  };

  useEffect(() => {
    getForumData();
  }, [updateForum]);

  console.log(forumList);

  // map out all the threads by TOPIC (Div>Container>Link>Card>Text)
  let forumListFinal;
  if (forumList) {
    forumListFinal = forumList.map((list: ThreadListData) => {
      return (
        <Grid.Col key={list.id} span={4}>
          {/* <Container key={list.id}> */}
          {/* <Link to={`/exchange/${list.id}`}> */}
          <Card
            withBorder
            p="lg"
            radius="md"
            className={classes.card}
            onClick={() => {
              navigate(`/exchange/${list.id}`);
            }}
            style={{ cursor: "pointer" }}
          >
            <Text weight={700} className={classes.title} mt="xs">
              {list.topic}
            </Text>

            <Group mt="md" mb="sm">
              <div>
                <Text weight={500} size="xs">
                  {list.lastPostUserName}
                </Text>
                <Text size="xs">posted {list.lastPostCreatedAt}</Text>
                <Text size="xs" color="dimmed">
                  {list.lastPost}
                </Text>
              </div>
            </Group>
            <Group position="apart">
              <Text size="sm">
                {<PersonOutline />}
                {list.usersCount} User
              </Text>
              <Text size="sm">
                {<EditOutline />}
                {list.postsCount} Post
              </Text>
            </Group>
          </Card>
          {/* </Link> */}
        </Grid.Col>
      );
    });
  }

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

  // create new thread
  //setState for explorePost and forumPost UNDER CHECKBOX
  const [forumPost, setForumPost] = useState<boolean>(true);
  const [explorePost, setExplorePost] = useState<string | null>(null);
  const [opened, setOpened] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const [fileInputFile, setFileInputFile] = useState<File>();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [areaId, setAreaId] = useState<string>();
  const [locationName, setLocationName] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [externalLink, setExternalLink] = useState<string>("");
  const { userInfo } = UseApp();

  // Googlemaps states for markers, and for autocomplete
  const [currentPosition, setCurrentPosition] = useState<Location>({
    lat: 35.68309653980229,
    lng: 139.7525871479461,
  });
  const [autoCompleteElem, setAutoCompleteElem] = useState<HTMLInputElement>();
  const [autoCompletePlacePos, setAutoCompletePlacePos] = useState<Location>();
  const [exactLocation, setExactLocation] = useState("");

  console.log(userInfo.id);
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
      const newForumPost = {
        userId: userInfo.id,
        content: content,
        areaId: areaId,
        forumPost: forumPost,
        explorePost: explorePost,
        externalLink: externalLink,
        title: title,
        photoLink: imageUrl,
        locationName: locationName,
        topic: topic,
        oldPinId: null,
        newPin: currentPosition,
        exactLocation: exactLocation,
      };

      await axios.post(`${backendUrl}/posts/create-thread`, newForumPost, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } else {
      if (Number(areaId) === 1) {
        pinId = 41;
      } else if (Number(areaId) === 2) {
        pinId = 42;
      } else {
        pinId = 43;
      }

      const newForumPost = {
        userId: userInfo.id,
        content: content,
        areaId: areaId,
        forumPost: forumPost,
        explorePost: explorePost,
        externalLink: externalLink,
        title: title,
        photoLink: imageUrl,
        locationName: locationName,
        topic: topic,
        oldPinId: pinId,
        newPin: null,
      };

      await axios.post(`${backendUrl}/posts/create-thread`, newForumPost, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    setOpened(false);
    setUpdateForum(!updateForum);
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
    setTopic("");
    setExternalLink("");
  };
  console.log(locationName);

  return (
    <div>
      <Space h="lg" />
      <Title align="center">Exchange</Title>
      <Text size="sm" align="center" color="aqua">
        reach out to like-minded enthusiasts and share tips or ask advice from
        our community of locals and denizens
      </Text>
      {/* create post button */}
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
          title="Start a Thread"
        >
          <Paper radius="md" p="xl" withBorder>
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
                label="Topic"
                placeholder="What is the topic about?"
                withAsterisk
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Textarea
                variant="filled"
                label="Content"
                placeholder="Tell us more details!"
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
                      <MarkerF key={`current pin`} position={currentPosition} />
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
                label="Upload Photo if any!"
                withAsterisk
                value={fileInputFile}
                onChange={(e: File) => {
                  console.log(e);
                  setFileInputFile(e);
                }}
              />
              <br />
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
                  // setForumPost(true);
                }}
              />
              <Group position="right">
                <Button type="submit">Create Post!</Button>
              </Group>
            </form>
          </Paper>
        </Modal>

        <Group position="center">
          <Button onClick={() => setOpened(true)}>Create Post!</Button>
        </Group>
      </div>
      {updateForum}
      <Grid>{forumListFinal}</Grid>
    </div>
  );
}
