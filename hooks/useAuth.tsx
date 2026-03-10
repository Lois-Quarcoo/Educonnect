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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for stored token and user data on app start
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // TODO: Add AsyncStorage back when installed
        // const token = await AsyncStorage.getItem('authToken');
        // const userData = await AsyncStorage.getItem('userData');

        // For now, just set loading to false
        setLoading(false);
      } catch (error) {
        console.error("Error loading stored auth data:", error);
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const storeToken = (newToken: string) => {
    setToken(newToken);
    setAuthToken(newToken); // Store in global API service
    // TODO: Store with AsyncStorage when installed
    // await AsyncStorage.setItem('authToken', newToken);
  };

  const login = async (email: string, password: string) => {
    try {
      clearError();
      const userData = await authAPI.login(email, password);

      // Store token and user data
      if (userData.token) {
        storeToken(userData.token);
      }
      setUser(userData);
    } catch (error: any) {
      setError(error.message || "Login failed");
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      clearError();
      console.log("Starting signup for:", email);

      const userData = await authAPI.register(name, email, password);
      console.log("Signup successful:", userData);

      // Store token and user data
      if (userData.token) {
        storeToken(userData.token);
      }
      setUser(userData);
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      // TODO: Clear stored data with AsyncStorage
      // await AsyncStorage.removeItem('authToken');
      // await AsyncStorage.removeItem('userData');

      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || "Logout failed");
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await userAPI.getProfile();

      // TODO: Update stored user data with AsyncStorage
      // await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
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
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
