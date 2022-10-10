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
export type AuthUser = {
  name: string;
  email: string;
};

// set ALL states and functions datatypes.
type AppContextType = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
};

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const value = { user, setUser };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
