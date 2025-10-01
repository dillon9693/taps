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
import { LOGIN_USER, LoginUserResult } from "../graphql/mutations";
import { GET_CURRENT_USER } from "../graphql/queries";

const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please check the form contents.";

export default function Login() {
  const navigate = useNavigate();
  const lastRoute = "/home"; // TODO get last attempted route

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email address",
    },
  });

  const [login, { data, loading, error }] = useMutation<LoginUserResult>(
    LOGIN_USER,
    {
      refetchQueries: [{ query: GET_CURRENT_USER }],
      onCompleted: (result) => {
        if (result.loginUser.success) {
          navigate(lastRoute);
        }
      },
    },
  );

  const hasError = error || (data?.loginUser && !data.loginUser.success);
  const errorMessages =
    data?.loginUser?.errors || (error ? [DEFAULT_ERROR_MESSAGE] : []);

  return (
    <form onSubmit={form.onSubmit((values) => login({ variables: values }))}>
      <TextInput
        label="Email"
        placeholder="Email"
        required
        withAsterisk
        key={form.key("email")}
        {...form.getInputProps("email")}
      />
      <PasswordInput
        label="Password"
        placeholder="Password"
        required
        withAsterisk
        key={form.key("password")}
        {...form.getInputProps("password")}
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
        Login
      </Button>

      <Center mt="md">
        <Anchor
          component={Link}
          size="sm"
          to="/request-password-reset"
          style={{ color: "inherit" }}
        >
          Forgot Password?
        </Anchor>
      </Center>
    </form>
  );
}
