import Constants from "expo-constants";

// ── Resolve the backend URL at runtime ───────────────────────────────────────
const getBackendUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && __DEV__) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5000/api`;
  }

  if (__DEV__) return "http://10.0.2.2:5000/api";
  return "https://your-production-url.com/api";
};

const BACKEND_URL = getBackendUrl();

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Main function ─────────────────────────────────────────────────────────────
export const generateTutorResponse = async (
  conversationHistory: ChatMessage[],
  newMessageText: string,
): Promise<ChatMessage> => {
  console.log("[Spark] sending to:", `${BACKEND_URL}/ai/chat`);

  // Convert to the format the backend expects
  const messages = [
    ...conversationHistory
      .slice(-10)
      .filter((m) => m.role === "user" || m.role === "ai")
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.text,
      })),
    { role: "user", content: newMessageText },
  ];

  // ── Step 1: quick connectivity check ─────────────────────────────────────
  try {
    const ping = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!ping.ok) throw new Error("health check failed");
  } catch {
    console.warn("[Spark] backend unreachable at", BACKEND_URL);
    return {
      id: Date.now().toString(),
      role: "ai",
      text: `⚠️ I can't reach the EduConnect server right now.\n\nMake sure:\n1. Your backend is running (npm run dev)\n2. Your phone and computer are on the same Wi-Fi\n\nServer: ${BACKEND_URL}`,
      suggestions: ["Try again"],
    };
  }

  // ── Step 2: actual AI request ─────────────────────────────────────────────
  try {
    const response = await fetch(`${BACKEND_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Spark] server error:", response.status, errText);
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.reply) {
      throw new Error("Empty reply from server");
    }

    return {
      id: Date.now().toString(),
      role: "ai",
      text: data.reply,
      suggestions: generateSuggestions(newMessageText),
    };
  } catch (error: any) {
    const msg = error?.message || String(error);
    console.error("[Spark] generateTutorResponse error:", msg);

    const isTimeout = msg.includes("Abort") || msg.includes("timeout");

    return {
      id: Date.now().toString(),
      role: "ai",
      text: isTimeout
        ? "That took too long — the AI is busy. Please try again. ⏱️"
        : "Something went wrong. Please try again. 🔄",
      suggestions: ["Try again", "Ask something else"],
    };
  }
};

// ── Suggestion chips ──────────────────────────────────────────────────────────
const generateSuggestions = (userMessage: string): string[] => {
  const lower = userMessage.toLowerCase();
  if (lower.match(/solve|equation|calculat|math|algebra|geometry/))
    return ["Show me another example", "Explain the rule", "Quiz me on this"];
  if (lower.match(/explain|what is|define|describe/))
    return ["Give me an example", "Why is this important?", "Simplify it more"];
  if (lower.match(/science|biology|chemistry|physics|cell|atom/))
    return ["How does it work?", "Real-world application?", "Quiz me"];
  if (lower.match(/history|when|who|ancient|war|empire/))
    return ["Tell me more", "What happened next?", "How did this affect us?"];
  if (lower.match(/english|essay|grammar|write|literature/))
    return ["Show me an example", "Help me practise", "What are the rules?"];
  if (lower.match(/geography|climate|country|continent|ocean/))
    return ["Where on a map?", "Why does this happen?", "Give me a fact"];
  return ["Tell me more", "Give an example", "Quiz me on this"];
};