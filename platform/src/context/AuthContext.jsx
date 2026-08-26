import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchApi, postApi, setAuthTokenGetter } from "../api";
import { clearSessionApiCache } from "../apiCache";
import { resetNavigationCacheWarmup, warmNavigationCache } from "../navigationCache";

const STORAGE_KEY = "mbo_auth_token";

const AuthContext = createContext(null);

function readStoredToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    writeStoredToken(null);
    setToken(null);
    setUser(null);
    resetNavigationCacheWarmup();
    clearSessionApiCache();
  }, []);

  const applySession = useCallback((nextToken, nextUser) => {
    writeStoredToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
    warmNavigationCache({ isPortal: nextUser?.role === "CLIENT" });
  }, []);

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetchApi("/auth/me");
        if (!active) return;
        setUser(response.user);
        warmNavigationCache({ isPortal: response.user?.role === "CLIENT" });
      } catch {
        if (!active) return;
        clearSession();
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    bootstrap();
    return () => {
      active = false;
    };
  }, [token, clearSession]);

  const login = useCallback(
    async ({ email, password }) => {
      const response = await postApi("/auth/login", { email, password });
      applySession(response.accessToken, response.user);
      return response;
    },
    [applySession],
  );

  const register = useCallback(
    async ({ email, password, name, verificationToken }) => {
      const response = await postApi("/auth/register", {
        email,
        password,
        name,
        verificationToken,
      });
      applySession(response.accessToken, response.user);
      return response;
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      if (token) {
        await postApi("/auth/logout");
      }
    } catch {
      // Always clear local session even if the server call fails.
    } finally {
      clearSession();
    }
  }, [token, clearSession]);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    const response = await fetchApi("/auth/me");
    setUser(response.user);
    return response.user;
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
