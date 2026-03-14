import { useAuth } from "@/hooks/useAuth";
import { Subject as APISubject, fetchSubjects } from "@/services/api";
import { LocalPDFStorage } from "@/services/localPDFStorage";
import { router, useLocalSearchParams } from "expo-router";
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

const ProgressBadge = ({ percent }: { percent: number }) => (
  <View className="bg-white/20 rounded-full px-2.5 py-1">
    <Text className="text-white font-bold text-[10px] uppercase tracking-wider">
      {percent}% Done
    </Text>
  </View>
);

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
      onPress={() => router.push(`/lesson/${subject.id}`)}
    >
      <View className="flex-row justify-between items-start">
        <View className="w-12 h-12 rounded-full bg-white/25 items-center justify-center shadow-sm">
          {getIcon(subject.iconName, 24, "#ffffff")}
        </View>
        <ProgressBadge percent={subject.progress} />
      </View>
      <View className="mt-8">
        <Text className="text-white font-black text-xl mb-1">
          {subject.title}
        </Text>
        <Text className="text-white/90 text-xs font-medium">
          {subject.lessonsCount} lessons • {subject.videosCount} vids •{" "}
          {subject.quizzesCount} qs
        </Text>
      </View>
    </TouchableOpacity>
  </Animated.View>
);

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

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<APISubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [uploading, setUploading] = useState(false);

  // Get subjectId from URL parameters
  const { subjectId } = useLocalSearchParams<{ subjectId?: string }>();

  const loadSubjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSubjects();

      if (user) {
        const localPdfs = await LocalPDFStorage.getAllPDFs(user._id);
        const localSubjectsMap = new Map<string, APISubject>();

        localPdfs.forEach((pdf) => {
          if (!pdf.subject) return;
          const subjectKey = pdf.subject;

          if (!localSubjectsMap.has(subjectKey)) {
            localSubjectsMap.set(subjectKey, {
              id: subjectKey.toLowerCase(),
              title: subjectKey,
              iconName: "Folder",
              color: "#4B5563",
              progress: 0,
              lessonsCount: 0,
              videosCount: 0,
              quizzesCount: 0,
            });
          }
          const subj = localSubjectsMap.get(subjectKey)!;
          subj.lessonsCount += 1;
        });

        const apiSubjectTitles = new Set(
          data.map((s) => s.title.toLowerCase()),
        );

        for (const [title, localSubj] of localSubjectsMap.entries()) {
          if (!apiSubjectTitles.has(title.toLowerCase())) {
            data.push(localSubj);
            apiSubjectTitles.add(title.toLowerCase());
          } else {
            const existing = data.find(
              (s) => s.title.toLowerCase() === title.toLowerCase(),
            );
            if (existing) {
              existing.lessonsCount += localSubj.lessonsCount;
            }
          }
        }
      }

      setSubjects(data);
    } catch (e) {
      console.error(e);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // If subjectId is provided, filter subjects to show only that specific one
  useEffect(() => {
    if (subjectId && subjects.length > 0) {
      const targetSubject = subjects.find((s) => s.id === subjectId);
      if (targetSubject) {
        // Filter to show only the specific subject
        setSubjects([targetSubject]);
      }
    }
  }, [subjectId, subjects]);

  // ✅ FIXED: uses LocalPDFStorage (local, per-user) — NOT Cloudinary
  const handleAddMaterial = async () => {
    if (!user) {
      Alert.alert("Error", "Please login to upload materials");
      return;
    }

    try {
      setUploading(true);
      const result = await LocalPDFStorage.uploadPDF(user._id);
      if (result) {
        Alert.alert(
          "✅ Uploaded!",
          `"${result.name}" saved to ${result.subject}`,
          [
            {
              text: "View Materials",
              onPress: () => router.push("/(tabs)/materials"),
            },
            { text: "OK" },
          ],
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload material. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const filtered = subjects.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    let matchesCategory = true;
    if (activeFilter !== "All") {
      if (activeFilter === "Science")
        matchesCategory = ["Science", "Physics", "Biology"].includes(s.title);
      if (activeFilter === "Math")
        matchesCategory = ["Mathematics", "Algebra"].includes(s.title);
      if (activeFilter === "Language")
        matchesCategory = ["English", "History"].includes(s.title);
    }
    return matchesSearch && matchesCategory;
  });

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
        <Animated.View entering={FadeInUp.delay(50)}>
          <Text className="text-4xl font-black text-gray-900 mb-6 tracking-tight">
            Subjects
          </Text>
        </Animated.View>

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
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Plus size={22} color="#fff" />
          )}
          <Text className="text-white font-black text-sm ml-2 tracking-wide uppercase">
            {uploading ? "Saving..." : "Add Material"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
