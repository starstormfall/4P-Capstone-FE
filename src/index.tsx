import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_DOMAIN as string}
    clientId={process.env.REACT_APP_CLIENT_ID as string}
    redirectUri={process.env.REACT_APP_REDIRECT as string}
    audience={process.env.REACT_APP_AUDIENCE as string}
    scope={process.env.REACT_APP_SCOPE as string}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>
);
