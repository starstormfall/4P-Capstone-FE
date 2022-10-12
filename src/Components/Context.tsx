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
  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  inputValue: string | null;
  setInputValue: React.Dispatch<React.SetStateAction<string | null>>;
};

// store the name and photolink

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [inputValue, setInputValue] = useState<string | null>(null);

  const value = {
    userEmail,
    setUserEmail,
    userInfo,
    setUserInfo,
    inputValue,
    setInputValue,
  };
  console.log(userEmail, userInfo);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
