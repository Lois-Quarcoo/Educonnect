import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Play, CheckCircle2, DownloadCloud } from 'lucide-react-native';

export default function VideosView() {
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
                ? 'bg-purple-50 border-purple-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter ? 'text-[#6B4EFF]' : 'text-gray-500'
              }`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-6">
        {/* Video 1 */}
        <TouchableOpacity className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden border border-gray-100">
          <View className="h-40 w-full bg-slate-800 relative justify-center items-center">
             {/* Thumbnail placeholder */}
             <View className="absolute inset-0 bg-emerald-900 opacity-60" />
             <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/20">
               <Play fill="white" color="white" size={20} className="ml-1" />
             </View>
             <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                <Text className="text-white text-xs font-medium">08:45</Text>
             </View>
          </View>
          <View className="p-4">
             <View className="flex-row items-center justify-between mb-2">
                 <Text className="text-gray-900 font-bold text-base flex-1">Introduction to Algebra</Text>
                 <CheckCircle2 size={20} color="#10B981" />
             </View>
             <View className="flex-row items-center">
                 <View className="bg-blue-50 rounded-lg px-2 py-1 mr-2">
                   <Text className="text-blue-500 text-xs font-medium">EduConnect</Text>
                 </View>
                 <Text className="text-gray-500 text-xs">● 1.2k views</Text>
             </View>
          </View>
        </TouchableOpacity>

        {/* Video 2 */}
         <TouchableOpacity className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden border border-gray-100">
          <View className="h-40 w-full bg-slate-800 relative justify-center items-center">
             <View className="absolute inset-0 bg-blue-900 opacity-60" />
             <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/20">
               <Play fill="white" color="white" size={20} className="ml-1" />
             </View>
             <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                <Text className="text-white text-xs font-medium">12:30</Text>
             </View>
          </View>
          <View className="p-4">
             <View className="flex-row items-center justify-between mb-2">
                 <Text className="text-gray-900 font-bold text-base flex-1">Solving Linear Equations - Part 1</Text>
                 <CheckCircle2 size={20} color="#10B981" />
             </View>
             <View className="flex-row items-center">
                 <View className="bg-blue-50 rounded-lg px-2 py-1 mr-2">
                   <Text className="text-blue-500 text-xs font-medium">EduConnect</Text>
                 </View>
                 <Text className="text-gray-500 text-xs">● 850 views</Text>
             </View>
          </View>
        </TouchableOpacity>

        {/* Video 3 */}
        <TouchableOpacity className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden border border-gray-100">
          <View className="h-40 w-full bg-slate-800 relative justify-center items-center">
             <View className="absolute inset-0 bg-amber-900 opacity-60" />
             <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/20">
               <Play fill="white" color="white" size={20} className="ml-1" />
             </View>
             <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                <Text className="text-white text-xs font-medium">05:15</Text>
             </View>
          </View>
          <View className="p-4">
             <View className="flex-row items-center justify-between mb-2">
                 <Text className="text-gray-900 font-bold text-base flex-1">Midterm Study Guide Review</Text>
                 <DownloadCloud size={20} color="#9CA3AF" />
             </View>
             <View className="flex-row items-center">
                 <View className="bg-green-50 rounded-lg px-2 py-1 mr-2">
                   <Text className="text-[#00D09E] text-xs font-medium">Your Upload</Text>
                 </View>
                 <Text className="text-gray-500 text-xs">● 15 views</Text>
             </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
