import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { X, Clock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState<number | null>(1); // Index 1 selected by default for mockup

  const options = [
    { id: 0, text: 'x = 7' },
    { id: 1, text: 'x = 9' },
    { id: 2, text: 'x = 11' },
    { id: 3, text: 'x = 12' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold text-lg">Algebra Fundamentals</Text>
        <View className="bg-orange-50 px-3 py-1.5 rounded-full flex-row items-center">
          <Clock size={14} color="#F59E0B" className="mr-1" />
          <Text className="text-[#F59E0B] font-bold text-xs">14:22</Text>
        </View>
      </View>

      {/* Progress */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-500 font-medium text-sm">Question 3 of 15</Text>
          <Text className="text-[#10B981] font-bold text-sm">20%</Text>
        </View>
        <View className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <View className="h-1.5 bg-[#10B981] rounded-full" style={{ width: '20%' }} />
        </View>
      </View>

      {/* Question Card */}
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
         <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="bg-blue-50 self-start rounded-full px-3 py-1 mb-6">
              <Text className="text-blue-500 text-xs font-bold uppercase tracking-wide">Multiple Choice</Text>
            </View>
            
            <Text className="text-gray-900 font-bold text-2xl mb-6">
              Solve for x in the following equation:
            </Text>
            
            <Text className="text-gray-900 font-bold text-xl mb-8">
              3(x - 4) + 5 = 20
            </Text>

            {/* Options */}
            <View className="gap-4 mb-4">
              {options.map((option, index) => {
                const isSelected = selectedOption === index;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedOption(index)}
                    className={`flex-row items-center p-4 rounded-xl border-2 ${
                      isSelected ? 'border-[#6B4EFF] bg-purple-50/30' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                        isSelected ? 'border-[#6B4EFF]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <View className="w-3 h-3 rounded-full bg-[#6B4EFF]" />}
                    </View>
                    <Text
                      className={`text-base font-medium ${
                        isSelected ? 'text-[#6B4EFF]' : 'text-gray-700'
                      }`}
                    >
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
         </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="p-6 pb-8 border-t border-gray-100 flex-row items-center justify-between bg-white">
        <TouchableOpacity className="flex-row items-center justify-center py-4 px-6 rounded-full border border-gray-200 flex-1 mr-4">
          <ChevronLeft size={20} color="#6B7280" className="mr-2" />
          <Text className="text-gray-600 font-bold text-base">Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center justify-center py-4 px-6 rounded-full bg-[#6B4EFF] flex-1">
          <Text className="text-white font-bold text-base mr-2">Next</Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
