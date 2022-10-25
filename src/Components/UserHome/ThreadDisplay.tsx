import React, { useEffect, useState, MouseEvent } from "react";
// import axios from "axios";
// import { backendUrl } from "../../utils";
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
  Blockquote,
  Box,
  Center,
} from "@mantine/core";
import { Edit, Close } from "@easy-eva-icons/react";

// import child components
import DisplayPost from "./DisplayPost";
import ThreadForm from "./NewThreadForm";

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
  setAssocThreads: React.Dispatch<React.SetStateAction<AssocThread[]>>;
  threadDisplayDrawerOn: boolean;
  token: string;
}

export default function ThreadDisplay({
  assocThreads,
  selectedPost,
  userLike,
  userFavourite,
  likePost,
  favouritePost,
  setAssocThreads,
  threadDisplayDrawerOn,
  token,
}: Props) {
  const navigate = useNavigate();

  // const [tags, setTags] = useState({
  //   categories: [],
  //   hashtags: [],
  //   prefecture: [],
  // });

  const [showNewThreadForm, setShowNewThreadForm] = useState<boolean>(false);

  // const getTags = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${backendUrl}/posts/${selectedPost.id}/tags`
  //     );
  //     setTags(response.data);
  //   } catch (err) {}
  // };

  const handleGoToThread = (threadId: number) => {
    navigate(`/exchange/${threadId}`);
  };

  // useEffect(() => {
  //   getTags();
  // }, []);

  useEffect(() => {}, [assocThreads]);

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
            padding: theme.spacing.sm,
            height: "60vh",
          })}
        >
          <ScrollArea style={{ height: "60vh" }}>
            <Center>
              <Button
                color={!showNewThreadForm ? "beige.9" : "beige.5"}
                rightIcon={!showNewThreadForm ? <Edit /> : null}
                leftIcon={showNewThreadForm ? <Close /> : null}
                onClick={() => setShowNewThreadForm(!showNewThreadForm)}
              >
                <Title order={5}>
                  {!showNewThreadForm
                    ? "Start a New Exchange Thread on This!"
                    : "Cancel Start New Exchange Thread..."}
                </Title>
              </Button>
            </Center>
            <Space h="md" />

            {showNewThreadForm && (
              <ThreadForm
                postId={selectedPost.id}
                areaId={selectedPost.areaId}
                showForm={showNewThreadForm}
                setShowForm={setShowNewThreadForm}
                assocThreads={assocThreads}
                setAssocThreads={setAssocThreads}
                threadDisplayDrawerOn={threadDisplayDrawerOn}
                token={token}
              />
            )}

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
