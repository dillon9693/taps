import { useState } from "react";
import {
  Button,
  Center,
  Loader,
  Modal,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, REGISTER_USER } from "../graphql/mutations";
import { GET_CURRENT_USER } from "../graphql/queries";

const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please check the form contents.";

type ModalProps = {
  close: () => void;
};

type RegisterMutationResult = {
  registerUser: {
    success: boolean;
    errors: string[];
  };
};

type LoginUserResult = {
  loginUser: {
    success: boolean;
    errors: string[];
  };
};

function RegisterForm({ close }: ModalProps) {
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
          close();
        }
      },
    });

  const hasError = error || (data?.registerUser && !data.registerUser.success);

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
        description="Must be at least 8 characters"
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

      {/* TODO make this look better */}
      {loading && (
        <Center>
          <Loader />
        </Center>
      )}

      {/* TODO make this look better */}
      {hasError && (
        <Text c="red" size="sm">
          {DEFAULT_ERROR_MESSAGE}
        </Text>
      )}

      <Button type="submit" mt="md" fullWidth>
        Register
      </Button>
    </form>
  );
}

function LoginForm({ close }: ModalProps) {
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
          close();
        }
      },
    },
  );

  const hasError = error || (data?.loginUser && !data.loginUser.success);

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
        description="Must be at least 8 characters"
        required
        withAsterisk
        key={form.key("password")}
        {...form.getInputProps("password")}
      />

      {/* TODO make this look better */}
      {loading && (
        <Center>
          <Loader />
        </Center>
      )}

      {/* TODO make this look better */}
      {hasError && (
        <Text c="red" size="sm">
          {DEFAULT_ERROR_MESSAGE}
        </Text>
      )}

      <Button type="submit" mt="md" fullWidth>
        Login
      </Button>
    </form>
  );
}

interface LoginRegisterModalProps {
  opened: boolean;
  close: () => void;
}

export default function LoginRegisterModal({
  opened,
  close,
}: LoginRegisterModalProps) {
  const [isRegistering, setIsRegistering] = useState(true);
  const modalTitle = isRegistering ? "Register" : "Login";

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={modalTitle}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      {isRegistering ? (
        <RegisterForm close={close} />
      ) : (
        <LoginForm close={close} />
      )}
      <Button
        variant="transparent"
        fullWidth
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? "Have an account? Login" : "No account? Register"}
      </Button>
    </Modal>
  );
}
