import React, { useEffect, useState, MouseEvent } from "react";
import axios from "axios";
import { backendUrl } from "../../utils";

// import interface
import { AssocThread, Post } from "./HomePageInterface";

// import style components
import {
  Container,
  Grid,
  ThemeIcon,
  Text,
  Avatar,
  Timeline,
  Title,
  Space,
  ScrollArea,
  Group,
  Button,
  Divider,
  Stack,
} from "@mantine/core";
import { Edit } from "@easy-eva-icons/react";

// import child components
import DisplayPost from "./DisplayPost";

interface Props {
  selectedPost: Post;
  assocThreads: AssocThread[];
  userLike: boolean;
  userFavourite: boolean;
  likePost: (
    event: React.MouseEvent<HTMLButtonElement>,
    postId: number
  ) => void;
  favouritePost: (
    event: React.MouseEvent<HTMLButtonElement>,
    postId: number
  ) => void;
}

export default function ThreadDisplay({
  assocThreads,
  selectedPost,
  userLike,
  userFavourite,
  likePost,
  favouritePost,
}: Props) {
  const [tags, setTags] = useState({
    categories: [],
    hashtags: [],
    prefecture: [],
  });

  const getTags = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/posts/${selectedPost.id}/tags`
      );
      setTags(response.data);
    } catch (err) {}
  };

  const handleGoToThread = async () => {};

  useEffect(() => {
    getTags();
  }, []);

  const showThreads = assocThreads.map((thread, index) => (
    <Timeline.Item
      key={index}
      title={
        <Group noWrap>
          <Button>
            <Title order={5}>{thread.topic}</Title>
          </Button>
          <Stack spacing={0}>
            <Text size="xs">Total Posts: {thread.postsCount}</Text>
            <Text size="xs">Users: {thread.usersCount}</Text>
          </Stack>
        </Group>
      }
      bulletSize={24}
    >
      <Text size="xs" mt={4}>
        Latest post by {thread.lastPostUserName} on {thread.lastPostCreatedAt}:
      </Text>
      <Text size="sm" mt={4}>
        {thread.lastPost}
      </Text>
    </Timeline.Item>
  ));

  return (
    <Grid justify="center" grow>
      <Grid.Col span={5}>
        <DisplayPost
          id={selectedPost.id}
          photoLink={selectedPost.photoLink}
          title={selectedPost.title}
          content={selectedPost.content}
          explorePost={selectedPost.explorePost}
          likeCount={selectedPost.likeCount}
          userFavourite={userFavourite}
          userLike={userLike}
          likePost={likePost}
          favouritePost={favouritePost}
        />
      </Grid.Col>

      <Grid.Col span={7}>
        <Divider
          my="xs"
          label={
            <Text align="center" size="lg" weight="700">
              Check Out the Conversations Here!
            </Text>
          }
          labelPosition="center"
        />

        <Space h="lg" />
        <ScrollArea style={{ height: "55vh" }}>
          <Container>
            {showThreads && showThreads.length ? (
              <Timeline>{showThreads}</Timeline>
            ) : (
              <Stack>
                <Title align="center" order={3}>
                  No discussions started yet...
                </Title>
                <Button rightIcon={<Edit />}>Start a Discussion!</Button>
              </Stack>
            )}
          </Container>
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
}
