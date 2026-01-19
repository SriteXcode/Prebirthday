import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import { MusicProvider } from "./MusicContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MusicProvider>
      <App />
    </MusicProvider>
  </React.StrictMode>
);
