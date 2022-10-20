import React, { useEffect, useState, MouseEvent } from "react";
import axios from "axios";
import { backendUrl } from "../../utils";

// import interface
import { AssocThread, Post } from "./HomePageInterface";

// import style components
import { Container, Grid } from "@mantine/core";

// import child components
import ExplorePost from "./ExplorePost";

interface Props {
  assocThreads: AssocThread[];
  selectedPost: Post;
}

export default function ThreadDisplay({ assocThreads, selectedPost }: Props) {
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
    <Container fluid size="md">
      <Grid justify="center" grow>
        <Grid.Col span={4}>
          Thread Display
          <br />
          {tags.categories}
          <br />
          {tags.hashtags}
          <br />
          {tags.prefecture}
          {/* <ExplorePost
            postId={Number(post.postId)}
            pinId={Number(post.pinId)}
            photoLink={post.photoLink}
            externalLink={post.externalLink}
            title={post.title}
            content={post.content}
            explorePost={post.explorePost}
            userId={post.userId}
            likeCount={post.likeCount}
            showPin={handleShowPin}
          /> */}
        </Grid.Col>
        <Grid.Col span={2}></Grid.Col>
        <Grid.Col span={4}>
          Threads :
          {showThreads && showThreads.length
            ? showThreads
            : "No threads found! You may start one here!"}
        </Grid.Col>
      </Grid>
    </Container>
  );
}
