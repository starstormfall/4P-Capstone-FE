import React, { useEffect, useState, MouseEvent } from "react";

// import interface
import { Area, Category, Hashtag, Post, PostCard } from "./HomePageInterface";

// import style components
import { Container, Grid } from "@mantine/core";

// import child components
import ExplorePost from "./ExplorePost";

interface Props {
  selectedPost: Post | undefined;
}

export default function PinDisplay({ selectedPost }: Props) {
  return (
    <Container fluid size="md">
      <Grid>
        <Grid.Col span={6}>
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
        <Grid.Col span={6}> Map </Grid.Col>
      </Grid>
    </Container>
  );
}
