import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  <View className="bg-white rounded-2xl p-4 mr-3 shadow-sm" style={{ width: width * 0.38 }}>
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
    style={{ backgroundColor: bgColor, width: (width - 48) / 2, height: 120, marginBottom: 12 }}
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
const Tab = ({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) => (
  <TouchableOpacity className="flex-1 items-center py-2">
    <Text
      className={`text-sm font-medium ${active ? "text-purple-600" : "text-gray-400"}`}
    >
      {label}
    </Text>
    {active && (
      <View className="mt-1 w-1 h-1 rounded-full bg-purple-600" />
    )}
  </TouchableOpacity>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeDashboard() {
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
              Hello, Sarah 👋
            </Text>
            <View className="flex-row items-center mt-2 bg-orange-50 self-start px-3 py-1 rounded-full border border-orange-200">
              <Text className="text-base">🔥</Text>
              <Text className="text-orange-500 font-semibold text-sm ml-1">
                7 day streak
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <View className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden border-2 border-purple-200">
              {/* Replace with actual Image source */}
              <View className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 items-center justify-center">
                <Text className="text-white font-bold text-lg">S</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Progress Banner ── */}
        <View className="mx-5 mt-3">
          <View
            className="rounded-2xl p-5 flex-row items-center justify-between"
            style={{ backgroundColor: "#7C3AED" }}
          >
            <View>
              <Text className="text-white font-bold text-lg">
                Great progress!
              </Text>
              <Text className="text-purple-200 text-sm mt-0.5">
                3 lessons completed this week
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
              <Text className="text-white text-2xl">↗</Text>
            </View>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        >
          <StatCard icon={<ClockIcon />} value="2h 15m" label="Learning Time" />
          <StatCard icon={<BadgeIcon />} value="12" label="Quizzes Done" />
          <StatCard icon={<VideoIcon />} value="8" label="Videos Watched" />
        </ScrollView>

        {/* ── Continue Learning ── */}
        <View className="px-5">
          <Text className="text-xl font-bold text-gray-900 mb-3">
            Continue Learning
          </Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            {/* Tag */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                <Text className="text-purple-600 text-sm">⊞</Text>
                <Text className="text-purple-700 font-medium text-sm ml-1">
                  Mathematics
                </Text>
              </View>
              <TouchableOpacity>
                <Text className="text-gray-400 text-lg tracking-widest">···</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-gray-900 font-bold text-lg mt-3">
              Introduction to Algebra
            </Text>

            {/* Progress bar */}
            <View className="mt-3 mb-1">
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: "64%", backgroundColor: "#7C3AED" }}
                />
              </View>
            </View>
            <Text className="text-right text-gray-500 text-xs mb-4">64%</Text>

            <TouchableOpacity
              className="rounded-xl py-4 items-center flex-row justify-center"
              style={{ backgroundColor: "#7C3AED" }}
              activeOpacity={0.85}
            >
              <Text className="text-white font-semibold text-base">
                Continue Lesson
              </Text>
              <Text className="text-white ml-2 text-base">→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Featured Subjects ── */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-3">
            Featured Subjects
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <SubjectCard
              title="Mathematics"
              lessons={24}
              icon={<GridIcon />}
              bgColor="#7C3AED"
            />
            <SubjectCard
              title="Science"
              lessons={18}
              icon={<AtomIcon />}
              bgColor="#3B82F6"
            />
            <SubjectCard
              title="English"
              lessons={32}
              icon={<BookIcon />}
              bgColor="#F97316"
            />
            <SubjectCard
              title="History"
              lessons={14}
              icon={<ColumnIcon />}
              bgColor="#92400E"
            />
          </View>
        </View>

        {/* ── Recent Uploads ── */}
        <View className="px-5 mt-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-gray-900">
              My Recent Uploads
            </Text>
            <TouchableOpacity>
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