import { useLazyQuery } from "@apollo/client";
import {
  Button,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  SEARCH_BEERS_BY_QUERY,
  SearchBeersByQueryResult,
} from "../graphql/queries";
import BeerCard from "../components/BeerCard";

export default function Home() {
  const queryForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      query: "",
    },
    validate: {
      query: (value: string) =>
        value.length <= 0 ? "You must be doing something!" : null,
    },
  });

  const [
    searchBeersByQuery,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<SearchBeersByQueryResult>(SEARCH_BEERS_BY_QUERY);

  const onQueryFormSubmit = queryForm.onSubmit((values) => {
    searchBeersByQuery({
      variables: {
        query: values.query,
        count: 6,
      },
    });
  });

  return (
    <Container mt="xl">
      <Center>
        <Title order={1} mb="lg">
          Cheers to you! 🍻
        </Title>
      </Center>

      <Grid gutter="lg">
        <Grid.Col span={12}>
          <form onSubmit={onQueryFormSubmit}>
            <TextInput
              label="What's going on today?"
              {...queryForm.getInputProps("query")}
            />

            <Group justify="flex-end" mt="md">
              <Button type="submit" disabled={queryLoading}>
                Find some beers!
              </Button>
            </Group>
          </form>
        </Grid.Col>

        {queryLoading && (
          // <Center mt="md">
          <Grid.Col span={12}>
            <Center>
              <Loader />
            </Center>
          </Grid.Col>
        )}

        {queryError && !queryLoading && (
          // <Center mt="md">
          <Grid.Col span={12}>
            <Center>
              <Text c="red" size="sm" mt="md">
                Error loading beers. Try again
              </Text>
            </Center>
          </Grid.Col>
        )}

        {!queryLoading && !queryError && queryData && (
          <>
            {queryData?.searchBeersByQuery?.matchingTags && (
              <Grid.Col span={12}>
                Tags used:{" "}
                {queryData?.searchBeersByQuery?.matchingTags?.join(", ")}
              </Grid.Col>
            )}

            {queryData?.searchBeersByQuery?.beers?.map((beer) => (
              <Grid.Col key={beer.id} span={{ base: 12, sm: 6, md: 4 }}>
                <BeerCard beer={beer} />
              </Grid.Col>
            ))}
          </>
        )}
      </Grid>
    </Container>
  );
}
