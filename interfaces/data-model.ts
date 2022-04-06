import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export interface DefaultUserContext {
  user?: null | User;
  username?: null | string;
}

export interface Post {
  slug: string;
  content?: string;
  username: string;
  title: string;
  published: boolean;
  heartCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AppUser extends User {
  username: string;
}
