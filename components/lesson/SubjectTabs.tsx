import { BookOpen, PenLine, Video } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type TabType = 'Lessons' | 'Videos' | 'Quizzes';

interface SubjectTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  color?: string;
}

const ACTIVE_COLOR = (color?: string) => color || '#7C3AED';

export default function SubjectTabs({ activeTab, onChangeTab, color }: SubjectTabsProps) {
  const activeCol = ACTIVE_COLOR(color);

  const tabs: { type: TabType; icon: (active: boolean) => React.ReactNode }[] = [
    { type: 'Lessons', icon: (a) => <BookOpen size={16} color={a ? activeCol : '#9CA3AF'} /> },
    { type: 'Videos', icon: (a) => <Video size={16} color={a ? activeCol : '#9CA3AF'} /> },
    { type: 'Quizzes', icon: (a) => <PenLine size={16} color={a ? activeCol : '#9CA3AF'} /> },
  ];

  return (
    <View className="flex-row justify-between bg-white border-b border-gray-100 shadow-sm">
      {tabs.map((tab) => {
        const active = activeTab === tab.type;
        return (
          <TouchableOpacity
            key={tab.type}
            onPress={() => onChangeTab(tab.type)}
            className="flex-1 items-center pb-3 pt-4 px-2 relative"
            activeOpacity={0.75}
          >
            <View className="flex-row items-center gap-1.5">
              {tab.icon(active)}
              <Text
                className="font-bold text-sm"
                style={{ color: active ? activeCol : '#9CA3AF' }}
              >
                {tab.type}
              </Text>
            </View>
            {active && (
              <View
                className="absolute bottom-0 left-4 right-4 h-[3px] rounded-t-full"
                style={{ backgroundColor: activeCol }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}