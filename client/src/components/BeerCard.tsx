import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Chip,
  Box,
} from "@mui/material";
import type { Beer } from "../types/beer";

interface BeerCardProps {
  beer: Beer;
}

export default function BeerCard(props: BeerCardProps) {
  const { beer } = props;

  return (
    <Card
      component={Link}
      to={`/beer/${beer.id}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
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
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {beer.brewery.name} • {beer.brewery.location}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Rating value={Number(beer.averageRating)} precision={0.1} readOnly />
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
          <Chip label={beer.styleDisplay} color="primary" size="small" />
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
  );
}
