import {
  Button,
  Container,
  Grid,
  PasswordInput,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { RESET_PASSWORD, ResetPasswordResult } from "../graphql/mutations";

const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please check the form contents.";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  if (!token || !uid) {
    return (
      <Container mt="xl">
        <Title order={1} mb="lg">
          Invalid Password Reset Link
        </Title>
        <Text>
          The password reset link is invalid or incomplete. Please check your
          email and try again.
        </Text>
      </Container>
    );
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value: string) =>
        value.length < 8 ? "Password must be at least 8 characters" : null,
      confirmPassword: (value: string, values: { password: string }) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const [resetPassword, { data, loading, error }] =
    useMutation<ResetPasswordResult>(RESET_PASSWORD);

  const hasError =
    error || (data?.resetPassword && !data.resetPassword.success);
  const errorMessages =
    data?.resetPassword?.errors || (error ? [DEFAULT_ERROR_MESSAGE] : []);

  // TODO route to login
  if (data?.resetPassword.success) {
    return (
      <Container mt="xl">
        <Title order={1} mb="lg">
          Password Reset Successful
        </Title>
        <Text>Your password has been reset successfully. </Text>
        <Button variant="transparent" fullWidth>
          Return to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container mt="xl">
      <Title order={1} mb="lg">
        Reset Password
      </Title>
      <Grid gutter="lg">
        <Grid.Col span={12}>
          <Text>Enter your new password below</Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <form
            onSubmit={form.onSubmit(({ password }) =>
              resetPassword({
                variables: { newPassword: password, token, uid },
              }),
            )}
          >
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

            {hasError && errorMessages.length > 0 && (
              <Text c="red" size="sm" mt="md">
                {errorMessages.join(". ")}
              </Text>
            )}

            <Button type="submit" mt="md">
              Reset Password
            </Button>
          </form>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
