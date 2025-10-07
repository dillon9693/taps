import {
  Container,
  Title,
  Paper,
  Stack,
  Text,
  Group,
  Button,
  TextInput,
  Alert,
  Space,
  Grid,
  Center,
  Loader,
} from "@mantine/core";
import { Navigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../contexts/AuthContext";
import {
  UPDATE_ACCOUNT_DETAILS,
  UpdateAccountDetailsResult,
} from "../graphql/mutations";
import {
  GET_CURRENT_USER,
  SAVED_BEERS,
  SavedBeersResult,
} from "../graphql/queries";
import BeerCard from "../components/BeerCard";

export default function Account() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [email, setEmail] = useState(currentUser?.email || "");

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

  const [updateAccountDetails, { data, error, loading, client }] =
    useMutation<UpdateAccountDetailsResult>(UPDATE_ACCOUNT_DETAILS, {
      onCompleted: (result) => {
        if (result.updateAccountDetails.success) {
          client.refetchQueries({ include: [GET_CURRENT_USER] });
          setIsEditing(false);
          notifications.show({
            title: "Success!",
            message: "Account details successfully updated",
            color: "green",
          });
        }
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

  const formErrorMessage =
    error?.message || data?.updateAccountDetails.errors.join(", ");

  const {
    loading: savedBeersLoading,
    error: savedBeersError,
    data: savedBeersData,
  } = useQuery<SavedBeersResult>(SAVED_BEERS);

  return (
    <Container mt="xl" size="sm">
      <Title order={1} mb="lg">
        Account
      </Title>
      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Account Details
        </Title>
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
                  description="Email is not currently editable"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  styles={textInputStyles}
                  disabled
                />

                {formErrorMessage && (
                  <Alert color="red" title="Error">
                    {formErrorMessage}
                  </Alert>
                )}

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

      <Space h="md" />

      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Your Saved Beers
        </Title>

        {savedBeersLoading && (
          <Center>
            <Loader />
          </Center>
        )}

        {!savedBeersLoading && !savedBeersError && (
          <Grid gutter="lg">
            {savedBeersData?.savedBeers?.map((beer) => (
              <Grid.Col key={beer.id} span={{ base: 12, md: 6 }}>
                <BeerCard beer={beer} />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {!savedBeersLoading && savedBeersError && (
          <Text c="red">Error loading saved beers.</Text>
        )}
      </Paper>
    </Container>
  );
}
