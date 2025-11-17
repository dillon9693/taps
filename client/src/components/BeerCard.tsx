import { MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Text,
  Rating,
  Badge,
  Group,
  Stack,
  Image,
  Box,
  Anchor,
  useMantineTheme,
} from "@mantine/core";
import type { Beer } from "../types";
import formatBreweryLocation from "../utils/brewery";
import Tag from "./Tag";

interface BeerCardProps {
  beer: Beer;
}

export default function BeerCard(props: BeerCardProps) {
  const { beer } = props;
  const theme = useMantineTheme();

  return (
    <Box
      component={Link}
      to={`/beer/${beer.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        height: "100%",
        display: "block",
      }}
    >
      <Card
        h="100%"
        withBorder
        shadow="sm"
        style={{
          transition: "all 0.2s ease-in-out",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
        }}
        onMouseEnter={(e: any) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e: any) => {
          e.currentTarget.style.transform = "translateY(0px)";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        <Card.Section>
          <Image
            src={beer.imageUrl || "/beer-placeholder.jpg"}
            alt={beer.name}
            height={200}
            fit="cover"
          />
        </Card.Section>

        <Card.Section
          p="md"
          style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <Stack gap="sm" style={{ flexGrow: 1 }}>
            <Text size="xl" fw={500} component="h2">
              {beer.name}
            </Text>

            <Text size="sm" c="dimmed">
              <Anchor
                component={Link}
                to={`/brewery/${beer.brewery.id}`}
                style={{ color: "inherit" }}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                }}
              >
                {beer.brewery.name}
              </Anchor>
              {" • "}
              {formatBreweryLocation(
                beer.brewery.city,
                beer.brewery.stateProvince,
              )}
            </Text>

            <Rating
              value={Number(beer.averageRating)}
              fractions={10}
              readOnly
            />

            <Text size="sm" c="dimmed" lineClamp={3}>
              {beer.description}
            </Text>

            <Group gap="md">
              <Text size="sm">ABV: {beer.abv}%</Text>
              {beer.ibu && <Text size="sm">IBU: {beer.ibu}</Text>}
            </Group>

            <Group gap="xs" style={{ marginTop: "auto" }}>
              <Badge
                size="sm"
                style={{
                  backgroundColor: theme.colors.accent[5],
                  color: "#333",
                }}
              >
                {beer.styleDisplay}
              </Badge>

              {beer.tagsWithVotes.map((tagWithVotes) => (
                <Tag
                  key={`${tagWithVotes.tagId}-${beer.id}`}
                  beer={beer}
                  tag={tagWithVotes}
                  withVotes
                />
              ))}
            </Group>
          </Stack>
        </Card.Section>
      </Card>
    </Box>
  );
}
