import { useMutation } from "@apollo/client";
import { useForm } from "@mantine/form";
import { Link, useNavigate } from "react-router-dom";
import {
  Anchor,
  Button,
  Center,
  Loader,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { REGISTER_USER, RegisterMutationResult } from "../graphql/mutations";
import { GET_CURRENT_USER } from "../graphql/queries";

const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please check the form contents.";

export default function Register() {
  const navigate = useNavigate();
  const lastRoute = "/home"; // TODO get last attempted route

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email address",
      password: (value: string) =>
        value.length < 8 ? "Password must be at least 8 characters" : null,
      confirmPassword: (value: string, values: { password: string }) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const [register, { data, loading, error }] =
    useMutation<RegisterMutationResult>(REGISTER_USER, {
      refetchQueries: [{ query: GET_CURRENT_USER }],
      onCompleted: (result) => {
        if (result.registerUser.success) {
          navigate(lastRoute);
        }
      },
    });

  const hasError = error || (data?.registerUser && !data.registerUser.success);
  const errorMessages =
    data?.registerUser?.errors || (error ? [DEFAULT_ERROR_MESSAGE] : []);

  return (
    <form onSubmit={form.onSubmit((values) => register({ variables: values }))}>
      <TextInput
        label="First Name"
        placeholder="First Name"
        required
        withAsterisk
        disabled={loading}
        key={form.key("firstName")}
        {...form.getInputProps("firstName")}
      />
      <TextInput
        label="Last Name"
        placeholder="Last Name"
        required
        withAsterisk
        disabled={loading}
        key={form.key("lastName")}
        {...form.getInputProps("lastName")}
      />
      <TextInput
        label="Email"
        placeholder="Email"
        required
        withAsterisk
        disabled={loading}
        key={form.key("email")}
        {...form.getInputProps("email")}
      />
      <PasswordInput
        label="Password"
        placeholder="Password"
        description="Must be at least 8 characters and not too common"
        required
        withAsterisk
        disabled={loading}
        key={form.key("password")}
        {...form.getInputProps("password")}
      />
      <PasswordInput
        label="Confirm Password"
        placeholder="Confirm Password"
        required
        withAsterisk
        disabled={loading}
        key={form.key("confirmPassword")}
        {...form.getInputProps("confirmPassword")}
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
        Register
      </Button>

      <Center mt="md">
        <Anchor
          component={Link}
          size="sm"
          to="/login"
          style={{ color: "inherit" }}
        >
          Return to Login
        </Anchor>
      </Center>
    </form>
  );
}
