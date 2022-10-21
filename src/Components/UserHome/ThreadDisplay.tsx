import React, { useEffect, useState, MouseEvent } from "react";
import axios from "axios";
import { backendUrl } from "../../utils";

// import interface
import { AssocThread, Post } from "./HomePageInterface";

// import style components
import { Container, Grid } from "@mantine/core";

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

  useEffect(() => {
    getTags();
  }, []);

  const showThreads = assocThreads.map((thread) => (
    <div key={thread.id}>
      {thread.topic} | {thread.postsCount} | {thread.usersCount} |{" "}
      {thread.lastPost}
    </div>
  ));

  return (
    <Grid justify="center" grow>
      <Grid.Col span={6}>
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

      <Grid.Col span={6}>
        Threads :
        {showThreads && showThreads.length
          ? showThreads
          : "No threads found! You may start one here!"}
      </Grid.Col>
    </Grid>
  );
}
