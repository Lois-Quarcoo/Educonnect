import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import {
    BarChart2,
    Bell,
    Camera,
    ChevronRight,
    Clock,
    Download,
    Flame,
    FolderOpen,
    HelpCircle,
    LogOut,
    Pencil,
    Settings,
} from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Stat Card ─────────────────────────────────────────────────────────────────
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
    className="bg-white rounded-2xl items-center justify-center py-5 shadow-sm"
    style={{ width: "30%" }}
  >
    {icon}
    <Text className="text-gray-900 font-bold text-lg mt-2">{value}</Text>
    <Text className="text-gray-400 text-xs mt-0.5 text-center">{label}</Text>
  </View>
);

// ── Menu Row ──────────────────────────────────────────────────────────────────
const MenuRow = ({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  titleColor = "text-gray-900",
  isLast = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  titleColor?: string;
  isLast?: boolean;
}) => (
  <>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4"
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`font-semibold text-sm ${titleColor}`}>{title}</Text>
        {subtitle && (
          <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>
        )}
      </View>
      <ChevronRight size={16} color="#D1D5DB" />
    </TouchableOpacity>
    {!isLast && <View className="h-[1px] bg-gray-100 mx-4" />}
  </>
);

// ── Screen ────────────────────────────────────────────────────────────────────
const Profile = () => {
  const { user } = useAuth();
  const logout = () => router.replace("/(auth)/login");

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-gray-500">Loading user data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Top Profile Section ── */}
        <View className="bg-white px-5 pt-6 pb-8 items-center">
          {/* Avatar */}
          <View className="relative mb-4">
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-24 h-24 rounded-full"
                style={{ borderWidth: 3, borderColor: "#E5E7EB" }}
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center">
                <Text className="text-gray-500 text-lg">No Avatar</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-purple-600 rounded-full w-7 h-7 items-center justify-center border-2 border-white">
              <Camera size={13} color="white" />
            </View>
          </View>

          {/* Name */}
          <View className="flex-row items-center">
            <Text className="font-bold text-2xl text-gray-900 mr-1">
              {user.name}
            </Text>
            <TouchableOpacity hitSlop={8}>
              <Pencil size={15} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          {/* Joined */}
          <Text className="text-gray-400 text-sm mt-1">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* ── Stats Row ── */}
        <View className="bg-white mt-3 px-5 py-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            <StatCard
              icon={<Clock size={20} color="#7C3AED" />}
              value={`${Math.floor(user.totalLearningTime / 60)}h ${user.totalLearningTime % 60}m`}
              label="Learning Time"
            />
            <StatCard
              icon={<Flame size={20} color="#F97316" />}
              value={`${user.streak} days 🔥`}
              label="Streak"
            />
            <StatCard
              icon={
                <View className="w-5 h-5 bg-blue-100 rounded items-center justify-center">
                  <Text className="text-blue-600 text-xs font-bold">
                    {user.quizzesCompleted}
                  </Text>
                </View>
              }
              value={`${user.quizzesCompleted} completed`}
              label="Quizzes"
            />
          </ScrollView>
        </View>

        {/* ── Learning Section ── */}
        <View className="bg-white rounded-2xl mx-4 mt-4 overflow-hidden shadow-sm">
          <MenuRow
            icon={<BarChart2 size={17} color="#7C3AED" />}
            iconBg="#EDE9FE"
            title="Learning Progress"
            subtitle="View detailed analytics"
          />
          <MenuRow
            icon={<FolderOpen size={17} color="#F59E0B" />}
            iconBg="#FEF3C7"
            title="My Uploads"
            subtitle="Browse uploaded materials"
            isLast
          />
        </View>

        {/* ── Settings Section ── */}
        <View className="bg-white rounded-2xl mx-4 mt-4 overflow-hidden shadow-sm">
          <MenuRow
            icon={<Bell size={17} color="#F59E0B" />}
            iconBg="#FEF9C3"
            title="Notifications"
            subtitle="Reminders, alerts & deadlines"
          />
          <MenuRow
            icon={<Download size={17} color="#10B981" />}
            iconBg="#D1FAE5"
            title="Offline Content"
            subtitle="Downloaded materials & cache"
          />
          <MenuRow
            icon={<Settings size={17} color="#6B7280" />}
            iconBg="#F3F4F6"
            title="Preferences"
            subtitle="Language, theme & data saver"
            isLast
          />
        </View>

        {/* ── Support Section ── */}
        <View className="bg-white rounded-2xl mx-4 mt-4 overflow-hidden shadow-sm">
          <MenuRow
            icon={<HelpCircle size={17} color="#3B82F6" />}
            iconBg="#DBEAFE"
            title="Help & Support"
            subtitle="FAQs, contact & tutorials"
          />
          <MenuRow
            icon={<LogOut size={17} color="#EF4444" />}
            iconBg="#FEE2E2"
            title="Log Out"
            titleColor="text-red-500"
            onPress={logout}
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
