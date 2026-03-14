import { useAuth } from "@/hooks/useAuth";
import { fetchSubjects, Subject } from "@/services/api";
import { LocalPDFStorage, PDFDocument } from "@/services/localPDFStorage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const ClockIcon = () => (
  <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
    <Text className="text-purple-600 text-base">🕐</Text>
  </View>
);
const BadgeIcon = () => (
  <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
    <Text className="text-green-600 text-base">🎖️</Text>
  </View>
);
const VideoIcon = () => (
  <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
    <Text className="text-red-500 text-base">▶️</Text>
  </View>
);
const FileIcon = () => (
  <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
    <Text className="text-purple-600 text-lg">📄</Text>
  </View>
);

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <View
    className="bg-white rounded-2xl p-4 mr-3 shadow-sm"
    style={{ width: width * 0.38 }}
  >
    {icon}
    <Text className="text-2xl font-bold text-gray-900 mt-3">{value}</Text>
    <Text className="text-gray-400 text-sm mt-0.5">{label}</Text>
  </View>
);

const SubjectCard = ({
  title,
  lessons,
  icon,
  bgColor,
  subjectId,
}: {
  title: string;
  lessons: number;
  icon: React.ReactNode;
  bgColor: string;
  subjectId: string;
}) => (
  <TouchableOpacity
    className="rounded-2xl p-4 justify-between"
    style={{
      backgroundColor: bgColor,
      width: (width - 48) / 2,
      height: 120,
      marginBottom: 12,
    }}
    activeOpacity={0.85}
    onPress={() => {
      // Navigate to subjects screen with the selected subject
      router.push({
        pathname: "/(tabs)/subjects",
        params: { subjectId: subjectId },
      });
    }}
  >
    <View className="self-end w-9 h-9 rounded-xl bg-white/20 items-center justify-center">
      {icon}
    </View>
    <View>
      <Text className="text-white font-bold text-lg">{title}</Text>
      <Text className="text-white/80 text-sm">{lessons} lessons</Text>
    </View>
  </TouchableOpacity>
);

// ── Upload Item ────────────────────────────────────────────────────────────────
const UploadItem = ({
  pdf,
  onPress,
}: {
  pdf: PDFDocument;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-3.5 border-b border-gray-100"
    activeOpacity={0.7}
  >
    <FileIcon />
    <View className="flex-1 ml-3">
      <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
        {pdf.name}
      </Text>
      <Text className="text-gray-400 text-xs mt-0.5">
        {pdf.subject ?? "General"} • {LocalPDFStorage.formatFileSize(pdf.size)}
      </Text>
    </View>
    <View className="bg-blue-100 px-2 py-0.5 rounded-full ml-2">
      <Text className="text-xs text-blue-700 font-semibold">PDF</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeDashboard() {
  const { user, loading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [recentUploads, setRecentUploads] = useState<PDFDocument[]>([]);

  // ✅ FIXED: load real local uploads for this user
  const loadRecentUploads = useCallback(async () => {
    if (!user) return;
    try {
      const pdfs = await LocalPDFStorage.getAllPDFs(user._id);
      setRecentUploads(pdfs.slice(0, 3)); // show last 3
    } catch (error) {
      console.error("Failed to load recent uploads:", error);
    }
  }, [user]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await fetchSubjects();
        setSubjects(data);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setSubjectsLoading(false);
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    if (user) loadRecentUploads();
  }, [user, loadRecentUploads]);

  const formatLearningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getUserInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleViewPDF = (pdf: PDFDocument) => {
    router.push({
      pathname: "/pdf-viewer",
      params: {
        uri: pdf.uri,
        name: pdf.name,
        subject: pdf.subject ?? "General",
        size: String(pdf.size),
        uploadDate: pdf.uploadDate,
      },
    });
  };

  // ✅ FIXED: upload goes local, not Cloudinary
  const handleUploadMore = async () => {
    if (!user) return;
    const result = await LocalPDFStorage.uploadPDF(user._id);
    if (result) {
      loadRecentUploads();
    }
  };

  if (loading || subjectsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start px-5 pt-4 pb-2">
          <View>
            <Text className="text-3xl font-bold text-gray-900">
              Hello, {user?.name || "User"} 👋
            </Text>
            <View className="flex-row items-center mt-2 bg-orange-50 self-start px-3 py-1 rounded-full border border-orange-200">
              <Text className="text-base">🔥</Text>
              <Text className="text-orange-500 font-semibold text-sm ml-1">
                {user?.streak || 0} day streak
              </Text>
            </View>
          </View>
          <View className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden border-2 border-purple-200">
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full bg-purple-400 items-center justify-center">
                <Text className="text-white font-bold text-lg">
                  {getUserInitials(user?.name || "U")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        >
          <StatCard
            icon={<ClockIcon />}
            value={formatLearningTime(user?.totalLearningTime || 0)}
            label="Learning Time"
          />
          <StatCard
            icon={<BadgeIcon />}
            value={String(user?.quizzesCompleted || 0)}
            label="Quizzes Done"
          />
          <StatCard
            icon={<VideoIcon />}
            value={String(user?.videosWatched || 0)}
            label="Videos Watched"
          />
        </ScrollView>

        {/* Featured Subjects */}
        <View className="px-5 mt-2">
          <Text className="text-xl font-bold text-gray-900 mb-3">
            Featured Subjects
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {subjects.slice(0, 4).map((subject) => (
              <SubjectCard
                key={subject.id}
                title={subject.title}
                lessons={subject.lessonsCount}
                subjectId={subject.id}
                icon={
                  <Text className="text-white text-xl">
                    {subject.iconName === "Calculator"
                      ? "⊞"
                      : subject.iconName === "Atom"
                        ? "⚛"
                        : subject.iconName === "BookOpen"
                          ? "📖"
                          : "🏛️"}
                  </Text>
                }
                bgColor={subject.color}
              />
            ))}
          </View>
        </View>

        {/* Recent Uploads — shows REAL local PDFs */}
        <View className="px-5 mt-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-gray-900">
              My Recent Uploads
            </Text>
            <TouchableOpacity onPress={handleUploadMore}>
              <Text className="text-purple-600 font-medium text-sm">
                + Upload
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl px-4 shadow-sm">
            {recentUploads.length === 0 ? (
              <View className="py-6 items-center">
                <Text className="text-gray-400 text-sm">No uploads yet</Text>
                <TouchableOpacity onPress={handleUploadMore} className="mt-2">
                  <Text className="text-purple-600 font-semibold text-sm">
                    Upload your first PDF →
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              recentUploads.map((pdf) => (
                <UploadItem
                  key={pdf.id}
                  pdf={pdf}
                  onPress={() => handleViewPDF(pdf)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
