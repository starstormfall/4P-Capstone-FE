import React, { useEffect, useState, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../utils";

// import style components from mantine
import { Button, Group, Grid, Loader } from "@mantine/core";

// import interface
import { Area, Category, Hashtag, Post, PostCard } from "./HomePageInterface";

// import child components
import ExplorePost from "./ExplorePost";

export default function HomePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allHashtags, setAllHashtags] = useState<Hashtag[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<number[]>([]);

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

  // handleClickArea ==> api call to get filtered posts based on selected area with all categories and hashtags
  const handleFilterArea = async (event: MouseEvent) => {
    const areaId = Number(event.currentTarget.id);
    const addAreaId: number[] = [...selectedAreas, areaId];

    setSelectedAreas(addAreaId);
    console.log(selectedAreas);

    const areaPosts = await axios.get(
      `${backendUrl}/posts/area=${selectedAreas}`
    );
    console.log(areaPosts);
  };

  // display all areas
  const listAreas = allAreas.map((area: Area, index) => (
    <Button
      color="aqua"
      key={index}
      id={`${area.id}`}
      onClick={handleFilterArea}
    >
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
      <Group>{allAreas && allAreas.length ? listAreas : <Loader />}</Group>
      <br />
      <Group>
        {allCategories && allCategories.length
          ? listCategories
          : "Loading Data"}
      </Group>
      <br />
      <Group>
        {allHashtags && allHashtags.length ? listHashtags : <Loader />}
      </Group>
      <br />
      <Grid>{allPosts && allPosts.length ? listPosts : <Loader />}</Grid>
    </div>
  );
}
