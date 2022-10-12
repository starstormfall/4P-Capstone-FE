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
  photoLink: string;
  externalLink: string;
  title: string;
  content: string;
  explorePost: string;
  userId: number;
  likeCount: number;
}
