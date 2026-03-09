import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Play, CheckCircle2, DownloadCloud } from 'lucide-react-native';
import { VideoLesson } from '@/services/api';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router, Href } from 'expo-router';

interface VideosViewProps {
  videos: VideoLesson[];
  color: string;
}

export default function VideosView({ videos, color }: VideosViewProps) {
  const filters = ['All', 'Downloaded', 'Not Downloaded'];
  const [activeFilter, setActiveFilter] = React.useState('All');

  return (
    <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Filters */}
      <View className="flex-row px-6 mb-6">
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`mr-2 px-4 py-1.5 rounded-full border ${
              activeFilter === filter
                ? 'bg-purple-50'
                : 'bg-white border-gray-200'
            }`}
             style={activeFilter === filter ? { borderColor: color } : {}}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter ? '' : 'text-gray-500'
              }`}
              style={activeFilter === filter ? { color: color } : {}}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-6">
        {videos.length === 0 ? (
           <Text className="text-gray-400 font-medium text-center mt-6">No videos available yet.</Text>
        ) : (
          videos.map((video, index) => (
             <Animated.View key={video.id} entering={FadeInUp.delay(index * 100).springify()}>
               <TouchableOpacity 
                 onPress={() => router.push(`/video/${video.id}` as Href)}
                 activeOpacity={0.88}
                 className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden border border-gray-100"
                >
                  <View className="h-40 w-full relative justify-center items-center" style={{ backgroundColor: color }}>
                     {/* Thumbnail placeholder mapping (in a real app, use Image component with video.thumbnailUrl) */}
                     <View className="absolute inset-0 bg-black opacity-30" />
                     <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/40">
                       <Play fill="white" color="white" size={20} className="ml-1" />
                     </View>
                     <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                        <Text className="text-white text-xs font-medium">{video.duration}</Text>
                     </View>
                  </View>
                  <View className="p-4">
                     <View className="flex-row items-center justify-between mb-2">
                         <Text className="text-gray-900 font-bold text-base flex-1 pr-4">{video.title}</Text>
                         <CheckCircle2 size={20} color="#10B981" />
                     </View>
                     <View className="flex-row items-center">
                         <View className="bg-gray-100 rounded-lg px-2 py-1 mr-2">
                           <Text className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">EduConnect</Text>
                         </View>
                         <Text className="text-gray-500 text-xs">● HD Lesson</Text>
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
