import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI, setAuthToken, userAPI } from "../services/api";

interface User {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  streak: number;
  totalLearningTime: number;
  quizzesCompleted: number;
  videosWatched: number;
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
  };
  createdAt: string;
}

export interface AuthError {
  field: "name" | "email" | "password" | "general";
  message: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    profileImage?: string | null,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseServerError = (message: string): AuthError => {
  const lower = message.toLowerCase();
  if (lower.includes("already exists") || lower.includes("duplicate"))
    return {
      field: "email",
      message: "An account with this email already exists.",
    };
  if (lower.includes("password"))
    return {
      field: "password",
      message: "Password must be at least 6 characters.",
    };
  if (lower.includes("name"))
    return { field: "name", message: "Name is required." };
  return { field: "general", message };
};

// ── Key helpers — store data per-email so users never see each other's data ──
const tokenKey = (email: string) => `auth_token:${email.toLowerCase()}`;
const userKey = (email: string) => `auth_user:${email.toLowerCase()}`;
const LAST_EMAIL_KEY = "last_logged_in_email";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Restore only the LAST logged-in user's session
        const lastEmail = await AsyncStorage.getItem(LAST_EMAIL_KEY);
        if (!lastEmail) {
          setLoading(false);
          return;
        }

        const storedToken = await AsyncStorage.getItem(tokenKey(lastEmail));
        const storedUser = await AsyncStorage.getItem(userKey(lastEmail));

        if (storedToken && storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          // Verify the stored user matches the last email (safety check)
          if (parsedUser.email.toLowerCase() === lastEmail.toLowerCase()) {
            setAuthToken(storedToken);
            setUser(parsedUser);
          } else {
            // Mismatch — clear everything
            await clearAllStoredSessions();
          }
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
        await clearAllStoredSessions();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const clearError = () => setError(null);

  // ── Clear all stored sessions (used on corruption / mismatch) ─────────────
  const clearAllStoredSessions = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(
        (k) => k.startsWith("auth_token:") || k.startsWith("auth_user:") || k === LAST_EMAIL_KEY,
      );
      if (authKeys.length > 0) await AsyncStorage.multiRemove(authKeys);
    } catch (err) {
      console.error("Failed to clear sessions:", err);
    }
  };

  // ── Save session for a specific user ─────────────────────────────────────
  const saveSession = async (userData: User & { token: string }) => {
    const email = userData.email.toLowerCase();
    await AsyncStorage.setItem(tokenKey(email), userData.token);
    await AsyncStorage.setItem(userKey(email), JSON.stringify(userData));
    await AsyncStorage.setItem(LAST_EMAIL_KEY, email);
  };

  // ── Clear session for a specific user ─────────────────────────────────────
  const clearSession = async (email: string) => {
    const e = email.toLowerCase();
    await AsyncStorage.removeItem(tokenKey(e));
    await AsyncStorage.removeItem(userKey(e));
    await AsyncStorage.removeItem(LAST_EMAIL_KEY);
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    clearError();
    if (!email.trim()) {
      const e: AuthError = { field: "email", message: "Email is required." };
      setError(e);
      throw new Error(e.message);
    }
    if (!password) {
      const e: AuthError = { field: "password", message: "Password is required." };
      setError(e);
      throw new Error(e.message);
    }

    try {
      // IMPORTANT: clear any previously loaded user from state FIRST
      // so the UI never flashes old data while the request is in-flight
      setUser(null);
      setAuthToken(null);

      const userData = await authAPI.login(email, password);

      if (userData.token) {
        setAuthToken(userData.token);
        // Save session keyed to THIS user's email
        await saveSession(userData);
        // Set user AFTER saving — this triggers the auth guard navigation
        setUser(userData);
      }
    } catch (err: any) {
      setError(parseServerError(err.message || "Login failed."));
      throw err;
    }
  };

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  const signup = async (
    name: string,
    email: string,
    password: string,
    profileImage?: string | null,
  ) => {
    clearError();

    if (!name.trim()) {
      const e: AuthError = { field: "name", message: "Full name is required." };
      setError(e);
      throw new Error(e.message);
    }
    if (!email.trim() || !email.includes("@")) {
      const e: AuthError = {
        field: "email",
        message: "A valid email address is required.",
      };
      setError(e);
      throw new Error(e.message);
    }
    if (password.length < 6) {
      const remaining = 6 - password.length;
      const e: AuthError = {
        field: "password",
        message: `Password needs ${remaining} more character${remaining !== 1 ? "s" : ""}.`,
      };
      setError(e);
      throw new Error(e.message);
    }

    try {
      // Clear any existing session before creating a new account
      setUser(null);
      setAuthToken(null);

      const userData = await authAPI.register(name, email, password, profileImage);

      if (userData.token) {
        setAuthToken(userData.token);
        await saveSession(userData);
        setUser(userData);
      }
    } catch (err: any) {
      setError(parseServerError(err.message || "Registration failed."));
      throw err;
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      if (user?.email) {
        await clearSession(user.email);
      }
      setAuthToken(null);
      setUser(null);
      clearError();
    } catch (err) {
      console.error("Failed to clear session on logout:", err);
      // Still clear in-memory state even if storage fails
      setAuthToken(null);
      setUser(null);
      clearError();
    }
  };

  // ── REFRESH ───────────────────────────────────────────────────────────────
  const refreshUserData = async () => {
    try {
      const userData = await userAPI.getProfile();
      setUser(userData);
      // Update stored user data too
      if (userData?.email && userData?.token) {
        await saveSession(userData);
      }
    } catch (err) {
      console.error("[Auth] refreshUserData failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, signup, logout, refreshUserData, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};