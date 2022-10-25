import React, { useContext, useEffect, useState, createContext } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

type AppContextProviderProps = {
  children: React.ReactNode;
};
export const UseApp = () => {
  return useContext(AppContext);
};

export const AppContext = createContext({} as AppContextType);

// set data type for one function.
// export type UserInfo = {
//   email: string;
//   userId: number;
// };

type UserInfo = {
  id: number;
  name: string;
  email: string;
  nationality: string;
  score: number;
  lastLogin: string;
  loginStreak: number;
  photoLink: string;
};

// set ALL states and functions datatypes.
type AppContextType = {
  userEmail: string | null;
  setUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  inputValue: string | null;
  setInputValue: React.Dispatch<React.SetStateAction<string | null>>;
  userName: string | null;
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  userPhoto: string | null;
  setUserPhoto: React.Dispatch<React.SetStateAction<string | null>>;
  userId: number | null;
  setUserId: React.Dispatch<React.SetStateAction<number | null>>;
};

// store the name and photolink

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 0,
    name: "loading",
    email: "loading",
    nationality: "loading",
    score: 0,
    lastLogin: "loading",
    loginStreak: 0,
    photoLink: "loading",
  });
  const [inputValue, setInputValue] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const value = {
    userEmail,
    setUserEmail,
    userInfo,
    setUserInfo,
    inputValue,
    setInputValue,
    userName,
    setUserName,
    userPhoto,
    setUserPhoto,
    userId,
    setUserId,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
