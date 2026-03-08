import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, Video, PenLine } from 'lucide-react-native';

export type TabType = 'Lessons' | 'Videos' | 'Quizzes';

interface SubjectTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function SubjectTabs({ activeTab, onChangeTab }: SubjectTabsProps) {
  const tabs: { type: TabType; icon: React.ReactNode }[] = [
    {
      type: 'Lessons',
      icon: <BookOpen size={18} color={activeTab === 'Lessons' ? '#6B4EFF' : '#9CA3AF'} />,
    },
    {
      type: 'Videos',
      icon: <Video size={18} color={activeTab === 'Videos' ? '#6B4EFF' : '#9CA3AF'} />,
    },
    {
      type: 'Quizzes',
      icon: <PenLine size={18} color={activeTab === 'Quizzes' ? '#6B4EFF' : '#9CA3AF'} />,
    },
  ];

  return (
    <View className="flex-row justify-between px-6 pt-6 pb-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.type}
          onPress={() => onChangeTab(tab.type)}
          className="items-center pb-3 px-2 relative"
        >
          <View className="flex-row items-center gap-2">
            {tab.icon}
            <Text
              className={`font-semibold text-base ${
                activeTab === tab.type ? 'text-[#6B4EFF]' : 'text-gray-400'
              }`}
            >
              {tab.type}
            </Text>
          </View>
          {activeTab === tab.type && (
            <View className="absolute bottom-[-10px] left-0 right-0 h-[3px] bg-[#6B4EFF] rounded-t-full" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
