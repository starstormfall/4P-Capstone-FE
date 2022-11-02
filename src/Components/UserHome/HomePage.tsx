import { useEffect, useState, MouseEvent } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../utils";
import { UseApp } from "../../Components/Context";
import { withAuthenticationRequired } from "@auth0/auth0-react";

import { ContextType } from "../../Styles/AppShell/AppShell";

// import style components
import "../../App.css";
import {
  Button,
  Group,
  Loader,
  Space,
  Divider,
  Drawer,
  Modal,
  Title,
  Badge,
  Box,
  Tabs,
  Text,
  Center,
  SimpleGrid,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { Heart, Star, Camera } from "@easy-eva-icons/react";

// import interface
import {
  Area,
  Category,
  Hashtag,
  AllPost,
  Post,
  AssocThread,
} from "./HomePageInterface";

// import child components
import ExplorePost from "./ExplorePost";
import PinDisplay from "./PinDisplay";
import ThreadDisplay from "./ThreadDisplay";
import SharePost from "./SharePost";
import ScrollTopButton from "./ScrollToTop";

function HomePage() {
  // eslint-disable-next-line
  const [userLoggedIn, setUserLoggedIn, token, inputValue] =
    useOutletContext<ContextType["key"]>();
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
    locationName: "location",
  };

  // posts that will be displayed based on different filters
  const [allPosts, setAllPosts] = useState<AllPost>({});
  // all unfiltered explore posts
  const [allExplore, setAllExplore] = useState<AllPost>({});
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allHashtags, setAllHashtags] = useState<Hashtag[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<number | null>();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<number[]>([]);
  // eslint-disable-next-line
  const [displayCategories, setDisplayCategories] = useState<boolean>(false);
  // eslint-disable-next-line
  const [displayHashtags, setDisplayHashtags] = useState<boolean>(false);
  // eslint-disable-next-line
  const [selectedPostId, setSelectedPostId] = useState<number>(0);
  const [selectedPost, setSelectedPost] = useState<Post>(mockPost);
  const [assocThreads, setAssocThreads] = useState<AssocThread[]>([]);
  const [userLikePostIds, setUserLikePostIds] = useState<number[]>([]);
  const [userFavouritePostIds, setUserFavouritePostIds] = useState<number[]>(
    []
  );
  const [userLikePosts, setUserLikePosts] = useState<AllPost>({});
  const [userFavouritePosts, setUserFavouritePosts] = useState<AllPost>({});
  const [tags, setTags] = useState({
    categories: [],
    hashtags: [],
    prefecture: [],
  });
  const [activeTab, setActiveTab] = useState<string | null>("allExplore");

  // show child components
  const [pinDrawerOn, setPinDrawerOn] = useState<boolean>(false);
  const [sharePostModalOn, setSharePostModalOn] = useState<boolean>(false);
  const [threadDisplayDrawerOn, setThreadDisplayDrawerOn] =
    useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);

  ///////// START OF USEEFFECT API CALLS /////////

  // trigger search based on search bar from appshell
  useEffect(() => {
    const getPostsBySource = async () => {
      const postsBySourceResponse = await axios.get(
        `${backendUrl}/posts/explore?source=${inputValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllPosts(postsBySourceResponse.data);
    };

    getPostsBySource();
    // eslint-disable-next-line
  }, [inputValue]);

  // useEffect api call to get subset of explore posts (need to set up pagination on backend)
  const getExplorePosts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/posts/explore`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllPosts(response.data);
      setAllExplore(response.data);
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

  const getUserLikes = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/users/${userInfo.id}/like`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserLikePosts(response.data.likePosts);
      setUserLikePostIds(response.data.likePostIds);
    } catch (err) {}
  };

  const getUserFavourites = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/users/${userInfo.id}/favourite`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserFavouritePosts(response.data.favouritePosts);
      setUserFavouritePostIds(response.data.favouritePostIds);
    } catch (err) {}
  };

  useEffect(() => {
    getExplorePosts();
    getAreas();
    getUserLikes();
    getUserFavourites();
    getHashtags();
    getCategories();
    // eslint-disable-next-line
  }, [userInfo]);

  useEffect(() => {
    switch (activeTab) {
      case "allExplore":
        setAllPosts(allExplore);
        break;
      case "favourites":
        setAllPosts(userFavouritePosts);
        break;
      case "likes":
        setAllPosts(userLikePosts);
        break;
      default:
        setAllPosts(allPosts);
    }
    // eslint-disable-next-line
  }, [activeTab]);

  ///////// END OF USEEFFECT API CALLS /////////

  const getTags = async (postId: number) => {
    try {
      const response = await axios.get(`${backendUrl}/posts/${postId}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTags(response.data);
    } catch (err) {}
  };

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
            `${backendUrl}/posts/explore?areaId=${areaId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
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
            `${backendUrl}/info/categories/hashtags?categoryIds=${updatedCategoryIds}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setAllHashtags(assocHashtags.data);
          setDisplayHashtags(true);

          // get all relevant posts filtered by area and category
          const areaCategoryPosts = await axios.get(
            `${backendUrl}/posts/explore?areaId=${selectedAreas}&categoryIds=${updatedCategoryIds}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setAllPosts(areaCategoryPosts.data);
        } else {
          // turn off showing hashtags if no categories are selected
          setDisplayHashtags(false);
          // get all area posts not filtered by category
          const areaPosts = await axios.get(
            `${backendUrl}/posts/explore?areaId=${selectedAreas}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
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
          `${backendUrl}/posts/explore?areaId=${selectedAreas}&categoryIds=${selectedCategories}&hashtagIds=${updatedHashtagIds}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAllPosts(areaCategoryHashtagPosts.data);
        setSelectedHashtags(updatedHashtagIds);

        break;
    }
  };

  // display all areas
  const listAreas = allAreas.map((area: Area) => (
    <Carousel.Slide key={area.id}>
      <Button
        uppercase
        variant={selectedAreas === area.id ? "gradient" : "light"}
        gradient={{ from: "aqua.5", to: "aqua.3", deg: 105 }}
        compact
        radius="md"
        size="sm"
        color="aqua"
        id={`${area.id}`}
        name="prefecture"
        onClick={handleFilter}
      >
        {area.prefecture}
      </Button>
    </Carousel.Slide>
  ));

  // display all categories
  const listCategories = allCategories.map((category: Category, index) => (
    <Carousel.Slide key={category.id}>
      <Button
        uppercase
        disabled={!selectedAreas ? true : false}
        compact
        radius="md"
        size="sm"
        variant={
          selectedCategories.includes(category.id) ? "gradient" : "light"
        }
        gradient={{ from: "blue.5", to: "blue.3", deg: 105 }}
        color="blue"
        key={index}
        id={`${category.id}`}
        name="category"
        onClick={handleFilter}
      >
        {category.name}
      </Button>
    </Carousel.Slide>
  ));
  // display all hashtags
  const listHashtags = allHashtags.map((hashtag: Hashtag, index) => (
    <Carousel.Slide key={hashtag.id}>
      <Button
        uppercase
        disabled={!selectedCategories.length ? true : false}
        compact
        radius="md"
        size="sm"
        variant={selectedHashtags.includes(hashtag.id) ? "gradient" : "light"}
        gradient={{ from: "purple.5", to: "purple.3", deg: 105 }}
        color="purple"
        key={index}
        id={`${hashtag.id}`}
        name="hashtag"
        onClick={handleFilter}
      >
        {hashtag.name}
      </Button>
    </Carousel.Slide>
  ));

  //######### START OF EVENT HANDLERS FOR EXPLORE POST ////////////

  // // handleGoToPin
  const handleShowPin = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    setPinDrawerOn(true);
    setSelectedPostId(postId);
    setSelectedPost(allPosts[postId]);
    getTags(postId);
    setShowButton(false);
  };

  // // handleLike
  const handleLikePost = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    const updatedLikePost = await axios.put(
      `${backendUrl}/posts/${postId}/${userInfo.id}/like`,
      { body: "body" },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
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
      `${backendUrl}/users/${userInfo.id}/post/${postId}/favourites`,
      { body: "body" },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    getUserFavourites();
  };

  // // handleAssocThread
  const handleShowAssocThread = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    const assocThreads = await axios.get(
      `${backendUrl}/posts/thread?postId=${postId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setAssocThreads(assocThreads.data);
    setThreadDisplayDrawerOn(true);
    setSelectedPost(allPosts[postId]);
    getTags(postId);
    setShowButton(false);
  };

  // // handleShareLink
  const handleShareLink = async (
    event: MouseEvent<HTMLButtonElement>,
    postId: number
  ) => {
    const assocThreads = await axios.get(
      `${backendUrl}/posts/thread?postId=${postId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setAssocThreads(assocThreads.data);
    setSelectedPost(allPosts[postId]);
    setSharePostModalOn(true);
  };

  //////////// END OF EVENT HANDLERS FOR EXPLORE POST ////////////

  // DISPLAY SCROLL TO TOP HANDLER

  useEffect(() => {
    const handleScrollButtonVisibility = () => {
      window.pageYOffset > 300 ? setShowButton(true) : setShowButton(false);
    };

    window.addEventListener("scroll", handleScrollButtonVisibility);

    return () => {
      window.removeEventListener("scroll", handleScrollButtonVisibility);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  ///////////////////////// LIST EXPLORE POSTS //////////////////////////////////////

  const listPosts = (tabView: AllPost) => {
    return (Object.values(tabView) as Post[]).map((post: Post, index) => {
      const like = userLikePostIds.includes(post.id);
      const favourite = userFavouritePostIds.includes(post.id);

      return (
        // <Grid.Col sm={5} md={4} lg={3} key={post.id}>
        <Box
          key={index}
          sx={(theme) => ({
            paddingBottom: theme.spacing.sm,
            borderRadius: theme.radius.md,
            cursor: "pointer",
          })}
        >
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
        </Box>
      );
    });
  };

  return (
    <>
      {/* FOR SHARE POST MODAL  */}
      <Modal
        transition="fade"
        transitionDuration={600}
        transitionTimingFunction="ease"
        centered
        opened={sharePostModalOn}
        onClose={() => setSharePostModalOn(false)}
        title="Share Post"
      >
        <SharePost selectedPost={selectedPost} assocThreads={assocThreads} />
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
        size="75%"
        title={
          <Group>
            <Title order={3}>{selectedPost.locationName}</Title>
            <Badge size="md" color="aqua">
              {tags.prefecture}
            </Badge>
            <Text color="dimmed">|</Text>
            {tags.categories.map((category, index) => (
              <Badge size="md" color="blue" key={`pin-category-${index}`}>
                {category}
              </Badge>
            ))}
            <Text color="dimmed">|</Text>
            {tags.hashtags.map((hashtag, index) => (
              <Badge size="md" color="purple" key={`pin-hashtag-${index}`}>
                {hashtag}
              </Badge>
            ))}
          </Group>
        }
      >
        <ThreadDisplay
          assocThreads={assocThreads}
          selectedPost={selectedPost}
          userLike={userLikePostIds.includes(selectedPost.id)}
          userFavourite={userFavouritePostIds.includes(selectedPost.id)}
          likePost={handleLikePost}
          favouritePost={handleFavouritePost}
          setAssocThreads={setAssocThreads}
          threadDisplayDrawerOn={threadDisplayDrawerOn}
          token={token}
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
        size="75%"
        title={
          <Group>
            <Title order={3}>{selectedPost.locationName}</Title>
            <Badge size="md" color="aqua">
              {tags.prefecture}
            </Badge>
            <Text color="dimmed">|</Text>
            {tags.categories.map((category, index) => (
              <Badge size="md" color="blue" key={`pin-category-${index}`}>
                {category}
              </Badge>
            ))}
            <Text color="dimmed">|</Text>
            {tags.hashtags.map((hashtag, index) => (
              <Badge size="md" color="purple" key={`pin-hashtag-${index}`}>
                {hashtag}
              </Badge>
            ))}
          </Group>
        }
      >
        <PinDisplay
          selectedPost={selectedPost}
          assocThreads={assocThreads}
          userLike={userLikePostIds.includes(selectedPost.id)}
          userFavourite={userFavouritePostIds.includes(selectedPost.id)}
          likePost={handleLikePost}
          favouritePost={handleFavouritePost}
        />
      </Drawer>

      {/* SCROLL TO TOP BUTTON */}

      {showButton && <ScrollTopButton scrollUp={handleScrollToTop} />}

      {/* FOR RENDERING ALL/FILTERED POSTS  */}
      <Space h="xs" />

      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List position="apart">
          {/* ALL EXPLORE POSTS */}
          <Tabs.Tab value="allExplore">
            <Group noWrap spacing="xs">
              <Stack spacing={3}>
                <Title
                  color={activeTab === "allExplore" ? "blue.6" : "gray.6"}
                  size={12}
                >
                  All Posts
                </Title>
                <Center>
                  <ThemeIcon
                    size="sm"
                    radius="xl"
                    color={activeTab === "allExplore" ? "blue.6" : "gray.6"}
                    variant={activeTab === "allExplore" ? "filled" : "light"}
                  >
                    <Camera />
                  </ThemeIcon>
                </Center>
              </Stack>

              {/* FOR SEARCH FILTERS */}
              {/* <Box
                sx={(theme) => ({
                  textAlign: "center",
                  padding: "0",
                  backgroundColor: "blue",
                  borderRadius: theme.radius.md,
                })}
              > */}
              {activeTab === "allExplore" ? (
                <SimpleGrid cols={3} spacing="xs">
                  <div>
                    <Group noWrap spacing="xs">
                      <Box
                        sx={(theme) => ({
                          textAlign: "center",
                          padding: "2px",
                          // backgroundColor: "blue",
                          // borderRadius: theme.radius.md,
                        })}
                      >
                        <Text size="xs" color="dimmed" align="center">
                          Choose 1 of 47 Prefectures
                        </Text>
                        <Space h="xs" />
                        {allAreas && allAreas.length ? (
                          <Center>
                            <Carousel
                              sx={{ width: "24vw" }}
                              height={30}
                              loop
                              slideGap="xs"
                              slidesToScroll={3}
                              slideSize="20%"
                              controlsOffset={0}
                              controlSize={14}
                            >
                              {listAreas}
                            </Carousel>
                          </Center>
                        ) : (
                          <Loader />
                        )}
                      </Box>
                      <Divider size="sm" orientation="vertical" />
                    </Group>
                  </div>

                  <div>
                    <Group noWrap spacing="xs">
                      <Box
                        sx={(theme) => ({
                          textAlign: "center",
                          padding: "2px",
                          // backgroundColor: "blue",
                          // borderRadius: theme.radius.md,
                        })}
                      >
                        <Text size="xs" color="dimmed" align="center">
                          Categories
                        </Text>
                        <Space h="xs" />
                        {allCategories && allCategories.length ? (
                          <Center>
                            <Carousel
                              sx={{ width: "24vw" }}
                              height={30}
                              loop
                              slideGap="xs"
                              slidesToScroll={3}
                              slideSize="20%"
                              controlsOffset={0}
                              controlSize={14}
                            >
                              {listCategories}
                            </Carousel>
                          </Center>
                        ) : (
                          <Loader />
                        )}
                      </Box>
                      <Divider size="sm" orientation="vertical" />
                    </Group>
                  </div>

                  <div>
                    <Group noWrap spacing="xs">
                      <Box
                        sx={(theme) => ({
                          textAlign: "center",
                          padding: "2px",
                          // backgroundColor: "blue",
                          // borderRadius: theme.radius.md,
                        })}
                      >
                        <Text size="xs" color="dimmed" align="center">
                          Hashtags
                        </Text>
                        <Space h="xs" />
                        {allHashtags && allHashtags.length ? (
                          <Carousel
                            sx={{ width: "24vw" }}
                            height={30}
                            loop
                            slideGap="xs"
                            slidesToScroll={3}
                            slideSize="20%"
                            controlsOffset={0}
                            controlSize={14}
                          >
                            {listHashtags}
                          </Carousel>
                        ) : (
                          <Loader />
                        )}
                      </Box>
                      <Divider size="sm" orientation="vertical" />
                    </Group>
                  </div>
                </SimpleGrid>
              ) : null}
              {/* </Box> */}
            </Group>
            {/* END OF SEARCH FILTERS */}
          </Tabs.Tab>

          {/* LIKES TAB */}
          <Tabs.Tab value="likes">
            <Stack spacing={3}>
              <Title
                color={activeTab === "likes" ? "red.6" : "gray.6"}
                size={12}
              >
                Likes
              </Title>
              <Center>
                <ThemeIcon
                  size="sm"
                  radius="xl"
                  color={activeTab === "likes" ? "red.6" : "gray.6"}
                  variant={activeTab === "likes" ? "filled" : "light"}
                >
                  <Heart />
                </ThemeIcon>
              </Center>
            </Stack>
          </Tabs.Tab>

          {/* FAVOURITES TAB */}
          <Tabs.Tab value="favourites">
            <Stack spacing={3}>
              <Title
                color={activeTab === "favourites" ? "yellow.6" : "gray.6"}
                size={12}
              >
                Favourites
              </Title>
              <Center>
                <ThemeIcon
                  size="sm"
                  radius="xl"
                  color={activeTab === "favourites" ? "yellow.6" : "gray.6"}
                  variant={activeTab === "favourites" ? "filled" : "light"}
                >
                  <Star />
                </ThemeIcon>
              </Center>
            </Stack>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="allExplore" pt="xs">
          <Space h="xs" />
          <section>
            {allPosts && Object.keys(allPosts).length ? (
              listPosts(allPosts)
            ) : (
              <Loader />
            )}
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="likes" pt="xs">
          <section>
            {allPosts && Object.keys(allPosts).length ? (
              listPosts(userLikePosts)
            ) : (
              <Loader />
            )}
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="favourites" pt="xs">
          <section>
            {allPosts && Object.keys(allPosts).length ? (
              listPosts(userFavouritePosts)
            ) : (
              <Loader />
            )}
          </section>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

export default withAuthenticationRequired(HomePage, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <Loader />,
});
