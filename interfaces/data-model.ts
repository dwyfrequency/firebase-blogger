import {User} from "firebase/auth";

export interface DefaultUserContext {
	user?: null|User;
	username?: null|string;
}
