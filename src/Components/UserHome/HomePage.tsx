import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../utils";

// import style components from mantine
import { Button, Group, Grid } from "@mantine/core";

// import interface
import { Area, Category, Hashtag, Post, PostCard } from "./HomePageInterface";

// import child components
import ExplorePost from "./ExplorePost";
import { getNameOfJSDocTypedef } from "typescript";

export default function HomePage() {
  const [allPosts, setAllPosts] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allHashtags, setAllHashtags] = useState([]);

  // useEffect api call to get subset of explore posts (need to set up pagination on backend)
  const getExplorePosts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/posts/explore`);
      setAllPosts(response.data);
    } catch (err) {}
  };

  // useEffect api call to get all areas
  const getAreas = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/areas`);
      setAllAreas(response.data);
    } catch (err) {}
  };

  // useEffect api call to get all categories
  const getCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/categories`);
      setAllCategories(response.data);
    } catch (err) {}
  };

  // useEffect api call to get all hashtags
  const getHashtags = async () => {
    try {
      const response = await axios.get(`${backendUrl}/info/hashtags`);
      setAllHashtags(response.data);
    } catch (err) {}
  };

  useEffect(() => {
    getExplorePosts();
    getAreas();
    getCategories();
    getHashtags();
  }, []);

  // display all areas
  const listAreas = allAreas.map((area: Area, index) => (
    <Button color="aqua" key={index}>
      {area.prefecture}
    </Button>
  ));

  // display all categories
  const listCategories = allCategories.map((category: Category, index) => (
    <Button color="blue" key={index}>
      {category.name}
    </Button>
  ));
  // display all hashtags
  const listHashtags = allHashtags.map((hashtag: Hashtag, index) => (
    <Button color="purple" key={index}>
      {hashtag.name}
    </Button>
  ));

  // handleClickArea ==> api call to get filtered posts based on selected area with all categories and hashtags
  // handleClickCategory ==> api call to get filtered posts based on selected category & selected area
  // handleClickHashtag ==> api call to get filtered posts based on selected hashtag & selected category & selected area

  // create post component
  // post component will have 5 buttons with 5 handlers
  // // handleGoToPin
  // // handleLike
  // // handleFavourite
  // // handleAssocThread
  // // handleShareLink

  const listPosts = allPosts.map((post: Post, index) => (
    <Grid.Col span={3} key={index}>
      <ExplorePost
        photoLink={post.photoLink}
        externalLink={post.externalLink}
        title={post.title}
        content={post.content}
        explorePost={post.explorePost}
        userId={post.userId}
        likeCount={post.likeCount}
      />
    </Grid.Col>
  ));

  return (
    <div>
      <Group>{allAreas && allAreas.length ? listAreas : "Loading Data"}</Group>
      <br />
      <Group>
        {allCategories && allCategories.length
          ? listCategories
          : "Loading Data"}
      </Group>
      <br />
      <Group>
        {allHashtags && allHashtags.length ? listHashtags : "Loading Data"}
      </Group>
      <br />
      <Grid>{allPosts && allPosts.length ? listPosts : "Loading data"}</Grid>
    </div>
  );
}
