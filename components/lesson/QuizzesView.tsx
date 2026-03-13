import { AIContentService, AIQuizQuestion } from "@/services/aiContentService";
import { Quiz } from "@/services/api";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";

interface QuizzesViewProps {
  quizzes: Quiz[];
  color: string;
  subjectId?: string;
  subjectTitle?: string;
}

type QuizState = "list" | "playing" | "results";

const DIFF_COLORS: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "#F0FDF4", text: "#15803D" },
  Medium: { bg: "#FFFBEB", text: "#B45309" },
  Hard: { bg: "#FFF1F2", text: "#BE123C" },
};

// ── Quiz Player ────────────────────────────────────────────────────────────────
function QuizPlayer({
  questions,
  quizTitle,
  color,
  onFinish,
  onRetry,
}: {
  questions: AIQuizQuestion[];
  quizTitle: string;
  color: string;
  onFinish: () => void;
  onRetry: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isAnswered = selectedAnswers[currentIdx] !== undefined;
  const isLast = currentIdx === questions.length - 1;

  const handleSelect = (optionIdx: number) => {
    if (selectedAnswers[currentIdx] !== undefined) return; // locked after answer
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
    // Auto-advance after 900ms
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        setShowResults(true);
      }
    }, 900);
  };

  const score = questions.reduce(
    (acc, q, i) => acc + (selectedAnswers[i] === q.correctAnswerIndex ? 1 : 0),
    0,
  );
  const pct = Math.round((score / questions.length) * 100);

  if (showResults) {
    const grade =
      pct >= 80 ? { label: "Excellent! 🎉", color: "#15803D" }
      : pct >= 60 ? { label: "Good job! 👍", color: "#B45309" }
      : { label: "Keep practising 💪", color: "#BE123C" };

    return (
      <Animated.View entering={FadeIn} className="flex-1 px-5 py-6">
        {/* Score card */}
        <View
          className="rounded-3xl p-6 mb-6 items-center shadow-sm"
          style={{ backgroundColor: color + "15" }}
        >
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: color + "25" }}
          >
            <Trophy size={40} color={color} />
          </View>
          <Text className="text-3xl font-black text-gray-900 mb-1">{pct}%</Text>
          <Text className="text-lg font-semibold" style={{ color: grade.color }}>
            {grade.label}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            {score} out of {questions.length} correct
          </Text>
        </View>

        {/* Answer review */}
        <Text className="text-gray-900 font-bold text-base mb-3">Review Answers</Text>
        {questions.map((q, i) => {
          const userAns = selectedAnswers[i];
          const correct = q.correctAnswerIndex;
          const isCorrect = userAns === correct;
          return (
            <View key={q.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
              <Text className="text-gray-800 font-semibold text-sm mb-2">
                Q{i + 1}: {q.question || q.text}
              </Text>
              <View className="flex-row items-center mb-1">
                <Text className="text-xs font-bold mr-2" style={{ color: isCorrect ? "#15803D" : "#BE123C" }}>
                  {isCorrect ? "✓ Your answer:" : "✗ Your answer:"}
                </Text>
                <Text className="text-xs text-gray-600">{q.options[userAns] ?? "—"}</Text>
              </View>
              {!isCorrect && (
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs font-bold text-green-700 mr-2">✓ Correct:</Text>
                  <Text className="text-xs text-gray-600">{q.options[correct]}</Text>
                </View>
              )}
              <Text className="text-xs text-gray-400 mt-1 italic">{q.explanation}</Text>
            </View>
          );
        })}

        {/* Actions */}
        <TouchableOpacity
          onPress={onRetry}
          className="py-4 rounded-2xl items-center mb-3 mt-2"
          style={{ backgroundColor: color }}
        >
          <Text className="text-white font-black text-sm uppercase tracking-wider">
            Retake Quiz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onFinish}
          className="py-3 rounded-2xl items-center border-2 border-gray-200"
        >
          <Text className="text-gray-600 font-bold text-sm uppercase tracking-wide">
            Back to Quizzes
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const diffColors = DIFF_COLORS[currentQ.difficulty] || DIFF_COLORS.Easy;
  const userSelected = selectedAnswers[currentIdx];

  return (
    <View className="flex-1 px-5 pt-5">
      {/* Progress bar */}
      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Question {currentIdx + 1} of {questions.length}
          </Text>
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: diffColors.bg }}>
            <Text className="text-xs font-bold" style={{ color: diffColors.text }}>
              {currentQ.difficulty}
            </Text>
          </View>
        </View>
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <Animated.View
            className="h-2 rounded-full"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </View>
      </View>

      {/* Question */}
      <Animated.View
        key={currentQ.id}
        entering={SlideInRight.duration(280).springify()}
        className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
      >
        <Text className="text-gray-900 font-black text-xl leading-tight mb-5">
          {currentQ.text || (currentQ as any).question}
        </Text>

        {/* Options */}
        <View className="gap-2">
          {currentQ.options.map((option, i) => {
            let borderColor = "#E5E7EB";
            let bgColor = "#FFFFFF";
            let textColor = "#374151";

            if (userSelected !== undefined) {
              if (i === currentQ.correctAnswerIndex) {
                borderColor = "#22C55E";
                bgColor = "#F0FDF4";
                textColor = "#15803D";
              } else if (i === userSelected && i !== currentQ.correctAnswerIndex) {
                borderColor = "#EF4444";
                bgColor = "#FFF1F2";
                textColor = "#BE123C";
              }
            } else if (userSelected === i) {
              borderColor = color;
              bgColor = color + "10";
              textColor = color;
            }

            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleSelect(i)}
                disabled={userSelected !== undefined}
                className="flex-row items-center px-4 py-3.5 rounded-2xl border-2"
                style={{ borderColor, backgroundColor: bgColor }}
                activeOpacity={0.75}
              >
                <View
                  className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
                  style={{ borderColor }}
                >
                  {userSelected === i && (
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: i === currentQ.correctAnswerIndex ? "#22C55E" : "#EF4444" }}
                    />
                  )}
                  {userSelected !== undefined && i === currentQ.correctAnswerIndex && userSelected !== i && (
                    <View className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </View>
                <Text className="flex-1 font-medium text-sm" style={{ color: textColor }}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation after answer */}
        {userSelected !== undefined && (
          <Animated.View entering={FadeIn.delay(300)} className="mt-4 p-3 rounded-xl bg-gray-50">
            <Text className="text-gray-600 text-xs leading-5">
              💡 {currentQ.explanation}
            </Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Navigation */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border-2 ${
            currentIdx === 0 ? "border-gray-100 bg-gray-50 opacity-40" : "border-gray-200 bg-white"
          }`}
        >
          <ChevronLeft size={20} color={currentIdx === 0 ? "#9CA3AF" : "#4B5563"} />
          <Text className={`font-bold text-sm uppercase tracking-wide ml-1 ${currentIdx === 0 ? "text-gray-400" : "text-gray-600"}`}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (isLast) {
              setShowResults(true);
            } else {
              setCurrentIdx((i) => i + 1);
            }
          }}
          disabled={!isAnswered}
          className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl shadow-sm ${
            isAnswered ? "" : "opacity-40"
          }`}
          style={{ backgroundColor: isAnswered ? color : "#E5E7EB" }}
        >
          <Text className={`font-black text-sm uppercase tracking-wide mr-1 ${isAnswered ? "text-white" : "text-gray-400"}`}>
            {isLast ? "Finish" : "Next"}
          </Text>
          {!isLast && <ChevronRight size={20} color={isAnswered ? "white" : "#9CA3AF"} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function QuizzesView({
  quizzes: apiQuizzes,
  color,
  subjectId = "general",
  subjectTitle = "Subject",
}: QuizzesViewProps) {
  const [aiQuestions, setAiQuestions] = useState<AIQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>("list");
  const [activeQuiz, setActiveQuiz] = useState<{ title: string; questions: AIQuizQuestion[] } | null>(null);
  const [quizKey, setQuizKey] = useState(0); // force re-mount on retry

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const content = await AIContentService.getSubjectContent(subjectId, subjectTitle);
      setAiQuestions(content.quizzes);
    } catch (e) {
      console.error("QuizzesView load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [subjectId, subjectTitle]);

  // Convert API quizzes to AIQuizQuestion format
  const apiAsAI: AIQuizQuestion[] = apiQuizzes.flatMap((quiz) =>
    quiz.questions.map((q) => ({
      id: q.id,
      type: "multiple_choice" as const,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: `The correct answer is: ${q.options[q.correctAnswerIndex]}`,
      difficulty: quiz.difficulty as "Easy" | "Medium" | "Hard",
    })),
  );

  // Build quiz sets to display
  const quizSets: Array<{ id: string; title: string; questions: AIQuizQuestion[]; source: "ai" | "api" }> =
    [];

  if (aiQuestions.length > 0) {
    quizSets.push({
      id: "ai_quiz",
      title: `${subjectTitle} Quiz`,
      questions: aiQuestions,
      source: "ai",
    });
  }
  apiQuizzes.forEach((quiz) => {
    const mapped: AIQuizQuestion[] = quiz.questions.map((q) => ({
      id: q.id,
      type: "multiple_choice" as const,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: `The correct answer is: ${q.options[q.correctAnswerIndex]}`,
      difficulty: quiz.difficulty as "Easy" | "Medium" | "Hard",
    }));
    quizSets.push({ id: quiz.id, title: quiz.title, questions: mapped, source: "api" });
  });

  // ── Playing state ───────────────────────────────────────────────────────────
  if (quizState === "playing" && activeQuiz) {
    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View
          className="flex-row items-center px-5 py-4 border-b border-gray-100 bg-white"
        >
          <TouchableOpacity
            onPress={() => setQuizState("list")}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 font-black text-gray-900 text-base" numberOfLines={1}>
            {activeQuiz.title}
          </Text>
        </View>

        <QuizPlayer
          key={quizKey}
          questions={activeQuiz.questions}
          quizTitle={activeQuiz.title}
          color={color}
          onFinish={() => setQuizState("list")}
          onRetry={() => {
            setQuizKey((k) => k + 1);
          }}
        />
      </ScrollView>
    );
  }

  // ── List state ──────────────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 pt-5 px-5"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-gray-900 font-bold text-lg">Available Quizzes</Text>
        <TouchableOpacity
          onPress={() => loadQuizzes()}
          className="p-2 rounded-xl bg-gray-100"
        >
          <RefreshCw size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="items-center justify-center py-16">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: color + "15" }}
          >
            <Sparkles size={28} color={color} />
          </View>
          <ActivityIndicator size="large" color={color} style={{ marginBottom: 12 }} />
          <Text className="text-gray-500 font-semibold">Generating quizzes…</Text>
        </View>
      ) : quizSets.length === 0 ? (
        <View className="items-center justify-center py-16">
          <Award size={56} color="#D1D5DB" />
          <Text className="text-gray-500 font-semibold mt-4">No quizzes yet</Text>
          <TouchableOpacity
            onPress={() => loadQuizzes()}
            className="mt-4 px-6 py-3 rounded-xl"
            style={{ backgroundColor: color }}
          >
            <Text className="text-white font-bold">Generate Quiz</Text>
          </TouchableOpacity>
        </View>
      ) : (
        quizSets.map((set, index) => (
          <Animated.View
            key={set.id}
            entering={FadeInUp.delay(index * 100).springify()}
          >
            <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
              {/* Badge row */}
              <View className="flex-row items-center justify-between mb-3">
                <View
                  className="px-2 py-1 rounded-lg"
                  style={{ backgroundColor: color + "15" }}
                >
                  <Text
                    className="text-xs font-black uppercase tracking-wider"
                    style={{ color }}
                  >
                    {set.source === "ai" ? "✦ AI Generated" : "EduConnect"}
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs font-medium">
                  {set.questions.length} questions
                </Text>
              </View>

              <Text className="text-gray-900 font-black text-lg mb-1">{set.title}</Text>

              {/* Difficulty distribution */}
              <View className="flex-row gap-2 mb-4 flex-wrap">
                {(["Easy", "Medium", "Hard"] as const).map((d) => {
                  const count = set.questions.filter((q) => q.difficulty === d).length;
                  if (!count) return null;
                  const dc = DIFF_COLORS[d];
                  return (
                    <View key={d} className="px-2 py-0.5 rounded-full" style={{ backgroundColor: dc.bg }}>
                      <Text className="text-xs font-semibold" style={{ color: dc.text }}>
                        {count} {d}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setActiveQuiz({ title: set.title, questions: set.questions });
                  setQuizKey((k) => k + 1);
                  setQuizState("playing");
                }}
                className="py-3.5 rounded-2xl items-center shadow-sm"
                style={{ backgroundColor: color }}
                activeOpacity={0.85}
              >
                <Text className="text-white font-black text-sm uppercase tracking-wider">
                  Start Quiz
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}