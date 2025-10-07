import {
  Container,
  Title,
  Paper,
  Stack,
  Text,
  Group,
  Button,
  TextInput,
} from "@mantine/core";
import { Navigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useMutation } from "@apollo/client";
import { useAuth } from "../contexts/AuthContext";
import {
  UPDATE_ACCOUNT_DETAILS,
  UpdateAccountDetailsResult,
} from "../graphql/mutations";
import { GET_CURRENT_USER } from "../graphql/queries";

export default function Account() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  // TODO any way to avoid this check
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFirstName(currentUser.firstName);
    setLastName(currentUser.lastName);
    setEmail(currentUser.email);
    setIsEditing(false);
  };

  const [updateAccountDetails, { loading }] =
    useMutation<UpdateAccountDetailsResult>(UPDATE_ACCOUNT_DETAILS, {
      refetchQueries: [{ query: GET_CURRENT_USER }],
      onCompleted: () => {
        setIsEditing(false);
      },
    });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateAccountDetails({
      variables: {
        firstName,
        lastName,
      },
    });
  };

  const textInputStyles = {
    input: {
      fontSize: "var(--mantine-font-size-sm)",
      fontWeight: 500,
    },
    label: {
      fontSize: "var(--mantine-font-size-sm)",
      fontWeight: 400,
      color: "var(--mantine-color-dimmed)",
    },
  };

  return (
    <Container mt="xl" size="sm">
      <Title order={1} mb="lg">
        Account
      </Title>
      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Stack gap="md">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.currentTarget.value)}
                  styles={textInputStyles}
                  required
                />

                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.currentTarget.value)}
                  styles={textInputStyles}
                  required
                />

                <TextInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  styles={textInputStyles}
                  required
                />

                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" onClick={handleCancel} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    Save
                  </Button>
                </Group>
              </Stack>
            </form>
          ) : (
            <>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  First Name
                </Text>
                <Text size="md" fw={500}>
                  {currentUser.firstName}
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Last Name
                </Text>
                <Text size="md" fw={500}>
                  {currentUser.lastName}
                </Text>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Text size="md" fw={500}>
                  {currentUser.email}
                </Text>
              </Stack>

              <Group justify="flex-end" mt="md">
                <Button onClick={handleEdit}>Edit</Button>
              </Group>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
