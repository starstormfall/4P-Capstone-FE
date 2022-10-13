// export const backendUrl: string = process.env.REACT_APP_API_SERVER as string;
export const backendUrl: string =
  (process.env.REACT_APP_NODE_ENV as string) === "production"
    ? (process.env.REACT_APP_REMOTE_API_SERVER as string)
    : (process.env.REACT_APP_LOCAL_API_SERVER as string);
