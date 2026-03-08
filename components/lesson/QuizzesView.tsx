import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';

export default function QuizzesView() {
  return (
    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* In Progress / Retake */}
      <Text className="text-gray-900 font-bold text-lg mb-4">In Progress / Retake</Text>
      
      {/* Quiz 1 */}
      <View className="bg-white rounded-2xl p-4 mb-8 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-2">
           <Text className="text-gray-900 font-bold text-base flex-1 pr-4">Algebra Fundamentals</Text>
           <View className="bg-blue-50 rounded-lg px-2 py-1">
             <Text className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">EduConnect</Text>
           </View>
        </View>
        <Text className="text-gray-500 text-xs mb-4">15 Qs • 20m • Medium</Text>
        
        <View className="flex-row items-center object-bottom justify-between mt-2 pt-4 border-t border-gray-100">
           <View>
              <Text className="text-[#F59E0B] font-bold text-sm">Best: 75%</Text>
              <Text className="text-gray-400 text-xs">2 attempts</Text>
           </View>
           
           <TouchableOpacity className="border border-gray-200 rounded-full px-4 py-2 flex-row items-center justify-center">
              <RefreshCw size={14} color="#6B7280" className="mr-2" />
              <Text className="text-gray-600 font-bold text-xs">Retake</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* Available Quizzes */}
      <Text className="text-gray-900 font-bold text-lg mb-4">Available Quizzes</Text>

      {/* Quiz 2 */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-2">
           <Text className="text-gray-900 font-bold text-base flex-1 pr-4">Solving Linear Equations</Text>
           <View className="bg-blue-50 rounded-lg px-2 py-1">
             <Text className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">EduConnect</Text>
           </View>
        </View>
        <View className="flex-row items-center mb-4">
            <Text className="text-gray-500 text-xs">10 Qs • No limit • </Text>
            <View className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1" />
            <Text className="text-[#10B981] text-xs font-semibold">Easy</Text>
        </View>
        
        <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-100">
           <Text className="text-gray-400 text-xs font-medium">Not attempted</Text>
           
           <TouchableOpacity 
             className="bg-[#6B4EFF] rounded-full px-5 py-2"
             onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: 'SolvingLinearEquations' } })}
           >
              <Text className="text-white font-bold text-xs">Start Quiz</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* Quiz 3 */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-2">
           <Text className="text-gray-900 font-bold text-base flex-1 pr-4">Midterm Practice Test</Text>
           <View className="bg-green-50 rounded-lg px-2 py-1">
             <Text className="text-[#00D09E] text-[10px] font-bold uppercase tracking-wider">Your Upload</Text>
           </View>
        </View>
        <View className="flex-row items-center mb-4">
            <Text className="text-gray-500 text-xs">25 Qs • 45m • </Text>
            <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
            <Text className="text-red-500 text-xs font-semibold">Hard</Text>
        </View>
        
        <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-100">
           <View>
              <Text className="text-[#10B981] font-bold text-sm">Best: 92%</Text>
              <Text className="text-gray-400 text-xs">1 attempt</Text>
           </View>
           
           <TouchableOpacity className="border border-gray-200 rounded-full px-4 py-2 flex-row items-center justify-center">
              <RefreshCw size={14} color="#6B7280" className="mr-2" />
              <Text className="text-gray-600 font-bold text-xs">Retake</Text>
           </TouchableOpacity>
        </View>
      </View>
      
      {/* Quiz 4 */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-2">
           <Text className="text-gray-900 font-bold text-base flex-1 pr-4">Graphing Functions Quiz</Text>
           <View className="bg-blue-50 rounded-lg px-2 py-1">
             <Text className="text-blue-500 text-[10px] font-bold uppercase tracking-wider">EduConnect</Text>
           </View>
        </View>
        <View className="flex-row items-center mb-4">
            <Text className="text-gray-500 text-xs">12 Qs • 15m • </Text>
            <View className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1" />
            <Text className="text-[#10B981] text-xs font-semibold">Easy</Text>
        </View>
        
        <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-100">
           <Text className="text-gray-400 text-xs font-medium">Not attempted</Text>
           
           <TouchableOpacity 
             className="bg-[#6B4EFF] rounded-full px-5 py-2"
             onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: 'GraphingFunctions' } })}
           >
              <Text className="text-white font-bold text-xs">Start Quiz</Text>
           </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}
