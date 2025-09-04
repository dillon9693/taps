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
import client from "./apollo-client";
import TapsLogo from "./components/TapsLogo";
import "./App.css";

function App() {
  const theme = useMantineTheme();

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
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Main>
          <Container>
            <Outlet />
          </Container>
        </AppShell.Main>
      </AppShell>
    </ApolloProvider>
  );
}

export default App;
