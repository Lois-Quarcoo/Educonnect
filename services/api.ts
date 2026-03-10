// Try different API URLs based on device type
const getApiUrl = () => {
  // For development, try different URLs
  const possibleUrls = [
    "http://10.0.2.2:5000/api", // Android Emulator (default)
    "http://10.0.2.15:5000/api", // Alternative Android Emulator
    "http://192.168.100.228:5000/api", // Your computer's IP (from Expo logs)
    "http://localhost:5000/api", // iOS Simulator
  ];

  return __DEV__ ? possibleUrls[2] : "https://your-production-url.com/api";
};

const API_URL = getApiUrl();

// For different environments:
// - iOS Simulator: http://localhost:5000/api
// - Android Emulator: http://10.0.2.2:5000/api
// - Physical Device: http://YOUR_COMPUTER_IP:5000/api

// Global token storage (temporary solution)
let globalToken: string | null = null;

// Helper to get stored JWT token
const getAuthToken = async () => {
  // TODO: Get from AsyncStorage when installed
  // const token = await AsyncStorage.getItem('authToken');
  // if (!token) throw new Error('Not authenticated');
  // return token;

  // For now, use global token
  return globalToken;
};

// Helper to set JWT token
export const setAuthToken = (token: string) => {
  globalToken = token;
};

// Helper to make authenticated API calls
const authenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
};

// Helper to make public API calls
const publicRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection.");
    }
    throw error;
  }
};

export const authAPI = {
  // Register new user
  register: async (name: string, email: string, password: string) => {
    console.log("API: Registering user", email);
    console.log("API: Using URL:", API_URL);

    try {
      const result = await publicRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      console.log("API: Registration successful", result);
      return result;
    } catch (error) {
      console.error("API: Registration failed", error);
      throw error;
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    console.log("API: Logging in user", email);

    try {
      const result = await publicRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      console.log("API: Login successful", result);
      return result;
    } catch (error) {
      console.error("API: Login failed", error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    return authenticatedRequest("/auth/me");
  },
};

export const userAPI = {
  // Get current user profile from MongoDB
  getProfile: async () => {
    return authenticatedRequest("/user/me");
  },

  // Update user profile
  updateProfile: async (updates: any) => {
    return authenticatedRequest("/user/me", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Update user stats
  updateStats: async (stats: any) => {
    return authenticatedRequest("/user/stats", {
      method: "PUT",
      body: JSON.stringify(stats),
    });
  },
};
