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
// export type AuthUser = {
//   email: string;
//   userId: number;
// };

// set ALL states and functions datatypes.
type AppContextType = {
  userEmail: string | null;
  setUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
  userId: number | null;
  setUserId: React.Dispatch<React.SetStateAction<number | null>>;
  inputValue: string | null;
  setInputValue: React.Dispatch<React.SetStateAction<string | null>>;
};

// store the name and photolink

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string | null>(null);

  const value = {
    userEmail,
    setUserEmail,
    userId,
    setUserId,
    inputValue,
    setInputValue,
  };
  console.log(userEmail, userId);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
