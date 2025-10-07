import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../contexts/AuthContext";

/**
 * Route guard that redirects authenticated users to /home.
 * Use this to protect auth routes (login, register, password reset)
 * that should only be accessible to unauthenticated users.
 */
export default function RequireUnauthenticated({
  children,
}: {
  children: ReactElement;
}) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
