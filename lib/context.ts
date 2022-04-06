import {createContext} from "react";
import {DefaultUserContext} from "../interfaces/data-model";

const defaultUserContext:DefaultUserContext = {user: null, username: null};

export const UserContext = createContext(defaultUserContext);
