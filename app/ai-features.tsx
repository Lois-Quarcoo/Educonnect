import { useAuth } from "@/hooks/useAuth";
import {
    AIPDFService,
    FlashcardSet,
    PDFSummary,
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
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type TabType = "summary" | "study-guide" | "flashcards";

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
  const [flashcards, setFlashcards] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<TabType | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCardBack, setShowCardBack] = useState(false);

  // ✅ FIX: depend on individual primitive values, not the params object
  useEffect(() => {
    if (uri) {
      const pdfDoc: PDFDocument = {
        id: uri.split("/").pop() || "unknown",
        name,
        uri,
        size: parseInt(size) || 0,
        uploadDate,
        subject,
      };
      setPdf(pdfDoc);
    }
  }, [uri, name, subject, size, uploadDate]);

  // Load existing AI content
  useEffect(() => {
    if (!pdf) return;

    const loadAIContent = async () => {
      try {
        const [existingSummary, existingStudyGuide, existingFlashcards] =
          await Promise.all([
            AIPDFService.getSummaryForPDF(pdf.id),
            AIPDFService.getStudyGuideForPDF(pdf.id),
            AIPDFService.getFlashcardsForPDF(pdf.id),
          ]);

        setSummary(existingSummary);
        setStudyGuide(existingStudyGuide);
        setFlashcards(existingFlashcards);
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
        case "flashcards":
          const newFlashcards = await AIPDFService.generateFlashcards(
            pdf.id,
            pdf.uri,
            pdf.name,
          );
          setFlashcards(newFlashcards);
          Alert.alert(
            "✅ Flashcards Generated",
            "Flashcards have been created successfully!",
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
                <Star size={14} color="#F59E0B" style={{ marginTop: 2, marginRight: 8 }} />
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
            <View
              key={index}
              className="mb-4 pb-4 border-b border-gray-100"
            >
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

  const renderFlashcardsTab = () => {
    if (!flashcards) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Flashlight size={56} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">
            No Flashcards Yet
          </Text>
          <Text className="text-gray-400 text-sm text-center mb-6">
            Create flashcards to test your knowledge and improve retention
          </Text>
          <TouchableOpacity
            onPress={() => generateContent("flashcards")}
            disabled={generating !== null}
            className={`px-6 py-3 rounded-xl flex-row items-center ${
              generating === "flashcards" ? "bg-gray-300" : "bg-purple-600"
            }`}
          >
            {generating === "flashcards" ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Flashlight size={18} color="white" />
            )}
            <Text className="text-white font-semibold ml-2">
              {generating === "flashcards"
                ? "Generating..."
                : "Create Flashcards"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentCard = flashcards.cards[currentCardIndex];

    return (
      <View className="flex-1 px-4">
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">
              🗂️ Flashcards
            </Text>
            <TouchableOpacity
              onPress={() => generateContent("flashcards")}
              disabled={generating !== null}
              className={`p-2 rounded-lg ${
                generating === "flashcards" ? "bg-gray-100" : "bg-purple-50"
              }`}
            >
              <RefreshCw
                size={16}
                color={generating === "flashcards" ? "#9CA3AF" : "#9333EA"}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-gray-500">
              Card {currentCardIndex + 1} of {flashcards.cards.length}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-full ${
                currentCard.difficulty === "Easy"
                  ? "bg-green-100"
                  : currentCard.difficulty === "Medium"
                    ? "bg-yellow-100"
                    : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  currentCard.difficulty === "Easy"
                    ? "text-green-700"
                    : currentCard.difficulty === "Medium"
                      ? "text-yellow-700"
                      : "text-red-700"
                }`}
              >
                {currentCard.difficulty}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setShowCardBack(!showCardBack)}
            className="bg-purple-500 rounded-2xl p-6 min-h-[200px] justify-center items-center mb-4"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-medium text-lg">
              {showCardBack ? currentCard.back : currentCard.front}
            </Text>
            <Text className="text-white/80 text-sm mt-3">
              {showCardBack ? "Tap to see question" : "Tap to see answer"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => {
                setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                setShowCardBack(false);
              }}
              disabled={currentCardIndex === 0}
              className={`px-4 py-2 rounded-lg ${
                currentCardIndex === 0 ? "bg-gray-100" : "bg-blue-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  currentCardIndex === 0 ? "text-gray-400" : "text-blue-700"
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCardBack(!showCardBack)}
              className="px-4 py-2 bg-purple-100 rounded-lg"
            >
              <Text className="text-sm font-medium text-purple-700">Flip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setCurrentCardIndex(
                  Math.min(flashcards.cards.length - 1, currentCardIndex + 1),
                );
                setShowCardBack(false);
              }}
              disabled={currentCardIndex === flashcards.cards.length - 1}
              className={`px-4 py-2 rounded-lg ${
                currentCardIndex === flashcards.cards.length - 1
                  ? "bg-gray-100"
                  : "bg-blue-100"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  currentCardIndex === flashcards.cards.length - 1
                    ? "text-gray-400"
                    : "text-blue-700"
                }`}
              >
                Next
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
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-3">Loading PDF information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 pt-4 pb-3">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-100 rounded-lg mr-3"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              🧠 AI Learning Assistant
            </Text>
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              {pdf.name}
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row space-x-2">
          {renderTabButton(
            "summary",
            <Brain size={16} color={activeTab === "summary" ? "white" : "#374151"} />,
            "Summary",
            "bg-blue-600",
          )}
          {renderTabButton(
            "study-guide",
            <BookOpen size={16} color={activeTab === "study-guide" ? "white" : "#374151"} />,
            "Study Guide",
            "bg-green-600",
          )}
          {renderTabButton(
            "flashcards",
            <Flashlight size={16} color={activeTab === "flashcards" ? "white" : "#374151"} />,
            "Flashcards",
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
      {activeTab === "flashcards" && renderFlashcardsTab()}
    </SafeAreaView>
  );
};

export default AIFeaturesScreen;