import Constants from "expo-constants";

// ── API URL ──────────────────────────────────────────────────────────────────
const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (debuggerHost && __DEV__) {
    return `http://${debuggerHost}:5000/api`;
  }

  if (__DEV__) {
    return "http://localhost:5000/api";
  }
  return "https://your-production-url.com/api";
};

export const API_URL = getApiUrl();

// ── Auth token storage ───────────────────────────────────────────────────────
let globalToken: string | null = null;

// FIX: accept null so logout properly clears the token
export const setAuthToken = (token: string | null) => {
  globalToken = token || null;
};

// ── Request helpers ──────────────────────────────────────────────────────────
const publicRequest = async (endpoint: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    console.log(`API [public] ${options.method ?? "GET"} ${API_URL}${endpoint}`);

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...options.headers },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Is the backend server running?");
    }
    throw error;
  }
};

const authenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  if (!globalToken) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${globalToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data.data;
};

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: async (
    name: string,
    email: string,
    password: string,
    avatar?: string | null,
  ) => {
    return publicRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, avatar }),
    });
  },

  login: async (email: string, password: string) => {
    return publicRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => authenticatedRequest("/auth/me"),
};

// ── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: async () => authenticatedRequest("/user/me"),

  updateProfile: async (updates: Record<string, unknown>) =>
    authenticatedRequest("/user/me", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  updateStats: async (stats: Record<string, unknown>) =>
    authenticatedRequest("/user/stats", {
      method: "PUT",
      body: JSON.stringify(stats),
    }),
};

// ── Subject / Quiz / Video types ─────────────────────────────────────────────
export interface Subject {
  id: string;
  title: string;
  lessonsCount: number;
  videosCount: number;
  quizzesCount: number;
  progress: number;
  color: string;
  iconName: string;
}

export interface QuizQuestion {
  id: string;
  type: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimitMins: number | null;
  questions: QuizQuestion[];
}

export interface VideoLesson {
  id: string;
  subjectId: string;
  title: string;
  duration: string;
  thumbnailUrl?: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────
const SUBJECTS: Subject[] = [
  {
    id: "math",
    title: "Mathematics",
    lessonsCount: 24,
    videosCount: 12,
    quizzesCount: 8,
    progress: 64,
    color: "#7C3AED",
    iconName: "Calculator",
  },
  {
    id: "science",
    title: "Science",
    lessonsCount: 18,
    videosCount: 9,
    quizzesCount: 6,
    progress: 30,
    color: "#3B82F6",
    iconName: "Atom",
  },
  {
    id: "english",
    title: "English",
    lessonsCount: 32,
    videosCount: 15,
    quizzesCount: 10,
    progress: 50,
    color: "#F97316",
    iconName: "BookOpen",
  },
  {
    id: "history",
    title: "History",
    lessonsCount: 14,
    videosCount: 7,
    quizzesCount: 5,
    progress: 20,
    color: "#92400E",
    iconName: "Landmark",
  },
  {
    id: "geography",
    title: "Geography",
    lessonsCount: 16,
    videosCount: 8,
    quizzesCount: 4,
    progress: 10,
    color: "#10B981",
    iconName: "Globe",
  },
  {
    id: "physics",
    title: "Physics",
    lessonsCount: 20,
    videosCount: 10,
    quizzesCount: 7,
    progress: 0,
    color: "#F59E0B",
    iconName: "Zap",
  },
];

const QUIZZES: Quiz[] = [
  {
    id: "algebra_fundamentals",
    subjectId: "math",
    title: "Algebra Fundamentals",
    difficulty: "Easy",
    timeLimitMins: 10,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "What is the value of x in: 2x + 4 = 10?",
        options: ["2", "3", "4", "5"],
        correctAnswerIndex: 1,
      },
      {
        id: "q2",
        type: "multiple_choice",
        text: "Which of the following is a linear equation?",
        options: ["y = x²", "y = 2x + 1", "y = x³", "y = √x"],
        correctAnswerIndex: 1,
      },
      {
        id: "q3",
        type: "multiple_choice",
        text: "Simplify: 3(x + 2) – x",
        options: ["2x + 6", "2x – 6", "4x + 6", "2x + 2"],
        correctAnswerIndex: 0,
      },
    ],
  },
  {
    id: "geometry_basics",
    subjectId: "math",
    title: "Geometry Basics",
    difficulty: "Medium",
    timeLimitMins: 15,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "What is the sum of angles in a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswerIndex: 1,
      },
      {
        id: "q2",
        type: "multiple_choice",
        text: "Area of a circle with radius r is:",
        options: ["2πr", "πr²", "2πr²", "πd"],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    id: "science_cells",
    subjectId: "science",
    title: "Cell Biology",
    difficulty: "Medium",
    timeLimitMins: 12,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "Which organelle is known as the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correctAnswerIndex: 2,
      },
      {
        id: "q2",
        type: "multiple_choice",
        text: "What controls what enters and exits a cell?",
        options: ["Cell wall", "Cell membrane", "Nucleus", "Cytoplasm"],
        correctAnswerIndex: 1,
      },
    ],
  },
];

const VIDEOS: VideoLesson[] = [
  { id: "v1", subjectId: "math", title: "Introduction to Algebra", duration: "12:34" },
  { id: "v2", subjectId: "math", title: "Solving Linear Equations", duration: "18:22" },
  { id: "v3", subjectId: "science", title: "What is Photosynthesis?", duration: "10:05" },
  { id: "v4", subjectId: "english", title: "Punctuation Made Easy", duration: "08:47" },
];

// ── Subject fetchers ─────────────────────────────────────────────────────────
export const fetchSubjects = async (): Promise<Subject[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(SUBJECTS), 400));
};

export const fetchSubjectById = async (id: string): Promise<Subject | undefined> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(SUBJECTS.find((s) => s.id === id)), 300),
  );
};

export const fetchQuizzesBySubject = async (subjectId: string): Promise<Quiz[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(QUIZZES.filter((q) => q.subjectId === subjectId)), 300),
  );
};

export const fetchQuizById = async (quizId: string): Promise<Quiz | undefined> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(QUIZZES.find((q) => q.id === quizId)), 300),
  );
};

export const fetchVideosBySubject = async (subjectId: string): Promise<VideoLesson[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(VIDEOS.filter((v) => v.subjectId === subjectId)), 300),
  );
};