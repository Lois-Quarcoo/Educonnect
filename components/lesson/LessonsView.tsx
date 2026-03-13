import { AIContentService, AILesson } from "@/services/aiContentService";
import { useAuth } from "@/hooks/useAuth";
import { LocalPDFStorage, PDFDocument } from "@/services/localPDFStorage";
import { router } from "expo-router";
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

interface LessonsViewProps {
  subjectId: string;
  subjectTitle: string;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  Beginner: { bg: "#F0FDF4", text: "#15803D", badge: "bg-green-100" },
  Intermediate: { bg: "#EFF6FF", text: "#1D4ED8", badge: "bg-blue-100" },
  Advanced: { bg: "#FDF4FF", text: "#7E22CE", badge: "bg-purple-100" },
};

// ── Lesson Card ────────────────────────────────────────────────────────────────
const LessonCard = ({
  lesson,
  index,
  isCompleted,
  onToggleComplete,
}: {
  lesson: AILesson;
  index: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const colors = DIFFICULTY_COLORS[lesson.difficulty] || DIFFICULTY_COLORS.Beginner;

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).springify().damping(14)}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => setExpanded(!expanded)}
        className={`bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 ${
          isCompleted ? "border-l-4 border-l-green-400" : "border-l-4 border-l-transparent"
        }`}
      >
        {/* Header row */}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mr-2">
                Lesson {lesson.order}
              </Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: colors.bg }}
              >
                <Text className="text-xs font-bold" style={{ color: colors.text }}>
                  {lesson.difficulty}
                </Text>
              </View>
            </View>
            <Text className="text-gray-900 font-bold text-base">{lesson.title}</Text>
            <Text className="text-gray-500 text-sm mt-0.5">{lesson.description}</Text>
          </View>

          <View className="items-center gap-2">
            <TouchableOpacity onPress={onToggleComplete} hitSlop={8}>
              {isCompleted ? (
                <CheckCircle2 size={24} color="#22C55E" />
              ) : (
                <View className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-50" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Meta row */}
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-2">
            <View className="bg-gray-100 rounded-lg px-2 py-1">
              <Text className="text-gray-500 text-xs font-medium">{lesson.duration}</Text>
            </View>
            <View className="bg-blue-50 rounded-lg px-2 py-1">
              <Text className="text-blue-500 text-xs font-medium">EduConnect AI</Text>
            </View>
          </View>
          {expanded ? (
            <ChevronUp size={18} color="#9CA3AF" />
          ) : (
            <ChevronDown size={18} color="#9CA3AF" />
          )}
        </View>

        {/* Expanded content */}
        {expanded && (
          <Animated.View entering={FadeIn.duration(250)} className="mt-4 pt-4 border-t border-gray-100">
            {lesson.content.split("\n\n").map((paragraph, i) => (
              <Text key={i} className="text-gray-700 text-sm leading-6 mb-3">
                {paragraph}
              </Text>
            ))}
            <TouchableOpacity
              onPress={onToggleComplete}
              className={`mt-2 py-3 rounded-xl items-center ${
                isCompleted ? "bg-green-500" : "bg-[#6B4EFF]"
              }`}
            >
              <Text className="text-white font-bold text-sm">
                {isCompleted ? "✓ Mark Incomplete" : "Mark as Complete"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── PDF Item ───────────────────────────────────────────────────────────────────
const PDFItem = ({ pdf, onPress }: { pdf: PDFDocument; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 border-l-4 border-l-emerald-400 flex-row items-center"
    activeOpacity={0.8}
  >
    <View className="flex-1 mr-3">
      <View className="flex-row items-center mb-1">
        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mr-2">
          Your Upload
        </Text>
        <View className="bg-emerald-50 px-2 py-0.5 rounded-full">
          <Text className="text-xs font-bold text-emerald-700">PDF</Text>
        </View>
      </View>
      <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
        {pdf.name}
      </Text>
      <View className="flex-row items-center mt-2 gap-2">
        <View className="bg-gray-100 rounded-lg px-2 py-1">
          <Text className="text-gray-500 text-xs font-medium">
            {LocalPDFStorage.formatFileSize(pdf.size)}
          </Text>
        </View>
      </View>
    </View>
    <View className="w-12 h-12 rounded-full border-2 border-emerald-100 items-center justify-center">
      <FileText size={20} color="#10B981" />
    </View>
  </TouchableOpacity>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LessonsView({ subjectId, subjectTitle }: LessonsViewProps) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<AILesson[]>([]);
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);

  const loadContent = async (forceRefresh = false) => {
    setLoading(true);
    setError(false);
    try {
      const content = await AIContentService.getSubjectContent(
        subjectId,
        subjectTitle,
        forceRefresh,
      );
      setLessons(content.lessons);

      if (user) {
        const userPDFs = await LocalPDFStorage.getPDFsBySubject(user._id, subjectTitle);
        setPdfs(userPDFs);
      }
    } catch (e) {
      console.error("LessonsView load error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [subjectId, subjectTitle, user]);

  const toggleComplete = (lessonId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      return next;
    });
  };

  const progress = lessons.length > 0
    ? Math.round((completedIds.size / lessons.length) * 100)
    : 0;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <View className="w-16 h-16 rounded-full bg-purple-50 items-center justify-center mb-4">
          <Sparkles size={28} color="#6B4EFF" />
        </View>
        <ActivityIndicator size="large" color="#6B4EFF" style={{ marginBottom: 12 }} />
        <Text className="text-gray-500 font-semibold text-base">
          Loading {subjectTitle} lessons…
        </Text>
        <Text className="text-gray-400 text-sm mt-1">Powered by AI</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-gray-400 font-medium text-center mb-4">
          Failed to load lessons
        </Text>
        <TouchableOpacity
          onPress={() => loadContent(true)}
          className="bg-[#6B4EFF] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-5 pt-5"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Progress card */}
      {lessons.length > 0 && (
        <Animated.View
          entering={FadeInUp.delay(50)}
          className="bg-[#6B4EFF] rounded-2xl p-4 mb-6 flex-row items-center shadow-sm"
        >
          <AnimatedCircularProgress
            size={56}
            width={5}
            fill={progress}
            tintColor="#FBBF24"
            backgroundColor="rgba(255,255,255,0.25)"
            rotation={0}
          >
            {() => (
              <Text className="text-white font-black text-xs">{progress}%</Text>
            )}
          </AnimatedCircularProgress>
          <View className="flex-1 ml-4">
            <Text className="text-white font-black text-base">{subjectTitle} Progress</Text>
            <Text className="text-white/80 text-sm mt-0.5">
              {completedIds.size} of {lessons.length} lessons completed
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => loadContent(true)}
            className="w-9 h-9 rounded-full bg-white/20 items-center justify-center"
            hitSlop={8}
          >
            <RefreshCw size={16} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* AI-generated lessons */}
      <View className="flex-row items-center mb-4">
        <BookOpen size={18} color="#1F2937" style={{ marginRight: 8 }} />
        <Text className="text-gray-900 font-bold text-lg">
          {subjectTitle} Lessons
        </Text>
      </View>

      {lessons.map((lesson, index) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          index={index}
          isCompleted={completedIds.has(lesson.id)}
          onToggleComplete={() => toggleComplete(lesson.id)}
        />
      ))}

      {/* User uploads */}
      {pdfs.length > 0 && (
        <>
          <View className="flex-row items-center mb-4 mt-4">
            <FileText size={18} color="#1F2937" style={{ marginRight: 8 }} />
            <Text className="text-gray-900 font-bold text-lg">Your Materials</Text>
          </View>
          {pdfs.map((pdf) => (
            <PDFItem
              key={pdf.id}
              pdf={pdf}
              onPress={() =>
                router.push({
                  pathname: "/pdf-viewer",
                  params: {
                    uri: pdf.uri,
                    name: pdf.name,
                    subject: pdf.subject ?? "General",
                    size: String(pdf.size),
                    uploadDate: pdf.uploadDate,
                  },
                })
              }
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}