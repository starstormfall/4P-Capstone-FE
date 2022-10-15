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
}

export interface AssocThread {
  id: number;
  topic: string;
}
