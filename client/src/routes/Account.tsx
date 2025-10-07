import { Container, Title, Paper, Stack, Text, Group } from "@mantine/core";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Account() {
  const { currentUser } = useAuth();

  // TODO any way to avoid this check
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container mt="xl" size="sm">
      <Title order={1} mb="lg">
        Account
      </Title>
      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                First Name
              </Text>
              <Text size="md" fw={500}>
                {currentUser.firstName}
              </Text>
            </Stack>
          </Group>

          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Last Name
              </Text>
              <Text size="md" fw={500}>
                {currentUser.lastName}
              </Text>
            </Stack>
          </Group>

          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Email
              </Text>
              <Text size="md" fw={500}>
                {currentUser.email}
              </Text>
            </Stack>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
