import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { BookOpen, Sparkles } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  return (
    <LinearGradient
      colors={["#8B5CF6", "#06B6D4"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Content Container */}
        <View className="flex-1 justify-between items-center px-8 py-12">
          {/* Top Section - Logo and Title */}
          <View className="items-center mt-20">
            {/* Logo Circle */}
            <View className="w-32 h-32 bg-white rounded-full items-center justify-center mb-8 shadow-2xl">
              <View className="relative">
                <BookOpen size={48} color="#8B5CF6" />
                <Sparkles
                  size={20}
                  color="#F97316"
                  className="absolute -top-2 -right-2"
                />
              </View>
            </View>

            {/* App Name */}
            <Text className="text-4xl font-bold text-white mb-3 tracking-wide">
              EduConnect
            </Text>

            {/* Tagline */}
            <Text className="text-white/80 text-lg text-center">
              Learn Smarter, Together
            </Text>
          </View>

          {/* Bottom Section - Get Started Button */}
          <View className="w-full items-center mb-8">
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity
                className="bg-white w-full py-4 rounded-full items-center shadow-lg active:scale-95 transition-transform"
                style={{ elevation: 8 }}
              >
                <Text className="text-purple-600 font-bold text-lg">
                  Get Started
                </Text>
              </TouchableOpacity>
            </Link>

            {/* Loading Indicator */}
            <ActivityIndicator size="small" color="#F97316" className="mt-6" />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Welcome;
