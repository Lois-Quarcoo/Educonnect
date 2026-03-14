import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Linking, Alert,
} from "react-native";
import { Play, Clock, ExternalLink } from "lucide-react-native";
import { VideoLesson } from "@/services/api";
import Animated, { FadeInUp } from "react-native-reanimated";

interface VideosViewProps {
  videos: VideoLesson[];
  color: string;
}

const openVideo = async (video: VideoLesson) => {
  // Build a YouTube search URL for the lesson title
  const query = encodeURIComponent(`${video.title} lesson explained`);
  const youtubeApp = `youtube://results?search_query=${query}`;
  const youtubeBrowser = `https://www.youtube.com/results?search_query=${query}`;

  try {
    const canOpen = await Linking.canOpenURL(youtubeApp);
    if (canOpen) {
      await Linking.openURL(youtubeApp);
    } else {
      await Linking.openURL(youtubeBrowser);
    }
  } catch {
    Alert.alert("Could not open video", "Please check your internet connection.");
  }
};

export default function VideosView({ videos, color }: VideosViewProps) {
  const filters = ["All", "Short (<15m)", "Long (15m+)"];
  const [activeFilter, setActiveFilter] = React.useState("All");

  const filtered = videos.filter((v) => {
    if (activeFilter === "All") return true;
    const [mins] = v.duration.split(":").map(Number);
    if (activeFilter === "Short (<15m)") return mins < 15;
    return mins >= 15;
  });

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Filter pills */}
      <View className="flex-row px-5 mt-4 mb-5 gap-2">
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full border ${
              activeFilter === filter ? "" : "bg-white border-gray-200"
            }`}
            style={
              activeFilter === filter
                ? { backgroundColor: color + "20", borderColor: color }
                : {}
            }
          >
            <Text
              className={`text-sm font-semibold ${activeFilter === filter ? "" : "text-gray-500"}`}
              style={activeFilter === filter ? { color } : {}}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-5">
        {filtered.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: color + "15" }}
            >
              <Play size={28} color={color} />
            </View>
            <Text className="text-gray-500 font-semibold text-base text-center">
              No videos match this filter
            </Text>
          </View>
        ) : (
          filtered.map((video, index) => (
            <Animated.View
              key={video.id}
              entering={FadeInUp.delay(index * 80).springify().damping(14)}
            >
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => openVideo(video)}
                className="bg-white rounded-2xl mb-5 shadow-sm overflow-hidden border border-gray-100"
              >
                {/* Thumbnail */}
                <View
                  className="h-44 w-full relative justify-center items-center"
                  style={{ backgroundColor: color }}
                >
                  <View className="absolute inset-0 bg-black/20" />
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center border-2 border-white/60"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Play fill="white" color="white" size={22} style={{ marginLeft: 3 }} />
                  </View>

                  {/* Duration badge */}
                  <View className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 rounded-lg">
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                      <Clock size={11} color="white" />
                      <Text className="text-white text-xs font-bold">{video.duration}</Text>
                    </View>
                  </View>

                  {/* Lesson number */}
                  <View
                    className="absolute top-3 left-3 px-2 py-1 rounded-lg"
                    style={{ backgroundColor: color + "cc" }}
                  >
                    <Text className="text-white text-xs font-black uppercase tracking-wider">
                      Lesson {index + 1}
                    </Text>
                  </View>

                  {/* YouTube badge */}
                  <View className="absolute top-3 right-3 bg-red-600 px-2 py-1 rounded-lg">
                    <Text className="text-white text-xs font-black">▶ YouTube</Text>
                  </View>
                </View>

                {/* Info */}
                <View className="p-4">
                  <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={2}>
                    {video.title}
                  </Text>
                  {video.description && (
                    <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
                      {video.description}
                    </Text>
                  )}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <View
                        className="px-2 py-1 rounded-lg"
                        style={{ backgroundColor: color + "15" }}
                      >
                        <Text className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                          EduConnect
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-xs">• HD Quality</Text>
                    </View>
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                      <ExternalLink size={14} color="#9CA3AF" />
                      <Text className="text-gray-400 text-xs">Opens YouTube</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </View>
    </ScrollView>
  );
}