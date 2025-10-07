import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../contexts/AuthContext";

/**
 * Route guard that redirects un-authenticated users to /login.
 */
export default function RequireAuthenticated({
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
