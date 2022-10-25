import React, { MouseEvent, useState } from "react";

import { DisplayPostCard } from "./HomePageInterface";

import {
  Card,
  Text,
  Group,
  Badge,
  ActionIcon,
  createStyles,
  UnstyledButton,
  Image,
  ScrollArea,
  Paper,
} from "@mantine/core";

import { Heart, HeartOutline, Star, StarOutline } from "@easy-eva-icons/react";

const useStyles = createStyles((theme, _params, getRef) => {
  const image = getRef("image");

  return {
    card: {
      position: "relative",
      height: "60vh",
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],

      [`&:hover .${image}`]: {
        transform: "scale(1.03)",
      },
    },

    rating: {
      position: "absolute",
      top: "0",
      right: "0",
      pointerEvents: "none",
      zIndex: 100,
    },

    image: {
      ref: image,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundSize: "fit",
      transition: "transform 500ms ease",
    },

    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        "linear-gradient(180deg,   rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, .8) 75%)",
    },

    content: {
      height: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      zIndex: 2,
    },

    centerImage: {
      height: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      zIndex: 1,
    },

    title: {
      color: theme.white,
      marginBottom: 5,
      zIndex: 99,
    },

    bodyText: {
      color: theme.colors.dark[2],
      marginLeft: 7,
    },

    author: {
      color: theme.colors.dark[2],
    },

    action: {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      ...theme.fn.hover({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[5]
            : theme.colors.gray[1],
      }),
    },
  };
});

export default function DisplayPost({
  id,
  photoLink,
  title,
  content,
  explorePost,
  likeCount,
  userFavourite,
  userLike,
  likePost,
  favouritePost,
}: DisplayPostCard) {
  const { classes, theme } = useStyles();
  const [showContent, setShowContent] = useState<boolean>(false);

  return (
    <Card p="lg" shadow="lg" className={classes.card} radius="md">
      <div
        className={classes.image}
        style={{ backgroundImage: `url(${photoLink})` }}
      />

      <div className={classes.overlay} />

      <div className={classes.content}>
        <div className={classes.centerImage}>
          <UnstyledButton onClick={() => setShowContent(!showContent)}>
            {!showContent ? (
              <Image height="50vh" fit="contain" radius="md" src={photoLink} />
            ) : (
              <Paper p="lg" radius="md">
                <ScrollArea
                  style={{ height: 275 }}
                  type="scroll"
                  scrollHideDelay={500}
                >
                  <Text align="center" size="md">
                    {content}
                  </Text>
                </ScrollArea>
              </Paper>
            )}
          </UnstyledButton>
        </div>
        <div>
          <Badge
            className={classes.rating}
            variant="gradient"
            gradient={{ from: "yellow", to: "red" }}
          >
            {explorePost}
          </Badge>

          <Text align="center" size="md" className={classes.title} weight={500}>
            {title}
          </Text>

          {/* BOTTOM ICONS GROUP */}

          <Group position="center" spacing="xs">
            <ActionIcon
              variant="outline"
              onClick={(event: MouseEvent<HTMLButtonElement>) =>
                favouritePost(event, id)
              }
              color="yellow"
            >
              {userFavourite ? <Star /> : <StarOutline />}
            </ActionIcon>
            <ActionIcon
              variant="outline"
              color="red"
              onClick={(event: MouseEvent<HTMLButtonElement>) =>
                likePost(event, id)
              }
            >
              {userLike ? <Heart /> : <HeartOutline />}
            </ActionIcon>
          </Group>
        </div>
      </div>
    </Card>
  );
}
