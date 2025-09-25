import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Grid,
  Title,
  Center,
  Loader,
  Alert,
  TextInput,
  Select,
  RangeSlider,
  Paper,
  Stack,
  Button,
  Group,
} from "@mantine/core";
import { SEARCH_BEERS } from "../graphql/queries";
import { Beer } from "../types";
import BeerCard from "../components/BeerCard";
import useDebounce from "../hooks/useDebounce";
import { usePageTitle } from "../hooks/usePageTitle";

const BEER_STYLES = [
  { value: "", label: "All Styles" },
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

// Default filter values
const DEFAULT_SEARCH_TERM = "";
const DEFAULT_STYLE = "";
const DEFAULT_ABV_RANGE: [number, number] = [0, 15];

type SearchBeersResult = {
  allBeers: Beer[];
};

export default function Search() {
  const [searchTerm, setSearchTerm] = useState(DEFAULT_SEARCH_TERM);

  usePageTitle({
    title: "Search Beers",
  });
  const [selectedStyle, setSelectedStyle] = useState(DEFAULT_STYLE);
  const [abvRange, setAbvRange] = useState(DEFAULT_ABV_RANGE);

  // Reset filters to default values
  const handleResetFilters = () => {
    setSearchTerm(DEFAULT_SEARCH_TERM);
    setSelectedStyle(DEFAULT_STYLE);
    setAbvRange(DEFAULT_ABV_RANGE);
  };

  // Debounced search parameters
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedStyle = useDebounce(selectedStyle, 300);
  const debouncedAbvRange = useDebounce(abvRange, 300);

  const { loading, error, data } = useQuery<SearchBeersResult>(SEARCH_BEERS, {
    variables: {
      search: debouncedSearchTerm || undefined,
      style: debouncedStyle || undefined,
      minAbv: debouncedAbvRange[0] || undefined,
      maxAbv: debouncedAbvRange[1] || undefined,
    },
  });

  return (
    <Container mt="xl">
      <Paper p="md" mb="lg">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search beers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              placeholder="Enter beer name..."
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Beer Style"
              value={selectedStyle}
              onChange={(value) => setSelectedStyle(value || "")}
              data={BEER_STYLES}
              placeholder="Select beer style"
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xs">
              <Title order={6}>ABV Range (%)</Title>
              <RangeSlider
                value={abvRange}
                onChange={setAbvRange}
                min={0}
                max={15}
                step={0.1}
                minRange={0}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 7.5, label: "7.5%" },
                  { value: 15, label: "15%" },
                ]}
                label={(value) => `${value}%`}
              />
            </Stack>
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </Group>
      </Paper>

      {loading && (
        <Center mt="xl">
          <Loader />
        </Center>
      )}
      {error && (
        <Alert color="red" title="Error" mt="md">
          Error loading beers: {error.message}
        </Alert>
      )}
      {!loading && !error && (
        <Grid gutter="lg">
          {data?.allBeers?.map((beer) => (
            <Grid.Col key={beer.id} span={{ base: 12, sm: 6, md: 4 }}>
              <BeerCard beer={beer} />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}
