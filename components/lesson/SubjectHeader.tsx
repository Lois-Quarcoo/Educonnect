import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, MoreVertical, Calculator } from 'lucide-react-native';
import { router } from 'expo-router';

interface SubjectHeaderProps {
  title: string;
  progress: number;
}

export default function SubjectHeader({ title, progress }: SubjectHeaderProps) {
  return (
    <View className="bg-[#6B4EFF] pt-14 pb-6 px-6 rounded-b-[32px] shadow-lg">
      {/* Top Header */}
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
        >
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
          <MoreVertical size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View className="flex-row items-center mb-6">
        <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4">
          <Calculator size={28} color="white" />
        </View>
        <Text className="text-white text-3xl font-bold font-grift">{title}</Text>
      </View>

      {/* Progress Section */}
      <View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white/80 font-medium text-sm">Course Progress</Text>
          <Text className="text-white font-bold">{progress}% Complete</Text>
        </View>
        <View className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
          <View
            className="h-2 bg-[#00D09E] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>
    </View>
  );
}
