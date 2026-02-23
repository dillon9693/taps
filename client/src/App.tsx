import { Link, Outlet, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useRef } from "react";
import {
  AppShell,
  Container,
  Group,
  Button,
  Text,
  Box,
  useMantineTheme,
  Loader,
  Burger,
  Stack,
} from "@mantine/core";
import { useClickOutside, useDisclosure } from "@mantine/hooks";
import client from "./apollo-client";
import TapsLogo from "./components/TapsLogo";
import "./App.css";
import { LOGOUT_USER } from "./graphql/mutations";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const theme = useMantineTheme();
  const loc = useLocation();
  const [mobileMenuOpen, { toggle, close }] = useDisclosure(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useClickOutside((event) => {
    if (burgerRef.current?.contains(event.target as Node)) {
      return;
    }
    close();
  });

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

          <Burger
            ref={burgerRef}
            opened={mobileMenuOpen}
            onClick={toggle}
            hiddenFrom="sm"
            color="white"
            aria-label="Toggle navigation"
          />

          <Group gap="xs" visibleFrom="sm">
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
              to="/featured"
              style={{ color: "white" }}
            >
              Featured
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

        {mobileMenuOpen && (
          <Box
            ref={mobileMenuRef}
            hiddenFrom="sm"
            style={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              backgroundColor: theme.colors.accent[5],
              borderTop: `1px solid ${theme.colors.accent[6]}`,
              zIndex: 100,
              padding: theme.spacing.md,
            }}
          >
            <Stack gap="xs">
              <Button
                variant="subtle"
                component={Link}
                to="/home"
                onClick={close}
                style={{ color: "white" }}
                fullWidth
              >
                Home
              </Button>
              <Button
                variant="subtle"
                component={Link}
                to="/search"
                onClick={close}
                style={{ color: "white" }}
                fullWidth
              >
                Search
              </Button>

              {isAuthenticated && (
                <Button
                  variant="subtle"
                  component={Link}
                  to="/account"
                  onClick={close}
                  style={{ color: "white" }}
                  fullWidth
                >
                  Account
                </Button>
              )}

              {loadingCurrentUser && (
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: theme.spacing.xs,
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
                  onClick={close}
                  style={{ color: "white" }}
                  fullWidth
                >
                  Login
                </Button>
              )}

              {!loadingCurrentUser && isAuthenticated && (
                <Button
                  variant="subtle"
                  onClick={() => {
                    logout();
                    close();
                  }}
                  disabled={loadingLogout}
                  style={{ color: "white" }}
                  fullWidth
                >
                  Logout
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </AppShell.Header>
      <AppShell.Main>
        <Container>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
