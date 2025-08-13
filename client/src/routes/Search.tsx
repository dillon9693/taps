import React, { useState } from "react";
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
  TextField,
  MenuItem,
  Slider,
  Paper,
} from "@mui/material";
import { SEARCH_BEERS } from "../graphql/queries";
import { Beer } from "../types/beer";

const BEER_STYLES = [
  { value: "IPA", label: "India Pale Ale" },
  { value: "DIPA", label: "Double IPA" },
  { value: "STOUT", label: "Stout" },
  { value: "PORTER", label: "Porter" },
  { value: "LAGER", label: "Lager" },
  { value: "PILSNER", label: "Pilsner" },
  { value: "WHEAT", label: "Wheat Beer" },
  { value: "SOUR", label: "Sour" },
  { value: "OTHER", label: "Other" },
];

type SearchBeersResult = {
  allBeers: Beer[];
};

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [abvRange, setAbvRange] = useState<number[]>([0, 15]);

  const { loading, error, data } = useQuery<SearchBeersResult>(SEARCH_BEERS, {
    variables: {
      search: searchTerm || undefined,
      style: selectedStyle || undefined,
      minAbv: abvRange[0] || undefined,
      maxAbv: abvRange[1] || undefined,
    },
  });

  const handleAbvChange = (_event: Event, newValue: number | number[]) => {
    setAbvRange(newValue as number[]);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search beers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Beer Style"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="">All Styles</MenuItem>
              {BEER_STYLES.map((style) => (
                <MenuItem key={style.value} value={style.value}>
                  {style.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>ABV Range (%)</Typography>
            <Slider
              value={abvRange}
              onChange={handleAbvChange}
              valueLabelDisplay="auto"
              min={0}
              max={15}
              step={0.5}
            />
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error">Error loading beers: {error.message}</Alert>
      )}
      {!loading && !error && (
        <Grid container spacing={4}>
          {data?.allBeers?.map((beer) => (
            <Grid item xs={12} sm={6} md={4} key={beer.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
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
                      value={beer.averageRating}
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
      )}
    </Container>
  );
}
