import { useAuth } from "@/hooks/useAuth";
import {
  AIPDFService,
  PDFSummary,
  QuizSet,
  StudyGuide,
} from "@/services/aiPDFService";
import { PDFDocument } from "@/services/localPDFStorage";
import { router, useLocalSearchParams } from "expo-router";
import {
  BookOpen,
  Brain,
  ChevronLeft,
  Flashlight,
  RefreshCw,
  Star,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type TabType = "summary" | "study-guide" | "quiz";

const AIFeaturesScreen = () => {
  const { user } = useAuth();

  // ✅ FIX: destructure to primitives so useEffect deps are stable strings
  const { uri, name, subject, size, uploadDate } = useLocalSearchParams<{
    uri: string;
    name: string;
    subject: string;
    size: string;
    uploadDate: string;
  }>();

  const [pdf, setPdf] = useState<PDFDocument | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [summary, setSummary] = useState<PDFSummary | null>(null);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<TabType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // ✅ FIX: depend on individual primitive values, not the params object
  useEffect(() => {
    console.log("AI Features Screen - Params:", {
      uri,
      name,
      subject,
      size,
      uploadDate,
    });

    if (uri) {
      const pdfDoc: PDFDocument = {
        id: uri.split("/").pop() || "unknown",
        name: name || "Unknown PDF",
        uri,
        size: parseInt(size) || 0,
        uploadDate: uploadDate || new Date().toISOString(),
        subject: subject || "General",
      };
      console.log("Setting PDF:", pdfDoc);
      setPdf(pdfDoc);
    } else {
      console.error("No URI provided to AI Features screen");
    }
  }, [uri, name, subject, size, uploadDate]);

  // Load existing AI content
  useEffect(() => {
    if (!pdf) return;

    const loadAIContent = async () => {
      try {
        const [existingSummary, existingStudyGuide, existingQuiz] =
          await Promise.all([
            AIPDFService.getSummaryForPDF(pdf.id),
            AIPDFService.getStudyGuideForPDF(pdf.id),
            AIPDFService.getQuizForPDF(pdf.id),
          ]);

        setSummary(existingSummary);
        setStudyGuide(existingStudyGuide);
        setQuiz(existingQuiz);
      } catch (error) {
        console.error("Error loading AI content:", error);
      }
    };

    loadAIContent();
  }, [pdf?.id]);

  // Generate AI content
  const generateContent = async (type: TabType) => {
    if (!pdf || !user) return;

    setGenerating(type);
    try {
      switch (type) {
        case "summary":
          const newSummary = await AIPDFService.generateSummary(
            pdf.id,
            pdf.uri,
            pdf.name,
          );
          setSummary(newSummary);
          Alert.alert(
            "✅ Summary Generated",
            "AI summary has been created successfully!",
          );
          break;
        case "study-guide":
          const newStudyGuide = await AIPDFService.generateStudyGuide(
            pdf.id,
            pdf.uri,
            pdf.name,
          );
          setStudyGuide(newStudyGuide);
          Alert.alert(
            "✅ Study Guide Generated",
            "Study guide has been created successfully!",
          );
          break;
        case "quiz":
          const newQuiz = await AIPDFService.generateQuiz(
            pdf.id,
            pdf.uri,
            pdf.name,
          );
          setQuiz(newQuiz);
          setSelectedAnswers([]);
          setShowResults(false);
          setCurrentQuestionIndex(0);
          Alert.alert(
            "✅ Quiz Generated",
            "Quiz has been created successfully!",
          );
          break;
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      Alert.alert(
        "Generation Failed",
        `Failed to generate ${type}. Please try again.`,
      );
    } finally {
      setGenerating(null);
    }
  };

  // Tab rendering
  const renderSummaryTab = () => {
    if (!summary) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Brain size={56} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">
            No Summary Yet
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Generate an AI summary to quickly understand the key points
          </Text>
          <TouchableOpacity
            onPress={() => generateContent("summary")}
            disabled={generating !== null}
            className={`px-6 py-3 rounded-xl flex-row items-center ${
              generating === "summary" ? "bg-gray-300" : "bg-blue-600"
            }`}
          >
            {generating === "summary" ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Zap size={18} color="white" />
            )}
            <Text className="text-white font-semibold ml-2">
              {generating === "summary" ? "Generating..." : "Generate Summary"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">
              📝 AI Summary
            </Text>
            <TouchableOpacity
              onPress={() => generateContent("summary")}
              disabled={generating !== null}
              className={`p-2 rounded-lg ${
                generating === "summary" ? "bg-gray-100" : "bg-blue-50"
              }`}
            >
              <RefreshCw
                size={16}
                color={generating === "summary" ? "#9CA3AF" : "#3B82F6"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-3">
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-xs text-green-700 font-semibold">
                {summary.difficulty}
              </Text>
            </View>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-xs text-blue-700 font-semibold">
                {summary.estimatedReadTime} min read
              </Text>
            </View>
            <View className="bg-purple-100 px-3 py-1 rounded-full">
              <Text className="text-xs text-purple-700 font-semibold">
                {summary.topics.length} topics
              </Text>
            </View>
          </View>

          <Text className="text-gray-700 leading-relaxed mb-4">
            {summary.summary}
          </Text>

          <View className="border-t border-gray-100 pt-3">
            <Text className="font-semibold text-gray-900 mb-2">
              🔑 Key Points
            </Text>
            {summary.keyPoints.map((point, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Star
                  size={14}
                  color="#F59E0B"
                  style={{ marginTop: 2, marginRight: 8 }}
                />
                <Text className="text-gray-600 text-sm flex-1">{point}</Text>
              </View>
            ))}
          </View>

          <View className="border-t border-gray-100 pt-3 mt-3">
            <Text className="font-semibold text-gray-900 mb-2">
              📚 Topics Covered
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {summary.topics.map((topic, index) => (
                <View
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full"
                >
                  <Text className="text-xs text-gray-700 font-medium">
                    {topic}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderStudyGuideTab = () => {
    if (!studyGuide) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <BookOpen size={56} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">
            No Study Guide Yet
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Create a comprehensive study guide to master the material
          </Text>
          <TouchableOpacity
            onPress={() => generateContent("study-guide")}
            disabled={generating !== null}
            className={`px-6 py-3 rounded-xl flex-row items-center ${
              generating === "study-guide" ? "bg-gray-300" : "bg-green-600"
            }`}
          >
            {generating === "study-guide" ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <BookOpen size={18} color="white" />
            )}
            <Text className="text-white font-semibold ml-2">
              {generating === "study-guide"
                ? "Generating..."
                : "Create Study Guide"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">
              📖 Study Guide
            </Text>
            <TouchableOpacity
              onPress={() => generateContent("study-guide")}
              disabled={generating !== null}
              className={`p-2 rounded-lg ${
                generating === "study-guide" ? "bg-gray-100" : "bg-green-50"
              }`}
            >
              <RefreshCw
                size={16}
                color={generating === "study-guide" ? "#9CA3AF" : "#10B981"}
              />
            </TouchableOpacity>
          </View>

          {studyGuide.sections.map((section, index) => (
            <View key={index} className="mb-4 pb-4 border-b border-gray-100">
              <Text className="font-semibold text-gray-900 mb-2">
                {index + 1}. {section.title}
              </Text>
              <Text className="text-gray-600 text-sm mb-2">
                {section.content}
              </Text>
              <View className="bg-blue-50 p-3 rounded-lg">
                <Text className="text-xs font-semibold text-blue-800 mb-1">
                  Key Concepts:
                </Text>
                {section.keyConcepts.map((concept, conceptIndex) => (
                  <Text
                    key={conceptIndex}
                    className="text-xs text-blue-700 mb-1"
                  >
                    • {concept}
                  </Text>
                ))}
              </View>
            </View>
          ))}

          <View className="mt-4 pt-4 border-t border-gray-100">
            <Text className="font-semibold text-gray-900 mb-3">
              🎯 Practice Questions
            </Text>
            {studyGuide.practiceQuestions.map((question, index) => (
              <View key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-sm font-medium text-gray-900 flex-1">
                    Q{index + 1}: {question.question}
                  </Text>
                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      question.difficulty === "Easy"
                        ? "bg-green-100"
                        : question.difficulty === "Medium"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        question.difficulty === "Easy"
                          ? "text-green-700"
                          : question.difficulty === "Medium"
                            ? "text-yellow-700"
                            : "text-red-700"
                      }`}
                    >
                      {question.difficulty}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-600">
                  A: {question.answer}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderQuizTab = () => {
    if (!quiz) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Flashlight size={56} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">
            No Quiz Yet
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Generate a quiz to test your understanding of the material
          </Text>
          <TouchableOpacity
            onPress={() => generateContent("quiz")}
            disabled={generating !== null}
            className={`px-6 py-3 rounded-xl flex-row items-center ${
              generating === "quiz" ? "bg-gray-300" : "bg-purple-600"
            }`}
          >
            {generating === "quiz" ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Flashlight size={18} color="white" />
            )}
            <Text className="text-white font-semibold ml-2">
              {generating === "quiz" ? "Generating..." : "Generate Quiz"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    const handleAnswerSelect = (answerIndex: number) => {
      const newAnswers = [...selectedAnswers];
      newAnswers[currentQuestionIndex] = answerIndex;
      setSelectedAnswers(newAnswers);

      // Auto-advance to next question after selecting answer
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 500);
      } else {
        // Show results when quiz is complete
        setShowResults(true);
      }
    };

    const calculateScore = () => {
      let correct = 0;
      selectedAnswers.forEach((answer, index) => {
        if (answer === quiz.questions[index].correctAnswer) {
          correct++;
        }
      });
      return correct;
    };

    if (showResults) {
      const score = calculateScore();
      const percentage = Math.round((score / quiz.questions.length) * 100);

      return (
        <View className="flex-1 px-4">
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
            <View className="items-center mb-6">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                {percentage}%
              </Text>
              <Text className="text-lg text-gray-600">
                You got {score} out of {quiz.questions.length} correct
              </Text>
            </View>

            <View className="mb-6">
              <Text className="font-semibold text-gray-900 mb-3">
                Review Answers:
              </Text>
              {quiz.questions.map((question, index) => {
                const isCorrect =
                  selectedAnswers[index] === question.correctAnswer;
                return (
                  <View key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <Text className="font-medium text-gray-900 mb-2">
                      Q{index + 1}: {question.question}
                    </Text>
                    <Text
                      className={`text-sm mb-1 ${isCorrect ? "text-green-600" : "text-red-600"}`}
                    >
                      Your answer:{" "}
                      {question.options[selectedAnswers[index]] ||
                        "Not answered"}
                    </Text>
                    {!isCorrect && (
                      <Text className="text-sm text-green-600">
                        Correct answer:{" "}
                        {question.options[question.correctAnswer]}
                      </Text>
                    )}
                    <Text className="text-xs text-gray-500 mt-1">
                      {question.explanation}
                    </Text>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => {
                setSelectedAnswers([]);
                setCurrentQuestionIndex(0);
                setShowResults(false);
              }}
              className="bg-purple-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold text-center">
                Retake Quiz
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 px-4">
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">� Quiz</Text>
            <TouchableOpacity
              onPress={() => generateContent("quiz")}
              disabled={generating !== null}
              className={`p-2 rounded-lg ${
                generating === "quiz" ? "bg-gray-100" : "bg-purple-50"
              }`}
            >
              <RefreshCw
                size={16}
                color={generating === "quiz" ? "#9CA3AF" : "#9333EA"}
              />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Text>
              <Text className="text-sm text-gray-600">
                {Math.round(progress)}%
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full">
              <View
                className="h-2 bg-purple-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Question */}
          <View className="mb-4">
            <View
              className={`px-2 py-1 rounded-full self-start mb-2 ${
                currentQuestion.difficulty === "Easy"
                  ? "bg-green-100"
                  : currentQuestion.difficulty === "Medium"
                    ? "bg-yellow-100"
                    : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  currentQuestion.difficulty === "Easy"
                    ? "text-green-700"
                    : currentQuestion.difficulty === "Medium"
                      ? "text-yellow-700"
                      : "text-red-700"
                }`}
              >
                {currentQuestion.difficulty}
              </Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </Text>

            {/* Answer Options */}
            {currentQuestion.type === "multiple-choice" && (
              <View className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleAnswerSelect(index)}
                    className={`p-4 rounded-xl border-2 ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? "text-purple-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentQuestion.type === "true-false" && (
              <View className="flex-row space-x-3">
                {currentQuestion.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleAnswerSelect(index)}
                    className={`flex-1 p-4 rounded-xl border-2 ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`font-medium text-center ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? "text-purple-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentQuestion.type === "short-answer" && (
              <View className="p-4 bg-gray-50 rounded-xl">
                <Text className="text-gray-600 text-center">
                  Short answer questions require manual review. In a full
                  implementation, this would include a text input field.
                </Text>
              </View>
            )}
          </View>

          {/* Navigation */}
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                }
              }}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-lg ${
                currentQuestionIndex === 0 ? "bg-gray-100" : "bg-blue-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  currentQuestionIndex === 0 ? "text-gray-400" : "text-blue-700"
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (currentQuestionIndex < quiz.questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                } else {
                  setShowResults(true);
                }
              }}
              className={`px-4 py-2 rounded-lg ${
                currentQuestionIndex === quiz.questions.length - 1
                  ? "bg-green-100"
                  : "bg-blue-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  currentQuestionIndex === quiz.questions.length - 1
                    ? "text-green-700"
                    : "text-blue-700"
                }`}
              >
                {currentQuestionIndex === quiz.questions.length - 1
                  ? "Finish"
                  : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Tab navigation
  const renderTabButton = (
    type: TabType,
    icon: React.ReactNode,
    label: string,
    color: string,
  ) => (
    <TouchableOpacity
      onPress={() => setActiveTab(type)}
      className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
        activeTab === type ? color : "bg-gray-100"
      }`}
    >
      {icon}
      <Text
        className={`ml-2 font-semibold text-sm ${
          activeTab === type ? "text-white" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!pdf) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-3 text-center">
          {uri
            ? "Loading PDF information..."
            : "No PDF selected. Please go back and select a PDF."}
        </Text>
        {!uri && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AI Features</Text>
            <Text style={styles.headerSubtitle}>{pdf.name}</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row space-x-2">
        {renderTabButton(
          "summary",
          <Brain
            size={16}
            color={activeTab === "summary" ? "white" : "#374151"}
          />,
          "Summary",
          "bg-blue-600",
        )}
        {renderTabButton(
          "study-guide",
          <BookOpen
            size={16}
            color={activeTab === "study-guide" ? "white" : "#374151"}
          />,
          "Study Guide",
          "bg-green-600",
        )}
        {renderTabButton(
          "quiz",
          <Flashlight
            size={16}
            color={activeTab === "quiz" ? "white" : "#374151"}
          />,
          "Quiz",
          "bg-purple-600",
        )}
        <View className="flex-row space-x-2">
          {renderTabButton(
            "summary",
            <Brain
              size={16}
              color={activeTab === "summary" ? "white" : "#374151"}
            />,
            "Summary",
            "bg-blue-600",
          )}
          {renderTabButton(
            "study-guide",
            <BookOpen
              size={16}
              color={activeTab === "study-guide" ? "white" : "#374151"}
            />,
            "Study Guide",
            "bg-green-600",
          )}
          {renderTabButton(
            "quiz",
            <Flashlight
              size={16}
              color={activeTab === "quiz" ? "white" : "#374151"}
            />,
            "Quiz",
            "bg-purple-600",
          )}
        </View>
      </View>

      {/* Generating banner */}
      {generating && (
        <View className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-blue-700 ml-2 text-sm font-medium">
              Generating {generating}... This may take a moment.
            </Text>
          </View>
        </View>
      )}

      {activeTab === "summary" && renderSummaryTab()}
      {activeTab === "study-guide" && renderStudyGuideTab()}
      {activeTab === "quiz" && renderQuizTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default AIFeaturesScreen;
