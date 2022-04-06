import {User} from "firebase/auth";

export interface DefaultUserContext {
	user?: null|User;
	username?: null|string;
}

export interface Post {
	slug: string;
	content?: string;
	username: string;
	title: string;
	published: boolean;
	heartCount: number;
}

export interface AppUser extends User  {
	username: string;
}
