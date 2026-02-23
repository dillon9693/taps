import {
  Button,
  Center,
  Container,
  Grid,
  Group,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";

export default function Home() {
  const queryForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      query: "",
    },
  });

  const onQueryFormSubmit = queryForm.onSubmit((values) => {
    console.log(values);
    // TODO send request
  });

  return (
    <Container mt="xl">
      <Center>
        <Title order={1} mb="lg">
          Cheers to you! 🍻
        </Title>
      </Center>

      <form onSubmit={onQueryFormSubmit}>
        <Grid gutter="lg">
          <Grid.Col span={12}>
            <TextInput
              label="What's going on today?"
              {...queryForm.getInputProps("query")}
            />

            <Group justify="flex-end" mt="md">
              <Button type="submit">Find some beers!</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </Container>
  );
}
