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

  // Function to call within googlemaps distance matrix service, to process the response provided back from matrix service.
  // Obtains closest place with same category to the current pin. Allows displaying of the data of that place. Renders pin data, post and crowd data of pin as JSX.
  const displayNearbyPlaces = () => {
    const infoToReturn = nearbyPlaceDist.map((place, j) => {
      const originalPin: PinLocationInformation | undefined = pins.find(
        (pin) => pin.lat === destinationAddresses[place.position].lat
      );

      if (originalPin) {
        const allCrowds = originalPin.crowds.slice(0, 1).map((crowd, i) => {
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
            <Text key={originalPin.lat}>
              {originalPin.placeName}:
              {(nearbyPlaceDist[j].distance / 1000).toFixed(3)}KM away{" "}
            </Text>
            {/* <Text>
                {allAvailableAreas[originalPin.areaId - 1].prefecture}
              </Text> */}
            <Text>LATEST CROWD ESTIMATE</Text>
            {allCrowds}
            {/* {allPosts} */}
          </div>
        );
      }
    });

    return infoToReturn;
  };

  return <>{displayNearbyPlaces()}</>;
}
