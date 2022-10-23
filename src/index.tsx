import React, { FC } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate, BrowserRouter } from "react-router-dom";

type Props = {
  children: React.ReactElement;
  domain: string;
  clientId: string;
  redirectUri: string;
  audience: string;
  scope: string;
};

const Auth0ProviderWithRedirectCallback = ({ children, ...props }: Props) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState?: any) => {
    navigate((appState && appState.returnTo) || window.location.pathname);
  };
  return (
    <Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
      {children}
    </Auth0Provider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithRedirectCallback
        domain={process.env.REACT_APP_DOMAIN as string}
        clientId={process.env.REACT_APP_CLIENT_ID as string}
        redirectUri={process.env.REACT_APP_REDIRECT as string}
        audience={process.env.REACT_APP_AUDIENCE as string}
        scope={process.env.REACT_APP_SCOPE as string}
      >
        <App />
      </Auth0ProviderWithRedirectCallback>
    </BrowserRouter>
  </React.StrictMode>
);
