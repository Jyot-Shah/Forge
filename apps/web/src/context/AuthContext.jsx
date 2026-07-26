import { createContext, useContext, useEffect, useState } from "react";
import { api, getAccessToken, setAccessToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        if (!getAccessToken()) {
          const { data } = await api.post("/auth/refresh");
          setAccessToken(data.accessToken);
          setUser(data.user);
        } else {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
        }
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }

  async function register(displayName, email, password) {
    const { data } = await api.post("/auth/register", {
      displayName,
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout API failure
    } finally {
      setAccessToken(null);
      setUser(null);
      window.location.href = "/login";
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
