import { Link, Outlet, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
import {
  AppShell,
  Container,
  Group,
  Button,
  Text,
  Box,
  useMantineTheme,
  Loader,
} from "@mantine/core";
import client from "./apollo-client";
import TapsLogo from "./components/TapsLogo";
import "./App.css";
import { LOGOUT_USER } from "./graphql/mutations";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const theme = useMantineTheme();
  const loc = useLocation();

  const { isAuthenticated, loading: loadingCurrentUser } = useAuth();

  const [logout, { loading: loadingLogout }] = useMutation(LOGOUT_USER, {
    onCompleted: () => {
      // Clear Apollo cache on logout to remove user data
      client.resetStore();
    },
  });

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header style={{ backgroundColor: theme.colors.accent[5] }}>
        <Group h="100%" px="md" justify="space-between">
          <Box
            component={Link}
            to="/home"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Group gap="xs">
              <TapsLogo width={32} height={32} />
              <Text size="xl" fw={700} style={{ color: "white" }}>
                Taps
              </Text>
            </Group>
          </Box>
          <Group gap="xs">
            <Button
              variant="subtle"
              component={Link}
              to="/home"
              style={{ color: "white" }}
            >
              Home
            </Button>
            <Button
              variant="subtle"
              component={Link}
              to="/search"
              style={{ color: "white" }}
            >
              Search
            </Button>

            {isAuthenticated && (
              <Button
                variant="subtle"
                component={Link}
                to="/account"
                style={{ color: "white" }}
              >
                Account
              </Button>
            )}

            {loadingCurrentUser && (
              <Box
                style={{
                  minWidth: "85px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Loader size="xs" color="white" />
              </Box>
            )}

            {!loadingCurrentUser && !isAuthenticated && (
              <Button
                variant="subtle"
                component={Link}
                to={`/login?prev=${encodeURIComponent(loc.pathname)}`}
                style={{ color: "white" }}
              >
                Login
              </Button>
            )}

            {!loadingCurrentUser && isAuthenticated && (
              <Button
                variant="subtle"
                onClick={() => logout()}
                disabled={loadingLogout}
                style={{ color: "white" }}
              >
                Logout
              </Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
