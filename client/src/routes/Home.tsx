import React from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { FEATURED_BEERS } from "../graphql/queries";
import { Beer } from "../types/beer";

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
      <Grid container spacing={4}>
        {data?.featuredBeers?.map((beer) => (
          <Grid item xs={12} sm={6} md={4} key={beer.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardMedia
                component="img"
                height="200"
                image={beer.imageUrl || "/beer-placeholder.jpg"}
                alt={beer.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {beer.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  {beer.brewery.name} • {beer.brewery.location}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Rating
                    value={Number(beer.averageRating)}
                    precision={0.1}
                    readOnly
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {beer.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" component="span" sx={{ mr: 2 }}>
                    ABV: {beer.abv}%
                  </Typography>
                  {beer.ibu && (
                    <Typography variant="body2" component="span">
                      IBU: {beer.ibu}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip
                    label={beer.styleDisplay}
                    color="primary"
                    size="small"
                  />
                  {beer.tags.map((tag) => (
                    <Chip
                      key={tag.name}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
