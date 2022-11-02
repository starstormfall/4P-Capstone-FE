import React from "react";

// import interface
import { AssocThread, Post } from "./HomePageInterface";

// import style components
import { Container, Grid, ScrollArea } from "@mantine/core";

// import child components
import PinMap from "../UserHome/PinMap";
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

export default function PinDisplay({
  selectedPost,
  assocThreads,
  userLike,
  userFavourite,
  likePost,
  favouritePost,
}: Props) {
  return (
    <Grid>
      <Grid.Col span={6}>
        <Container>
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
        </Container>
      </Grid.Col>

      {/* RIGHT SIDE PIN MAP */}

      <Grid.Col span={6}>
        <ScrollArea style={{ height: "65vh" }}>
          {selectedPost && (
            <PinMap
              postId={Number(selectedPost.id)}
              pinId={Number(selectedPost.pinId)}
              areaId={Number(selectedPost.areaId)}
            />
          )}
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
}
