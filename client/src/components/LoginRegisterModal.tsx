import React from "react";
import { Button, Modal, PasswordInput, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

function RegisterForm() {
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
      password: (value: string) => {
        console.log("#####");

        return value.length < 8
          ? "Password must be at least 8 characters"
          : null;
      },
      confirmPassword: (value: string, values: { password: string }) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const register = (v: typeof form.values) => {
    console.log("registering user");
    console.log(v);
  };

  return (
    <form onSubmit={form.onSubmit((values) => register(values))}>
      <TextInput
        label="First Name"
        placeholder="First Name"
        required
        withAsterisk
        key={form.key("firstName")}
        {...form.getInputProps("firstName")}
      />
      <TextInput
        label="Last Name"
        placeholder="Last Name"
        required
        withAsterisk
        key={form.key("lastName")}
        {...form.getInputProps("lastName")}
      />
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
      <PasswordInput
        label="Confirm Password"
        placeholder="Confirm Password"
        required
        withAsterisk
        key={form.key("confirmPassword")}
        {...form.getInputProps("confirmPassword")}
      />

      <Button type="submit" mt="md" fullWidth>
        Register
      </Button>
    </form>
  );
}

function LoginForm() {
  return <Text>Login Form</Text>;
}

interface LoginRegisterModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function LoginRegisterModal({
  opened,
  onClose,
}: LoginRegisterModalProps) {
  const [isRegistering, setIsRegistering] = React.useState(true);

  const modalTitle = isRegistering ? "Register" : "Login";
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={modalTitle}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      {isRegistering ? <RegisterForm /> : <LoginForm />}
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
