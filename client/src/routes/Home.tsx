import React from "react";
import { useQuery } from "@apollo/client";
import { Container, Grid, Title, Loader, Alert, Center } from "@mantine/core";
import { FEATURED_BEERS } from "../graphql/queries";
import { Beer } from "../types";
import BeerCard from "../components/BeerCard";

type FeaturedBeersResult = {
  featuredBeers: Beer[];
};

export default function Home() {
  const { loading, error, data } =
    useQuery<FeaturedBeersResult>(FEATURED_BEERS);

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
          Error loading beers: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container mt="xl">
      <Title order={1} mb="lg">
        Featured Beers
      </Title>
      <Grid gutter="lg">
        {data?.featuredBeers?.map((beer) => (
          <Grid.Col key={beer.id} span={{ base: 12, sm: 6, md: 4 }}>
            <BeerCard beer={beer} />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
