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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const clearError = () => setError(null);

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
      const userData = await authAPI.login(email, password);
      if (userData.token) {
        setAuthToken(userData.token);
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

    console.log("[Auth] signup →", email);
    try {
      const userData = await authAPI.register(name, email, password, profileImage);
      console.log("[Auth] signup OK, _id:", userData._id);
      if (userData.token) {
        setAuthToken(userData.token);
        setUser(userData);
      }
    } catch (err: any) {
      setError(parseServerError(err.message || "Registration failed."));
      throw err;
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    // FIX: use null (not "") so globalToken is properly cleared
    setAuthToken(null);
    setUser(null);
    clearError();
  };

  // ── REFRESH ───────────────────────────────────────────────────────────────
  const refreshUserData = async () => {
    try {
      const userData = await userAPI.getProfile();
      setUser(userData);
    } catch (err) {
      console.error("[Auth] refreshUserData failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        refreshUserData,
        clearError,
      }}
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