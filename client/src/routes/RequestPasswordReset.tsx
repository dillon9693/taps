import { useMutation } from "@apollo/client";
import { useForm } from "@mantine/form";
import {
  Anchor,
  Button,
  Center,
  Container,
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

  const [sendPasswordReset, { data, loading, error }] =
    useMutation<RequestPasswordResetResult>(REQUEST_PASSWORD_RESET);

  const hasError =
    error || (data?.requestPasswordReset && !data.requestPasswordReset.success);
  const errorMessages =
    error || !data?.requestPasswordReset.success ? [DEFAULT_ERROR_MESSAGE] : [];

  if (data?.requestPasswordReset.success) {
    return (
      <Container mt="xl">
        <Title order={1} mb="lg">
          Check Your Email
        </Title>
        <Text>
          If an account with that email exists, you should receive an email with
          instructions to reset your password.
        </Text>

        <Center>
          <Anchor
            component={Link}
            size="sm"
            m="sm"
            to="/home"
            style={{ color: "inherit" }}
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
            }}
          >
            Return Home
          </Anchor>
        </Center>
      </Container>
    );
  }

  return (
    <Container mt="xl">
      <Title order={1} mb="lg">
        Reset Password
      </Title>

      <Text mb="sm">
        Enter the email associated with your account below, and we&apos;ll send
        you instructions for how to reset your password.
      </Text>
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

      <Center>
        <Anchor
          component={Link}
          size="sm"
          m="sm"
          to="/home"
          style={{ color: "inherit" }}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
          }}
        >
          Return Home
        </Anchor>
      </Center>
    </Container>
  );
}
