import React, { MouseEvent } from "react";

import { PostCard } from "./HomePageInterface";

import {
  Pin,
  MessageCircle,
  Heart,
  HeartOutline,
  Star,
} from "@easy-eva-icons/react";

import { IconBookmark, IconHeart, IconShare } from "@tabler/icons";
import {
  Card,
  Image,
  Text,
  ActionIcon,
  Badge,
  Group,
  Center,
  createStyles,
  UnstyledButton,
  Spoiler,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  rating: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs + 2,
    pointerEvents: "none",
  },

  title: {
    display: "block",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs / 2,
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

  footer: {
    marginTop: theme.spacing.md,
  },
}));

// create post component
// post component will have 5 buttons with 5 handlers
// // handleGoToPin
// // handleLike
// // handleFavourite
// // handleAssocThread
// // handleShareLink

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
  ...others
}: PostCard & Omit<React.ComponentPropsWithoutRef<"div">, keyof PostCard>) {
  const { classes, cx, theme } = useStyles();
  const linkProps = {
    href: externalLink,
    target: "_blank",
    rel: "noopener noreferrer",
  };

  return (
    <Card
      withBorder
      radius="md"
      className={cx(classes.card, className)}
      {...others}
    >
      <Card.Section>
        <UnstyledButton
          onClick={(event: MouseEvent<HTMLButtonElement>) =>
            showPin(event, postId)
          }
        >
          <Image src={photoLink} />
        </UnstyledButton>
      </Card.Section>

      <Badge
        className={classes.rating}
        variant="gradient"
        gradient={{ from: "yellow", to: "red" }}
      >
        {explorePost}
      </Badge>

      <Group align="flex-start" position="apart" noWrap>
        <Text
          className={classes.title}
          weight={500}
          component="a"
          {...linkProps}
        >
          {title}
        </Text>
        <Center className={classes.title}>
          <ActionIcon
            id={`${postId}`}
            className={classes.action}
            color="red"
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              likePost(event, postId)
            }
          >
            <Heart />
          </ActionIcon>
          <Text size="sm" inline>
            {likeCount}
          </Text>
        </Center>
      </Group>

      <Text size="sm" color="dimmed" lineClamp={5}>
        {content}
      </Text>

      <Group position="apart" className={classes.footer}>
        <Group spacing={8} mr={0}>
          <ActionIcon className={classes.action} color="aqua">
            <Pin />
          </ActionIcon>
          <ActionIcon
            className={classes.action}
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              showAssocThread(event, postId)
            }
          >
            <MessageCircle />
          </ActionIcon>
          <ActionIcon
            className={classes.action}
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              favouritePost(event, postId)
            }
          >
            <Star />
          </ActionIcon>
          <ActionIcon
            className={classes.action}
            onClick={(event: MouseEvent<HTMLButtonElement>) =>
              shareLink(event, postId)
            }
          >
            <IconShare size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}
