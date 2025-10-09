import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import {
  Container,
  Grid,
  Title,
  Card,
  Text,
  Image,
  Group,
  Rating,
  Loader,
  Alert,
  Paper,
  Button,
  Center,
  Stack,
  Anchor,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { GET_BEER } from "../graphql/queries";
import type { Beer } from "../types";
import { usePageTitle } from "../hooks/usePageTitle";
import Tag from "../components/Tag";
import {
  SAVE_BEER,
  SaveBeerResult,
  UNSAVE_BEER,
  UnsaveBeerResult,
} from "../graphql/mutations";
import AddTagModal from "../components/AddTagModal";
import { useAuth } from "../contexts/AuthContext";

const SAVE_ERROR_NOTIFICATION = {
  title: "Error!",
  message: "There was an issue saving this beer. Please try again",
  color: "red",
};

const UNSAVE_ERROR_NOTIFICATION = {
  title: "Error!",
  message: "There was an issue removing save from this beer. Please try again",
  color: "red",
};

type GetBeerResult = {
  beerById: Beer;
};

export default function BeerDetail() {
  const { id } = useParams<{ id: string }>();
  const theme = useMantineTheme();

  const { isAuthenticated } = useAuth();

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { loading, error, data } = useQuery<GetBeerResult>(GET_BEER, {
    variables: { id },
    skip: !id,
  });

  // Keep this state in sync with updates from the back-end
  useEffect(() => {
    if (data?.beerById) {
      setIsSaved(data.beerById.isSaved);
    }
  }, [data]);

  usePageTitle({
    title: data?.beerById
      ? `${data.beerById.name} by ${data.beerById.brewery.name}`
      : "Beer Details",
  });

  const [saveBeer, { client: saveBeerClient, loading: saveBeerLoading }] =
    useMutation<SaveBeerResult>(SAVE_BEER, {
      onCompleted: (result) => {
        if (result.saveBeer.success) {
          setIsSaved(true);
          saveBeerClient.refetchQueries({ include: [GET_BEER] });
        } else {
          notifications.show(SAVE_ERROR_NOTIFICATION);
        }
      },
      onError: () => {
        notifications.show(SAVE_ERROR_NOTIFICATION);
      },
    });

  const [unsaveBeer, { client: unsaveBeerClient, loading: unsaveBeerLoading }] =
    useMutation<UnsaveBeerResult>(UNSAVE_BEER, {
      onCompleted: (result) => {
        if (result.unsaveBeer.success) {
          setIsSaved(false);
          unsaveBeerClient.refetchQueries({ include: [GET_BEER] });
        } else {
          notifications.show(UNSAVE_ERROR_NOTIFICATION);
        }
      },
      onError: () => {
        notifications.show(UNSAVE_ERROR_NOTIFICATION);
      },
    });

  const [
    addTagModalOpened,
    { open: openAddTagModal, close: closeAddTagModal },
  ] = useDisclosure();

  if (loading) {
    return (
      <Container mt="xl">
        <Center>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container mt="xl">
        <Alert color="red" title="Error">
          Error loading beer: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!data?.beerById) {
    return (
      <Container mt="xl">
        <Stack gap="md">
          <Alert color="red" title="Error">
            Beer not found
          </Alert>
          <Button component={Link} to="/home">
            Return to Home
          </Button>
        </Stack>
      </Container>
    );
  }

  const { beerById: beer } = data;

  const saveButtonText = isSaved ? "Saved!" : "Save";
  const onSaveButtonClick = () => {
    if (isSaved) {
      unsaveBeer({ variables: { beerId: beer.id } });
    } else {
      saveBeer({ variables: { beerId: beer.id } });
    }
  };

  const handleAddTag = () => {
    openAddTagModal();
  };

  return (
    <Container mt="xl" mb="xl">
      <AddTagModal
        beer={beer}
        opened={addTagModalOpened}
        close={closeAddTagModal}
      />

      {/* Hero Section */}
      <Card mb="lg" withBorder shadow="md">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Image
              src={beer.imageUrl || "/beer-placeholder.jpg"}
              alt={beer.name}
              height={400}
              fit="cover"
              radius="md"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card.Section p="xl" h="100%">
              <Stack justify="flex-start" h="100%">
                <Title order={1}>{beer.name}</Title>
                <Text size="xl" c="dimmed" mb="md">
                  <Anchor
                    component={Link}
                    to={`/brewery/${beer.brewery.id}`}
                    style={{ color: "inherit" }}
                  >
                    {beer.brewery.name}
                  </Anchor>
                  {" • "}
                  {beer.brewery.location}
                </Text>
                <Group align="center" mb="lg">
                  <Rating
                    value={Number(beer.averageRating)}
                    fractions={10}
                    readOnly
                    size="lg"
                  />
                  <Text size="lg">{beer.averageRating}/5</Text>
                </Group>
                <Group align="center" mb="lg">
                  <Button
                    size="sm"
                    radius="md"
                    variant={isSaved ? "filled" : "outline"}
                    color={theme.colors.accent[5]}
                    style={{ minWidth: "85px" }}
                    onClick={onSaveButtonClick}
                    aria-label={isSaved ? "Unsave this beer" : "Save this beer"}
                    aria-busy={saveBeerLoading || unsaveBeerLoading}
                  >
                    {saveBeerLoading || unsaveBeerLoading ? (
                      <Loader size="xs" color="white" />
                    ) : (
                      saveButtonText
                    )}
                  </Button>
                </Group>
              </Stack>
            </Card.Section>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Main Content */}
      <Grid>
        {/* Left Column - Description and Tags */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="lg" mb="md" withBorder shadow="sm">
            <Title order={3} mb="md">
              About This Beer
            </Title>
            <Text lh={1.7}>{beer.description}</Text>
          </Paper>

          {beer.tagsWithVotes.length > 0 && (
            <Paper p="lg" withBorder shadow="sm">
              <Title order={4} mb="md">
                Tags
              </Title>
              <Group gap="xs">
                {beer.tagsWithVotes.map((tagWithVotes) => (
                  <Tag
                    key={`${tagWithVotes.tagId}-${beer.id}`}
                    beer={beer}
                    tagWithVotes={tagWithVotes}
                  />
                ))}
              </Group>

              <Group mt="xs">
                <Button
                  variant="outline"
                  size="sm"
                  radius="xl"
                  style={{
                    borderColor: theme.colors.accent[5],
                    color: theme.colors.accent[5],
                    fontSize: "12px",
                  }}
                  onClick={handleAddTag}
                  disabled={!isAuthenticated}
                >
                  Add Tag
                </Button>
              </Group>
            </Paper>
          )}
        </Grid.Col>

        {/* Right Column - Technical Specs */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="lg" mb="md" withBorder shadow="sm">
            <Title order={4} mb="md">
              Technical Details
            </Title>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text fw={500}>Alcohol by Volume</Text>
                <Text
                  size="xl"
                  fw={700}
                  style={{ color: theme.colors.accent[5] }}
                >
                  {beer.abv}%
                </Text>
              </Group>
              {beer.ibu && (
                <Group justify="space-between" align="center">
                  <Text fw={500}>Bitterness (IBU)</Text>
                  <Text
                    size="xl"
                    fw={700}
                    style={{ color: theme.colors.accent[5] }}
                  >
                    {beer.ibu}
                  </Text>
                </Group>
              )}
              <Group justify="space-between" align="center">
                <Text fw={500}>Style</Text>
                <Text>{beer.style}</Text>
              </Group>
            </Stack>
          </Paper>

          <Paper p="lg" withBorder shadow="sm">
            <Title order={4} mb="md">
              Brewery Information
            </Title>
            <Stack gap="xs">
              <Anchor
                component={Link}
                to={`/brewery/${beer.brewery.id}`}
                fw={500}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {beer.brewery.name}
              </Anchor>
              <Text size="sm" c="dimmed">
                {beer.brewery.location}
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
