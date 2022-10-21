export interface Area {
  id: number;
  prefecture: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Hashtag {
  id: number;
  name: string;
  categoryId: number;
}

export interface AllPost {
  [key: number]: Post;
}

export interface Post {
  id: number;
  title: string;
  photoLink: string;
  content: string;
  areaId: number;
  pinId: number;
  forumPost: boolean;
  explorePost: string;
  externalLink: string;
  likeCount: number;
  userId: number;
  locationName: string;
}

export interface PostCard {
  postId: number;
  photoLink: string;
  externalLink: string;
  title: string;
  content: string;
  explorePost: string;
  userId: number;
  likeCount: number;
  showPin: (event: React.MouseEvent<HTMLButtonElement>, postId: number) => void;
  likePost: (
    event: React.MouseEvent<HTMLButtonElement>,
    postId: number
  ) => void;
  favouritePost: (
    event: React.MouseEvent<HTMLButtonElement>,
    postId: number
  ) => void;
  showAssocThread: (
    event: React.MouseEvent<HTMLButtonElement>,
    postId: number
  ) => void;
  shareLink: (
    event: React.MouseEvent<HTMLButtonElement>,
    postId: number
  ) => void;
  userLike: boolean;
  userFavourite: boolean;
}

export interface AssocThread {
  id: number;
  topic: string;
  postsCount: number;
  usersCount: number;
  lastPost: string;
  lasPostCreated: string;
}

//Interfaces for PinMap Component
export interface Position {
  lat: number;
  lng: number;
}

export interface Distance {
  position: number;
  distance: number;
}

export interface MarkerPositions {
  position: {
    lat: number;
    lng: number;
  };
  id: number;
  name: string;
  areaId: number;
  categoryId: number[];
  hashtagId: number[];
  latestCrowdIntensity: string;
  latestCrowdSize: string;
  latestCrowdTime: Date;
}

interface CrowdPinInformation {
  recordedAt: Date;
  crowdSize: string;
  crowdIntensity: string;
}

interface CategoryIdInfo {
  categoryId: number;
}

interface HashtagIdInfo {
  hashtagId: number;
}

interface PostPinInformation {
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
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  postCategories: CategoryIdInfo[];
  postHashtags: HashtagIdInfo[];
}

export interface PinLocationInformation {
  id: number;
  lat: number;
  lng: number;
  placeName: string;
  areaId: number;
  createdAt: Date;
  updatedAt: Date;
  area: {
    prefecture: string;
  };
  crowds: CrowdPinInformation[];
  posts: PostPinInformation[];
}
//END OF Interfaces for PinMap Component
