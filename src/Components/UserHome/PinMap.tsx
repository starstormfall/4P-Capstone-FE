import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  HeatmapLayer,
  DistanceMatrixService,
} from "@react-google-maps/api";
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
  Alert,
  Anchor,
  Modal,
  Box,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconMapSearch,
  IconFriends,
  IconMapPins,
  IconUserCheck,
} from "@tabler/icons";
import { backendUrl } from "../../utils";
import { UseApp } from "../Context";
import axios from "axios";
import {
  Area,
  Category,
  Hashtag,
  Position,
  Distance,
  MarkerPositions,
  PinLocationInformation,
} from "./HomePageInterface";
import NearbyPlaces from "./NearbyPlaces";
import { useAuth0 } from "@auth0/auth0-react";

// Styles for crowd check in banner
const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    alignItems: "center",
    // padding: theme.spacing.xs * 2,
    borderRadius: theme.radius.md,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    // border: `1px solid ${
    //   theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[3]
    // }`,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      flexDirection: "column-reverse",
      padding: theme.spacing.xs,
    },
  },

  image: {
    maxWidth: "40%",

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      maxWidth: "100%",
    },
  },

  body: {
    // paddingRight: theme.spacing.xl * 4,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      paddingRight: 0,
      marginTop: theme.spacing.xs,
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1,
    marginBottom: theme.spacing.xs,
  },

  controls: {
    display: "flex",
    marginTop: theme.spacing.xs,
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

  select: {
    padding: 0,
  },

  crowdNew: {
    justifyContent: "flex-end",
  },
}));

// Defining interfaces
interface Props {
  postId: number;
  pinId: number;
  areaId: number;
}

export default function PinMap(props: Props) {
  const { classes } = useStyles();
  const navigate = useNavigate();

  // Usage of Context to obtain userId and userInfo.
  const { userId, userInfo, setUserInfo } = UseApp();

  // Obtain methods for auth0 authentication.
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Google map library and API definition
  const [libraries] = useState<
    ("visualization" | "places" | "drawing" | "geometry" | "localContext")[]
  >(["visualization", "places"]);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

  // States for loading all prefectures, categories and hashtags.
  const [allAvailableAreas, setAllAvailableAreas] = useState<Area[]>([]);
  const [allAvailableCategories, setAllAvailableCategories] = useState<
    Category[]
  >([]);
  const [allAvailableHashtags, setAllAvailableHashtags] = useState<Hashtag[]>(
    []
  );

  // States for map display.
  const [originalMap, setOriginalMap] = useState<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>();
  const [mapCenter, setMapCenter] = useState<Position>();
  const [zoomLevel, setZoomLevel] = useState(15);

  // States for saving pin infos from BE in different formats, to set markers on google map.
  const [pinMarkers, setPinMarkers] = useState<MarkerPositions[]>([]);
  const [currentPin, setCurrentPin] = useState<PinLocationInformation>();
  const [currentPinInfo, setCurrentPinInfo] = useState<MarkerPositions>();
  const [pins, setPins] = useState<PinLocationInformation[]>([]);

  // States for saving heatmap info to set heatmap on google map.
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [heatmapData, setHeatmapData] = useState<
    google.maps.visualization.WeightedLocation[]
  >([]);
  const [crowdMapWeight, setCrowdMapWeight] = useState(0);

  // States for user to submit crowd data.
  const [checkIn, setCheckIn] = useState(false);
  const [crowdValue, setCrowdValue] = useState<string | null>("");
  const [errorCheckIn, setErrorCheckIn] = useState(false);
  const [successCheckIn, setSuccessCheckIn] = useState(false);
  const [newUserScore, setNewUserScore] = useState(0);

  // States for Googlemap DistanceMatrix Service. To get distances.
  const [control, setControl] = useState(true);
  const [destinationAddresses, setDestinationAddresses] = useState<Position[]>(
    []
  );
  const [nearbyPlaceDist, setNearbyPlaceDist] = useState<Distance[]>([]);

  const [nearbyVisible, setNearbyVisible] = useState(false);
  const [crowdVisible, setCrowdVisible] = useState(true);

  // useEffect for checking auth0 authentication upon load.
  useEffect(() => {
    if (isAuthenticated) {
      console.log(user);
    } else {
      loginWithRedirect();
    }
  }, []);

  // Marker style for current location of user based on GPS. Requires google map instance to be loaded.
  let blueDot;
  if (isLoaded) {
    blueDot = {
      fillColor: "#3F9DA1",
      fillOpacity: 1,
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      strokeColor: "#FFFFFF",
      strokeWeight: 3,
    };
  }

  // useEffect api call to get all areas(prefectures)
  const getAreas = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/areas`);
      setAllAvailableAreas(response.data);
    } catch (err) {}
  };

  // useEffect api call to get all categories
  const getCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/categories`);
      setAllAvailableCategories(response.data);
    } catch (err) {}
  };

  // useEffect api call to get all hashtags
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

  // useEffect api call to get info of one pin, and to get info of all pins in the same prefecture.
  // useEffect is recalled when user checks in to refresh latest crowd data.
  useEffect(() => {
    getCurrentPin();
    getAllInitialPinsToArea();
  }, [checkIn, crowdValue]);

  const getCurrentPin = async () => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });

    const response = await axios.get(
      `${backendUrl}/maps/onePin/${props.pinId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    setCurrentPin(response.data);
  };

  const getAllInitialPinsToArea = async () => {
    const accessToken = await getAccessTokenSilently({
      audience: process.env.REACT_APP_AUDIENCE,
      scope: process.env.REACT_APP_SCOPE,
    });

    const response = await axios.get(
      `${backendUrl}/maps/allPins?areaId=${props.areaId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const markersRes = await axios.get(
      `${backendUrl}/maps/allPins?type=markers`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const newMarkersRes = markersRes.data.filter(
      (pin: MarkerPositions) => Number(pin.areaId) === Number(props.areaId)
    );

    setPins(response.data);
    setPinMarkers(newMarkersRes);
  };

  //  useEffect to set center of google map after both google map and one pin info is loaded. Get permissions from user to share current location. Obtain latest crowd info of the one pin. Set latlng positions of remaining pins to obtain closest pins.
  useEffect(() => {
    if (originalMap && currentPin) {
      setMapCenter({ lat: currentPin.lat, lng: currentPin.lng });

      originalMap.panTo({ lat: currentPin.lat, lng: currentPin.lng });

      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });

      setHeatmapVisible(true);

      const leftoverPinMarkers = [...pinMarkers].filter(
        (element) => element.id !== props.pinId
      );

      const destinationPins = leftoverPinMarkers.map((pin) => {
        const newObject = {
          lat: pin.position.lat,
          lng: pin.position.lng,
        };

        return newObject;
      });

      setDestinationAddresses(destinationPins);
    }
  }, [currentPin, originalMap, pinMarkers, checkIn]);

  // useEffect to set heatMapData when setHeatmap is turned to true. Also renders latest current pin info. Is triggered upon first load of google maps and triggered after submitting crowd data.
  useEffect(() => {
    if (originalMap && currentPin) {
      setHeatmapData([
        {
          location: new window.google.maps.LatLng(
            currentPin.lat,
            currentPin.lng
          ),
          weight: 1000000,
        },
      ]);

      const currentPinMarker = pinMarkers.find((pin) => pin.id === props.pinId);

      if (currentPinMarker) {
        setCurrentPinInfo(currentPinMarker);
      }

      if (
        currentPinMarker &&
        currentPinMarker.latestCrowdSize === "little crowd"
      ) {
        setCrowdMapWeight(10);
      } else if (
        currentPinMarker &&
        currentPinMarker.latestCrowdSize === "somewhat crowded"
      ) {
        setCrowdMapWeight(40);
      } else {
        setCrowdMapWeight(100);
      }
    }
  }, [currentPin, originalMap, pinMarkers]);

  // Function that handles user when user clicks check in. Sets states for jsx to render.
  const handleCheckIn = () => {
    setCheckIn(!checkIn);
    setErrorCheckIn(false);
    setSuccessCheckIn(false);
  };

  // Helper function to calculate the distance between the pin position and the user's live position.
  const calcDistanceTwoPoints = (point1: Position, point2: Position) => {
    let latPoint1 = point1.lat / 57.29577951;
    let latPoint2 = point2.lat / 57.29577951;
    let lngPoint1 = point1.lng / 57.29577951;
    let lngPoint2 = point1.lng / 57.29577951;

    return (
      3963.0 *
      1.609344 *
      1000 *
      Math.acos(
        Math.sin(latPoint1) * Math.sin(latPoint2) +
          Math.cos(latPoint1) *
            Math.cos(latPoint2) *
            Math.cos(lngPoint2 - lngPoint1)
      )
    );
  };

  console.log(currentPin);

  const findPinCrowd = () => {
    if (currentPin && currentPin !== undefined) {
      const { crowds } = currentPin;

      const allCrowds = crowds.slice(0, 7).map((crowd, i) => {
        const { crowdIntensity, crowdSize, recordedAt } = crowd;
        return (
          <>
            <Card
              key={new Date(recordedAt).toLocaleString()}
              className={classes.select}
              // withBorder
            >
              <Text transform="uppercase" size="md">
                {crowdIntensity}
              </Text>
              <Text transform="capitalize" size="sm">
                {crowdSize}
              </Text>
              <Text color="dimmed" size="xs">
                {new Date(recordedAt).toLocaleString()}{" "}
              </Text>
            </Card>
          </>
        );
      });
      return <div key={currentPin.placeName}>{allCrowds}</div>;
    }
  };

  // Function triggered when user clicks submit crowd data. Checks if user is within 100m of the pin. If no, send error banner. If yes, create data within BE and update user score.
  const handleSubmitCrowd: React.MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });

    if (currentPosition && currentPin) {
      const distanceFromPoint = calcDistanceTwoPoints(currentPosition, {
        lat: currentPin.lat,
        lng: currentPin.lng,
      });

      if (distanceFromPoint <= 100) {
        setHeatmapVisible(false);
        setErrorCheckIn(false);
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

        const accessToken = await getAccessTokenSilently({
          audience: process.env.REACT_APP_AUDIENCE,
          scope: process.env.REACT_APP_SCOPE,
        });

        await axios.post(
          `${backendUrl}/maps/${props.pinId}/createCrowdData`,
          objectBody,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const newUserScoreObj = {
          email: userInfo.email,
          score: Number(userInfo.score + 10),
          name: userInfo.name,
          nationality: userInfo.nationality,
          lastLogin: userInfo.lastLogin,
          photoLink: userInfo.photoLink,
          loginStreak: userInfo.loginStreak,
        };

        const userResponse = await axios.put(
          `${backendUrl}/users/update/${userId}`,
          newUserScoreObj,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        setCrowdValue("");
        setCheckIn(false);
        setSuccessCheckIn(true);
        setNewUserScore(userResponse.data.score);
        setUserInfo({ ...userInfo, score: newUserScoreObj.score });
      } else {
        setErrorCheckIn(true);
        setSuccessCheckIn(false);
        setCheckIn(false);
      }
    }
  };

  // To render marker for current pin.
  let arrayOfMarkers;
  let singleMarker;

  if (currentPinInfo) {
    if (currentPinInfo.categoryId.length > 1) {
      const { categoryId, position } = currentPinInfo;
      arrayOfMarkers = categoryId.map((category, index) => {
        let markerIcon = "";
        if (category === 1) {
          markerIcon =
            "https://tabler-icons.io/static/tabler-icons/icons-png/soup.png";
        } else if (category === 2) {
          markerIcon =
            "https://tabler-icons.io/static/tabler-icons/icons-png/camera.png";
        } else if (category === 3) {
          markerIcon =
            "https://tabler-icons.io/static/tabler-icons/icons-png/building-skyscraper.png";
        } else {
          markerIcon =
            "https://tabler-icons.io/static/tabler-icons/icons-png/shopping-cart.png";
        }
        return (
          <MarkerF
            key={`${category}`}
            icon={{
              url: `${markerIcon}`,
              scaledSize: new google.maps.Size(30, 30),
            }}
            position={{
              lat: position.lat + index * 0.0001,
              lng: position.lng + index * 0.0001,
            }}
          ></MarkerF>
        );
      });
    } else {
      const { position } = currentPinInfo;
      let category = currentPinInfo.categoryId[0];
      let markerIcon = "";
      if (category === 1) {
        markerIcon =
          "https://tabler-icons.io/static/tabler-icons/icons-png/soup.png";
      } else if (category === 2) {
        markerIcon =
          "https://tabler-icons.io/static/tabler-icons/icons-png/camera.png";
      } else if (category === 3) {
        markerIcon =
          "https://tabler-icons.io/static/tabler-icons/icons-png/building-skyscraper.png";
      } else {
        markerIcon =
          "https://tabler-icons.io/static/tabler-icons/icons-png/shopping-cart.png";
      }

      singleMarker = (
        <MarkerF
          key={currentPinInfo.id}
          icon={{
            url: `${markerIcon}`,

            scaledSize: new google.maps.Size(30, 30),
          }}
          position={position}
        ></MarkerF>
      );
    }
  }

  return (
    <>
      <br />
      {errorCheckIn ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Bummer!"
          color="#C1BBD5"
          withCloseButton
          closeButtonLabel="Close alert"
          onClose={() => setErrorCheckIn(false)}
        >
          You are not within the vicinity of the place you are trying to check
          in at! Please move closer and try again
        </Alert>
      ) : null}

      {successCheckIn ? (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Congratulations!"
          color="aqua"
          withCloseButton
          closeButtonLabel="Close alert"
          onClose={() => setSuccessCheckIn(false)}
        >
          You have successfully checked in. Thank you for helping the community!
          You have earned 10 points for your contribution and have{" "}
          {newUserScore} points now.
        </Alert>
      ) : null}

      {isLoaded && pinMarkers.length > 0 ? (
        <>
          <Grid>
            <Grid.Col span={7}>
              <GoogleMap
                key={currentPinInfo?.name}
                onLoad={(map) => setOriginalMap(map)}
                zoom={zoomLevel}
                mapContainerStyle={{
                  width: "26.5vw",
                  height: "44vh",
                  position: "fixed",
                }}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {heatmapVisible && (
                  <HeatmapLayer
                    key={currentPinInfo?.position.lng}
                    data={heatmapData}
                    options={{ radius: crowdMapWeight, opacity: 0.4 }}
                    // onUnmount={onUnmount}
                  />
                )}
                {control && currentPin && destinationAddresses && (
                  <DistanceMatrixService
                    key={currentPin.lat}
                    options={{
                      destinations: destinationAddresses,
                      origins: [{ lat: currentPin.lat, lng: currentPin.lng }],
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

                            // For each response object, finds the corresponding pin info in state.
                            const distancePin = pinMarkers.find(
                              (pin) =>
                                pin.position === destinationAddresses[index]
                            );

                            // Finds the current pin info in state.
                            const originPin = pinMarkers.find(
                              (pin) => pin.position.lat === currentPin.lat
                            );

                            // Checks if the response object has common category as the current pin info.
                            if (originPin && distancePin) {
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
                            return [distanceObject];
                          }
                        );

                        // Sets the response object into state, for those that passed the filter. Sorts the objects by distance, from nearest to furthest. Saves only the closest 3 reponse objects.
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
                {/* MARKER FOR USER LIVE LOCATION */}
                {currentPosition && isLoaded ? (
                  <MarkerF
                    key={`current location`}
                    icon={blueDot}
                    position={currentPosition}
                  />
                ) : null}

                {/* MARKER FOR SELECTED PIN  */}
                {currentPinInfo &&
                isLoaded &&
                arrayOfMarkers &&
                arrayOfMarkers.length > 0
                  ? arrayOfMarkers.map((marker) => marker)
                  : null}

                {currentPinInfo && isLoaded && singleMarker
                  ? singleMarker
                  : null}
              </GoogleMap>

              <Button.Group>
                <Button fullWidth onClick={handleCheckIn}>
                  <IconUserCheck />
                </Button>
                {crowdVisible ? (
                  <Button
                    fullWidth
                    onClick={() => {
                      setNearbyVisible(false);
                      setCrowdVisible(!crowdVisible);
                    }}
                    variant="subtle"
                  >
                    <IconFriends />
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => {
                      setNearbyVisible(false);
                      setCrowdVisible(!crowdVisible);
                    }}
                  >
                    <IconFriends />
                  </Button>
                )}

                {nearbyVisible ? (
                  <Button
                    fullWidth
                    onClick={() => {
                      setNearbyVisible(!nearbyVisible);
                      setCrowdVisible(false);
                    }}
                    variant="subtle"
                  >
                    <IconMapPins />
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => {
                      setNearbyVisible(!nearbyVisible);
                      setCrowdVisible(false);
                    }}
                  >
                    <IconMapPins />
                  </Button>
                )}

                <Button
                  fullWidth
                  onClick={() =>
                    navigate("../map", {
                      state: {
                        pinId: props.pinId,
                        position: currentPinInfo?.position,
                      },
                    })
                  }
                >
                  <IconMapSearch />
                </Button>
              </Button.Group>
            </Grid.Col>
            <Grid.Col span={5}>
              {
                crowdVisible && currentPinInfo && (
                  <>
                    <Box
                      sx={(theme) => ({
                        minHeight: "52.5vh",
                        padding: theme.spacing.md,
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : theme.white,
                        // borderRadius: theme.radius.lg,
                        // boxShadow: theme.shadows.xs,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        maxWidth: "31vw",
                      })}
                    >
                      <ScrollArea style={{ height: "49vh" }} offsetScrollbars>
                        <Title order={4}>CROWD ESTIMATE</Title>
                        {findPinCrowd()}
                      </ScrollArea>
                    </Box>
                  </>
                )
                // <>
                // <Title order={4} transform="uppercase">
                //   {currentPinInfo.name}
                // </Title>
                //   <Text>
                //     Current Crowd Estimate: {currentPinInfo.latestCrowdSize} -{" "}
                //     {currentPinInfo.latestCrowdIntensity} at{" "}
                //     {new Date(currentPinInfo.latestCrowdTime).toLocaleString()}
                //   </Text>
                // </>
              }

              {checkIn && currentPin ? (
                <>
                  <Modal
                    opened={checkIn}
                    onClose={() => setCheckIn(false)}
                    radius="md"
                    size="auto"
                    withCloseButton={false}
                  >
                    <div className={classes.wrapper}>
                      <div className={classes.body}>
                        <Text weight={500} size="lg" mb={5}>
                          At {currentPin.placeName} and want to check in?
                        </Text>
                        <Text size="sm" color="dimmed">
                          Earn 10 points if you provide your feedback and help
                          the community!
                        </Text>
                        <div className={classes.select}>
                          <Select
                            style={{ marginTop: 20, zIndex: 2, padding: 0 }}
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
                        </div>
                        <div>
                          <br />
                          <Group className={classes.crowdNew}>
                            <Button
                              onClick={handleSubmitCrowd}
                              name="with location"
                            >
                              <IconUserCheck />
                            </Button>
                          </Group>
                        </div>
                      </div>
                    </div>
                  </Modal>
                </>
              ) : null}

              {nearbyVisible &&
              nearbyPlaceDist.length > 0 &&
              pins.length !== 0 ? (
                <ScrollArea style={{ height: "49vh" }} offsetScrollbars>
                  <Title order={4}>SIMILAR NEARBY</Title>
                  <NearbyPlaces
                    key={`nearby-${props.pinId}`}
                    nearbyPlaceDist={nearbyPlaceDist}
                    pins={pins}
                    destinationAddresses={destinationAddresses}
                    allAvailableCategories={allAvailableCategories}
                    allAvailableHashtags={allAvailableHashtags}
                    allAvailableAreas={allAvailableAreas}
                  />
                </ScrollArea>
              ) : null}
            </Grid.Col>
          </Grid>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}
