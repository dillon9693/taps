import { Link, Outlet } from "react-router-dom";
import { ApolloProvider, useMutation, useQuery } from "@apollo/client";
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
import { useDisclosure } from "@mantine/hooks";
import client from "./apollo-client";
import TapsLogo from "./components/TapsLogo";
import "./App.css";
import LoginRegisterModal from "./components/LoginRegisterModal";
import { LOGOUT_USER } from "./graphql/mutations";
import { GET_CURRENT_USER } from "./graphql/queries";

function AppContent() {
  const theme = useMantineTheme();

  const [authModalOpened, { open, close }] = useDisclosure(false);

  // Query current user to determine authentication state
  const { data, loading: loadingCurrentUser } = useQuery(GET_CURRENT_USER);
  const isAuthenticated = !!data?.currentUser;

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

            {/* TODO this jumps after loading */}
            {loadingCurrentUser && <Loader size="xs" color="white" />}

            {!loadingCurrentUser && !isAuthenticated && (
              <Button
                variant="subtle"
                style={{ color: "white" }}
                onClick={open}
              >
                Login / Register
              </Button>
            )}

            {!loadingCurrentUser && isAuthenticated && (
              <Button
                variant="subtle"
                onClick={() => logout()}
                disabled={loadingCurrentUser || loadingLogout}
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

          {/* Modals */}
          <LoginRegisterModal opened={authModalOpened} close={close} />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AppContent />
    </ApolloProvider>
  );
}
