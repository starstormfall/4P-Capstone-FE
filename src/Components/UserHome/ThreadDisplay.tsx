import React, { useEffect, useState, MouseEvent } from "react";
import axios from "axios";
import { backendUrl } from "../../utils";
import { useNavigate } from "react-router-dom";

// import interface
import { AssocThread, Post } from "./HomePageInterface";

// import style components
import {
  Container,
  Grid,
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
  Mark,
  Paper,
  Blockquote,
  Box,
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
  const navigate = useNavigate();

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

  const handleGoToThread = (threadId: number) => {
    navigate(`/exchange/${threadId}`);
  };

  useEffect(() => {
    getTags();
  }, []);

  const handleStartNewThread = () => {
    navigate("/exchange");
  };

  const showThreads = assocThreads.map((thread, index) => (
    <Timeline.Item
      key={index}
      title={
        <Group noWrap>
          <Button
            // variant="light"
            color="beige.7"
            radius="md"
            onClick={(event: MouseEvent) => handleGoToThread(thread.id)}
          >
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
      <Blockquote
        cite={
          <Group>
            <Avatar
              src={thread.lastPostUserPhoto}
              alt={thread.lastPostUserName}
              radius="xl"
            />
            <div>
              <Text size="sm">posted by {thread.lastPostUserName}</Text>
              <Text size="xs" color="dimmed">
                {thread.lastPostCreatedAt}
              </Text>
            </div>
          </Group>
        }
      >
        <Text size="md">{thread.lastPost}</Text>
      </Blockquote>
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
        <Box
          sx={(theme) => ({
            textAlign: "center",
            padding: theme.spacing.sm,
            height: "60vh",
          })}
        >
          <Button
            color="beige.7"
            rightIcon={<Edit />}
            onClick={handleStartNewThread}
          >
            <Title order={5}> Start a New Discussion on This!</Title>
          </Button>
          <Space h="lg" />
          <Divider
            label={
              <Text color="greyBlue.7" align="center" size="lg" weight="700">
                Or Check Out the Latest Conversations Here!
              </Text>
            }
            labelPosition="center"
          />

          <Space h="lg" />
          <ScrollArea style={{ height: "45vh" }}>
            <Container>
              {showThreads && showThreads.length ? (
                <Timeline>{showThreads}</Timeline>
              ) : (
                <Stack>
                  <Title align="center" order={4}>
                    No discussions started yet...
                  </Title>
                </Stack>
              )}
            </Container>
          </ScrollArea>
        </Box>
      </Grid.Col>
    </Grid>
  );
}
