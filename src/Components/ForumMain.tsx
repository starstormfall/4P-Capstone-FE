import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { backendUrl } from "../utils";
import { UseApp } from "./Context";
import { Button, Container, Image, Grid, Card, Text } from "@mantine/core";

type ThreadListData = {
  areaId: number;
  content: string;
  createdAt: string;
  explorePost: string;
  externalLink: string;
  forumPost: boolean;
  id: number;
  likeCount: number;
  locationName: string;
  photoLink: string;
  pinId: number;
  threads: {
    createdAt: string;
    id: number;
    threadPosts: {
      createdAt: string;
      postId: number;
      threadId: number;
      updatedAt: string;
    };
    topic: string;
    updatedAt: string;
  };
  title: string;
  updatedAt: string;
  userId: number;
};

export default function ForumMain() {
  // have a create post that can extend to explore page

  // get all data
  const forumList = useQuery(["threadList"], () =>
    axios.get(`${backendUrl}/posts/forum`).then((res) => res.data)
  );
  console.log(forumList.data);
  // console.log("thread ID", forumList.data[0].threads[0].id);
  // const threadList = useQuery(["threadList"], () =>
  //   axios.get(`${backendUrl}/posts/thread`).then((res) => res.data)
  // );
  // console.log(threadList.data);

  // map out all the threads by TOPIC (Div>Container>Link>Card>Text)
  let forumListFinal;
  if (forumList.data) {
    forumListFinal = forumList.data.map((list: ThreadListData) => {
      return (
        <div>
          {list.explorePost === "forum" && list.title ? (
            <Link to={`/exchange/${list.threads.id}`}>
              <Grid justify="center">
                <Grid.Col span={5}>
                  <Container key={list.id}>
                    <Card>
                      <Text>Thread Title:</Text>
                      {/* cant index */}
                      <Text>{list.threads.topic}</Text>
                      <Text>Content:</Text>
                      <Text>{list.content}</Text>
                      <Text>Last Updated At:</Text>
                      <Text>{list.updatedAt}</Text>
                    </Card>
                  </Container>
                </Grid.Col>
              </Grid>
            </Link>
          ) : null}
        </div>
      );
    });
  }
  // threads can link to indivdual page
  return <div>{forumListFinal}</div>;
}
