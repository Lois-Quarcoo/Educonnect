import { delay } from '../utils/helpers';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Subject = {
  id: string;
  title: string;
  lessonsCount: number;
  videosCount: number;
  quizzesCount: number;
  progress: number;
  color: string;
  iconName: string;
};

export type QuizQuestion = {
  id: string;
  text: string;
  type: 'multiple_choice';
  options: string[];
  correctAnswerIndex: number;
};

export type Quiz = {
  id: string;
  subjectId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimitMins: number | null;
  questions: QuizQuestion[];
};

export type VideoLesson = {
  id: string;
  subjectId: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
};

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'math',
    title: 'Mathematics',
    lessonsCount: 18,
    videosCount: 12,
    quizzesCount: 6,
    progress: 64,
    color: '#7C3AED',
    iconName: 'Calculator',
  },
  {
    id: 'science',
    title: 'Science',
    lessonsCount: 14,
    videosCount: 8,
    quizzesCount: 4,
    progress: 42,
    color: '#3B82F6',
    iconName: 'Atom',
  },
  {
    id: 'english',
    title: 'English',
    lessonsCount: 22,
    videosCount: 5,
    quizzesCount: 10,
    progress: 85,
    color: '#EA580C',
    iconName: 'BookOpen',
  },
  {
    id: 'history',
    title: 'History',
    lessonsCount: 10,
    videosCount: 15,
    quizzesCount: 2,
    progress: 15,
    color: '#92400E',
    iconName: 'Landmark',
  },
];

const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'algebra_fundamentals',
    subjectId: 'math',
    title: 'Algebra Fundamentals',
    difficulty: 'Medium',
    timeLimitMins: 20,
    questions: [
      {
        id: 'q1',
        text: 'Solve for x: 3x + 5 = 14',
        type: 'multiple_choice',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correctAnswerIndex: 1,
      },
      {
        id: 'q2',
        text: 'What is the expanded form of (x + 2)(x - 3)?',
        type: 'multiple_choice',
        options: ['x² - x - 6', 'x² + x - 6', 'x² - 5x - 6', 'x² - x + 6'],
        correctAnswerIndex: 0,
      },
      {
        id: 'q3',
        text: 'Solve for x: 2(x - 4) + 6 = 10',
        type: 'multiple_choice',
        options: ['x = 4', 'x = 5', 'x = 6', 'x = 8'],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    id: 'graphing_functions',
    subjectId: 'math',
    title: 'Graphing Functions',
    difficulty: 'Easy',
    timeLimitMins: 15,
    questions: [
      {
        id: 'q1',
        text: 'What is the y-intercept of the line y = 2x + 4?',
        type: 'multiple_choice',
        options: ['2', '4', '-2', '-4'],
        correctAnswerIndex: 1,
      },
      {
        id: 'q2',
        text: 'What is the slope of a horizontal line?',
        type: 'multiple_choice',
        options: ['1', '0', 'Undefined', '-1'],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    id: 'cell_biology',
    subjectId: 'science',
    title: 'Cell Biology 101',
    difficulty: 'Medium',
    timeLimitMins: 10,
    questions: [
      {
        id: 'q1',
        text: 'Which organelle is known as the powerhouse of the cell?',
        type: 'multiple_choice',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
        correctAnswerIndex: 1,
      },
    ],
  },
];

const MOCK_VIDEOS: VideoLesson[] = [
  {
    id: 'math_vid_1',
    subjectId: 'math',
    title: 'Introduction to Linear Equations',
    duration: '12:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // placeholder open video
  },
  {
    id: 'math_vid_2',
    subjectId: 'math',
    title: 'Understanding Slope-Intercept Form',
    duration: '08:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=600&auto=format&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 'sci_vid_1',
    subjectId: 'science',
    title: 'The Cell Cycle and Mitosis',
    duration: '15:30',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
];

// ── Service API Functions ─────────────────────────────────────────────────────

// Add artificial delay to simulate network latency
const SIMULATED_DELAY = 600;

export const fetchSubjects = async (): Promise<Subject[]> => {
  await delay(SIMULATED_DELAY);
  return MOCK_SUBJECTS;
};

export const fetchSubjectById = async (id: string): Promise<Subject | undefined> => {
  await delay(SIMULATED_DELAY);
  return MOCK_SUBJECTS.find((s) => s.id === id);
};

export const fetchQuizzesBySubject = async (subjectId: string): Promise<Quiz[]> => {
  await delay(SIMULATED_DELAY);
  return MOCK_QUIZZES.filter((q) => q.subjectId === subjectId);
};

export const fetchQuizById = async (quizId: string): Promise<Quiz | undefined> => {
  await delay(SIMULATED_DELAY);
  return MOCK_QUIZZES.find((q) => q.id === quizId);
};

export const fetchVideosBySubject = async (subjectId: string): Promise<VideoLesson[]> => {
  await delay(SIMULATED_DELAY);
  return MOCK_VIDEOS.filter((v) => v.subjectId === subjectId);
};
