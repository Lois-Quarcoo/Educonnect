import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Play, CheckCircle2, Clock } from "lucide-react-native";
import { VideoLesson } from "@/services/api";
import Animated, { FadeInUp } from "react-native-reanimated";

interface VideosViewProps {
  videos: VideoLesson[];
  color: string;
}

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
      {/* Filters */}
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
              className={`text-sm font-semibold ${
                activeFilter === filter ? "" : "text-gray-500"
              }`}
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
              No videos available yet
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-1 px-8">
              Check back soon — new video lessons are added regularly.
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
                className="bg-white rounded-2xl mb-5 shadow-sm overflow-hidden border border-gray-100"
              >
                {/* Thumbnail area */}
                <View
                  className="h-44 w-full relative justify-center items-center"
                  style={{ backgroundColor: color }}
                >
                  {/* Dark overlay for readability */}
                  <View className="absolute inset-0 bg-black/20" />

                  {/* Play button */}
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center border-2 border-white/60"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Play
                      fill="white"
                      color="white"
                      size={22}
                      style={{ marginLeft: 3 }}
                    />
                  </View>

                  {/* Duration badge */}
                  <View className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 rounded-lg">
                    <View className="flex-row items-center gap-1">
                      <Clock size={11} color="white" />
                      <Text className="text-white text-xs font-bold">
                        {video.duration}
                      </Text>
                    </View>
                  </View>

                  {/* Video number badge */}
                  <View
                    className="absolute top-3 left-3 px-2 py-1 rounded-lg"
                    style={{ backgroundColor: color + "cc" }}
                  >
                    <Text className="text-white text-xs font-black uppercase tracking-wider">
                      Lesson {index + 1}
                    </Text>
                  </View>
                </View>

                {/* Info section */}
                <View className="p-4">
                  <Text
                    className="text-gray-900 font-bold text-base mb-1"
                    numberOfLines={2}
                  >
                    {video.title}
                  </Text>

                  {video.description && (
                    <Text
                      className="text-gray-500 text-sm mb-3"
                      numberOfLines={2}
                    >
                      {video.description}
                    </Text>
                  )}

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View
                        className="px-2 py-1 rounded-lg"
                        style={{ backgroundColor: color + "15" }}
                      >
                        <Text
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color }}
                        >
                          EduConnect
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-xs">
                        • HD Quality
                      </Text>
                    </View>
                    <CheckCircle2 size={18} color="#D1D5DB" />
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