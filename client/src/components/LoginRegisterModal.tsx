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

enum CurrentState {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD,
}

const stateConfig = {
  [CurrentState.LOGIN]: {
    title: "Login",
    toggleText: "No account? Register",
    toggleTargetState: CurrentState.REGISTER,
  },
  [CurrentState.REGISTER]: {
    title: "Register",
    toggleText: "Have an account? Login",
    toggleTargetState: CurrentState.LOGIN,
  },
  [CurrentState.FORGOT_PASSWORD]: {
    title: "Forgot Password",
    toggleText: " No account? Register",
    toggleTargetState: CurrentState.REGISTER,
  },
};

type ModalFormProps = {
  setViewState: (state: CurrentState) => void;
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

function RegisterForm({ close }: ModalFormProps) {
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
    </form>
  );
}

function LoginForm({ close }: ModalFormProps) {
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
  const [viewState, setViewState] = useState<CurrentState>(CurrentState.LOGIN);
  const { title, toggleTargetState, toggleText } = stateConfig[viewState];

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={title}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      {viewState === CurrentState.REGISTER && (
        <RegisterForm close={close} setViewState={setViewState} />
      )}
      {viewState === CurrentState.LOGIN && (
        <LoginForm close={close} setViewState={setViewState} />
      )}

      <Button
        variant="transparent"
        fullWidth
        onClick={() => setViewState(toggleTargetState)}
      >
        {toggleText}
      </Button>
    </Modal>
  );
}
