import React from "react";
import { Link, Outlet } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import {
  AppShell,
  Container,
  Group,
  Button,
  Text,
  Box,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import client from "./apollo-client";
import TapsLogo from "./components/TapsLogo";
import "./App.css";
import LoginRegisterModal from "./components/LoginRegisterModal";

function App() {
  const theme = useMantineTheme();

  const [authModalOpened, { open, close }] = useDisclosure(false);

  const isAuthenticated = false; // TODO replace with auth logic

  return (
    <ApolloProvider client={client}>
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

              {!isAuthenticated && (
                <Button
                  variant="subtle"
                  style={{ color: "white" }}
                  onClick={open}
                >
                  Login / Register
                </Button>
              )}

              {isAuthenticated && (
                <Button
                  variant="subtle"
                  onClick={() => console.log("logging out")}
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
    </ApolloProvider>
  );
}

export default App;
