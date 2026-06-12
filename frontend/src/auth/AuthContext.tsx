import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "../api/client";
import type { AuthToken, User } from "../api/types";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "btc_portfolio_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = React.useState<string | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as AuthToken).access_token;
  });
  const [user, setUser] = React.useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as AuthToken).user;
  });

  const persist = React.useCallback((auth: AuthToken) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    setToken(auth.access_token);
    setUser(auth.user);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      async login(email, password) {
        persist(await api.login(email, password));
      },
      async register(email, password) {
        persist(await api.register(email, password));
      },
      logout() {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
        queryClient.clear();
      },
    }),
    [persist, queryClient, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

