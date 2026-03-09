import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';
import { Quiz } from '@/services/api';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface QuizzesViewProps {
  quizzes: Quiz[];
  color: string;
}

export default function QuizzesView({ quizzes, color }: QuizzesViewProps) {
  return (
    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text className="text-gray-900 font-bold text-lg mb-4">Available Quizzes</Text>

      {quizzes.length === 0 ? (
        <Text className="text-gray-400 font-medium text-center mt-6">No quizzes available for this subject.</Text>
      ) : (
        quizzes.map((quiz, index) => (
          <Animated.View key={quiz.id} entering={FadeInUp.delay(index * 100).springify()}>
            <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-start justify-between mb-3">
                 <Text className="text-gray-900 font-black text-lg flex-1 pr-4 tracking-tight">{quiz.title}</Text>
                 <View className="bg-blue-50 rounded-lg px-2 py-1" style={{ backgroundColor: `${color}15` }}>
                   <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: color }}>EduConnect</Text>
                 </View>
              </View>
              <View className="flex-row items-center mb-5">
                  <Text className="text-gray-500 text-xs font-medium">
                    {quiz.questions.length} Qs • {quiz.timeLimitMins ? `${quiz.timeLimitMins}m` : 'No limit'} • 
                  </Text>
                  <View 
                    className="w-1.5 h-1.5 rounded-full mx-1.5" 
                    style={{ 
                      backgroundColor: quiz.difficulty === 'Easy' ? '#10B981' : quiz.difficulty === 'Medium' ? '#F59E0B' : '#EF4444' 
                    }} 
                  />
                  <Text 
                    className="text-xs font-bold"
                    style={{ 
                      color: quiz.difficulty === 'Easy' ? '#10B981' : quiz.difficulty === 'Medium' ? '#F59E0B' : '#EF4444' 
                    }}
                  >
                    {quiz.difficulty}
                  </Text>
              </View>
              
              <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-100">
                 <Text className="text-gray-400 text-xs font-medium">Not attempted</Text>
                 
                 <TouchableOpacity 
                   className="rounded-full px-6 py-2.5 shadow-sm"
                   style={{ backgroundColor: color }}
                   onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: quiz.id } })}
                 >
                    <Text className="text-white font-black text-xs uppercase tracking-wide">Start Quiz</Text>
                 </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        ))
      )}

    </ScrollView>
  );
}
