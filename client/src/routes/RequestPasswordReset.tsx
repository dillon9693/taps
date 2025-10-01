import { useMutation } from "@apollo/client";
import { useForm } from "@mantine/form";
import {
  Anchor,
  Button,
  Center,
  Container,
  Grid,
  Loader,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
  REQUEST_PASSWORD_RESET,
  RequestPasswordResetResult,
} from "../graphql/mutations";

const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please check the form contents.";

export default function RequestPasswordReset() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email address",
    },
  });

  const [sendPasswordReset, { called, data, loading, error }] =
    useMutation<RequestPasswordResetResult>(REQUEST_PASSWORD_RESET);

  const hasError =
    error || (data?.requestPasswordReset && !data.requestPasswordReset.success);
  const errorMessages =
    error || !data?.requestPasswordReset.success ? [DEFAULT_ERROR_MESSAGE] : [];

  // TODO fix formatting
  return (
    <Container mt="xl">
      <Grid gutter="lg">
        <Grid.Col span={12}>
          <Title order={1} mb="lg">
            Reset Password
          </Title>
        </Grid.Col>

        {(!called || hasError) && (
          <Container>
            <Grid.Col span={12}>
              <Text>
                Enter the email associated with your account below, and
                we&apos;ll send you instructions for how to reset your password.
              </Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <form
                onSubmit={form.onSubmit((values) =>
                  sendPasswordReset({ variables: values }),
                )}
              >
                <TextInput
                  label="Email"
                  placeholder="Email"
                  required
                  withAsterisk
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                />

                {loading && (
                  <Center mt="md">
                    <Loader />
                  </Center>
                )}

                {hasError && errorMessages.length > 0 && (
                  <Text c="red" size="sm" mt="md">
                    {errorMessages.join(". ")}
                  </Text>
                )}

                <Button type="submit" mt="md" fullWidth>
                  Send Reset Instructions
                </Button>
              </form>
            </Grid.Col>
          </Container>
        )}

        {called && data?.requestPasswordReset.success && (
          <Container>
            <Grid.Col span={12}>
              <Text>
                If an account with that email exists, you should receive an
                email with instructions to reset your password.
              </Text>
            </Grid.Col>
          </Container>
        )}

        <Grid.Col span={12}>
          <Center>
            <Anchor
              component={Link}
              size="sm"
              to="/home"
              style={{ color: "inherit" }}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
              }}
            >
              Return Home
            </Anchor>
          </Center>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
