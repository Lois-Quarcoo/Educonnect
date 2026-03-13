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
  description?: string;
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
    title: "Cell Biology Quiz",
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
  {
    id: "english_grammar",
    subjectId: "english",
    title: "Grammar & Writing Quiz",
    difficulty: "Easy",
    timeLimitMins: 10,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "Which sentence is grammatically correct?",
        options: [
          "Me and him went to school.",
          "He and I went to school.",
          "Him and me went to school.",
          "I and he went to school.",
        ],
        correctAnswerIndex: 1,
      },
      {
        id: "q2",
        type: "multiple_choice",
        text: "What is the purpose of a thesis statement?",
        options: [
          "To summarize the essay",
          "To state the central argument",
          "To introduce evidence",
          "To conclude the essay",
        ],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    id: "history_ancient",
    subjectId: "history",
    title: "Ancient Civilizations Quiz",
    difficulty: "Medium",
    timeLimitMins: 12,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "Where was the first civilization developed?",
        options: ["Ancient Egypt", "Mesopotamia", "Indus Valley", "Ancient China"],
        correctAnswerIndex: 1,
      },
      {
        id: "q2",
        type: "multiple_choice",
        text: "Which writing system did the ancient Egyptians use?",
        options: ["Cuneiform", "Latin", "Hieroglyphics", "Sanskrit"],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    id: "geography_world",
    subjectId: "geography",
    title: "World Geography Quiz",
    difficulty: "Easy",
    timeLimitMins: 10,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "Which is the largest continent?",
        options: ["Africa", "North America", "Asia", "Europe"],
        correctAnswerIndex: 2,
      },
      {
        id: "q2",
        type: "multiple_choice",
        text: "Which ocean is the largest?",
        options: ["Atlantic", "Indian", "Pacific", "Arctic"],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    id: "physics_motion",
    subjectId: "physics",
    title: "Motion and Forces Quiz",
    difficulty: "Medium",
    timeLimitMins: 15,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "What is the SI unit of force?",
        options: ["Watt", "Joule", "Newton", "Pascal"],
        correctAnswerIndex: 2,
      },
      {
        id: "q2",
        type: "multiple_choice",
        text: "According to Newton's second law, F = ?",
        options: ["mv", "ma", "m/a", "v/t"],
        correctAnswerIndex: 1,
      },
    ],
  },
];

// ── Comprehensive video lessons for ALL subjects ──────────────────────────────
const VIDEOS: VideoLesson[] = [
  // Mathematics
  {
    id: "v_math_1",
    subjectId: "math",
    title: "Introduction to Algebra: Variables & Expressions",
    duration: "12:34",
    description: "Learn the fundamentals of algebra including variables, constants, and expressions.",
  },
  {
    id: "v_math_2",
    subjectId: "math",
    title: "Solving Linear Equations Step by Step",
    duration: "18:22",
    description: "Master solving one-variable and two-variable linear equations.",
  },
  {
    id: "v_math_3",
    subjectId: "math",
    title: "Geometry: Triangles, Circles, and Polygons",
    duration: "20:45",
    description: "Explore properties, area, and perimeter of common geometric shapes.",
  },
  {
    id: "v_math_4",
    subjectId: "math",
    title: "Understanding Fractions and Decimals",
    duration: "15:10",
    description: "Practical guide to working with fractions, decimals, and percentages.",
  },
  {
    id: "v_math_5",
    subjectId: "math",
    title: "Introduction to Probability and Statistics",
    duration: "22:18",
    description: "Learn mean, median, mode and basic probability calculations.",
  },

  // Science
  {
    id: "v_sci_1",
    subjectId: "science",
    title: "What is Photosynthesis? The Full Process Explained",
    duration: "10:05",
    description: "How plants convert sunlight, water, and CO₂ into glucose and oxygen.",
  },
  {
    id: "v_sci_2",
    subjectId: "science",
    title: "Inside the Cell: Organelles and Their Functions",
    duration: "16:30",
    description: "Tour of the cell — from nucleus to mitochondria to cell membrane.",
  },
  {
    id: "v_sci_3",
    subjectId: "science",
    title: "The Periodic Table: Understanding Elements",
    duration: "14:22",
    description: "How the periodic table is organized and what it tells us about elements.",
  },
  {
    id: "v_sci_4",
    subjectId: "science",
    title: "Ecosystems and Food Chains Explained",
    duration: "12:55",
    description: "Energy flow from producers to consumers through trophic levels.",
  },
  {
    id: "v_sci_5",
    subjectId: "science",
    title: "DNA, Genes, and Heredity: How Traits Are Passed Down",
    duration: "19:41",
    description: "Genetics fundamentals — from DNA structure to Mendel's laws.",
  },

  // English
  {
    id: "v_eng_1",
    subjectId: "english",
    title: "Punctuation Made Easy: Commas, Semicolons & More",
    duration: "08:47",
    description: "Master the rules of punctuation with clear examples.",
  },
  {
    id: "v_eng_2",
    subjectId: "english",
    title: "How to Write a Powerful Essay: Structure & Argument",
    duration: "21:15",
    description: "From thesis to conclusion — build compelling, well-structured essays.",
  },
  {
    id: "v_eng_3",
    subjectId: "english",
    title: "Literary Devices: Metaphor, Simile, Symbolism & More",
    duration: "13:33",
    description: "Identify and analyze figurative language in literature.",
  },
  {
    id: "v_eng_4",
    subjectId: "english",
    title: "Parts of Speech: A Complete Visual Guide",
    duration: "11:20",
    description: "Understand nouns, verbs, adjectives, adverbs, and more.",
  },
  {
    id: "v_eng_5",
    subjectId: "english",
    title: "Reading Between the Lines: Critical Analysis Skills",
    duration: "17:08",
    description: "Techniques for deep reading, annotation, and textual analysis.",
  },

  // History
  {
    id: "v_hist_1",
    subjectId: "history",
    title: "Ancient Egypt: Pyramids, Pharaohs, and Civilization",
    duration: "19:44",
    description: "Discover the world of ancient Egypt from the Nile to the pyramids.",
  },
  {
    id: "v_hist_2",
    subjectId: "history",
    title: "The Mali Empire: Africa's Golden Age",
    duration: "15:30",
    description: "The rise of Mansa Musa and the great Mali Empire's golden era.",
  },
  {
    id: "v_hist_3",
    subjectId: "history",
    title: "World War II: Causes, Events, and Aftermath",
    duration: "24:11",
    description: "A comprehensive look at the most destructive conflict in human history.",
  },
  {
    id: "v_hist_4",
    subjectId: "history",
    title: "African Independence Movements of the 20th Century",
    duration: "18:55",
    description: "How African nations won independence and shaped the modern continent.",
  },
  {
    id: "v_hist_5",
    subjectId: "history",
    title: "Ancient Greece: Democracy, Philosophy, and the Olympics",
    duration: "16:22",
    description: "The legacy of ancient Greece on modern civilization.",
  },

  // Geography
  {
    id: "v_geo_1",
    subjectId: "geography",
    title: "Earth's Structure: Layers, Plates, and Earthquakes",
    duration: "14:19",
    description: "Journey from Earth's crust to its core and understand plate tectonics.",
  },
  {
    id: "v_geo_2",
    subjectId: "geography",
    title: "Climate Zones: Why Different Places Have Different Weather",
    duration: "12:44",
    description: "From tropical rainforests to polar tundra — understanding climate zones.",
  },
  {
    id: "v_geo_3",
    subjectId: "geography",
    title: "World Rivers and Their Importance to Civilization",
    duration: "11:35",
    description: "The Nile, Amazon, Congo, and other great rivers and their role in history.",
  },
  {
    id: "v_geo_4",
    subjectId: "geography",
    title: "Population Growth and Urbanization",
    duration: "16:05",
    description: "How and why cities grow, and the challenges of urbanization.",
  },
  {
    id: "v_geo_5",
    subjectId: "geography",
    title: "Climate Change: Causes, Effects, and Solutions",
    duration: "20:33",
    description: "Understanding climate change and what geography tells us about the future.",
  },

  // Physics
  {
    id: "v_phys_1",
    subjectId: "physics",
    title: "Newton's Three Laws of Motion with Examples",
    duration: "17:22",
    description: "Understand inertia, F=ma, and action-reaction with real examples.",
  },
  {
    id: "v_phys_2",
    subjectId: "physics",
    title: "Energy: Kinetic, Potential, and Conservation",
    duration: "15:48",
    description: "How energy transforms between forms and is always conserved.",
  },
  {
    id: "v_phys_3",
    subjectId: "physics",
    title: "Waves and Sound: How We Hear the World",
    duration: "13:15",
    description: "Properties of waves, the Doppler effect, and how sound travels.",
  },
  {
    id: "v_phys_4",
    subjectId: "physics",
    title: "Electricity: Circuits, Ohm's Law, and Power",
    duration: "18:40",
    description: "Build your understanding of circuits, voltage, current, and resistance.",
  },
  {
    id: "v_phys_5",
    subjectId: "physics",
    title: "Projectile Motion: The Math Behind Flying Objects",
    duration: "14:56",
    description: "Kinematics equations applied to real-world projectile motion problems.",
  },
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