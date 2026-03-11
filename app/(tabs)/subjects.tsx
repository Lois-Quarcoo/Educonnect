import { useAuth } from "@/hooks/useAuth";
import { Subject as APISubject, fetchSubjects } from "@/services/api";
import { uploadFile } from "@/services/universalUpload";
import { router } from "expo-router";
import {
    Atom,
    BookOpen,
    Calculator,
    Globe,
    Landmark,
    Plus,
    Search,
    Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// ── Icon Mapper ───────────────────────────────────────────────────────────────
const getIcon = (iconName: string, size: number, color: string) => {
  switch (iconName) {
    case "Calculator":
      return <Calculator size={size} color={color} />;
    case "Atom":
      return <Atom size={size} color={color} />;
    case "BookOpen":
      return <BookOpen size={size} color={color} />;
    case "Landmark":
      return <Landmark size={size} color={color} />;
    case "Globe":
      return <Globe size={size} color={color} />;
    case "Zap":
      return <Zap size={size} color={color} />;
    default:
      return <BookOpen size={size} color={color} />;
  }
};

// ── Progress Ring ─────────────────────────────────────────────────────────────
const ProgressBadge = ({ percent }: { percent: number }) => (
  <View className="bg-white/20 rounded-full px-2.5 py-1">
    <Text className="text-white font-bold text-[10px] uppercase tracking-wider">
      {percent}% Done
    </Text>
  </View>
);

// ── Subject Card ──────────────────────────────────────────────────────────────

const SubjectCard = ({
  subject,
  index,
}: {
  subject: APISubject;
  index: number;
}) => (
  <Animated.View
    entering={FadeInUp.delay(index * 100)
      .springify()
      .damping(14)}
  >
    <TouchableOpacity
      activeOpacity={0.88}
      style={{ width: CARD_WIDTH, backgroundColor: subject.color }}
      className="rounded-3xl p-4 mb-4 shadow-sm border border-black/5"
      onPress={() => router.push(`/lesson/${subject.id}`)} // Use ID for dynamic routing
    >
      {/* Icon row */}
      <View className="flex-row justify-between items-start">
        <View className="w-12 h-12 rounded-full bg-white/25 items-center justify-center shadow-sm">
          {getIcon(subject.iconName, 24, "#ffffff")}
        </View>
        <ProgressBadge percent={subject.progress} />
      </View>

      {/* Info */}
      <View className="mt-8">
        <Text className="text-white font-black text-xl mb-1">
          {subject.title}
        </Text>
        <View className="flex-row items-center flex-wrap">
          <Text className="text-white/90 text-xs font-medium">
            {subject.lessonsCount} lessons • {subject.videosCount} vids •{" "}
            {subject.quizzesCount} qs
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  </Animated.View>
);

// ── Filter Pill ───────────────────────────────────────────────────────────────
const FilterPill = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-5 py-2.5 rounded-full mr-3 border ${
      active
        ? "bg-[#1F2937] border-[#1F2937]"
        : "bg-white border-gray-200 shadow-sm"
    }`}
  >
    <Text
      className={`font-bold text-sm ${active ? "text-white" : "text-gray-600"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const FILTERS = ["All", "Science", "Math", "Language"];

// ── Screen ────────────────────────────────────────────────────────────────────
export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<APISubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (e) {
      console.error(e);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle material upload from subjects tab
  const handleAddMaterial = async () => {
    if (!user) {
      Alert.alert("Error", "Please login to upload materials");
      return;
    }

    try {
      const result = await uploadFile(
        user._id,
        "document",
        "subject-materials",
      );
      if (result) {
        Alert.alert("Success", `${result.name} uploaded successfully!`);
        // TODO: Refresh materials list or navigate to materials tab
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload material. Please try again.");
    }
  };

  const filtered = subjects.filter((s) => {
    // Very basic filter matching logic based on title for demonstration
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    let matchesCategory = true;
    if (activeFilter !== "All") {
      if (activeFilter === "Science")
        matchesCategory =
          s.title === "Science" ||
          s.title === "Physics" ||
          s.title === "Biology";
      if (activeFilter === "Math")
        matchesCategory = s.title === "Mathematics" || s.title === "Algebra";
      if (activeFilter === "Language")
        matchesCategory = s.title === "English" || s.title === "History";
    }
    return matchesSearch && matchesCategory;
  });

  // Pair subjects into rows of 2
  const rows: APISubject[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View entering={FadeInUp.delay(50)}>
          <Text className="text-4xl font-black text-gray-900 mb-6 tracking-tight">
            Subjects
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          entering={FadeInUp.delay(100)}
          className="flex-row items-center bg-white rounded-2xl px-5 py-4 mb-6 shadow-sm border border-gray-100"
        >
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="ml-3 flex-1 text-gray-800 text-base font-medium"
            placeholder="Search all subjects..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </Animated.View>

        {/* Filter Pills */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6 pb-2"
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {FILTERS.map((f) => (
              <FilterPill
                key={f}
                label={f}
                active={activeFilter === f}
                onPress={() => setActiveFilter(f)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Loading State or Subject Grid */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color="#6B4EFF" />
            <Text className="text-gray-400 font-medium mt-4">
              Loading subjects...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <Animated.View
            entering={FadeIn}
            className="items-center justify-center pt-10"
          >
            <Text className="text-gray-400 font-medium">
              No subjects found.
            </Text>
          </Animated.View>
        ) : (
          <View>
            {rows.map((row, i) => (
              <View key={i} className="flex-row justify-between mb-2">
                {row.map((subject, j) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    index={i * 2 + j}
                  />
                ))}
                {/* Fill empty slot if odd number */}
                {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Material FAB */}
      <Animated.View
        entering={FadeInUp.delay(400)}
        className="absolute bottom-6 right-5 shadow-2xl"
      >
        <TouchableOpacity
          className="flex-row items-center bg-[#6B4EFF] px-6 py-4 rounded-full shadow-lg"
          activeOpacity={0.85}
          onPress={handleAddMaterial}
        >
          <Plus size={22} color="#fff" />
          <Text className="text-white font-black text-sm ml-2 tracking-wide uppercase">
            Add Material
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
