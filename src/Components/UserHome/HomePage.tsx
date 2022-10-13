import React, { useEffect, useState, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../utils";

// import style components from mantine
import { Button, Group, Grid, Loader, ScrollArea } from "@mantine/core";

// import interface
import { Area, Category, Hashtag, Post, PostCard } from "./HomePageInterface";

// import child components
import ExplorePost from "./ExplorePost";

export default function HomePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allHashtags, setAllHashtags] = useState<Hashtag[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<number | null>();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<number[]>([]);
  const [displayCategories, setDisplayCategories] = useState<boolean>(false);
  const [displayHashtags, setDisplayHashtags] = useState<boolean>(false);

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
    // getCategories();
    // getHashtags();
  }, []);

  // handleClickArea ==> api call to get filtered posts based on selected area with all categories and hashtags
  const handleFilter = async (event: MouseEvent<HTMLButtonElement>) => {
    const { id, name } = event.currentTarget;

    switch (name) {
      // if prefecture button is clicked
      case "prefecture":
        const areaId = Number(id);
        // if another area is selected, get filtered posts
        if (areaId !== selectedAreas) {
          const areaPosts = await axios.get(
            `${backendUrl}/posts/explore?areaId=${areaId}`
          );
          setAllPosts(areaPosts.data);
          setSelectedAreas(areaId);
          setDisplayCategories(true);
          if (Object.keys(allCategories).length === 0) {
            getCategories();
          }
        } else {
          // if same area is selected
          setSelectedAreas(null); // erase selected area
          setDisplayCategories(false); // erase categories

          getExplorePosts(); // reload all posts
        }
        setSelectedCategories([]);
        setDisplayHashtags(false);
        break;
      // if category button is clicked
      case "category":
        const categoryId = Number(id);
        let updatedCategoryIds: number[] = [];

        if (selectedCategories.includes(categoryId)) {
          // remove categoryId if selected before
          updatedCategoryIds = selectedCategories.filter(
            (id) => id !== categoryId
          );
        } else {
          // add categoryId to selected
          updatedCategoryIds = [...selectedCategories, categoryId];
        }

        if (updatedCategoryIds.length) {
          // get associated hashtags if 1 or more categories are selected
          const assocHashtags = await axios.get(
            `${backendUrl}/info/categories/hashtags?categoryIds=${updatedCategoryIds}`
          );
          setAllHashtags(assocHashtags.data);
          setDisplayHashtags(true);
          console.log("did this run?");
          // get all relevant posts filtered by area and category
          const areaCategoryPosts = await axios.get(
            `${backendUrl}/posts/explore?areaId=${selectedAreas}&categoryIds=${updatedCategoryIds}`
          );
          setAllPosts(areaCategoryPosts.data);
        } else {
          // turn off showing hashtags if no categories are selected
          setDisplayHashtags(false);
          // get all area posts not filtered by category
          const areaPosts = await axios.get(
            `${backendUrl}/posts/explore?areaId=${selectedAreas}`
          );
          setAllPosts(areaPosts.data);
        }

        // const areaCategoriesPost = await axios.get(`${backendUrl}/`);

        setSelectedCategories(updatedCategoryIds);
        break;

      case "hashtag":
        console.log("hashtag", name, id);
        const hashtagId = Number(id);
        let updatedHashtagIds: number[] = [];

        if (selectedHashtags.includes(hashtagId)) {
          // remove hashtagId if selected before
          updatedHashtagIds = selectedHashtags.filter((id) => id !== hashtagId);
        } else {
          // add hashtagId to selected
          updatedHashtagIds = [...selectedHashtags, hashtagId];
        }

        const areaCategoryHashtagPosts = await axios.get(
          `${backendUrl}/posts/explore?areaId=${selectedAreas}&categoryIds=${selectedCategories}&hashtagIds=${updatedHashtagIds}`
        );

        setAllPosts(areaCategoryHashtagPosts.data);
        setSelectedHashtags(updatedHashtagIds);

        break;
    }
  };

  // display all areas
  const listAreas = allAreas.map((area: Area, index) => (
    <Button
      color="aqua"
      key={index}
      id={`${area.id}`}
      name="prefecture"
      onClick={handleFilter}
    >
      {area.prefecture}
    </Button>
  ));

  // display all categories
  const listCategories = allCategories.map((category: Category, index) => (
    <Button
      color="blue"
      key={index}
      id={`${category.id}`}
      name="category"
      onClick={handleFilter}
    >
      {category.name}
    </Button>
  ));
  // display all hashtags
  const listHashtags = allHashtags.map((hashtag: Hashtag, index) => (
    <Button
      color="purple"
      key={index}
      id={`${hashtag.id}`}
      name="hashtag"
      onClick={handleFilter}
    >
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
      <ScrollArea style={{ height: 50 }}>
        <div style={{ width: "100vw" }}>
          <Group>{allAreas && allAreas.length ? listAreas : <Loader />}</Group>
        </div>
      </ScrollArea>
      <br />

      {allCategories && allCategories.length && displayCategories ? (
        <Group>{listCategories}</Group>
      ) : null}

      <br />
      {allHashtags && allHashtags.length && displayHashtags ? (
        <Group>{listHashtags} </Group>
      ) : null}
      <br />
      <Grid>{allPosts && allPosts.length ? listPosts : <Loader />}</Grid>
    </div>
  );
}
