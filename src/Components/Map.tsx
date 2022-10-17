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
  DistanceMatrixService,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Group,
  Grid,
  Loader,
  Text,
  Card,
  Image,
  ScrollArea,
  Badge,
  Overlay,
  createStyles,
  Title,
  TextInput,
  Select,
} from "@mantine/core";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import axios from "axios";
import { addAbortSignal } from "stream";

//apparently center of japan
const center = {
  lat: 36.2048,
  lng: 138.2529,
};

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing.xl * 2,
    borderRadius: theme.radius.md,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[3]
    }`,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      flexDirection: "column-reverse",
      padding: theme.spacing.xl,
    },
  },

  image: {
    maxWidth: "40%",

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      maxWidth: "100%",
    },
  },

  body: {
    paddingRight: theme.spacing.xl * 4,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      paddingRight: 0,
      marginTop: theme.spacing.xl,
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1,
    marginBottom: theme.spacing.md,
  },

  controls: {
    display: "flex",
    marginTop: theme.spacing.xl,
  },

  inputWrapper: {
    width: "100%",
    flex: "1",
  },

  input: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRight: 0,
  },

  control: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
}));

interface MarkerPositions {
  position: {
    lat: number;
    lng: number;
  };
  id: number;
  name: string;
  areaId: number;
  categoryId: number[];
  hashtagId: number[];
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

interface Position {
  lat: number;
  lng: number;
}

interface Distance {
  position: number;
  distance: number;
}

export default function Map() {
  const { classes } = useStyles();
  // to allow user to check in on crowd. If current location is used, give more points!

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

  const [mapCenter, setMapCenter] = useState(center);
  const [zoomLevel, setZoomLevel] = useState(7);
  const [pins, setPins] = useState<PinLocationInformation[]>([]);
  const [pinMarkers, setPinMarkers] = useState<MarkerPositions[]>([]);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [activeWindow, setActiveWindow] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<
    google.maps.visualization.WeightedLocation[]
  >([]);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [hashtagVisible, setHashtagVisible] = useState(false);
  const [filterRegion, setFilterRegion] = useState(0);
  const [filterCategory, setFilterCategory] = useState(0);
  const [filterHash, setFilterHash] = useState(0);
  const [crowdMapWeight, setCrowdMapWeight] = useState(0);
  const [checkIn, setCheckIn] = useState(false);
  const [crowdValue, setCrowdValue] = useState<string | null>("");

  //For Googlemaps DistanceMatrix Service. To get distances.
  const [control, setControl] = useState(true);
  const [originAddress, setOriginAddress] = useState<Position[]>();
  const [destinationAddresses, setDestinationAddresses] = useState<Position[]>(
    []
  );
  const [nearbyPlaceDist, setNearbyPlaceDist] = useState<Distance[]>([]);

  console.log(crowdValue);

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

      const markersRes = await axios.get(
        `${backendUrl}/maps/allPins?type=markers`
      );

      const newMarkersRes = markersRes.data.filter(
        (pin: MarkerPositions) => Number(pin.areaId) === Number(filterRegion)
      );

      setPins(response.data);
      setPinMarkers(newMarkersRes);
    } else if (filterRegion !== 0 && filterCategory !== 0 && filterHash === 0) {
      const response = await axios.get(
        `${backendUrl}/maps/allPins?areaId=${filterRegion}&categoryId=${filterCategory}`
      );

      const markersRes = await axios.get(
        `${backendUrl}/maps/allPins?type=markers`
      );

      const newMarkersRes = await markersRes.data.filter(
        (pin: MarkerPositions) => Number(pin.areaId) === Number(filterRegion)
      );

      const newMarkersCatRes = newMarkersRes.filter((pin: MarkerPositions) =>
        pin.categoryId.includes(Number(filterCategory))
      );

      setPins(response.data);
      setPinMarkers(newMarkersCatRes);
    } else if (filterRegion !== 0 && filterCategory !== 0 && filterHash !== 0) {
      const response = await axios.get(
        `${backendUrl}/maps/allPins?areaId=${filterRegion}&categoryId=${filterCategory}&hashtagId=${filterHash}`
      );

      const markersRes = await axios.get(
        `${backendUrl}/maps/allPins?type=markers`
      );

      const newMarkersRes = await markersRes.data.filter(
        (pin: MarkerPositions) => Number(pin.areaId) === Number(filterRegion)
      );

      const newMarkersCatRes = newMarkersRes.filter((pin: MarkerPositions) =>
        pin.categoryId.includes(Number(filterCategory))
      );

      const newMarkersHashCatRes = newMarkersCatRes.filter(
        (pin: MarkerPositions) => pin.hashtagId.includes(Number(filterHash))
      );

      setPins(response.data);
      setPinMarkers(newMarkersHashCatRes);
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
  }, [filterRegion, filterCategory, filterHash, checkIn]);

  //   // //sort by distance.
  //   // //get the closest 3 places.
  //   // //slice?
  //   // //compare index with destinationaddresses index.
  //   // //get the latlng of the destination addresses. Find in pins for the ones that match the latlng

  const displayNearbyPlaces = () => {
    if (nearbyPlaceDist.length !== 0) {
      const infoToReturn = nearbyPlaceDist.map((place) => {
        //place.position is the index within destination address

        console.log(destinationAddresses[place.position]);
        //this gives me lat long of each place.

        const originalPin = pins.find(
          (pin) => pin.lat === destinationAddresses[place.position].lat
        );

        console.log(originalPin);

        if (originalPin) {
          const allCrowds = originalPin.crowds.slice(0, 3).map((crowd, i) => {
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

          const allPosts = originalPin.posts.map((post, i) => {
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
              <Text>NEARBY SIMILAR PLACES OF INTEREST</Text>
              <Text>{originalPin.placeName}</Text>
              <Text>
                {allAvailableAreas[originalPin.areaId - 1].prefecture}
              </Text>
              <Text>LATEST CROWD ESTIMATES</Text>
              {allCrowds}
              <br />
              {allPosts}
            </>
          );
        }
      });

      return infoToReturn;
    }
  };

  const handleFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { id, name } = event.currentTarget;

    setActiveMarker(null);
    setActiveWindow(null);
    setHeatmapData([{ location: null, weight: 0 }]);
    setCrowdMapWeight(0);
    setMapCenter(center);
    setZoomLevel(7);

    if (name === "prefecture") {
      setFilterCategory(0);
      setHashtagVisible(false);
      setFilterHash(0);

      setControl(true);
      setOriginAddress([]);
      setDestinationAddresses([]);
      setNearbyPlaceDist([]);

      const areaId = Number(id);

      if (filterRegion !== areaId) {
        setCategoryVisible(true);
        setFilterRegion(areaId);
      } else if (filterRegion === areaId) {
        setCategoryVisible(false);
        setFilterRegion(0);
      }
    } else if (name === "category") {
      setHashtagVisible(true);
      setFilterHash(0);

      setControl(true);
      setOriginAddress([]);
      setDestinationAddresses([]);
      setNearbyPlaceDist([]);

      const categoryId = Number(id);

      if (filterCategory !== categoryId) {
        setFilterCategory(categoryId);
      } else if (filterCategory === categoryId) {
        setFilterCategory(0);
      }
    } else if (name === "hashtag") {
      const hashtagId = Number(id);

      if (filterHash !== hashtagId) {
        setFilterHash(hashtagId);
      } else if (filterHash === hashtagId) {
        console.log("this is running");
        setFilterHash(0);
      }
    }
  };

  const listAreas = allAvailableAreas.map((area: Area, index) => {
    if (area.id === filterRegion) {
      return (
        <Button
          color="aqua"
          variant="light"
          key={index}
          id={`${area.id}`}
          name="prefecture"
          onClick={handleFilter}
        >
          {area.prefecture}
        </Button>
      );
    } else {
      return (
        <Button
          color="aqua"
          key={index}
          id={`${area.id}`}
          name="prefecture"
          onClick={handleFilter}
        >
          {area.prefecture}
        </Button>
      );
    }
  });

  const listCategories = allAvailableCategories.map(
    (category: Category, index) => {
      if (category.id === filterCategory) {
        return (
          <Button
            color="blue"
            variant="light"
            key={index}
            id={`${category.id}`}
            name="category"
            onClick={handleFilter}
          >
            {category.name.toUpperCase()}
          </Button>
        );
      } else {
        return (
          <Button
            color="blue"
            key={index}
            id={`${category.id}`}
            name="category"
            onClick={handleFilter}
          >
            {category.name.toUpperCase()}
          </Button>
        );
      }
    }
  );

  const listHashtags = allAvailableHashtags.map((hashtag: Hashtag, index) => {
    if (filterCategory === hashtag.categoryId) {
      if (hashtag.id === filterHash) {
        return (
          <Button
            color="purple"
            variant="light"
            key={index}
            id={`${hashtag.id}`}
            name="hashtag"
            onClick={handleFilter}
          >
            {hashtag.name}
          </Button>
        );
      } else {
        return (
          <Button
            color="purple"
            key={index}
            id={`${hashtag.id}`}
            name="hashtag"
            onClick={handleFilter}
          >
            {hashtag.name}
          </Button>
        );
      }
    } else return null;
  });

  const handleActiveMarker = async (marker: number, index: number) => {
    setControl(true);
    setOriginAddress([]);
    setDestinationAddresses([]);
    setNearbyPlaceDist([]);

    if (marker === activeMarker) {
      return;
    }
    const realIndex = pinMarkers.findIndex((item) => item.id === marker);
    setActiveMarker(marker);
    setActiveWindow(realIndex);
    setHeatmapData([
      {
        location: new window.google.maps.LatLng(
          pinMarkers[realIndex].position.lat,
          pinMarkers[realIndex].position.lng
        ),
        weight: 1000000,
      },
    ]);

    console.log(pinMarkers[realIndex].latestCrowdSize);
    if (pinMarkers[realIndex].latestCrowdSize === "little crowd") {
      setCrowdMapWeight(10);
    } else if (pinMarkers[realIndex].latestCrowdSize === "somewhat crowded") {
      setCrowdMapWeight(40);
    } else {
      setCrowdMapWeight(100);
    }

    setOriginAddress([pinMarkers[realIndex].position]);

    const leftoverPinMarkers = [...pinMarkers].filter(
      (element) => element.id !== marker
    );

    const destinationPins = leftoverPinMarkers.map((pin) => {
      const newObject = {
        lat: pin.position.lat,
        lng: pin.position.lng,
      };

      return newObject;
    });

    setDestinationAddresses(destinationPins);
  };
  console.log(activeWindow);

  const findPinInfo = () => {
    if (activeMarker !== null && activeWindow !== null) {
      // const index = pins.findIndex((item) => item.id === activeMarker);

      //activemarker is the id.
      const realIndex = pins.findIndex((item) => item.id === activeMarker);

      const { crowds, posts } = pins[realIndex];

      const allCrowds = crowds.slice(0, 3).map((crowd, i) => {
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
              <Badge
                variant="gradient"
                gradient={{ from: "aqua", to: "purple" }}
                key={categoryId}
              >
                {allAvailableCategories[categoryId - 1].name.toUpperCase()}
              </Badge>
            );
          });
          const allHashtags = postHashtags.map((hashtag) => {
            const { hashtagId } = hashtag;
            return (
              <Badge
                variant="gradient"
                gradient={{ from: "purple", to: "beige" }}
                key={hashtagId}
              >
                {allAvailableHashtags[hashtagId - 1].name}
              </Badge>
            );
          });

          return (
            <Card>
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
          <Text>{pinMarkers[activeWindow].name}</Text>
          <Text>
            {
              pins[Number(pins.findIndex((item) => item.id === activeMarker))]
                .area.prefecture
            }
          </Text>
          <br />

          <Text>LATEST CROWD ESTIMATES</Text>
          {allCrowds}
          <br />
          <Button color="greyBlue" onClick={handleCheckIn}>
            Check in for XX points
          </Button>
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
    setCrowdMapWeight(0);
    setControl(true);
    setOriginAddress([]);
    setDestinationAddresses([]);
    setNearbyPlaceDist([]);
    setHeatmapData([{ location: null, weight: 0 }]);
    setCrowdMapWeight(0);
    setMapCenter(center);
  };

  const onUnmount = () => {
    setHeatmapData([{ location: null, weight: 0 }]);
    setCrowdMapWeight(0);
  };

  const handleCheckIn = () => {
    setCheckIn(true);
  };

  const handleSubmitCrowd: React.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    let crowdIntensity;
    if (crowdValue === "very crowded") {
      crowdIntensity = ">100 pax";
      setCrowdMapWeight(100);
    } else if (crowdValue === "somewhat crowded") {
      crowdIntensity = "30 to 100 pax";
      setCrowdMapWeight(40);
    } else {
      crowdIntensity = "<30 pax";
      setCrowdMapWeight(10);
    }

    const objectBody = {
      userId: userId,
      crowdSize: crowdValue,
      crowdIntensity: crowdIntensity,
    };

    await axios.post(
      `${backendUrl}/maps/${activeMarker}/createCrowdData`,
      objectBody
    );

    setCrowdValue("");
    setCheckIn(false);
  };

  return (
    <>
      <div>Map Page</div>
      <ScrollArea style={{ height: 50 }}>
        <div style={{ width: "100vw" }}>
          <Group>
            {allAvailableAreas && allAvailableAreas.length ? (
              listAreas
            ) : (
              <Loader />
            )}
          </Group>
        </div>
      </ScrollArea>
      <br />
      {allAvailableCategories &&
      allAvailableCategories.length &&
      categoryVisible ? (
        <Group>{listCategories}</Group>
      ) : null}
      <br />
      {allAvailableHashtags && allAvailableHashtags.length && hashtagVisible ? (
        <Group>{listHashtags} </Group>
      ) : null}
      <br />
      {isLoaded && pinMarkers.length > 0 ? (
        <>
          <GoogleMap
            onClick={() => handleResetMarker()}
            center={mapCenter}
            zoom={zoomLevel}
            mapContainerStyle={{ width: "70%", height: "100%" }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {activeWindow !== null ? (
              <HeatmapLayer
                data={heatmapData}
                options={{ radius: crowdMapWeight, opacity: 0.4 }}
                onUnmount={onUnmount}
              />
            ) : null}

            {activeWindow !== null &&
              filterRegion !== 0 &&
              control &&
              originAddress &&
              destinationAddresses && (
                <DistanceMatrixService
                  options={{
                    destinations: destinationAddresses,
                    origins: originAddress,
                    travelMode: google.maps.TravelMode.DRIVING,
                  }}
                  callback={async (res) => {
                    console.log("RESPONSE", res);
                    setControl(false);

                    if (res !== null) {
                      const nearbyDistanceObjects = res.rows[0].elements.map(
                        (place, index) => {
                          const distanceObject = {
                            position: index,
                            distance: place.distance.value,
                          };

                          const distancePin = pinMarkers.find(
                            (pin) =>
                              pin.position === destinationAddresses[index]
                          );

                          const originPin = pinMarkers.find(
                            (pin) => pin.position === originAddress[0]
                          );

                          if (originPin && distancePin) {
                            if (filterCategory !== 0) {
                              if (
                                distancePin.categoryId.includes(filterCategory)
                              ) {
                                return distanceObject;
                              } else
                                return {
                                  position: -1,
                                  distance: Number.MAX_SAFE_INTEGER,
                                };
                            } else {
                              const response = originPin.categoryId.map(
                                (category) => {
                                  if (
                                    distancePin.categoryId.includes(category)
                                  ) {
                                    return distanceObject;
                                  } else
                                    return {
                                      position: -1,
                                      distance: Number.MAX_SAFE_INTEGER,
                                    };
                                }
                              );
                              return response.flat();
                            }
                          }
                          return [distanceObject];
                        }
                      );
                      if (
                        nearbyDistanceObjects.flat().length > 0 &&
                        !nearbyDistanceObjects
                          .flat()
                          .some((element) => element === null)
                      ) {
                        setNearbyPlaceDist(
                          nearbyDistanceObjects
                            .flat(2)
                            .sort((a, b) => a.distance - b.distance)
                            .slice(0, 3)
                        );
                      }
                    }
                  }}
                />
              )}

            {/* <Marker position={center} /> */}
            {pinMarkers.map((element, index) => {
              const { id, name, position, categoryId } = element;

              if (categoryId.length > 1) {
                if (filterCategory !== 0) {
                  const arrayOfMarkers = categoryId.map((category, index) => {
                    let markerIcon = "";

                    if (category === filterCategory) {
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
                          {/* {activeMarker === id ? (
                            <InfoWindowF
                              onCloseClick={() => setActiveMarker(null)}
                            >
                              <>
                                <Text>{name}</Text>
                                <Text>
                                  {
                                    pins[
                                      Number(
                                        pins.findIndex(
                                          (item) => item.id === activeMarker
                                        )
                                      )
                                    ].area.prefecture
                                  }
                                </Text>
                              </>
                            </InfoWindowF>
                          ) : null} */}
                        </MarkerF>
                      );
                    }
                  });

                  return arrayOfMarkers.map((marker) => marker);
                } else {
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
                        {/* {activeMarker === id ? (
                          <InfoWindowF
                            onCloseClick={() => setActiveMarker(null)}
                          >
                            <>
                              <Text>{name}</Text>
                              <Text>
                                {
                                  pins[
                                    Number(
                                      pins.findIndex(
                                        (item) => item.id === activeMarker
                                      )
                                    )
                                  ].area.prefecture
                                }
                              </Text>
                            </>
                          </InfoWindowF>
                        ) : null} */}
                      </MarkerF>
                    );
                  });

                  return arrayOfMarkers.map((marker) => marker);
                }
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
                    {/* {activeMarker === id ? (
                      <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                        <>
                          <Text>{name}</Text>
                          <Text>
                            {
                              pins[
                                Number(
                                  pins.findIndex(
                                    (item) => item.id === activeMarker
                                  )
                                )
                              ].area.prefecture
                            }
                          </Text>
                        </>
                      </InfoWindowF>
                    ) : null} */}
                  </MarkerF>
                );
              }
            })}
          </GoogleMap>
          {checkIn && activeWindow ? (
            <>
              <div className={classes.wrapper}>
                <div className={classes.body}>
                  <Text weight={500} size="lg" mb={5}>
                    At {pins[activeWindow].placeName} and want to check in?
                  </Text>
                  <Text size="sm" color="dimmed">
                    Earn XX points if you provide your feedback and help the
                    community!
                  </Text>

                  <Select
                    style={{ marginTop: 20, zIndex: 2 }}
                    data={[
                      {
                        value: "very crowded",
                        label: "Very Crowded (> 100 people)",
                        name: ">100 pax",
                      },
                      {
                        value: "somewhat crowded",
                        label: "Somewhat Crowded (30 to 100 people)",
                        name: "30 to 100 pax",
                      },
                      {
                        value: "little crowd",
                        label: "Little Crowd (< 30 people)",
                        name: "<30 pax",
                      },
                    ]}
                    placeholder="Pick one"
                    label="Current Crowd Estimate"
                    classNames={classes}
                    value={crowdValue}
                    onChange={setCrowdValue}
                  />
                  <div className={classes.controls}>
                    <Button
                      className={classes.control}
                      onClick={handleSubmitCrowd}
                    >
                      Check In{" "}
                    </Button>
                  </div>
                </div>
                {/* <Image src={image.src} className={classes.image} /> */}
              </div>
            </>
          ) : null}
          {activeWindow !== null ? (
            <>
              <Card>{findPinInfo()}</Card>
            </>
          ) : null}
          {nearbyPlaceDist.length > 0 ? displayNearbyPlaces() : null}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}
