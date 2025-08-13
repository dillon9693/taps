import React from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Grid2,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { FEATURED_BEERS } from "../graphql/queries";
import { Beer } from "../types/beer";
import BeerCard from "../components/BeerCard";

type FeaturedBeersResult = {
  featuredBeers: Beer[];
};

export default function Home() {
  const { loading, error, data } =
    useQuery<FeaturedBeersResult>(FEATURED_BEERS);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error loading beers: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Featured Beers
      </Typography>
      <Grid2 container spacing={4}>
        {data?.featuredBeers?.map((beer) => (
          <Grid2 key={beer.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <BeerCard beer={beer} />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
}
