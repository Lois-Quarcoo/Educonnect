import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface FloatingAIButtonProps {
  subjectName: string;
  onPress: () => void;
}

export default function FloatingAIButton({ subjectName, onPress }: FloatingAIButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="absolute bottom-6 right-6 flex-row items-center bg-[#6B4EFF] py-3 px-5 rounded-full shadow-lg"
      style={styles.shadow}
    >
      <View className="bg-white/20 p-1 rounded-full mr-2">
        <Sparkles size={16} color="white" />
      </View>
      <Text className="text-white font-bold text-sm">Ask AI about {subjectName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#6B4EFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
