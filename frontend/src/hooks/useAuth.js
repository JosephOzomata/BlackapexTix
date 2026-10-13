import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/auth.service";
import { queryKeys } from "../queryClient";

/**
 * Bootstraps auth state once for the app.
 * Mounted by App.jsx. In production, GET /auth/me is the source of truth
 * on every cold start.
 */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const hydrate = useAuthStore((s) => s.hydrate);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    hydrate(); // restore from mock-session cache first
  }, [hydrate]);

  useEffect(() => {
    if (isLoading) {
      setStatus("loading");
      return;
    }
    if (data?.success && data.data?.user) {
      setUser(data.data.user);
    } else {
      // No session — but keep any hydrated mock session for dev continuity.
      const cached = useAuthStore.getState().user;
      if (!cached) setStatus("unauthenticated");
    }
  }, [data, isLoading, setUser, setStatus]);
}

/** Simple accessor hook. */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const signIn = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success) setUser(res.data.user);
    return res;
  };

  const signUp = async (payload) => {
    const res = await authService.register(payload);
    if (res.success) setUser(res.data.user);
    return res;
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      queryClient.removeQueries();
    }
  };

  return {
    user,
    role,
    status,
    isAuthenticated: status === "authenticated" && Boolean(user),
    isLoading: status === "loading",
    signIn,
    signUp,
    signOut,
  };
}

export default useAuth;