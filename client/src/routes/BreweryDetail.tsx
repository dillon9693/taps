import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  Container,
  Grid,
  Title,
  Card,
  Text,
  Group,
  Loader,
  Alert,
  Paper,
  Button,
  Center,
  Stack,
  useMantineTheme,
  SimpleGrid,
  Badge,
  Rating,
  Anchor,
} from "@mantine/core";
import { GET_BREWERY_BY_ID } from "../graphql/queries";
import type { Brewery } from "../types";
import { usePageTitle } from "../hooks/usePageTitle";
import formatBreweryLocation from "../utils/brewery";

type GetBreweryResult = {
  breweryById: Brewery;
};

export default function BreweryDetail() {
  const { id } = useParams<{ id: string }>();
  const theme = useMantineTheme();
  const { loading, error, data } = useQuery<GetBreweryResult>(
    GET_BREWERY_BY_ID,
    {
      variables: { id },
      skip: !id,
    },
  );

  usePageTitle({
    title: data?.breweryById?.name || "Brewery Details",
  });

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
          Error loading brewery: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!data?.breweryById) {
    return (
      <Container mt="xl">
        <Stack gap="md">
          <Alert color="red" title="Error">
            Brewery not found
          </Alert>
          <Button component={Link} to="/home">
            Return to Home
          </Button>
        </Stack>
      </Container>
    );
  }

  const { breweryById: brewery } = data;

  return (
    <Container mt="xl" mb="xl">
      {/* Hero Section */}
      <Card mb="lg" withBorder shadow="md">
        <Card.Section p="xl">
          <Stack gap="md">
            <Title order={1}>{brewery.name}</Title>
            <Text size="xl" c="dimmed">
              {formatBreweryLocation(brewery.city, brewery.stateProvince)}
            </Text>
            {brewery.beerCount && (
              <Group align="center">
                <Badge
                  size="lg"
                  variant="outline"
                  style={{
                    borderColor: theme.colors.accent[5],
                    color: theme.colors.accent[5],
                  }}
                >
                  {brewery.beerCount}{" "}
                  {brewery.beerCount === 1 ? "Beer" : "Beers"}
                </Badge>
              </Group>
            )}
          </Stack>
        </Card.Section>
      </Card>

      {/* Main Content */}
      <Grid>
        {/* Left Column - Description and Beers */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          {brewery.description && (
            <Paper p="lg" mb="md" withBorder shadow="sm">
              <Title order={3} mb="md">
                About {brewery.name}
              </Title>
              <Text lh={1.7}>{brewery.description}</Text>
            </Paper>
          )}

          {brewery.beers && brewery.beers.length > 0 && (
            <Paper p="lg" withBorder shadow="sm">
              <Title order={3} mb="md">
                Our Beers
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {brewery.beers.map((beer) => (
                  <Card
                    key={beer.id}
                    component={Link}
                    to={`/beer/${beer.id}`}
                    withBorder
                    shadow="sm"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e: any) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e: any) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-start">
                        <Title order={5}>{beer.name}</Title>
                        {beer.averageRating > 0 && (
                          <Group gap="xs" align="center">
                            <Rating
                              value={Number(beer.averageRating)}
                              fractions={10}
                              readOnly
                              size="sm"
                            />
                            <Text size="sm">{beer.averageRating}</Text>
                          </Group>
                        )}
                      </Group>
                      <Group gap="md">
                        <Text size="sm" c="dimmed">
                          {beer.styleDisplay || beer.style}
                        </Text>
                        <Text size="sm" fw={500}>
                          {beer.abv}% ABV
                        </Text>
                        {beer.ibu && <Text size="sm">{beer.ibu} IBU</Text>}
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Paper>
          )}
        </Grid.Col>

        {/* Right Column - Brewery Info */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="lg" withBorder shadow="sm">
            <Title order={4} mb="md">
              Brewery Information
            </Title>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text fw={500}>Location</Text>
                <Text>
                  {formatBreweryLocation(brewery.city, brewery.stateProvince)}
                </Text>
              </Group>
              {brewery.yearFounded && (
                <Group justify="space-between" align="center">
                  <Text fw={500}>Founded</Text>
                  <Text>{brewery.yearFounded}</Text>
                </Group>
              )}
              {brewery.website && (
                <Group justify="space-between" align="center">
                  <Text fw={500}>Website</Text>
                  <Anchor
                    href={brewery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: theme.colors.accent[5] }}
                  >
                    Visit Website
                  </Anchor>
                </Group>
              )}
              {brewery.beerCount && (
                <Group justify="space-between" align="center">
                  <Text fw={500}>Total Beers</Text>
                  <Text
                    size="xl"
                    fw={700}
                    style={{ color: theme.colors.accent[5] }}
                  >
                    {brewery.beerCount}
                  </Text>
                </Group>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
