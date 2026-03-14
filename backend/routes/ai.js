const express = require("express");
const router = express.Router();

const SYSTEM_PROMPT = `You are Spark, an expert AI Tutor for the EduConnect learning platform — a mobile app designed for African students. You help learners across all subjects: Mathematics, Science (Biology, Chemistry, Physics), English Language and Literature, History, and Geography.

Your teaching style:
- Be warm, encouraging, and concise — this is a mobile chat, not a lecture
- Explain concepts clearly with relatable real-world examples
- Break difficult topics into simple digestible steps
- Keep responses to 3-5 sentences unless deeper explanation is needed
- Use emojis sparingly (1-2 per message max)
- If asked to solve a problem step-by-step, show your working clearly
- NEVER refuse to answer an academic question
- ALWAYS give a real helpful answer`;

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: "messages array is required" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
      console.error("❌ ANTHROPIC_API_KEY is not set in backend/.env");
      return res.status(500).json({
        success: false,
        message: "AI service not configured — add ANTHROPIC_API_KEY to backend/.env",
      });
    }

    console.log(`[AI] calling Anthropic with ${messages.length} message(s)`);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Anthropic error:", response.status, errText);
      return res.status(502).json({ success: false, message: "AI upstream error" });
    }

    const data = await response.json();
    const reply = data?.content?.[0]?.text?.trim();

    if (!reply) {
      return res.status(502).json({ success: false, message: "Empty AI response" });
    }

    console.log("[AI] reply length:", reply.length, "chars");
    res.json({ success: true, reply });
  } catch (error) {
    console.error("❌ AI chat route error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;