import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PDFSummary {
  id: string;
  pdfId: string;
  summary: string;
  keyPoints: string[];
  topics: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedReadTime: number; // in minutes
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

export class AIPDFService {
  private static readonly SUMMARY_KEY = "ai_summaries";
  private static readonly STUDY_GUIDE_KEY = "ai_study_guides";
  private static readonly FLASHCARDS_KEY = "ai_flashcards";
  private static readonly QUIZ_KEY = "ai_quizzes";

  // ── PDF Processing ───────────────────────────────────────────────────────

  /**
   * Extract text content from a PDF file
   * Note: In a real implementation, you'd use a PDF parsing library
   * For demo purposes, we'll simulate this with mock data
   */
  private static async extractPDFText(pdfUri: string): Promise<string> {
    try {
      console.log("Extracting text from PDF:", pdfUri);

      // In a real implementation, you would use:
      // 1. react-native-pdf-lib for local PDF parsing
      // 2. Send file to backend AI service for processing
      // 3. Use expo-pdf with text extraction

      // For now, return a placeholder that indicates real processing
      const filename = pdfUri.split("/").pop() || "document.pdf";
      console.log("Processing PDF:", filename);

      // TODO: Implement real PDF text extraction
      // This would involve:
      // - Reading the PDF file
      // - Extracting text content
      // - Processing with AI/NLP services

      // Return placeholder content for demo
      return `This is the extracted text content from ${filename}. In a real implementation, this would contain the actual text extracted from the PDF document using libraries like react-native-pdf-lib or by sending the file to a backend service for processing.`;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }

  // ── AI Summarization ─────────────────────────────────────────────────────

  /**
   * Generate a comprehensive summary of the PDF content
   */
  static async generateSummary(
    pdfId: string,
    pdfUri: string,
    pdfName: string,
  ): Promise<PDFSummary> {
    try {
      console.log("Generating summary for PDF:", { pdfId, pdfUri, pdfName });

      // Extract text from PDF
      const text = await this.extractPDFText(pdfUri);
      console.log("Text extracted successfully, length:", text.length);

      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate summary (in real app, this would call an AI API)
      const summary = this.generateMockSummary(text, pdfName, pdfId);

      // Save to storage
      await this.saveSummary(pdfId, summary);

      return summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      throw new Error(
        `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private static generateMockSummary(
    text: string,
    pdfName: string,
    pdfId: string,
  ): PDFSummary {
    const wordCount = text.split(" ").length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // Average reading speed

    // Extract key topics based on content
    const topics = this.extractTopics(text);

    // Generate key points
    const keyPoints = this.extractKeyPoints(text);

    // Determine difficulty
    const difficulty = this.assessDifficulty(text);

    return {
      id: `summary_${Date.now()}`,
      pdfId,
      summary: this.generateConciseSummary(text),
      keyPoints,
      topics,
      difficulty,
      estimatedReadTime,
      generatedAt: new Date().toISOString(),
    };
  }

  private static generateConciseSummary(text: string): string {
    // Simple summarization logic (in real app, use AI API)
    const sentences = text.split(".").filter((s) => s.trim().length > 0);
    const importantSentences = sentences.filter((_, index) => index % 2 === 0);
    return importantSentences.slice(0, 5).join(". ") + ".";
  }

  private static extractTopics(text: string): string[] {
    const topicKeywords = {
      Mathematics: ["algebra", "equation", "variable", "linear", "quadratic"],
      Science: [
        "scientific",
        "method",
        "experiment",
        "hypothesis",
        "observation",
      ],
      English: ["literature", "writing", "grammar", "composition", "analysis"],
      History: ["historical", "ancient", "modern", "period", "civilization"],
      Physics: ["force", "motion", "energy", "matter", "quantum"],
      Geography: ["location", "climate", "terrain", "population", "region"],
    };

    const foundTopics: string[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        foundTopics.push(topic);
      }
    });

    return foundTopics.length > 0 ? foundTopics : ["General"];
  }

  private static extractKeyPoints(text: string): string[] {
    // Extract numbered lists and key concepts
    const keyPointPatterns = [
      /\d+\.\s+([^.\n]+)/g,
      /Key Concepts?:\s*([^.\n]+)/g,
      /Main Topics?:\s*([^.\n]+)/g,
    ];

    const keyPoints: string[] = [];

    keyPointPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const cleaned = match
            .replace(/^\d+\.\s*/, "")
            .replace(/Key Concepts?:\s*/, "")
            .trim();
          if (cleaned.length > 10) {
            keyPoints.push(cleaned);
          }
        });
      }
    });

    // If no structured key points found, create them from important sentences
    if (keyPoints.length === 0) {
      const sentences = text.split(".").filter((s) => s.trim().length > 20);
      keyPoints.push(...sentences.slice(0, 3).map((s) => s.trim()));
    }

    return keyPoints.slice(0, 5);
  }

  private static assessDifficulty(
    text: string,
  ): "Beginner" | "Intermediate" | "Advanced" {
    const advancedKeywords = [
      "complex",
      "advanced",
      "sophisticated",
      "intricate",
      "nuanced",
    ];
    const beginnerKeywords = [
      "introduction",
      "basic",
      "fundamental",
      "elementary",
      "simple",
    ];

    const lowerText = text.toLowerCase();
    const advancedCount = advancedKeywords.filter((word) =>
      lowerText.includes(word),
    ).length;
    const beginnerCount = beginnerKeywords.filter((word) =>
      lowerText.includes(word),
    ).length;

    if (advancedCount > beginnerCount) return "Advanced";
    if (beginnerCount > 0) return "Beginner";
    return "Intermediate";
  }

  // ── Study Guide Generation ─────────────────────────────────────────────────

  /**
   * Generate a comprehensive study guide from the PDF
   */
  static async generateStudyGuide(
    pdfId: string,
    pdfUri: string,
    pdfName: string,
  ): Promise<StudyGuide> {
    try {
      const text = await this.extractPDFText(pdfUri);

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const studyGuide = this.generateMockStudyGuide(pdfId, pdfName, text);
      await this.saveStudyGuide(studyGuide);

      return studyGuide;
    } catch (error) {
      console.error("Error generating study guide:", error);
      throw new Error("Failed to generate study guide");
    }
  }

  private static generateMockStudyGuide(
    pdfId: string,
    pdfName: string,
    text: string,
  ): StudyGuide {
    const sections = this.createSections(text);
    const practiceQuestions = this.generatePracticeQuestions(text);

    return {
      id: `study_guide_${Date.now()}`,
      pdfId,
      title: `Study Guide: ${pdfName}`,
      sections,
      practiceQuestions,
      generatedAt: new Date().toISOString(),
    };
  }

  private static createSections(text: string): StudyGuide["sections"] {
    // Find chapter/section headers
    const sectionPattern = /Chapter\s+\d+:\s*([^\n]+)/g;
    const sections: StudyGuide["sections"] = [];
    let match;

    while ((match = sectionPattern.exec(text)) !== null) {
      const sectionTitle = match[1].trim();
      const sectionStart = match.index;
      const nextMatch = sectionPattern.exec(text);
      const sectionEnd = nextMatch ? nextMatch.index : text.length;

      const sectionContent = text.slice(sectionStart, sectionEnd);
      const keyConcepts = this.extractKeyPoints(sectionContent);

      sections.push({
        title: sectionTitle,
        content: sectionContent.slice(0, 500) + "...", // Truncate for demo
        keyConcepts: keyConcepts.slice(0, 3),
      });
    }

    // If no sections found, create default ones
    if (sections.length === 0) {
      sections.push({
        title: "Overview",
        content: text.slice(0, 500) + "...",
        keyConcepts: this.extractKeyPoints(text).slice(0, 3),
      });
    }

    return sections;
  }

  private static generatePracticeQuestions(
    text: string,
  ): StudyGuide["practiceQuestions"] {
    const questions: StudyGuide["practiceQuestions"] = [];

    // Generate questions based on content
    const topics = this.extractTopics(text);

    topics.forEach((topic) => {
      questions.push({
        question: `What are the main principles of ${topic}?`,
        answer: `The main principles of ${topic} include fundamental concepts, practical applications, and theoretical frameworks that guide understanding in this field.`,
        difficulty: "Medium",
      });
    });

    // Add some general questions
    questions.push(
      {
        question:
          "Explain the importance of this subject in real-world applications.",
        answer:
          "This subject has numerous real-world applications that impact our daily lives and technological advancement.",
        difficulty: "Easy",
      },
      {
        question:
          "Compare and contrast the different approaches mentioned in the material.",
        answer:
          "Different approaches have unique strengths and weaknesses, and the choice depends on specific contexts and requirements.",
        difficulty: "Hard",
      },
    );

    return questions.slice(0, 5);
  }

  // ── Quiz Generation ───────────────────────────────────────────────────────

  /**
   * Generate comprehensive quiz from the PDF content
   */
  static async generateQuiz(
    pdfId: string,
    pdfUri: string,
    pdfName: string,
  ): Promise<QuizSet> {
    try {
      const text = await this.extractPDFText(pdfUri);

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const quiz = this.generateMockQuiz(pdfId, pdfName, text);
      await this.saveQuiz(quiz);

      return quiz;
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw new Error("Failed to generate quiz");
    }
  }

  private static generateMockQuiz(
    pdfId: string,
    pdfName: string,
    text: string,
  ): QuizSet {
    const questions = this.generateQuizQuestions(text);

    return {
      id: `quiz_${Date.now()}`,
      pdfId,
      title: `Quiz: ${pdfName}`,
      questions,
      generatedAt: new Date().toISOString(),
    };
  }

  private static generateQuizQuestions(text: string): QuizSet["questions"] {
    const questions: QuizSet["questions"] = [];

    // Generate multiple choice questions
    questions.push({
      question: "What is the main topic of this document?",
      options: [
        "Introduction to the subject",
        "Advanced concepts",
        "Historical background",
        "Practical applications",
      ],
      correctAnswer: 0,
      explanation:
        "The document primarily serves as an introduction to the subject matter.",
      difficulty: "Easy",
      type: "multiple-choice",
    });

    questions.push({
      question: "Which of the following are key learning objectives?",
      options: [
        "Only theoretical understanding",
        "Understanding concepts and applying them to problems",
        "Memorization without application",
        "Advanced research methods",
      ],
      correctAnswer: 1,
      explanation:
        "The document emphasizes both understanding fundamental concepts and applying them to practical problems.",
      difficulty: "Medium",
      type: "multiple-choice",
    });

    // Generate true/false questions
    questions.push({
      question: "The document is suitable only for advanced learners.",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation:
        "The document serves as both an introduction for beginners and a reference for advanced learners.",
      difficulty: "Easy",
      type: "true-false",
    });

    questions.push({
      question: "The content includes practical applications and examples.",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation:
        "One of the main topics covered is practical applications and examples.",
      difficulty: "Easy",
      type: "true-false",
    });

    // Generate short answer questions
    questions.push({
      question: "What are the main topics covered in this document?",
      options: [],
      correctAnswer: 0,
      explanation:
        "The main topics include basic definitions, historical context, core principles, practical applications, and advanced topics.",
      difficulty: "Medium",
      type: "short-answer",
    });

    questions.push({
      question: "Who is the target audience for this comprehensive guide?",
      options: [],
      correctAnswer: 0,
      explanation:
        "The guide serves as both an introduction for beginners and a reference for advanced learners.",
      difficulty: "Medium",
      type: "short-answer",
    });

    return questions;
  }

  /**
   * Generate flashcards from the PDF content
   */
  static async generateFlashcards(
    pdfId: string,
    pdfUri: string,
    pdfName: string,
  ): Promise<FlashcardSet> {
    try {
      const text = await this.extractPDFText(pdfUri);

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const flashcards = this.generateMockFlashcards(pdfId, pdfName, text);
      await this.saveFlashcards(flashcards);

      return flashcards;
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw new Error("Failed to generate flashcards");
    }
  }

  private static generateMockFlashcards(
    pdfId: string,
    pdfName: string,
    text: string,
  ): FlashcardSet {
    const keyPoints = this.extractKeyPoints(text);
    const cards = keyPoints.map((point, index) => {
      const parts = point.split(":");
      if (parts.length > 1) {
        return {
          front: parts[0].trim(),
          back: parts.slice(1).join(":").trim(),
          difficulty:
            index % 3 === 0 ? "Easy" : index % 3 === 1 ? "Medium" : "Hard",
        } as const;
      } else {
        return {
          front: `What is ${point.split(" ").slice(0, 3).join(" ")}?`,
          back: point,
          difficulty: (index % 3 === 0
            ? "Easy"
            : index % 3 === 1
              ? "Medium"
              : "Hard") as "Easy" | "Medium" | "Hard",
        };
      }
    });

    return {
      id: `flashcards_${Date.now()}`,
      pdfId,
      title: `Flashcards: ${pdfName}`,
      cards,
      generatedAt: new Date().toISOString(),
    };
  }

  // ── Storage Methods ───────────────────────────────────────────────────────

  private static async saveSummary(
    pdfId: string,
    summary: PDFSummary,
  ): Promise<void> {
    try {
      const existing = await this.getSummaries();
      const filtered = existing.filter((s) => s.pdfId !== pdfId);
      filtered.push(summary);
      await AsyncStorage.setItem(this.SUMMARY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error saving summary:", error);
    }
  }

  static async getSummaries(): Promise<PDFSummary[]> {
    try {
      const stored = await AsyncStorage.getItem(this.SUMMARY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting summaries:", error);
      return [];
    }
  }

  static async getSummaryForPDF(pdfId: string): Promise<PDFSummary | null> {
    try {
      const summaries = await this.getSummaries();
      return summaries.find((s) => s.pdfId === pdfId) || null;
    } catch (error) {
      console.error("Error getting summary for PDF:", error);
      return null;
    }
  }

  private static async saveStudyGuide(studyGuide: StudyGuide): Promise<void> {
    try {
      const existing = await this.getStudyGuides();
      const filtered = existing.filter((sg) => sg.pdfId !== studyGuide.pdfId);
      filtered.push(studyGuide);
      await AsyncStorage.setItem(
        this.STUDY_GUIDE_KEY,
        JSON.stringify(filtered),
      );
    } catch (error) {
      console.error("Error saving study guide:", error);
    }
  }

  static async getStudyGuides(): Promise<StudyGuide[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STUDY_GUIDE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting study guides:", error);
      return [];
    }
  }

  static async getStudyGuideForPDF(pdfId: string): Promise<StudyGuide | null> {
    try {
      const studyGuides = await this.getStudyGuides();
      return studyGuides.find((sg) => sg.pdfId === pdfId) || null;
    } catch (error) {
      console.error("Error getting study guide for PDF:", error);
      return null;
    }
  }

  private static async saveFlashcards(flashcards: FlashcardSet): Promise<void> {
    try {
      const existing = await this.getFlashcardSets();
      const filtered = existing.filter((fs) => fs.pdfId !== flashcards.pdfId);
      filtered.push(flashcards);
      await AsyncStorage.setItem(this.FLASHCARDS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error saving flashcards:", error);
    }
  }

  static async getFlashcardSets(): Promise<FlashcardSet[]> {
    try {
      const stored = await AsyncStorage.getItem(this.FLASHCARDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting flashcard sets:", error);
      return [];
    }
  }

  static async getFlashcardsForPDF(
    pdfId: string,
  ): Promise<FlashcardSet | null> {
    try {
      const flashcardSets = await this.getFlashcardSets();
      return flashcardSets.find((fs) => fs.pdfId === pdfId) || null;
    } catch (error) {
      console.error("Error getting flashcards for PDF:", error);
      return null;
    }
  }

  // ── Quiz Storage Methods ─────────────────────────────────────────────────────

  private static async saveQuiz(quiz: QuizSet): Promise<void> {
    try {
      const existing = await this.getQuizzes();
      const filtered = existing.filter((q) => q.pdfId !== quiz.pdfId);
      filtered.push(quiz);
      await AsyncStorage.setItem(this.QUIZ_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  }

  static async getQuizzes(): Promise<QuizSet[]> {
    try {
      const stored = await AsyncStorage.getItem(this.QUIZ_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting quizzes:", error);
      return [];
    }
  }

  static async getQuizForPDF(pdfId: string): Promise<QuizSet | null> {
    try {
      const quizzes = await this.getQuizzes();
      return quizzes.find((q) => q.pdfId === pdfId) || null;
    } catch (error) {
      console.error("Error getting quiz for PDF:", error);
      return null;
    }
  }
}
