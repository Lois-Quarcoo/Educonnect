import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { API_URL } from "./api";

// ── Types (unchanged so the rest of the app still compiles) ──────────────────

export interface PDFSummary {
  id: string;
  pdfId: string;
  summary: string;
  keyPoints: string[];
  topics: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedReadTime: number;
  generatedAt: string;
}

export interface StudyGuide {
  id: string;
  pdfId: string;
  title: string;
  sections: {
    title: string;
    content: string;
    keyConcepts: string[];
  }[];
  practiceQuestions: {
    question: string;
    answer: string;
    difficulty: "Easy" | "Medium" | "Hard";
  }[];
  generatedAt: string;
}

export interface FlashcardSet {
  id: string;
  pdfId: string;
  title: string;
  cards: {
    front: string;
    back: string;
    difficulty: "Easy" | "Medium" | "Hard";
  }[];
  generatedAt: string;
}

export interface QuizSet {
  id: string;
  pdfId: string;
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: "Easy" | "Medium" | "Hard";
    type: "multiple-choice" | "true-false" | "short-answer";
  }[];
  generatedAt: string;
}

// ── Storage keys ──────────────────────────────────────────────────────────────
const SUMMARY_KEY = "ai_summaries";
const STUDY_GUIDE_KEY = "ai_study_guides";
const FLASHCARDS_KEY = "ai_flashcards";
const QUIZ_KEY = "ai_quizzes";

// ── Helper: read a local file:// URI as base64 ────────────────────────────────
async function readPDFAsBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

// ── Helper: call the backend /ai/pdf-analyze endpoint ────────────────────────
async function analyzeViaBackend(
  pdfUri: string,
  pdfName: string,
  task: "summary" | "study-guide" | "quiz",
): Promise<any> {
  const pdfBase64 = await readPDFAsBase64(pdfUri);

  const res = await fetch(`${API_URL}/ai/pdf-analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfBase64, pdfName, task }),
    signal: AbortSignal.timeout(60_000), // PDFs can take a while
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Backend PDF analysis failed (${res.status}): ${err}`);
  }

  const json = await res.json();
  if (!json.success || !json.data) throw new Error("Empty response from backend");

  return json.data;
}

// ── Main service ──────────────────────────────────────────────────────────────

export class AIPDFService {
  // ── Summary ─────────────────────────────────────────────────────────────────

  static async generateSummary(
    pdfId: string,
    pdfUri: string,
    pdfName: string,
  ): Promise<PDFSummary> {
    const raw = await analyzeViaBackend(pdfUri, pdfName, "summary");

    const summary: PDFSummary = {
      id: `summary_${Date.now()}`,
      pdfId,
      summary: raw.summary || "No summary available.",
      keyPoints: raw.keyPoints || [],
      topics: raw.topics || ["General"],
      difficulty: raw.difficulty || "Intermediate",
      estimatedReadTime: raw.estimatedReadTime ?? 5,
      generatedAt: new Date().toISOString(),
    };

    await this.saveSummary(pdfId, summary);
    return summary;
  }

  // ── Study Guide ──────────────────────────────────────────────────────────────

  static async generateStudyGuide(
    pdfId: string,
    pdfUri: string,
    pdfName: string,
  ): Promise<StudyGuide> {
    const raw = await analyzeViaBackend(pdfUri, pdfName, "study-guide");

    const studyGuide: StudyGuide = {
      id: `study_guide_${Date.now()}`,
      pdfId,
      title: raw.title || `Study Guide: ${pdfName}`,
      sections: raw.sections || [],
      practiceQuestions: raw.practiceQuestions || [],
      generatedAt: new Date().toISOString(),
    };

    await this.saveStudyGuide(studyGuide);
    return studyGuide;
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────

  static async generateQuiz(
    pdfId: string,
    pdfUri: string,
    pdfName: string,
  ): Promise<QuizSet> {
    const raw = await analyzeViaBackend(pdfUri, pdfName, "quiz");

    const quiz: QuizSet = {
      id: `quiz_${Date.now()}`,
      pdfId,
      title: raw.title || `Quiz: ${pdfName}`,
      questions: (raw.questions || []).map((q: any) => ({
        question: q.question || q.text || "",
        options: q.options || [],
        correctAnswer: q.correctAnswer ?? 0,
        explanation: q.explanation || "",
        difficulty: q.difficulty || "Medium",
        type: q.type || "multiple-choice",
      })),
      generatedAt: new Date().toISOString(),
    };

    await this.saveQuiz(quiz);
    return quiz;
  }

  // ── Flashcards (kept for API compatibility — backed by study-guide data) ─────

  static async generateFlashcards(
    pdfId: string,
    pdfUri: string,
    pdfName: string,
  ): Promise<FlashcardSet> {
    // Re-use the study-guide endpoint and convert key concepts to cards
    const raw = await analyzeViaBackend(pdfUri, pdfName, "study-guide");

    const cards: FlashcardSet["cards"] = [];
    (raw.sections || []).forEach((section: any) => {
      (section.keyConcepts || []).forEach((concept: string, i: number) => {
        cards.push({
          front: `What is: ${concept}?`,
          back: concept,
          difficulty: (["Easy", "Medium", "Hard"] as const)[i % 3],
        });
      });
    });

    const flashcards: FlashcardSet = {
      id: `flashcards_${Date.now()}`,
      pdfId,
      title: `Flashcards: ${pdfName}`,
      cards,
      generatedAt: new Date().toISOString(),
    };

    await this.saveFlashcards(flashcards);
    return flashcards;
  }

  // ── AsyncStorage helpers ──────────────────────────────────────────────────────

  private static async saveSummary(pdfId: string, summary: PDFSummary): Promise<void> {
    const list = await this.getSummaries();
    const updated = [...list.filter((s) => s.pdfId !== pdfId), summary];
    await AsyncStorage.setItem(SUMMARY_KEY, JSON.stringify(updated));
  }

  static async getSummaries(): Promise<PDFSummary[]> {
    const raw = await AsyncStorage.getItem(SUMMARY_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static async getSummaryForPDF(pdfId: string): Promise<PDFSummary | null> {
    const list = await this.getSummaries();
    return list.find((s) => s.pdfId === pdfId) || null;
  }

  private static async saveStudyGuide(studyGuide: StudyGuide): Promise<void> {
    const list = await this.getStudyGuides();
    const updated = [...list.filter((sg) => sg.pdfId !== studyGuide.pdfId), studyGuide];
    await AsyncStorage.setItem(STUDY_GUIDE_KEY, JSON.stringify(updated));
  }

  static async getStudyGuides(): Promise<StudyGuide[]> {
    const raw = await AsyncStorage.getItem(STUDY_GUIDE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static async getStudyGuideForPDF(pdfId: string): Promise<StudyGuide | null> {
    const list = await this.getStudyGuides();
    return list.find((sg) => sg.pdfId === pdfId) || null;
  }

  private static async saveFlashcards(flashcards: FlashcardSet): Promise<void> {
    const list = await this.getFlashcardSets();
    const updated = [...list.filter((fs) => fs.pdfId !== flashcards.pdfId), flashcards];
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updated));
  }

  static async getFlashcardSets(): Promise<FlashcardSet[]> {
    const raw = await AsyncStorage.getItem(FLASHCARDS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static async getFlashcardsForPDF(pdfId: string): Promise<FlashcardSet | null> {
    const list = await this.getFlashcardSets();
    return list.find((fs) => fs.pdfId === pdfId) || null;
  }

  private static async saveQuiz(quiz: QuizSet): Promise<void> {
    const list = await this.getQuizzes();
    const updated = [...list.filter((q) => q.pdfId !== quiz.pdfId), quiz];
    await AsyncStorage.setItem(QUIZ_KEY, JSON.stringify(updated));
  }

  static async getQuizzes(): Promise<QuizSet[]> {
    const raw = await AsyncStorage.getItem(QUIZ_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static async getQuizForPDF(pdfId: string): Promise<QuizSet | null> {
    const list = await this.getQuizzes();
    return list.find((q) => q.pdfId === pdfId) || null;
  }
}