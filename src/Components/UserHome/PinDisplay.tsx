import React, { useEffect, useState, MouseEvent } from "react";
import axios from "axios";
import { backendUrl } from "../../utils";

// import interface
import {
  Area,
  Category,
  Hashtag,
  PostCard,
  AssocThread,
  Post,
} from "./HomePageInterface";

// import style components
import {
  Container,
  Grid,
  Badge,
  Paper,
  createStyles,
  ScrollArea,
} from "@mantine/core";

// import child components
import PinMap from "../UserHome/PinMap";
import DisplayPost from "./DisplayPost";

const useStyles = createStyles((theme) => ({
  card: {
    height: 440,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  title: {
    fontFamily: `Greycliff CF ${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.white,
    lineHeight: 1.2,
    fontSize: 32,
    marginTop: theme.spacing.xs,
  },

  category: {
    color: theme.white,
    opacity: 0.7,
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));
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
  const { classes } = useStyles();

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
