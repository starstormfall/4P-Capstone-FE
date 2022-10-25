import React, { MouseEvent, useState } from "react";

import { PostCard } from "./HomePageInterface";

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

import {
  Pin,
  MessageCircle,
  Heart,
  HeartOutline,
  Star,
  StarOutline,
  Share,
} from "@easy-eva-icons/react";

const useStyles = createStyles((theme, _params, getRef) => {
  const image = getRef("image");

  return {
    card: {
      position: "relative",
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
        "linear-gradient(180deg, rgba(255, 255, 255, .5) 0%  , rgba(0, 0, 0, 0.7) 50%)",
    },
    // "linear-gradient(180deg,   rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, .8) 75%)",
    // "linear-gradient(180deg,   rgba(0, 0, 0, 0.4) 0%, rgba(255, 255, 255, .8) 75%)",
    // "linear-gradient(180deg, rgba(255, 255, 255, .5) 0%  , rgba(0, 0, 0, 0.7) 50%)",
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

export default function ExplorePost({
  postId,
  className,
  photoLink,
  externalLink,
  title,
  content,
  userId,
  explorePost,
  likeCount,
  showPin,
  likePost,
  favouritePost,
  showAssocThread,
  shareLink,
  userLike,
  userFavourite,
  ...others
}: PostCard & Omit<React.ComponentPropsWithoutRef<"div">, keyof PostCard>) {
  const { classes } = useStyles();
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
              <Image fit="cover" radius="md" src={photoLink} />
            ) : (
              <Paper p="lg" radius="md">
                <ScrollArea
                  style={{ height: 275 }}
                  type="scroll"
                  scrollHideDelay={500}
                >
                  <Text align="center" size="sm">
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

          <Text size="md" className={classes.title} weight={500}>
            {title}
          </Text>

          {/* BOTTOM ICONS GROUP */}
          <Group position="apart" noWrap>
            <Group spacing="xs">
              <ActionIcon
                variant="outline"
                onClick={(event: MouseEvent<HTMLButtonElement>) =>
                  favouritePost(event, postId)
                }
                color="yellow"
              >
                {userFavourite ? <Star /> : <StarOutline />}
              </ActionIcon>
              <ActionIcon
                variant="outline"
                color="red"
                onClick={(event: MouseEvent<HTMLButtonElement>) =>
                  likePost(event, postId)
                }
              >
                {userLike ? <Heart /> : <HeartOutline />}
              </ActionIcon>
              <Text size="sm" className={classes.author}>
                {likeCount}
              </Text>
            </Group>

            <Group spacing="xs">
              <ActionIcon
                variant="outline"
                color="aqua"
                onClick={(event: MouseEvent<HTMLButtonElement>) =>
                  showPin(event, postId)
                }
              >
                <Pin />
              </ActionIcon>
              <ActionIcon
                variant="outline"
                color="aqua"
                onClick={(event: MouseEvent<HTMLButtonElement>) =>
                  showAssocThread(event, postId)
                }
              >
                <MessageCircle />
              </ActionIcon>

              <ActionIcon
                variant="outline"
                color="aqua"
                onClick={(event: MouseEvent<HTMLButtonElement>) =>
                  shareLink(event, postId)
                }
              >
                <Share />
              </ActionIcon>
            </Group>
          </Group>
        </div>
      </div>
    </Card>
  );
}
