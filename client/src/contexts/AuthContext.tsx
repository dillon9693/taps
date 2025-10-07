import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { GET_CURRENT_USER } from "../graphql/queries";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, loading, error } = useQuery(GET_CURRENT_USER, {
    errorPolicy: "all",
  });

  const isAuthenticated = !error && !!data?.currentUser;
  const currentUser = data?.currentUser || null;

  const value = useMemo(
    () => ({ currentUser, isAuthenticated, loading }),
    [currentUser, isAuthenticated, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
