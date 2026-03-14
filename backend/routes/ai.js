const express = require("express");
const router = express.Router();

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in backend/.env");
  return key;
};

/** Call Gemini and return the raw text response. Throws on any error. */
const callGemini = async (contents, systemInstruction = null, maxTokens = 1024) => {
  const payload = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
  };
  if (systemInstruction) {
    payload.system_instruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(`${GEMINI_URL}?key=${getApiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ Gemini error:", res.status, errText);
    throw new Error(`Gemini API responded with ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Empty response from Gemini");
  return text;
};

// ── POST /api/ai/chat  (Spark AI Tutor) ──────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: "messages array is required" });
    }

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

    // Convert to Gemini's role format (user / model)
    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    console.log(`[Spark] calling Gemini with ${contents.length} message(s)`);
    const reply = await callGemini(contents, SYSTEM_PROMPT);
    console.log("[Spark] reply length:", reply.length, "chars");

    res.json({ success: true, reply });
  } catch (error) {
    console.error("❌ /ai/chat error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// ── POST /api/ai/content  (Lessons + Quizzes for a subject) ──────────────────
router.post("/content", async (req, res) => {
  try {
    const { subjectId, subjectTitle } = req.body;

    if (!subjectId || !subjectTitle) {
      return res.status(400).json({
        success: false,
        message: "subjectId and subjectTitle are required",
      });
    }

    const prompt = `Create engaging educational content for "${subjectTitle}" aimed at African high school students.
Return ONLY valid JSON — no markdown fences, no commentary:
{
  "lessons": [
    {"id":"l1","title":"string","description":"one sentence","content":"3 rich paragraphs","duration":"15 min","difficulty":"Beginner","order":1},
    {"id":"l2","title":"string","description":"one sentence","content":"3 rich paragraphs","duration":"20 min","difficulty":"Intermediate","order":2},
    {"id":"l3","title":"string","description":"one sentence","content":"3 rich paragraphs","duration":"25 min","difficulty":"Advanced","order":3}
  ],
  "quizzes": [
    {"id":"q1","type":"multiple_choice","text":"question?","options":["A","B","C","D"],"correctAnswerIndex":0,"explanation":"why","difficulty":"Easy"},
    {"id":"q2","type":"multiple_choice","text":"question?","options":["A","B","C","D"],"correctAnswerIndex":1,"explanation":"why","difficulty":"Medium"},
    {"id":"q3","type":"true_false","text":"a true/false statement","options":["True","False"],"correctAnswerIndex":0,"explanation":"why","difficulty":"Easy"},
    {"id":"q4","type":"multiple_choice","text":"harder question?","options":["A","B","C","D"],"correctAnswerIndex":2,"explanation":"why","difficulty":"Hard"}
  ]
}`;

    const text = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      null,
      2048,
    );

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json({
      success: true,
      data: {
        subjectId,
        subjectTitle,
        lessons: parsed.lessons || [],
        quizzes: parsed.quizzes || [],
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ /ai/content error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// ── POST /api/ai/pdf-analyze  (Summary / Study Guide / Quiz from a PDF) ───────
router.post("/pdf-analyze", async (req, res) => {
  try {
    const { pdfBase64, pdfName, task, extractedText } = req.body;
    // task: "summary" | "study-guide" | "quiz"

    if (!task || (!pdfBase64 && !extractedText)) {
      return res.status(400).json({
        success: false,
        message: "task and either pdfBase64 or extractedText are required",
      });
    }

    // Use extracted text if provided, otherwise generate content from filename context
    const docContext = extractedText
      ? `The following is the text content extracted from the PDF document "${pdfName}":\n\n${extractedText.slice(0, 8000)}`
      : `You are generating educational content for a PDF document named "${pdfName}". Create realistic and educationally relevant content based on the subject matter implied by the filename.`;

    const PROMPTS = {
      summary: `${docContext}

Based on this document, return ONLY valid JSON (no markdown fences, no extra text):
{"summary":"2-3 paragraph summary","keyPoints":["point1","point2","point3","point4","point5"],"topics":["topic1","topic2","topic3"],"difficulty":"Intermediate","estimatedReadTime":5}`,

      "study-guide": `${docContext}

Create a comprehensive study guide and return ONLY valid JSON (no markdown fences, no extra text):
{"title":"Study Guide: ${pdfName}","sections":[{"title":"section title","content":"detailed explanation paragraph","keyConcepts":["concept1","concept2","concept3"]},{"title":"another section","content":"explanation paragraph","keyConcepts":["c1","c2","c3"]}],"practiceQuestions":[{"question":"Q?","answer":"A","difficulty":"Easy"},{"question":"Q?","answer":"A","difficulty":"Medium"},{"question":"Q?","answer":"A","difficulty":"Hard"}]}`,

      quiz: `${docContext}

Create a 5-question quiz and return ONLY valid JSON (no markdown fences, no extra text):
{"title":"Quiz: ${pdfName}","questions":[{"question":"MCQ?","options":["A","B","C","D"],"correctAnswer":0,"explanation":"why A","difficulty":"Easy","type":"multiple-choice"},{"question":"MCQ?","options":["A","B","C","D"],"correctAnswer":1,"explanation":"why B","difficulty":"Medium","type":"multiple-choice"},{"question":"True/false statement?","options":["True","False"],"correctAnswer":0,"explanation":"why","difficulty":"Easy","type":"true-false"},{"question":"MCQ?","options":["A","B","C","D"],"correctAnswer":2,"explanation":"why C","difficulty":"Hard","type":"multiple-choice"},{"question":"MCQ?","options":["A","B","C","D"],"correctAnswer":3,"explanation":"why D","difficulty":"Medium","type":"multiple-choice"}]}`,
    };

    const promptText = PROMPTS[task] || PROMPTS.summary;

    // Primary approach: text-only (works on all Gemini free/paid tiers)
    let text;
    try {
      text = await callGemini(
        [{ role: "user", parts: [{ text: promptText }] }],
        null,
        2048,
      );
    } catch (textErr) {
      // Fallback: try inline PDF only if text approach failed AND base64 is available
      // Note: inline PDF requires Gemini 1.5+ with paid tier
      if (pdfBase64) {
        console.log("[pdf-analyze] Text-only failed, trying inline PDF:", textErr.message);
        const fallbackPrompt = `Analyse the attached PDF document "${pdfName}" for task: ${task}. ${PROMPTS[task].split("\n").slice(-2).join("\n")}`;
        text = await callGemini(
          [{
            role: "user",
            parts: [
              { inline_data: { mime_type: "application/pdf", data: pdfBase64 } },
              { text: fallbackPrompt },
            ],
          }],
          null,
          2048,
        );
      } else {
        throw textErr;
      }
    }

    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("❌ /ai/pdf-analyze error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

module.exports = router;