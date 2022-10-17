import { useEffect, useState, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../utils";
import { UseApp } from "../../Components/Context";

// import style components from mantine
import {
  Button,
  Group,
  Grid,
  Loader,
  ScrollArea,
  Container,
  Space,
  Divider,
  Drawer,
  Modal,
} from "@mantine/core";

// import interface
import {
  Area,
  Category,
  Hashtag,
  AllPost,
  Post,
  PostCard,
  AssocThread,
} from "./HomePageInterface";

// import child components
import ExplorePost from "./ExplorePost";
import PinDisplay from "./PinDisplay";
import ThreadDisplay from "./ThreadDisplay";
import SharePost from "./SharePost";

export default function HomePage() {
  const navigate = useNavigate();
  const { userInfo } = UseApp();

  const mockPost = {
    id: 0,
    title: "title",
    photoLink: "photo",
    content: "content",
    areaId: 0,
    pinId: 0,
    forumPost: false,
    explorePost: "explore",
    externalLink: "external",
    likeCount: 0,
    userId: 0,
  };

  const [allPosts, setAllPosts] = useState<AllPost>({});
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allHashtags, setAllHashtags] = useState<Hashtag[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<number | null>();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<number[]>([]);
  const [displayCategories, setDisplayCategories] = useState<boolean>(false);
  const [displayHashtags, setDisplayHashtags] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<number>(0);
  const [selectedPost, setSelectedPost] = useState<Post>(mockPost);
  const [assocThreads, setAssocThreads] = useState<AssocThread[]>([]);
  const [userLikePosts, setUserLikePosts] = useState<number[]>([]);
  const [userFavouritePosts, setUserFavouritePosts] = useState<number[]>([]);

  // show child components
  const [pinDrawerOn, setPinDrawerOn] = useState<boolean>(false);
  const [sharePostModalOn, setSharePostModalOn] = useState<boolean>(false);
  const [threadDisplayDrawerOn, setThreadDisplayDrawerOn] =
    useState<boolean>(false);

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

  // // useEffect api call to get all hashtags
  // const getHashtags = async () => {
  //   try {
  //     const response = await axios.get(`${backendUrl}/info/hashtags`);
  //     setAllHashtags(response.data);
  //   } catch (err) {}
  // };

  const getUserLikes = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/users/${userInfo.id}/like`
      );
      setUserLikePosts(response.data);
      console.log("userlikes", response.data);
    } catch (err) {}
  };

  const getUserFavourites = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/users/${userInfo.id}/favourite`
      );
      setUserFavouritePosts(response.data);
    } catch (err) {}
  };

  useEffect(() => {
    getExplorePosts();
    getAreas();
    getUserLikes();
    getUserFavourites();
  }, []);

  // api call to get filtered posts based on selected area, categories, hashtags
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

        setSelectedCategories(updatedCategoryIds);
        break;

      case "hashtag":
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

  // create post component
  // post component will have 5 buttons with 5 handlers

  // // handleGoToPin
  const handleShowPin = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    setPinDrawerOn(true);
    setSelectedPostId(postId);
    setSelectedPost(allPosts[postId]);
  };

  // // handleLike
  const handleLikePost = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    const updatedLikePost = await axios.put(
      `${backendUrl}/posts/${postId}/${userInfo.id}/like`
    );
    setAllPosts((prev) => ({
      ...prev,
      [postId]: updatedLikePost.data,
    }));
    getUserLikes();
  };

  // // handleFavourite
  const handleFavouritePost = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    await axios.post(
      `${backendUrl}/users/${userInfo.id}/post/${postId}/favourites`
    );
    getUserFavourites();
  };

  // // handleAssocThread
  const handleShowAssocThread = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    const assocThreads = await axios.get(
      `${backendUrl}/posts/thread?postId=${postId}`
    );
    setAssocThreads(assocThreads.data);
    setThreadDisplayDrawerOn(true);
    setSelectedPost(allPosts[postId]);
  };

  // // handleShareLink
  const handleShareLink = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    setSharePostModalOn(true);
  };

  const listPosts = (Object.values(allPosts) as Post[]).map(
    (post: Post, index) => {
      const like = userLikePosts.includes(post.id);
      const favourite = userFavouritePosts.includes(post.id);

      return (
        <Grid.Col sm={5} md={4} lg={3} xl={2} key={post.id}>
          <ExplorePost
            postId={post.id}
            photoLink={post.photoLink}
            externalLink={post.externalLink}
            title={post.title}
            content={post.content}
            explorePost={post.explorePost}
            userId={post.userId}
            likeCount={post.likeCount}
            showPin={handleShowPin}
            likePost={handleLikePost}
            favouritePost={handleFavouritePost}
            showAssocThread={handleShowAssocThread}
            shareLink={handleShareLink}
            userLike={like}
            userFavourite={favourite}
          />
        </Grid.Col>
      );
    }
  );
  return (
    <Container fluid>
      {/* FOR SEARCH FILTERS */}
      <Grid justify="center" grow>
        <Grid.Col span={4}>
          <ScrollArea style={{ height: 50 }}>
            <div style={{ width: "xl" }}>
              <Group position="center">
                {allAreas && allAreas.length ? listAreas : <Loader />}
              </Group>
            </div>
          </ScrollArea>
        </Grid.Col>
        <Divider size="sm" orientation="vertical" />
        <Grid.Col span={4}>
          <ScrollArea style={{ height: 50 }}>
            <div style={{ width: "xl" }}>
              {allCategories && allCategories.length ? (
                <Group position="center">{listCategories}</Group>
              ) : (
                <Loader />
              )}
            </div>
          </ScrollArea>
        </Grid.Col>
        <Divider size="sm" orientation="vertical" />
        <Grid.Col span={3}>
          <ScrollArea style={{ height: 50 }}>
            <div style={{ width: "xl" }}>
              {allHashtags && allHashtags.length ? (
                <Group position="center">{listHashtags} </Group>
              ) : (
                <Loader />
              )}
            </div>
          </ScrollArea>
        </Grid.Col>
      </Grid>

      {/* FOR SHARE POST MODAL  */}
      <Modal
        transition="fade"
        transitionDuration={600}
        transitionTimingFunction="ease"
        centered
        opened={sharePostModalOn}
        withCloseButton={false}
        onClose={() => setSharePostModalOn(false)}
      >
        <SharePost />
      </Modal>

      {/* FOR ASSOC THREADS DISPLAY */}
      <Drawer
        opened={threadDisplayDrawerOn}
        onClose={() => setThreadDisplayDrawerOn(false)}
        overlayColor="gray"
        overlayOpacity={0.55}
        overlayBlur={3}
        position="bottom"
        padding="xl"
        size="70%"
      >
        <ThreadDisplay
          assocThreads={assocThreads}
          selectedPost={selectedPost}
        />
      </Drawer>

      {/* FOR SHOW PIN DISPLAY */}
      <Drawer
        opened={pinDrawerOn}
        onClose={() => setPinDrawerOn(false)}
        overlayColor="gray"
        overlayOpacity={0.55}
        overlayBlur={3}
        position="bottom"
        padding="xl"
        size="70%"
      >
        <PinDisplay selectedPost={selectedPost} />
      </Drawer>

      {/* FOR RENDERING ALL/FILTERED POSTS  */}
      <Space h="xs" />
      <Grid columns={15} grow>
        {allPosts && Object.keys(allPosts).length ? listPosts : <Loader />}
      </Grid>
    </Container>
  );
}
