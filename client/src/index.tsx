import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import App from "./App";
import Home from "./routes/Home";
import Search from "./routes/Search";
import BeerDetail from "./routes/BeerDetail";
import BreweryDetail from "./routes/BreweryDetail";
import reportWebVitals from "./reportWebVitals";
import { theme } from "./theme/theme";
import "@mantine/core/styles.css";
import "./index.css";

const version = process.env.REACT_APP_VERSION;
if (version) {
  console.log(`App version: ${version}`);
} else {
  console.log("No app version found");
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="beer/:id" element={<BeerDetail />} />
            <Route path="brewery/:id" element={<BreweryDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
