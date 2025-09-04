import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  Container,
  Grid2,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { GET_BEER } from "../graphql/queries";
import type { Beer } from "../types/beer";

type GetBeerResult = {
  beerById: Beer;
};

export default function BeerDetail() {
  const { id } = useParams<{ id: string }>();
  const { loading, error, data } = useQuery<GetBeerResult>(GET_BEER, {
    variables: { id },
    skip: !id,
  });

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
        <Alert severity="error">Error loading beer: {error.message}</Alert>
      </Container>
    );
  }

  if (!data?.beerById) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Beer not found</Alert>
      </Container>
    );
  }

  const { beerById: beer } = data;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Card sx={{ mb: 4 }}>
        <Grid2 container>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <CardMedia
              component="img"
              sx={{ height: 400, objectFit: "cover" }}
              image={beer.imageUrl || "/beer-placeholder.jpg"}
              alt={beer.name}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <CardContent sx={{ height: "100%", p: 4 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                {beer.name}
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 2 }}
              >
                {beer.brewery.name} • {beer.brewery.location}
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Rating
                  value={Number(beer.averageRating)}
                  precision={0.1}
                  readOnly
                  size="large"
                />
                <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                  {beer.averageRating}/5
                </Typography>
              </Box>
              <Chip
                label={beer.styleDisplay}
                color="primary"
                size="medium"
                sx={{ fontSize: "1rem", py: 1 }}
              />
            </CardContent>
          </Grid2>
        </Grid2>
      </Card>

      {/* Main Content */}
      <Grid2 container spacing={4}>
        {/* Left Column - Description and Tags */}
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              About This Beer
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              {beer.description}
            </Typography>
          </Paper>

          {beer.tags.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Characteristics
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {beer.tags.map((tag) => (
                  <Chip
                    key={tag.name}
                    label={tag.name}
                    variant="outlined"
                    size="medium"
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid2>

        {/* Right Column - Technical Specs */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Technical Details
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  Alcohol by Volume
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {beer.abv}%
                </Typography>
              </Box>
              {beer.ibu && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    Bitterness (IBU)
                  </Typography>
                  <Typography variant="h6" color="secondary.main">
                    {beer.ibu}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  Style
                </Typography>
                <Typography variant="body1">{beer.style}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Brewery Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                {beer.brewery.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {beer.brewery.location}
              </Typography>
            </Box>
          </Paper>
        </Grid2>
      </Grid2>
    </Container>
  );
}
