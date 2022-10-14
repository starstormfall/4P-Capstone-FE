import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import {
  Button,
  Container,
  Image,
  Grid,
  Card,
  Text,
  Avatar,
} from "@mantine/core";

type ThreadSingleData = {
  id: number;
  postId: number;
  threadId: number;
  createdAt: string;
  updatedAt: string;
  post: {
    id: number;
    title: string;
    photoLink: string;
    content: string;
    areaId: number;
    pinId: number;
    locationName: string;
    forumPost: boolean;
    explorePost: string;
    externalLink: string;
    likeCount: number;
    userId: 4;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: 4;
    name: string;
    email: string;
    nationality: string;
    score: number;
    lastLogin: string;
    loginStreak: number;
    photoLink: string;
    createdAt: string;
    updatedAt: string;
  };
  thread: {
    id: number;
    topic: string;
    createdAt: string;
    updatedAt: string;
  };
};

export default function ThreadSingle() {
  const [threadId, setThreadId] = useState<string>();
  const params = useParams();
  if (threadId !== params.threadId) {
    setThreadId(params.threadId);
  }
  // get data from forum get
  const singleThread = useQuery(["threadList"], () =>
    axios.get(`${backendUrl}/posts/thread/${threadId}`).then((res) => res.data)
  );
  console.log(singleThread.data);

  // handle post req for comments (to post to table)

  // map out the ALL comments under the thread.
  // Div > Container > Card > Text;

  //
  const allComments = [];
  if (singleThread.data) {
    for (let i = 0; i < singleThread.data.length; i++) {
      allComments.push(
        <div>
          <Container>
            {/* add friend button */}
            <Card>
              <Avatar
                src={singleThread.data.user.photoLink}
                alt={singleThread.data.user.name}
                radius="xl"
                size="lg"
              />
              <Text>
                {singleThread.data.user.name} added a comment on{" "}
                {singleThread.data.post.createdAt}:
              </Text>
              <Text>{singleThread.data.post.content}</Text>
            </Card>
          </Container>
        </div>
      );
    }
  }

  return (
    <div>
      <Container>
        <Card>
          <Text>Thread Title:{singleThread.data[0].thread.topic}</Text>
          <Text></Text>
          <Text>Content:</Text>
          <Text>{singleThread.data.post.content}</Text>
          <Text>By user:</Text>
          <Text>{singleThread.data.user.name}</Text>
          <Text>Created At:</Text>
          <Text>{singleThread.data.createdAt}</Text>
        </Card>
      </Container>
      <Container>
        {singleThread.data ? (
          allComments
        ) : (
          <div>
            <Card>
              <Text>Be the first to comment!</Text>
              {/* add comment function here */}
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}
