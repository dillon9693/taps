import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo-client";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";
import FeaturedBeers from "./routes/FeaturedBeers";
import Home from "./routes/Home";
import Search from "./routes/Search";
import BeerDetail from "./routes/BeerDetail";
import BreweryDetail from "./routes/BreweryDetail";
import reportWebVitals from "./reportWebVitals";
import { theme } from "./theme/theme";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import ResetPassword from "./routes/ResetPassword";
import RequestPasswordReset from "./routes/RequestPasswordReset";
import Login from "./routes/Login";
import Register from "./routes/Register";
import RequireUnauthenticated from "./components/RequireUnauthenticated";
import Account from "./routes/Account";
import RequireAuthenticated from "./components/RequireAuthenticated";

const version = process.env.REACT_APP_VERSION;
if (version) {
  // eslint-disable-next-line no-console
  console.log(`App version: ${version}`);
} else {
  // eslint-disable-next-line no-console
  console.log("No app version found");
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <MantineProvider theme={theme}>
          <Notifications />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="featured" element={<FeaturedBeers />} />
                <Route path="search" element={<Search />} />
                <Route path="beer/:id" element={<BeerDetail />} />
                <Route path="brewery/:id" element={<BreweryDetail />} />
                <Route
                  path="account"
                  element={
                    <RequireAuthenticated>
                      <Account />
                    </RequireAuthenticated>
                  }
                />

                {/* Start auth routes */}
                <Route
                  path="login"
                  element={
                    <RequireUnauthenticated>
                      <Login />
                    </RequireUnauthenticated>
                  }
                />
                <Route
                  path="register"
                  element={
                    <RequireUnauthenticated>
                      <Register />
                    </RequireUnauthenticated>
                  }
                />
                <Route
                  path="request-password-reset"
                  element={
                    <RequireUnauthenticated>
                      <RequestPasswordReset />
                    </RequireUnauthenticated>
                  }
                />
                <Route
                  path="reset-password"
                  element={
                    <RequireUnauthenticated>
                      <ResetPassword />
                    </RequireUnauthenticated>
                  }
                />
                {/* End auth routes */}
              </Route>

              <Route path="*" element={<Navigate to="home" replace />} />
            </Routes>
          </BrowserRouter>
        </MantineProvider>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
