import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  InfoBoxF,
  HeatmapLayer,
  DistanceMatrixService,
} from "@react-google-maps/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  Divider,
  Box,
  Container,
  Collapse,
  UnstyledButton,
  ThemeIcon,
  ChevronIcon,
  Modal,
  Paper,
  useMantineTheme,
  Space,
  Center,
  SimpleGrid,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";

import {
  IconAlertCircle,
  IconToolsKitchen2,
  IconBuildingSkyscraper,
  IconFriends,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconMapPins,
  IconUserCheck,
} from "@tabler/icons";
import { Heart, HeartOutline } from "@easy-eva-icons/react";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { addAbortSignal } from "stream";
import { getTokenSourceMapRange } from "typescript";

// Define centers for each region for google maps.
const center = {
  lat: 36.2048,
  lng: 138.2529,
};

const tokyo = {
  lat: 35.68309653980229,
  lng: 139.7525871479461,
};

const hokkaido = {
  lat: 43.27748330255431,
  lng: 142.61770892207522,
};

const osaka = {
  lat: 34.66801615290104,
  lng: 135.49706560580577,
};

// Styles for crowd check in banner
const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    alignItems: "center",
    // padding: theme.spacing.xl * 2,
    borderRadius: theme.radius.md,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    // border: `1px solid ${
    //   theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[3]
    // }`,

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
    // paddingRight: theme.spacing.xl * 4,

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

  select: {
    padding: 0,
  },

  input: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRight: 0,
  },

  control: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    height: "6.5vh",
  },

  chevron: {
    transition: "transform 200ms ease",
  },

  crowdNew: {
    // alignSelf: "self-end",
    justifyContent: "flex-end",
  },

  card: {
    height: "26vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  titleCaro: {
    fontFamily: `Merriweather, serif`,
    fontWeight: 900,
    color: "white",
    textShadow: "-0.1px 0 grey, 0 0.1px grey, 0.1px 0 grey, 0 -0.1px grey",
    lineHeight: 1.2,
    fontSize: 24,
    marginTop: theme.spacing.xs,
  },

  category: {
    color: "white",
    // opacity: 0.9,
    fontWeight: 700,
    textShadow: "-0.1px 0 grey, 0 0.1px grey, 0.1px 0 grey, 0 -0.1px grey",
    // lineHeight: 1,
    // textTransform: "uppercase",
  },

  cardWrapper: {
    height: "29vh",
  },
}));

// Defining interfaces
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

interface Area {
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
  const { classes, theme } = useStyles();
  const navigate = useNavigate();
  const { state } = useLocation();
  const carouselTheme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  // Google map library and API definition
  const [libraries] = useState<
    ("visualization" | "places" | "drawing" | "geometry" | "localContext")[]
  >(["visualization", "places"]);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries,
  });

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
  const [mapCenter, setMapCenter] = useState(center);
  const [zoomLevel, setZoomLevel] = useState(7);

  // States for saving pin infos from BE in different formats, to set markers on google map.
  const [pins, setPins] = useState<PinLocationInformation[]>([]);
  const [pinMarkers, setPinMarkers] = useState<MarkerPositions[]>([]);

  // States for saving pinId and index of current pin within the pins array state when marker on map is selected.
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [activeWindow, setActiveWindow] = useState<number | null>(null);

  // States for saving heatmap info to set heatmap on google map.
  const [heatmapData, setHeatmapData] = useState<
    google.maps.visualization.WeightedLocation[]
  >([]);
  const [crowdMapWeight, setCrowdMapWeight] = useState(0);

  // States for filtering by region, category and hashtag. Boolean to render out next row of buttons to click.
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [hashtagVisible, setHashtagVisible] = useState(false);
  const [filterRegion, setFilterRegion] = useState(0);
  const [filterCategory, setFilterCategory] = useState(0);
  const [filterHash, setFilterHash] = useState(0);

  // States for user to submit crowd data.
  const [checkIn, setCheckIn] = useState(false);
  const [crowdValue, setCrowdValue] = useState<string | null>("");
  const [errorCheckIn, setErrorCheckIn] = useState(false);
  const [successCheckIn, setSuccessCheckIn] = useState(false);
  const [newUserScore, setNewUserScore] = useState(0);

  // States for Googlemap DistanceMatrix Service. To get distances.
  const [control, setControl] = useState(true);
  const [originAddress, setOriginAddress] = useState<Position[]>();
  const [destinationAddresses, setDestinationAddresses] = useState<Position[]>(
    []
  );
  const [nearbyPlaceDist, setNearbyPlaceDist] = useState<Distance[]>([]);

  const [infoOpened, setInfoOpened] = useState(false);
  const [crowdOpened, setCrowdOpened] = useState(false);
  const [nearbyOpened, setNearbyOpened] = useState(false);
  const ChevronIcon = theme.dir === "ltr" ? IconChevronRight : IconChevronLeft;

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

  //  useEffect to set center of google map after google map is loaded. Get permissions from user to share current location.
  useEffect(() => {
    if (originalMap) {
      if (state) {
        originalMap.panTo(state.position);
        handleActiveMarker(state.pinId);
      } else {
        originalMap.panTo(center);
      }

      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, [originalMap]);

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

  // Function for api call to get all pins info and corresponding pin markers info, depending on region, category and hashtag filters. Set into states.
  const getAllInitialPins = async () => {
    if (filterRegion === 0 && filterCategory === 0) {
      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUDIENCE,
        scope: process.env.REACT_APP_SCOPE,
      });

      const response = await axios.get(`${backendUrl}/maps/allPins`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const markersRes = await axios.get(
        `${backendUrl}/maps/allPins?type=markers`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setPins(response.data);
      setPinMarkers(markersRes.data);
    } else if (filterRegion !== 0 && filterCategory === 0) {
      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUDIENCE,
        scope: process.env.REACT_APP_SCOPE,
      });

      const response = await axios.get(
        `${backendUrl}/maps/allPins?areaId=${filterRegion}`,
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
        (pin: MarkerPositions) => Number(pin.areaId) === Number(filterRegion)
      );

      setPins(response.data);
      setPinMarkers(newMarkersRes);
    } else if (filterRegion !== 0 && filterCategory !== 0 && filterHash === 0) {
      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUDIENCE,
        scope: process.env.REACT_APP_SCOPE,
      });

      const response = await axios.get(
        `${backendUrl}/maps/allPins?areaId=${filterRegion}&categoryId=${filterCategory}`,
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

      const newMarkersRes = await markersRes.data.filter(
        (pin: MarkerPositions) => Number(pin.areaId) === Number(filterRegion)
      );

      const newMarkersCatRes = newMarkersRes.filter((pin: MarkerPositions) =>
        pin.categoryId.includes(Number(filterCategory))
      );

      setPins(response.data);
      setPinMarkers(newMarkersCatRes);
    } else if (filterRegion !== 0 && filterCategory !== 0 && filterHash !== 0) {
      const accessToken = await getAccessTokenSilently({
        audience: process.env.REACT_APP_AUDIENCE,
        scope: process.env.REACT_APP_SCOPE,
      });

      const response = await axios.get(
        `${backendUrl}/maps/allPins?areaId=${filterRegion}&categoryId=${filterCategory}&hashtagId=${filterHash}`,
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

  useEffect(() => {
    getAllInitialPins();
  }, [filterRegion, filterCategory, filterHash, checkIn]);

  // Function to call within googlemaps distance matrix service, to process the response provided back from matrix service.
  // Obtains 3 closest places with same category to the selected pin. Allows displaying of the data of those places. Renders pin data, 3 posts and 3 latest crowd data of pin as JSX.
  const displayNearbyPlaces = () => {
    if (nearbyPlaceDist.length !== 0) {
      const infoToReturn = nearbyPlaceDist.map((place, j) => {
        //place.position is the index within destination address

        console.log(destinationAddresses[place.position]);
        //this gives me lat long of each place.

        const originalPin: PinLocationInformation | undefined = pins.find(
          (pin) => pin.lat === destinationAddresses[place.position].lat
        );

        console.log(originalPin);

        if (originalPin) {
          const allCrowds = originalPin.crowds.slice(0, 1).map((crowd, i) => {
            const { crowdIntensity, crowdSize, recordedAt } = crowd;
            return (
              <>
                {/* <Text className={classes.category} transform="uppercase">
                  {crowdIntensity}
                </Text> */}

                <Text
                  className={classes.category}
                  size="xs"
                  transform="uppercase"
                >
                  {crowdSize}
                </Text>
                <Text className={classes.category} size="xs" color="dimmed">
                  {new Date(recordedAt).toLocaleString()}{" "}
                </Text>
              </>
            );
          });

          const allPostsHashCat = originalPin.posts.map((post, i) => {
            if (i < 1) {
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
              const allHashtags = postHashtags.map((hashtag, i) => {
                const { hashtagId } = hashtag;
                if (i < 2) {
                  return (
                    <Badge
                      variant="gradient"
                      gradient={{ from: "purple", to: "beige" }}
                      key={hashtagId}
                    >
                      {allAvailableHashtags[hashtagId - 1].name}
                    </Badge>
                  );
                }
              });

              return (
                <>
                  {allCategories} &nbsp;
                  {/* <br /> */}
                  {allHashtags}
                </>
              );
            } else return null;
          });

          // const allPosts = originalPin.posts.map((post, i) => {
          //   if (i < 3) {
          //     return (
          //       <Card key={post.title}>
          //         {/* {allCategories}
          //         <br />
          //         {allHashtags} */}
          //         <Text>Title: {post.title}</Text>
          //         <Text>
          //           Posted: {new Date(post.createdAt).toLocaleDateString()}
          //         </Text>
          //         <Text>{post.content}</Text>
          //         <Anchor
          //           href={post.externalLink}
          //           target="_blank"
          //           rel="noopener noreferrer"
          //         >
          //           <img src={post.photoLink} alt={post.title} height={400} />
          //         </Anchor>
          //         <Text>Likes: {post.likeCount}</Text>
          //       </Card>
          //     );
          //   } else return null;
          // });

          return (
            <Carousel.Slide
              key={originalPin.placeName}
              className={classes.cardWrapper}
            >
              <Card
                className={classes.cardWrapper}
                component="a"
                href={originalPin.posts[0].externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Paper
                  // shadow="md"
                  p="xl"
                  radius="md"
                  sx={{
                    backgroundImage: `url(${originalPin.posts[0].photoLink})`,
                    // height: "26vh",
                  }}
                  className={classes.card}
                >
                  <div>
                    {/* <Text className={classes.category} size="xs">
                      {category}
                    </Text> */}
                    {allPostsHashCat}
                    <Title order={3} className={classes.titleCaro}>
                      {originalPin.placeName}
                    </Title>
                    <Text className={classes.category} size="sm">
                      {(nearbyPlaceDist[j].distance / 1000).toFixed(3)}Km away
                    </Text>
                  </div>
                  {/* <Button variant="white" color="dark">
                    Read more
                  </Button> */}
                  {/* <br /> */}
                  {allCrowds}
                </Paper>
                {/* <Text>
                  {(nearbyPlaceDist[j].distance / 1000).toFixed(3)}km away //{" "}
                </Text>
                <Text>{originalPin.placeName}</Text>{" "}
                <Text>
                  {allAvailableAreas[originalPin.areaId - 1].prefecture}{" "}
                </Text>
                <Text>LATEST CROWD ESTIMATES</Text>
                {allCrowds}
                {allPosts} */}
              </Card>
            </Carousel.Slide>

            // <div key={originalPin.placeName}>
            //   <Text>
            //     {(nearbyPlaceDist[j].distance / 1000).toFixed(3)}km away
            //   </Text>
            //   <Text>{originalPin.placeName}</Text>
            //   <Text>
            //     {allAvailableAreas[originalPin.areaId - 1].prefecture}
            //   </Text>
            //   <Text>LATEST CROWD ESTIMATES</Text>
            //   {allCrowds}
            //   {allPosts}
            // </div>
          );
        }
      });

      return (
        <Carousel
          slideSize="100%"
          breakpoints={[{ maxWidth: "sm", slideSize: "26vw", slideGap: "md" }]}
          slideGap="xl"
          align="start"
          slidesToScroll={1}
          height="30vh"
          sx={{ maxWidth: "26vw" }}
          loop
          orientation="vertical"
          controlsOffset="xs"
          // withIndicators
          // styles={{
          //   indicator: {
          //     width: 4,
          //     height: 12,
          //     transition: "height 250ms ease",

          //     "&[data-active]": {
          //       height: 40,
          //     },
          //   },
          // }}
        >
          {infoToReturn.length === nearbyPlaceDist.length && infoToReturn}
        </Carousel>
      );
    }
  };

  // Function that resets map markers, map center, closest distance pins, and sets new region ids, category ids and hashtag ids into state accordingly.
  const handleFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { id, name } = event.currentTarget;

    setActiveMarker(null);
    setActiveWindow(null);
    setHeatmapData([{ location: null, weight: 0 }]);
    setCrowdMapWeight(0);
    setMapCenter(center);
    setZoomLevel(7);
    setSuccessCheckIn(false);

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

        if (originalMap) {
          if (areaId === 1) {
            originalMap.panTo(tokyo);
          } else if (areaId === 2) {
            originalMap.panTo(hokkaido);
          } else {
            originalMap.panTo(osaka);
          }
        }
      } else if (filterRegion === areaId) {
        setCategoryVisible(false);
        setFilterRegion(0);
        if (originalMap) {
          originalMap.panTo(center);
        }
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

  // Renders out area buttons for further filters.
  const listAreas = allAvailableAreas.map((area: Area, index) => (
    <Carousel.Slide key={area.id}>
      <Button
        uppercase
        variant={filterRegion === area.id ? "gradient" : "light"}
        gradient={{ from: "aqua.5", to: "aqua.3", deg: 105 }}
        compact
        radius="md"
        size="sm"
        color="aqua"
        id={`${area.id}`}
        name="prefecture"
        onClick={handleFilter}
      >
        {area.prefecture}
      </Button>
    </Carousel.Slide>
  ));

  // Renders out category buttons for further filters.
  const listCategories = allAvailableCategories.map(
    (category: Category, index) => (
      <Carousel.Slide key={category.id}>
        <Button
          uppercase
          disabled={!categoryVisible ? true : false}
          compact
          radius="md"
          size="sm"
          variant={category.id === filterCategory ? "gradient" : "light"}
          gradient={{ from: "blue.5", to: "blue.3", deg: 105 }}
          color="blue"
          key={index}
          id={`${category.id}`}
          name="category"
          onClick={handleFilter}
        >
          {category.name}
        </Button>
      </Carousel.Slide>
    )
  );

  // Renders out hashtag buttons for further filters.
  const listHashtags = allAvailableHashtags.map((hashtag: Hashtag, index) => (
    <Carousel.Slide key={hashtag.id}>
      <Button
        uppercase
        disabled={!hashtagVisible ? true : false}
        compact
        radius="md"
        size="sm"
        variant={hashtag.id === filterHash ? "gradient" : "light"}
        gradient={{ from: "purple.5", to: "purple.3", deg: 105 }}
        color="purple"
        key={index}
        id={`${hashtag.id}`}
        name="hashtag"
        onClick={handleFilter}
      >
        {hashtag.name}
      </Button>
    </Carousel.Slide>
  ));

  // Function for obtaining info of pin that is selected on map. Centers the map, obtains crowd data of pin, renders on map. Sets state with all other pin infos for google maps matrix service to calculate nearest pins.
  const handleActiveMarker = async (marker: number) => {
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

    if (originalMap) {
      originalMap.panTo(pinMarkers[realIndex].position);
    }

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
  console.log(nearbyPlaceDist);

  // Function to obtain info of current selected pin.
  // Obtains 3 closest places with same category to the selected pin. Allows displaying of the data of those places. Renders pin data, 3 posts and 3 latest crowd data of pin as JSX.
  const findPinInfo = () => {
    if (activeMarker !== null && activeWindow !== null) {
      // const index = pins.findIndex((item) => item.id === activeMarker);

      //activemarker is the id.
      const realIndex = pins.findIndex((item) => item.id === activeMarker);

      const { posts } = pins[realIndex];

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
            <div key={post.title}>
              {/* <Card key={post.title}> */}
              {allCategories}
              <br />
              {allHashtags}
              <br />
              <br />
              <Anchor
                href={post.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div
                  style={{
                    width: "26vw",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <Image radius="md" src={post.photoLink} alt={post.title} />
                </div>
                {/* <img src={post.photoLink} alt={post.title} width="100%" /> */}
              </Anchor>
              <Text align="right">
                <Heart color="red" />
                {post.likeCount}
              </Text>
              <Text transform="uppercase">{post.title}</Text>
              <Text color="dimmed" size="xs">
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
              <Text size="sm">{post.content}</Text>

              {/* </Card> */}
            </div>
          );
        } else return null;
      });

      return (
        <div key={pinMarkers[activeWindow].name}>
          <br />
          <Button
            color="greyBlue"
            onClick={handleCheckIn}
            rightIcon={<IconUserCheck />}
          >
            EARN 10 POINTS
          </Button>
          <br />
          <br />
          <Text transform="uppercase">{pinMarkers[activeWindow].name}</Text>
          <Text color="dimmed" size="xs">
            {
              pins[Number(pins.findIndex((item) => item.id === activeMarker))]
                .area.prefecture
            }
          </Text>

          {allPosts}
        </div>
      );
    }
  };

  const findPinCrowd = () => {
    if (activeMarker !== null && activeWindow !== null) {
      // const index = pins.findIndex((item) => item.id === activeMarker);

      //activemarker is the id.
      const realIndex = pins.findIndex((item) => item.id === activeMarker);

      const { crowds } = pins[realIndex];

      const allCrowds = crowds.slice(0, 3).map((crowd, i) => {
        const { crowdIntensity, crowdSize, recordedAt } = crowd;
        return (
          <>
            <Card key={new Date(recordedAt).toLocaleString()}>
              <Text size="md" transform="uppercase">
                {crowdIntensity}
              </Text>
              <Text size="sm" transform="capitalize">
                {crowdSize}
              </Text>
              <Text color="dimmed" size="xs">
                {new Date(recordedAt).toLocaleString()}{" "}
              </Text>
            </Card>
          </>
        );
      });

      return <div key={pinMarkers[activeWindow].name}>{allCrowds}</div>;
    }
  };

  console.log(pinMarkers);
  console.log(pins);

  // Function to reset states when pin is unselected on map.
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
    setSuccessCheckIn(false);
  };

  // Function to remove instance of heatmap on googlemaps when unneeded.
  const onUnmount = () => {
    setHeatmapData([{ location: null, weight: 0 }]);
    setCrowdMapWeight(0);
  };

  // Function that handles user when user clicks check in. Sets states for jsx to render
  const handleCheckIn = () => {
    setCheckIn(!checkIn);
    setErrorCheckIn(false);
    setSuccessCheckIn(false);
  };

  console.log(checkIn);
  console.log(activeWindow);

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

  // Function triggered when user clicks submit crowd data. Checks if user selected check in with location or check in without location.
  // If with location, checks if user is within 100m of the pin. If no, send error banner. If yes, create data within BE, and update score of user.
  // If without location, create data within BE, and update score of user.
  const handleSubmitCrowd: React.MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    console.log(e.currentTarget.name);

    if (e.currentTarget.name === "with location") {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });

      if (currentPosition && originAddress) {
        const distanceFromPoint = calcDistanceTwoPoints(
          currentPosition,
          originAddress[0]
        );

        if (distanceFromPoint <= 100) {
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
            `${backendUrl}/maps/${activeMarker}/createCrowdData`,
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
    } else {
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
        `${backendUrl}/maps/${activeMarker}/createCrowdData`,
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
    }
  };

  return (
    <>
      <Space h="lg" />
      <SimpleGrid cols={3} spacing="md">
        <div>
          <Group noWrap spacing="xs">
            <Box
              sx={(theme) => ({
                textAlign: "center",
                padding: "2px",
                // backgroundColor: "blue",
                // borderRadius: theme.radius.md,
              })}
            >
              <Text size="xs" color="dimmed" align="center">
                Choose 1 of 47 Prefectures
              </Text>
              <Space h="xs" />
              {allAvailableAreas && allAvailableAreas.length ? (
                <Center>
                  <Carousel
                    sx={{ width: "31vw" }}
                    height={30}
                    loop
                    slideGap="xs"
                    slidesToScroll={3}
                    slideSize="20%"
                    controlsOffset={0}
                    controlSize={14}
                  >
                    {listAreas}
                  </Carousel>
                </Center>
              ) : (
                <Loader />
              )}
            </Box>
            <Divider size="sm" orientation="vertical" />
          </Group>
        </div>

        <div>
          <Group noWrap spacing="xs">
            <Box
              sx={(theme) => ({
                textAlign: "center",
                padding: "2px",
                // backgroundColor: "blue",
                // borderRadius: theme.radius.md,
              })}
            >
              <Text size="xs" color="dimmed" align="center">
                Categories
              </Text>
              <Space h="xs" />
              {allAvailableCategories && allAvailableCategories.length ? (
                <Center>
                  <Carousel
                    sx={{ width: "31vw" }}
                    height={30}
                    loop
                    slideGap="xs"
                    slidesToScroll={3}
                    slideSize="20%"
                    controlsOffset={0}
                    controlSize={14}
                    align="start"
                  >
                    {listCategories}
                  </Carousel>
                </Center>
              ) : (
                <Loader />
              )}
            </Box>
            <Divider size="sm" orientation="vertical" />
          </Group>
        </div>

        <div>
          <Group noWrap spacing="xs">
            <Box
              sx={(theme) => ({
                textAlign: "center",
                padding: "2px",
                // backgroundColor: "blue",
                // borderRadius: theme.radius.md,
              })}
            >
              <Text size="xs" color="dimmed" align="center">
                Hashtags
              </Text>
              <Space h="xs" />
              {allAvailableHashtags && allAvailableHashtags.length ? (
                <Carousel
                  sx={{ width: "31vw" }}
                  height={30}
                  loop
                  slideGap="xs"
                  slidesToScroll={3}
                  slideSize="20%"
                  controlsOffset={0}
                  controlSize={14}
                >
                  {listHashtags}
                </Carousel>
              ) : (
                <Loader />
              )}
            </Box>
            <Divider size="sm" orientation="vertical" />
          </Group>
        </div>
      </SimpleGrid>

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
      {activeWindow !== null && successCheckIn ? (
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
      {checkIn && activeWindow !== null ? (
        <>
          {console.log("this is running")}
          <Modal
            opened={checkIn}
            onClose={() => setCheckIn(false)}
            radius="md"
            size="auto"
            withCloseButton={false}
            // centered
          >
            <div className={classes.wrapper}>
              <div className={classes.body}>
                <Text weight={500} size="lg" mb={5}>
                  At {pinMarkers[activeWindow].name} and want to check in?
                </Text>
                <Text size="sm" color="dimmed">
                  Earn 10 points if you provide your feedback and help the
                  community!
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
                    <Button onClick={handleSubmitCrowd} name="with location">
                      <IconUserCheck />
                    </Button>
                  </Group>
                  <br />
                  <Button
                    className={classes.control}
                    onClick={handleSubmitCrowd}
                    name="without location"
                  >
                    Check In Without Location
                  </Button>
                </div>
              </div>
              {/* <Image src={image.src} className={classes.image} /> */}
            </div>
          </Modal>
        </>
      ) : // <Container fluid>
      // </Container>
      null}
      {isLoaded && pinMarkers.length > 0 ? (
        <>
          {/* <Container style={{ width: "100%" }}> */}
          <Grid
            // grow
            gutter="md"
            style={{
              width: "100%",
              margin: "-8px 0px",
              justifyContent: "center",
            }}
          >
            <Box
              sx={(theme) => ({
                // minHeight: 250,
                padding: theme.spacing.md,
                // backgroundColor:
                //   theme.colorScheme === "dark"
                //     ? theme.colors.dark[6]
                //     : theme.white,
                // borderRadius: theme.radius.lg,
                // boxShadow: theme.shadows.lg,
                display: "flex",
                width: "95vw",
                // flexDirection: "column",
                // justifyContent: "space-between",
              })}
            >
              <Grid.Col span={8}>
                <GoogleMap
                  onClick={() => {
                    handleResetMarker();
                    // if (e.latLng && e.latLng.lat && e.latLng?.lng) {
                    //   console.log("lat", e.latLng.lat());
                    //   console.log("lng", e.latLng.lng());
                    // }
                  }}
                  center={mapCenter}
                  onLoad={(map) => setOriginalMap(map)}
                  zoom={zoomLevel}
                  mapContainerStyle={{ width: "60vw", height: "70vh" }}
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
                            const nearbyDistanceObjects =
                              res.rows[0].elements.map((place, index) => {
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
                                  (pin) => pin.position === originAddress[0]
                                );

                                // Checks if the response object has common category as the current pin info. Checks if category filter is in place. If category filter in place, filters by set category instead.
                                if (originPin && distancePin) {
                                  if (filterCategory !== 0) {
                                    if (
                                      distancePin.categoryId.includes(
                                        filterCategory
                                      )
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
                                          distancePin.categoryId.includes(
                                            category
                                          )
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
                              });

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

                  {/* MARKERS FOR ALL PINS WITHIN STATE. CHECKS IF CATEGORY FILTER IS SET. */}
                  {pinMarkers.map((element, index) => {
                    const { id, name, position, categoryId } = element;

                    if (categoryId.length > 1) {
                      if (filterCategory !== 0) {
                        const arrayOfMarkers = categoryId.map(
                          (category, index) => {
                            let markerIcon = "";

                            if (category === filterCategory) {
                              if (category === 1) {
                                markerIcon =
                                  "https://tabler-icons.io/static/tabler-icons/icons-png/soup.png";
                              } else if (category === 2) {
                                markerIcon =
                                  "https://tabler-icons.io/static/tabler-icons/icons-png/camera.png";
                              } else if (category === 3) {
                                markerIcon =
                                  "https://tabler-icons.io/static/tabler-icons/icons-png/building-skyscraper.png";
                              } else if (category === 4) {
                                markerIcon =
                                  "https://tabler-icons.io/static/tabler-icons/icons-png/shopping-cart.png";
                              } else {
                                markerIcon =
                                  "https://tabler-icons.io/static/tabler-icons/icons-png/camera.png";
                              }

                              return (
                                <MarkerF
                                  key={`${id} ${category}`}
                                  icon={{
                                    url: `${markerIcon}`,
                                    scaledSize: new google.maps.Size(30, 30),
                                    // scale: 0.0005,
                                  }}
                                  // icon={markerIcon}
                                  position={{
                                    lat: position.lat + index * 0.0001,
                                    lng: position.lng + index * 0.0001,
                                  }}
                                  // position={position}
                                  onClick={() => handleActiveMarker(id)}
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
                          }
                        );

                        return arrayOfMarkers.map((marker) => marker);
                      } else {
                        const arrayOfMarkers = categoryId.map(
                          (category, index) => {
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
                            } else if (category === 4) {
                              markerIcon =
                                "https://tabler-icons.io/static/tabler-icons/icons-png/shopping-cart.png";
                            } else {
                              markerIcon =
                                "https://tabler-icons.io/static/tabler-icons/icons-png/camera.png";
                            }

                            return (
                              <MarkerF
                                key={`${id} ${category}`}
                                icon={{
                                  url: `${markerIcon}`,
                                  scaledSize: new google.maps.Size(30, 30),
                                  // scale: 0.0005,
                                }}
                                // icon={markerIcon}
                                position={{
                                  lat: position.lat + index * 0.0001,
                                  lng: position.lng + index * 0.0001,
                                }}
                                // position={position}
                                onClick={() => handleActiveMarker(id)}
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
                        );

                        return arrayOfMarkers.map((marker) => marker);
                      }
                    } else {
                      let markerIcon = "";
                      if (categoryId[0] === 1) {
                        markerIcon =
                          "https://tabler-icons.io/static/tabler-icons/icons-png/soup.png";
                      } else if (categoryId[0] === 2) {
                        markerIcon =
                          "https://tabler-icons.io/static/tabler-icons/icons-png/camera.png";
                      } else if (categoryId[0] === 3) {
                        markerIcon =
                          "https://tabler-icons.io/static/tabler-icons/icons-png/building-skyscraper.png";
                      } else if (categoryId[0] === 4) {
                        markerIcon =
                          "https://tabler-icons.io/static/tabler-icons/icons-png/shopping-cart.png";
                      } else {
                        markerIcon =
                          "https://tabler-icons.io/static/tabler-icons/icons-png/camera.png";
                      }

                      return (
                        <MarkerF
                          key={id}
                          icon={{
                            url: `${markerIcon}`,
                            // scale: 0.0005,
                            scaledSize: new google.maps.Size(30, 30),
                          }}
                          // icon={markerIcon}
                          position={position}
                          onClick={() => handleActiveMarker(id)}
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
              </Grid.Col>
              <Grid.Col span={4}>
                <Box
                  sx={(theme) => ({
                    minHeight: "9vh",
                    padding: theme.spacing.md,
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : theme.white,
                    borderRadius: theme.radius.lg,
                    boxShadow: theme.shadows.xs,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    maxWidth: "31vw",
                  })}
                >
                  <UnstyledButton
                    disabled={activeWindow === null}
                    onClick={() => {
                      setInfoOpened((o) => !o);
                      setCrowdOpened(false);
                      setNearbyOpened(false);
                    }}
                    className={classes.control}
                  >
                    <Group position="apart" spacing={0}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ThemeIcon variant="light" size={40}>
                          <IconMapPin size={25} />
                        </ThemeIcon>
                        <Box ml="md">
                          <Title order={5}>INFORMATION</Title>
                        </Box>
                      </Box>
                      <ChevronIcon
                        className={classes.chevron}
                        size={20}
                        stroke={1.5}
                        style={{
                          transform: infoOpened
                            ? `rotate(${theme.dir === "rtl" ? -90 : 90}deg)`
                            : "none",
                        }}
                      />
                    </Group>
                  </UnstyledButton>
                  <Collapse in={infoOpened}>
                    <ScrollArea style={{ height: "30vh" }} offsetScrollbars>
                      {findPinInfo()}
                    </ScrollArea>
                  </Collapse>
                </Box>

                <br />

                <Box
                  sx={(theme) => ({
                    minHeight: "9vh",
                    padding: theme.spacing.md,
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : theme.white,
                    borderRadius: theme.radius.lg,
                    boxShadow: theme.shadows.xs,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    maxWidth: "31vw",
                  })}
                >
                  <UnstyledButton
                    disabled={activeWindow === null}
                    onClick={() => {
                      setCrowdOpened((o) => !o);
                      setInfoOpened(false);
                      setNearbyOpened(false);
                    }}
                    className={classes.control}
                  >
                    <Group position="apart" spacing={0}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ThemeIcon variant="light" size={40}>
                          <IconFriends size={25} />
                        </ThemeIcon>
                        <Box ml="md">
                          <Title order={5}>LATEST CROWDS</Title>
                        </Box>
                      </Box>
                      <ChevronIcon
                        className={classes.chevron}
                        size={20}
                        stroke={1.5}
                        style={{
                          transform: crowdOpened
                            ? `rotate(${theme.dir === "rtl" ? -90 : 90}deg)`
                            : "none",
                        }}
                      />
                    </Group>
                  </UnstyledButton>
                  <Collapse in={crowdOpened}>
                    <ScrollArea style={{ height: "30vh" }} offsetScrollbars>
                      {findPinCrowd()}
                    </ScrollArea>
                  </Collapse>
                </Box>

                <br />

                <Box
                  sx={(theme) => ({
                    minHeight: "9vh",
                    padding: theme.spacing.md,
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : theme.white,
                    borderRadius: theme.radius.lg,
                    boxShadow: theme.shadows.xs,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    maxWidth: "31vw",
                  })}
                >
                  <UnstyledButton
                    disabled={!(nearbyPlaceDist.length > 0)}
                    onClick={() => {
                      setNearbyOpened((o) => !o);
                      setCrowdOpened(false);
                      setInfoOpened(false);
                    }}
                    className={classes.control}
                  >
                    <Group position="apart" spacing={0}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ThemeIcon variant="light" size={40}>
                          <IconMapPins size={25} />
                        </ThemeIcon>
                        <Box ml="md">
                          <Title order={5}>SIMILAR NEARBY</Title>
                        </Box>
                      </Box>
                      <ChevronIcon
                        className={classes.chevron}
                        size={20}
                        stroke={1.5}
                        style={{
                          transform: nearbyOpened
                            ? `rotate(${theme.dir === "rtl" ? -90 : 90}deg)`
                            : "none",
                        }}
                      />
                    </Group>
                  </UnstyledButton>
                  <Collapse in={nearbyOpened}>
                    <ScrollArea style={{ height: "30vh" }}>
                      {/* <br /> */}
                      {displayNearbyPlaces()}
                    </ScrollArea>
                  </Collapse>
                </Box>
              </Grid.Col>
            </Box>
          </Grid>
          {/* </Container> */}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}
