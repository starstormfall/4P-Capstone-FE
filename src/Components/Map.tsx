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
import { useNavigate, Link } from "react-router-dom";
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
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import axios from "axios";
import { addAbortSignal } from "stream";

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
  // TO DO ADDITION OF POINTS WHEN CHECK IN
  const { classes } = useStyles();
  const navigate = useNavigate();

  // Google map library and API definition
  const [libraries] = useState<
    ("visualization" | "places" | "drawing" | "geometry" | "localContext")[]
  >(["visualization", "places"]);
  const { userId } = UseApp();
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

  // States for Googlemap DistanceMatrix Service. To get distances.
  const [control, setControl] = useState(true);
  const [originAddress, setOriginAddress] = useState<Position[]>();
  const [destinationAddresses, setDestinationAddresses] = useState<Position[]>(
    []
  );
  const [nearbyPlaceDist, setNearbyPlaceDist] = useState<Distance[]>([]);

  // Marker style for current location of user based on GPS. Requires google map instance to be loaded.
  let blueDot;
  if (isLoaded) {
    blueDot = {
      fillColor: "purple",
      fillOpacity: 1,
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      strokeColor: "beige",
      strokeWeight: 3,
    };
  }

  //  useEffect to set center of google map after google map is loaded. Get permissions from user to share current location.
  useEffect(() => {
    if (originalMap) {
      originalMap.panTo(center);
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
          const allCrowds = originalPin.crowds.slice(0, 3).map((crowd, i) => {
            const { crowdIntensity, crowdSize, recordedAt } = crowd;
            return (
              <>
                <Card key={new Date(recordedAt).toLocaleString()}>
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
                <Card key={post.title}>
                  {allCategories}
                  <br />
                  {allHashtags}
                  <Text>Title: {post.title}</Text>
                  <Text>
                    Posted: {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                  <Text>{post.content}</Text>
                  <Anchor
                    href={post.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={post.photoLink} alt={post.title} height={400} />
                  </Anchor>
                  <Text>Likes: {post.likeCount}</Text>
                </Card>
              );
            } else return null;
          });

          return (
            <div key={originalPin.placeName}>
              <Text>
                {(nearbyPlaceDist[j].distance / 1000).toFixed(3)}km away
              </Text>
              <Text>{originalPin.placeName}</Text>
              <Text>
                {allAvailableAreas[originalPin.areaId - 1].prefecture}
              </Text>
              <Text>LATEST CROWD ESTIMATES</Text>
              {allCrowds}
              {allPosts}
            </div>
          );
        }
      });

      return infoToReturn;
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

  // Renders out category buttons for further filters.
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

  // Renders out hashtag buttons for further filters.
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

  // Function for obtaining info of pin that is selected on map. Centers the map, obtains crowd data of pin, renders on map. Sets state with all other pin infos for google maps matrix service to calculate nearest pins.
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

      const { crowds, posts } = pins[realIndex];

      const allCrowds = crowds.slice(0, 3).map((crowd, i) => {
        const { crowdIntensity, crowdSize, recordedAt } = crowd;
        return (
          <>
            <Card key={new Date(recordedAt).toLocaleString()}>
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
            <Card key={post.title}>
              {allCategories}
              <br />
              {allHashtags}
              <Text>Title: {post.title}</Text>
              <Text>
                Posted: {new Date(post.createdAt).toLocaleDateString()}
              </Text>
              <Text>{post.content}</Text>
              <Anchor
                href={post.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={post.photoLink} alt={post.title} height={400} />
              </Anchor>
              <Text>Likes: {post.likeCount}</Text>
            </Card>
          );
        } else return null;
      });

      return (
        <div key={pinMarkers[activeWindow].name}>
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
            CHECK IN FOR XX POINTS
          </Button>
          <br />
          {allPosts}
        </div>
      );
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

  // Function triggered when user clicks submit crowd data. Checks if user selected check in with location or check in without location.
  // If with location, checks if user is within 100m of the pin. If no, send error banner. If yes, create data within BE.
  // If without location, create data within BE.
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

          await axios.post(
            `${backendUrl}/maps/${activeMarker}/createCrowdData`,
            objectBody
          );

          setCrowdValue("");
          setCheckIn(false);
        } else {
          setErrorCheckIn(true);
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

      await axios.post(
        `${backendUrl}/maps/${activeMarker}/createCrowdData`,
        objectBody
      );

      setCrowdValue("");
      setCheckIn(false);
    }
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
            onLoad={(map) => setOriginalMap(map)}
            zoom={zoomLevel}
            mapContainerStyle={{ width: "70vw", height: "80vh" }}
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
              {errorCheckIn ? (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Bummer!"
                  color="aqua"
                >
                  You are not within the vicinity of the place you are trying to
                  check in at! Please move closer and try again
                </Alert>
              ) : null}
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
                      name="with location"
                    >
                      Check In With Location for XX more Points
                    </Button>
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
            </>
          ) : null}
          {activeWindow !== null ? (
            <>
              <Card>{findPinInfo()}</Card>
            </>
          ) : null}
          {nearbyPlaceDist.length > 0 ? (
            <Text>NEARBY SIMILAR PLACES OF INTEREST</Text>
          ) : null}
          {nearbyPlaceDist.length > 0 ? displayNearbyPlaces() : null}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}
