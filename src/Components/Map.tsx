import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  InfoBoxF,
  HeatmapLayer,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { Button, Group, Grid, Loader, Text, Card, Image } from "@mantine/core";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import axios from "axios";
import { addAbortSignal } from "stream";

//apparently center of japan
const center = {
  lat: 36.2048,
  lng: 138.2529,
};

interface MarkerPositions {
  position: {
    lat: number;
    lng: number;
  };
  id: number;
  name: string;
  areaId: number;
  categoryId: number[];
  latestCrowdIntensity: string;
  latestCrowdSize: string;
  latestCrowdTime: Date;
}

interface CrowdPinInformation {
  recordedAt: Date;
  crowdSize: string;
  crowdIntensity: string;
}

interface CategoryIdInfo {
  categoryId: number;
}

interface HashtagIdInfo {
  hashtagId: number;
}

interface PostPinInformation {
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
  createdAt: Date;
  updatedAt: Date;
  postCategories: CategoryIdInfo[];
  postHashtags: HashtagIdInfo[];
}

interface PinLocationInformation {
  id: number;
  lat: number;
  lng: number;
  placeName: string;
  areaId: number;
  createdAt: Date;
  updatedAt: Date;
  area: {
    prefecture: string;
  };
  crowds: CrowdPinInformation[];
  posts: PostPinInformation[];
}

export interface Area {
  id: number;
  prefecture: string;
}

interface Category {
  id: number;
  name: string;
}

interface Hashtag {
  id: number;
  name: string;
  categoryId: number;
}

export default function Map() {
  const [libraries] = useState<
    ("visualization" | "places" | "drawing" | "geometry" | "localContext")[]
  >(["visualization", "places"]);
  const { userId } = UseApp();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  const [allAvailableAreas, setAllAvailableAreas] = useState<Area[]>([]);
  const [allAvailableCategories, setAllAvailableCategories] = useState<
    Category[]
  >([]);
  const [allAvailableHashtags, setAllAvailableHashtags] = useState<Hashtag[]>(
    []
  );

  const [pins, setPins] = useState<PinLocationInformation[]>([]);
  const [pinMarkers, setPinMarkers] = useState<MarkerPositions[]>([]);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [activeWindow, setActiveWindow] = useState<number | null>(null);
  const [filterRegion, setFilterRegion] = useState(0);
  const [filterCategory, setFilterCategory] = useState(0);

  const getAllInitialPins = async () => {
    if (filterRegion === 0 && filterCategory === 0) {
      const response = await axios.get(`${backendUrl}/maps/allPins`);
      const markersRes = await axios.get(
        `${backendUrl}/maps/allPins?type=markers`
      );

      setPins(response.data);
      setPinMarkers(markersRes.data);
    } else if (filterRegion !== 0 && filterCategory === 0) {
      const response = await axios.get(
        `${backendUrl}/maps/allPins?areaId=${filterRegion}`
      );

      setPins(response.data);
    } else {
      const response = await axios.get(
        `${backendUrl}/maps/allPins?categoryId=${filterCategory}`
      );

      setPins(response.data);
    }
  };

  const getAreas = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/areas`);
      setAllAvailableAreas(response.data);
    } catch (err) {}
  };

  const getCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/categories`);
      setAllAvailableCategories(response.data);
    } catch (err) {}
  };

  const getHashtags = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/hashtags`);
      setAllAvailableHashtags(response.data);
    } catch (err) {}
  };

  useEffect(() => {
    getCategories();
    getHashtags();
    getAreas();
  }, []);

  useEffect(() => {
    getAllInitialPins();
  }, [filterRegion, filterCategory]);

  const handleActiveMarker = async (marker: number, index: number) => {
    if (marker === activeMarker) {
      return;
    }
    const realIndex = pins.findIndex((item) => item.id === marker);
    setActiveMarker(marker);
    setActiveWindow(realIndex);
  };
  console.log(activeWindow);

  const findPinInfo = () => {
    if (activeWindow !== null) {
      // const index = pins.findIndex((item) => item.id === activeMarker);

      const { crowds, posts } = pins[activeWindow];

      const allCrowds = crowds.slice(2).map((crowd, i) => {
        const { crowdIntensity, crowdSize, recordedAt } = crowd;
        return (
          <>
            <Card>
              <Text>{new Date(recordedAt).toLocaleString()} </Text>
              <Text>{crowdIntensity}</Text>
              <Text>{crowdSize}</Text>
            </Card>
          </>
        );
      });

      const allPosts = posts.map((post, i) => {
        if (i < 3) {
          const { postCategories, postHashtags } = post;
          const allCategories = postCategories.map((category) => {
            const { categoryId } = category;
            return (
              <Button key={categoryId}>
                {allAvailableCategories[categoryId - 1].name.toUpperCase()}
              </Button>
            );
          });
          const allHashtags = postHashtags.map((hashtag) => {
            const { hashtagId } = hashtag;
            return (
              <Button key={hashtagId}>
                {allAvailableHashtags[hashtagId - 1].name}
              </Button>
            );
          });

          return (
            <Card>
              {/* <Text>Category {allCategories}</Text> */}
              {allCategories}
              <br />
              {allHashtags}
              <Text>Title: {post.title}</Text>
              <Text>
                Posted: {new Date(post.createdAt).toLocaleDateString()}
              </Text>
              <Text>{post.content}</Text>
              <img src={post.photoLink} alt={post.title} height={400} />
              <Text>Likes: {post.likeCount}</Text>
            </Card>
          );
        } else return null;
      });

      return (
        <>
          <Text>{pins[activeWindow].placeName}</Text>
          <Text>{pins[activeWindow].area.prefecture}</Text>
          <Text>LATEST CROWD ESTIMATES</Text>
          {allCrowds}
          <br />
          {allPosts}
        </>
      );
    }
  };

  console.log(pinMarkers);
  console.log(pins);

  const handleResetMarker = () => {
    setActiveMarker(null);
    setActiveWindow(null);
  };

  return (
    <>
      <div>Map Page</div>
      {isLoaded && pinMarkers.length > 0 ? (
        <>
          <GoogleMap
            onClick={() => handleResetMarker()}
            center={center}
            zoom={7}
            mapContainerStyle={{ width: "70%", height: "100%" }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {activeWindow !== null ? (
              <HeatmapLayer
                data={[
                  {
                    location: new window.google.maps.LatLng(
                      pinMarkers[activeWindow].position.lat,
                      pinMarkers[activeWindow].position.lng
                    ),
                    weight: 10000,
                  },
                ]}
                options={{ radius: 50, opacity: 0.4 }}
              />
            ) : null}

            {/* <Marker position={center} /> */}
            {pinMarkers.map((element, index) => {
              const { id, name, position, categoryId } = element;

              if (categoryId.length > 1) {
                const arrayOfMarkers = categoryId.map((category, index) => {
                  let markerIcon = "";
                  if (category === 1) {
                    markerIcon =
                      "https://tabler-icons.io/static/tabler-icons/icons-png/grill.png";
                  } else if (category === 2) {
                    markerIcon =
                      "https://tabler-icons.io/static/tabler-icons/icons-png/camera-selfie.png";
                  } else if (category === 3) {
                    markerIcon =
                      "https://tabler-icons.io/static/tabler-icons/icons-png/building.png";
                  } else {
                    markerIcon =
                      "https://tabler-icons.io/static/tabler-icons/icons-png/shirt.png";
                  }

                  return (
                    <MarkerF
                      key={`${id} ${category}`}
                      icon={{
                        url: `${markerIcon}`,
                        scaledSize: new google.maps.Size(50, 50),
                        // scale: 0.0005,
                      }}
                      // icon={markerIcon}
                      position={{
                        lat: position.lat + index * 0.0001,
                        lng: position.lng + index * 0.0001,
                      }}
                      // position={position}
                      onClick={() => handleActiveMarker(id, index)}
                    >
                      {activeMarker === id ? (
                        <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                          <>
                            <Text>{name}</Text>
                            <Text>{pins[index].area.prefecture}</Text>
                          </>
                        </InfoWindowF>
                      ) : null}
                    </MarkerF>
                  );
                });

                return arrayOfMarkers.map((marker) => marker);
              } else {
                let markerIcon = "";
                if (categoryId[0] === 1) {
                  markerIcon =
                    "https://tabler-icons.io/static/tabler-icons/icons-png/grill.png";
                } else if (categoryId[0] === 2) {
                  markerIcon =
                    "https://tabler-icons.io/static/tabler-icons/icons-png/camera-selfie.png";
                } else if (categoryId[0] === 3) {
                  markerIcon =
                    "https://tabler-icons.io/static/tabler-icons/icons-png/building.png";
                } else {
                  markerIcon =
                    "https://tabler-icons.io/static/tabler-icons/icons-png/shirt.png";
                }

                return (
                  <MarkerF
                    key={id}
                    icon={{
                      url: `${markerIcon}`,
                      // scale: 0.0005,
                      scaledSize: new google.maps.Size(50, 50),
                    }}
                    // icon={markerIcon}
                    position={position}
                    onClick={() => handleActiveMarker(id, index)}
                  >
                    {activeMarker === id ? (
                      <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                        <>
                          <Text>{name}</Text>
                          <Text>{pins[index].area.prefecture}</Text>
                        </>
                      </InfoWindowF>
                    ) : null}
                  </MarkerF>
                );
              }
            })}
          </GoogleMap>
          {activeWindow !== null ? (
            <>
              <Card>{findPinInfo()}</Card>
            </>
          ) : null}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}
