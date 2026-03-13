import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAE-WR8QZ3yBdj0UxBsWyGFeUFY2SNH80c";
const genAI = new GoogleGenerativeAI(API_KEY);

// Rate limiting to prevent quota exceeded errors
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
const MAX_DAILY_REQUESTS = 50; // Conservative limit for free tier
let dailyRequestCount = 0;
let lastResetDate = new Date().getDate();

// Check if we need to reset daily counter
const checkDailyReset = () => {
  const today = new Date().getDate();
  if (today !== lastResetDate) {
    dailyRequestCount = 0;
    lastResetDate = today;
  }
};

// Rate limiting function
const waitForRateLimit = async (): Promise<void> => {
  checkDailyReset();

  // Check daily limit
  if (dailyRequestCount >= MAX_DAILY_REQUESTS) {
    throw new Error("Daily AI request limit reached. Try again tomorrow!");
  }

  // Check rate limit between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
  dailyRequestCount++;
};

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  suggestions?: string[];
  lessonCard?: {
    subject: string;
    title: string;
    meta: string;
    id: string;
    type: "video" | "quiz";
  };
};

export const generateTutorResponse = async (
  conversationHistory: ChatMessage[],
  newMessageText: string,
): Promise<ChatMessage> => {
  console.log("AI Service called with:", newMessageText);

  if (!API_KEY) {
    console.log("No API key found, using fallback");
    return {
      id: Date.now().toString(),
      role: "ai",
      text: generateFallbackResponse(newMessageText),
      suggestions: generateContextualSuggestions(newMessageText),
    };
  }

  try {
    // Apply rate limiting
    await waitForRateLimit();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const context = conversationHistory
      .filter((msg) => !msg.lessonCard)
      .map((msg) => `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.text}`)
      .join("\n");

    const prompt = `You are Spark, an expert AI Tutor for the EduConnect learning platform. You specialize in helping students learn various subjects including Mathematics, Science, English, and History.

Your teaching style:
- Be encouraging and positive
- Explain concepts simply and clearly
- Use real-world examples when possible
- Ask follow-up questions to check understanding
- Keep responses concise but thorough
- Adapt to the student's level
- ALWAYS provide helpful, educational answers to questions
- NEVER just introduce yourself - always answer the actual question asked

Here is the conversation history:
${context}

Student: ${newMessageText}

Tutor:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      id: Date.now().toString(),
      role: "ai",
      text,
      suggestions: generateContextualSuggestions(newMessageText),
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);

    // Handle quota exceeded errors
    if (
      error.message.includes("quota") ||
      error.message.includes("429") ||
      error.message.includes("Daily AI request limit")
    ) {
      return {
        id: Date.now().toString(),
        role: "ai",
        text: generateFallbackResponse(newMessageText),
        suggestions: generateContextualSuggestions(newMessageText),
      };
    }

    // For other errors, still use fallback
    return {
      id: Date.now().toString(),
      role: "ai",
      text: generateFallbackResponse(newMessageText),
      suggestions: generateContextualSuggestions(newMessageText),
    };
  }
};

// Generate fallback responses when API quota is exceeded
const generateFallbackResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();

  // Add debugging
  console.log("Using fallback response for:", userMessage);

  // Greetings - provide helpful response instead of just introduction
  if (
    lower.includes("hi") ||
    lower.includes("hello") ||
    lower.includes("hey") ||
    lower === "hi" ||
    lower === "hello"
  ) {
    return "👋 Hi there! I'm Spark, your AI tutor ready to help you learn! I can assist with Math 📐, Science 🔬, History 📚, English ✍️, and more. What subject would you like to explore today?";
  }

  // Direct questions - provide actual answers
  if (lower.includes("what is prohibited") || lower.includes("prohibited")) {
    return "📋 In educational contexts, 'prohibited' typically means things that are not allowed in school or during exams. This could include: cheating, using unauthorized notes, electronic devices during tests, plagiarism, or bringing forbidden items to school. Always check your school's specific rules and code of conduct. Is there a specific situation you're asking about?";
  }

  // Math fallback responses
  if (
    lower.includes("math") ||
    lower.includes("calculat") ||
    lower.includes("equation") ||
    lower.includes("algebra") ||
    lower.includes("geometry") ||
    lower.includes("solve")
  ) {
    if (lower.includes("algebra") || lower.includes("solve")) {
      return "🧮 For algebra equations like 2x + 5 = 15: First, subtract 5 from both sides to get 2x = 10. Then divide both sides by 2 to get x = 5. Always isolate the variable by doing the opposite operation! Want to try another equation?";
    }
    if (lower.includes("geometry")) {
      return "📐 Geometry is all about shapes and spaces! Key concepts: triangles have 180° total angles, circles use π (3.14159), and the Pythagorean theorem (a² + b² = c²) works for right triangles. What geometry topic are you studying?";
    }
    return "📐 Math is all about practice! Start with the basics, write down each step, and check your work. I can help with arithmetic, algebra, geometry, and more. What specific math problem are you working on?";
  }

  // Science fallback responses
  if (
    lower.includes("science") ||
    lower.includes("experiment") ||
    lower.includes("theory") ||
    lower.includes("biology") ||
    lower.includes("chemistry") ||
    lower.includes("physics")
  ) {
    if (lower.includes("photosynthesis")) {
      return "🌱 Photosynthesis is how plants make their food! They use sunlight, water, and carbon dioxide to create glucose (energy) and oxygen. It happens in the chloroplasts using chlorophyll (the green stuff). Pretty amazing how plants turn sunlight into energy!";
    }
    if (lower.includes("cell")) {
      return "🔬 Cells are the building blocks of life! Animal cells have a nucleus, mitochondria (powerhouses), and cell membrane. Plant cells have those plus a cell wall and chloroplasts for photosynthesis. Each organelle has a specific job to keep the cell alive!";
    }
    if (lower.includes("chemistry")) {
      return "⚗️ Chemistry studies matter and its changes! Key concepts: atoms (basic units), molecules (atoms bonded together), and chemical reactions (rearranging atoms). Water (H2O) is the most important molecule for life!";
    }
    return "🔬 Science helps us understand the world! Start with observations, form hypotheses, test them, and draw conclusions. I can help with biology, chemistry, physics, and more. What science topic interests you?";
  }

  // History fallback responses
  if (
    lower.includes("history") ||
    lower.includes("when") ||
    lower.includes("who") ||
    lower.includes("war") ||
    lower.includes("american") ||
    lower.includes("world")
  ) {
    if (lower.includes("world war")) {
      return "🌍 World War II (1939-1945) was a global conflict involving Allied powers (US, UK, USSR) vs Axis powers (Germany, Italy, Japan). It ended with the atomic bombings of Hiroshima and Nagasaki and shaped the modern world!";
    }
    return "📚 History tells the story of humanity! Understanding the past helps us make better decisions today. Focus on cause and effect, and remember that history is written by people with different perspectives. What historical period or event would you like to explore?";
  }

  // English fallback responses
  if (
    lower.includes("english") ||
    lower.includes("grammar") ||
    lower.includes("write") ||
    lower.includes("essay") ||
    lower.includes("read")
  ) {
    if (lower.includes("essay")) {
      return "✍️ Essay writing structure: 1) Introduction with thesis statement, 2) Body paragraphs with evidence, 3) Conclusion that summarizes. Each paragraph should have a topic sentence and supporting details. Start with an outline!";
    }
    return "✍️ Good writing starts with clear thinking! Read widely, practice daily, and don't be afraid to revise. Grammar provides the structure, but your voice makes it unique. Need help with a specific writing topic or grammar rule?";
  }

  // General learning fallback
  if (
    lower.includes("help") ||
    lower.includes("explain") ||
    lower.includes("understand") ||
    lower.includes("learn") ||
    lower.includes("study")
  ) {
    return "💡 Learning is a journey! Break complex topics into smaller parts, ask lots of questions, and connect new ideas to what you already know. Everyone learns differently - find what works for you! What topic would you like to understand better?";
  }

  // Default fallback - more helpful
  return "🚀 I'm Spark, your AI tutor! I can help with Math (📐), Science (🔬), History (📚), English (✍️), and more. I'm currently using my knowledge base to help you learn. What specific question or topic would you like to explore? I'm here to help you understand concepts better!";
};

const generateContextualSuggestions = (userMessage: string): string[] => {
  const lower = userMessage.toLowerCase();

  if (
    lower.includes("math") ||
    lower.includes("calculat") ||
    lower.includes("equation")
  )
    return ["Show me the steps", "Give me another example", "Quiz me on this"];

  if (
    lower.includes("science") ||
    lower.includes("experiment") ||
    lower.includes("theory")
  )
    return [
      "Explain the concept",
      "Show me an example",
      "What are the applications?",
    ];

  if (
    lower.includes("history") ||
    lower.includes("when") ||
    lower.includes("who")
  )
    return [
      "Tell me more details",
      "What happened next?",
      "How did this impact things?",
    ];

  if (
    lower.includes("english") ||
    lower.includes("grammar") ||
    lower.includes("write")
  )
    return ["Show me examples", "Explain the rule", "Help me practice"];

  if (
    lower.includes("help") ||
    lower.includes("explain") ||
    lower.includes("understand")
  )
    return [
      "Simplify it further",
      "Use an analogy",
      "Break it down step by step",
    ];

  return ["Tell me more", "Give me an example", "Quiz me on this"];
};

export const generateQuizQuestion = async (
  topic: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
): Promise<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}> => {
  if (!API_KEY) throw new Error("AI service not available");

  try {
    // Apply rate limiting
    await waitForRateLimit();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate a ${difficulty} multiple-choice question about ${topic} for a student.
Format your response exactly like this:
Question: [question text]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
Correct: [A/B/C/D]
Explanation: [brief explanation]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const lines = text.split("\n");
    const question =
      lines
        .find((l) => l.startsWith("Question:"))
        ?.replace("Question:", "")
        .trim() || "";
    const options = lines
      .filter((l) => /^[ABCD]:/.test(l))
      .map((l) => l.substring(2).trim());
    const correctLine = lines.find((l) => l.startsWith("Correct:"));
    const correctAnswer = correctLine
      ? ["A", "B", "C", "D"].indexOf(correctLine.replace("Correct:", "").trim())
      : 0;
    const explanation =
      lines
        .find((l) => l.startsWith("Explanation:"))
        ?.replace("Explanation:", "")
        .trim() || "";

    return { question, options, correctAnswer, explanation };
  } catch (error: any) {
    console.error("Quiz generation error:", error);

    // Handle quota exceeded errors
    if (
      error.message.includes("quota") ||
      error.message.includes("429") ||
      error.message.includes("Daily AI request limit")
    ) {
      // Return a fallback quiz question
      const fallbackQuiz = generateFallbackQuiz(topic, difficulty);
      return fallbackQuiz;
    }

    throw new Error("Failed to generate quiz question");
  }
};

// Generate fallback quiz questions when API quota is exceeded
const generateFallbackQuiz = (topic: string, difficulty: string) => {
  const lower = topic.toLowerCase();

  // Math fallback quizzes
  if (
    lower.includes("math") ||
    lower.includes("algebra") ||
    lower.includes("geometry")
  ) {
    return {
      question: "What is the value of x in the equation 2x + 5 = 15?",
      options: ["5", "10", "15", "20"],
      correctAnswer: 0,
      explanation:
        "Subtract 5 from both sides: 2x = 10. Then divide by 2: x = 5.",
    };
  }

  // Science fallback quizzes
  if (
    lower.includes("science") ||
    lower.includes("biology") ||
    lower.includes("chemistry")
  ) {
    return {
      question: "What is the chemical formula for water?",
      options: ["H2O", "CO2", "O2", "N2"],
      correctAnswer: 0,
      explanation:
        "Water consists of two hydrogen atoms and one oxygen atom, making H2O.",
    };
  }

  // History fallback quizzes
  if (
    lower.includes("history") ||
    lower.includes("war") ||
    lower.includes("american")
  ) {
    return {
      question: "In which year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctAnswer: 2,
      explanation: "World War II ended in 1945 with the surrender of Japan.",
    };
  }

  // Default fallback quiz
  return {
    question: `What is the capital of ${topic}?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 0,
    explanation:
      "This is a fallback question. Please try again later for a better quiz!",
  };
};
