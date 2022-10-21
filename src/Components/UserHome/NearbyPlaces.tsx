import React, { useEffect, useState } from "react";
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
import {
  Category,
  Hashtag,
  Position,
  Distance,
  PinLocationInformation,
  Area,
} from "./HomePageInterface";

const useStyles = createStyles((theme) => ({
  titleCaro: {
    lineHeight: 1.2,
    marginTop: theme.spacing.sm,
  },
}));

// Defining interfaces
interface Props {
  nearbyPlaceDist: Distance[];
  pins: PinLocationInformation[];
  destinationAddresses: Position[];
  allAvailableCategories: Category[];
  allAvailableHashtags: Hashtag[];
  allAvailableAreas: Area[];
}

export default function NearbyPlaces(props: Props) {
  const {
    nearbyPlaceDist,
    pins,
    destinationAddresses,
    allAvailableCategories,
    allAvailableHashtags,
  } = props;
  // States for loading all prefectures, categories and hashtags.

  const { classes } = useStyles();

  // Function to call within googlemaps distance matrix service, to process the response provided back from matrix service.
  // Obtains closest place with same category to the current pin. Allows displaying of the data of that place. Renders pin data, post and crowd data of pin as JSX.
  const displayNearbyPlaces = () => {
    const infoToReturn = nearbyPlaceDist.map((place, j) => {
      const originalPin: PinLocationInformation | undefined = pins.find(
        (pin) => pin.lat === destinationAddresses[place.position].lat
      );

      if (originalPin) {
        const allCrowds = originalPin.crowds.slice(0, 2).map((crowd, i) => {
          const { crowdIntensity, crowdSize, recordedAt } = crowd;
          return (
            <>
              <Text size="sm" transform="uppercase">
                {crowdSize}
              </Text>
              <Text size="xs" color="dimmed">
                {new Date(recordedAt).toLocaleString()}{" "}
              </Text>
            </>
          );
        });

        // const allPosts = originalPin.posts.map((post, i) => {
        //   if (i < 3) {
        //     const { postCategories, postHashtags } = post;
        //     const allCategories = postCategories.map((category) => {
        //       const { categoryId } = category;
        //       return (
        //         <Badge
        //           variant="gradient"
        //           gradient={{ from: "aqua", to: "purple" }}
        //           key={categoryId}
        //         >
        //           {allAvailableCategories[categoryId - 1].name.toUpperCase()}
        //         </Badge>
        //       );
        //     });
        //     const allHashtags = postHashtags.map((hashtag) => {
        //       const { hashtagId } = hashtag;
        //       return (
        //         <Badge
        //           variant="gradient"
        //           gradient={{ from: "purple", to: "beige" }}
        //           key={hashtagId}
        //         >
        //           {allAvailableHashtags[hashtagId - 1].name}
        //         </Badge>
        //       );
        //     });

        //     return (
        //       <Card key={post.title}>
        //         {allCategories}
        //         <br />
        //         {allHashtags}
        //         <Text>Title: {post.title}</Text>
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
          <Card key={originalPin.placeName}>
            <Text size="lg">{originalPin.placeName}</Text>
            <Text key={originalPin.lat} size="sm" color="dimmed">
              ({(nearbyPlaceDist[j].distance / 1000).toFixed(2)}km away)
            </Text>

            {allCrowds}
          </Card>
        );
      }
    });

    return infoToReturn;
  };

  return <>{displayNearbyPlaces()}</>;
}
