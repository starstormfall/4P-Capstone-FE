import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  TextInput,
} from "@mantine/core";
import { storage } from "../DB/firebase";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

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

// type PrefData = {
//   id: string;
//   label: string;
//   value: string;
// };

export default function ForumMain() {
  // have a create post that can extend to explore page
  const [forumList, setForumList] = useState<ThreadListData[]>();
  const [updateForum, setUpdateForum] = useState<boolean>(false);
  const { getAccessTokenSilently } = useAuth0();

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
  // get all data
  // const forumList = useQuery(["threadList"], () =>
  //   axios.get(`${backendUrl}/posts/thread`).then((res) => res.data)
  // );
  console.log(forumList);
  // console.log("thread ID", forumList.data[0].threads[0].id);

  // map out all the threads by TOPIC (Div>Container>Link>Card>Text)
  let forumListFinal;
  if (forumList) {
    forumListFinal = forumList.map((list: ThreadListData) => {
      return (
        <div>
          <Link to={`/exchange/${list.id}`}>
            <Grid justify="center" key={list.id}>
              <Grid.Col span={5}>
                <Container key={list.id}>
                  <Card>
                    <Text>Thread Title:</Text>
                    {/* cant index */}
                    <Text>{list.topic}</Text>
                    <Text>Content:</Text>
                    <Text>{list.lastPost}</Text>
                    <Text>Post Count:</Text>
                    <Text>{list.postsCount}</Text>
                    <Text>User Count:</Text>
                    <Text>{list.usersCount}</Text>
                    <Text>Last Updated At:</Text>
                    <Text>{list.lastPostCreatedAt}</Text>
                  </Card>
                </Container>
              </Grid.Col>
            </Grid>
          </Link>
        </div>
      );
    });
  }

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
        externalLink: null,
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
        externalLink: null,
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
  };

  return (
    <div>
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
          title="Tell us more in details!"
        >
          <Container>
            <form onSubmit={handleSubmit}>
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
                  mapContainerStyle={{ width: "367px", height: "30vh" }}
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
                  // setForumPost(true);
                }}
              />
              <button>Create Post!</button>
            </form>
          </Container>
        </Modal>

        <Group position="center">
          <Button onClick={() => setOpened(true)}>Create Post!</Button>
        </Group>
      </div>
      {updateForum}
      {forumListFinal}
    </div>
  );
}
