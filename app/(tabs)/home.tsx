import { useAuth } from "@/hooks/useAuth";
import { fetchSubjects, Subject } from "@/services/api";
import { uploadFile } from "@/services/universalUpload";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Main Screen ───────────────────────────────────────────────────────────────
const { width } = Dimensions.get("window");

// ── Icons (inline SVG-style via Text or replace with react-native-vector-icons / lucide-react-native) ──
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
const GridIcon = () => <Text className="text-white text-xl">⊞</Text>;
const AtomIcon = () => <Text className="text-white text-xl">⚛</Text>;
const BookIcon = () => <Text className="text-white text-xl">📖</Text>;
const ColumnIcon = () => <Text className="text-white text-xl">🏛️</Text>;
const FileIcon = () => (
  <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
    <Text className="text-purple-600 text-lg">📄</Text>
  </View>
);
const ImageIcon = () => (
  <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
    <Text className="text-purple-600 text-lg">🖼️</Text>
  </View>
);

// ── Stat Card ──────────────────────────────────────────────────────────────────
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

// ── Subject Card ──────────────────────────────────────────────────────────────
const SubjectCard = ({
  title,
  lessons,
  icon,
  bgColor,
}: {
  title: string;
  lessons: number;
  icon: React.ReactNode;
  bgColor: string;
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
  icon,
  title,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
}) => (
  <View className="flex-row items-center py-3.5 border-b border-gray-100">
    {icon}
    <View className="flex-1 ml-3">
      <Text className="text-gray-900 font-semibold text-sm">{title}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{meta}</Text>
    </View>
    <TouchableOpacity className="p-2">
      <Text className="text-gray-400 text-lg leading-none">⋮</Text>
    </TouchableOpacity>
  </View>
);

// ── Bottom Tab ────────────────────────────────────────────────────────────────
const Tab = ({ label, active }: { label: string; active?: boolean }) => (
  <TouchableOpacity className="flex-1 items-center py-2">
    <Text
      className={`text-sm font-medium ${active ? "text-purple-600" : "text-gray-400"}`}
    >
      {label}
    </Text>
    {active && <View className="mt-1 w-1 h-1 rounded-full bg-purple-600" />}
  </TouchableOpacity>
);

export default function HomeDashboard() {
  const { user, loading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  // Handle file upload from home screen
  const handleUploadFile = async () => {
    if (!user) {
      Alert.alert("Error", "Please login to upload files");
      return;
    }

    try {
      const result = await uploadFile(user._id, "any", "home-uploads");
      if (result) {
        Alert.alert("Success", `${result.name} uploaded successfully!`);
        // TODO: Refresh recent uploads list
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload file. Please try again.");
    }
  };

  // Fetch subjects on mount
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

  // Format learning time
  const formatLearningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
        {/* ── Header ── */}
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
          <TouchableOpacity>
            <View className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden border-2 border-purple-200">
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {getUserInitials(user?.name || "U")}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ── */}
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

        {/* ── Featured Subjects ── */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-3">
            Featured Subjects
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {subjects.slice(0, 4).map((subject) => (
              <SubjectCard
                key={subject.id}
                title={subject.title}
                lessons={subject.lessonsCount}
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

        {/* ── Recent Uploads ── */}
        <View className="px-5 mt-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-gray-900">
              My Recent Uploads
            </Text>
            <TouchableOpacity onPress={handleUploadFile}>
              <Text className="text-purple-600 font-medium text-sm">
                + Upload More
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl px-4 shadow-sm">
            <UploadItem
              icon={<FileIcon />}
              title="History Notes Ch.4"
              meta="PDF • Uploaded 2h ago"
            />
            <UploadItem
              icon={<ImageIcon />}
              title="Algebra Formulas"
              meta="Image • Uploaded 1d ago"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
