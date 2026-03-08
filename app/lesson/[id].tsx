import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SubjectHeader from '@/components/lesson/SubjectHeader';
import SubjectTabs, { TabType } from '@/components/lesson/SubjectTabs';
import LessonsView from '@/components/lesson/LessonsView';
import VideosView from '@/components/lesson/VideosView';
import QuizzesView from '@/components/lesson/QuizzesView';
import FloatingAIButton from '@/components/FloatingAIButton';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams();
  const title = (id as string) || 'Mathematics';
  const [activeTab, setActiveTab] = useState<TabType>('Lessons');

  const renderContent = () => {
    switch (activeTab) {
      case 'Lessons':
        return <LessonsView />;
      case 'Videos':
        return <VideosView />;
      case 'Quizzes':
        return <QuizzesView />;
      default:
        return <LessonsView />;
    }
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <SubjectHeader title={title} progress={64} />
      
      <SubjectTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      
      <View className="flex-1 relative">
         {renderContent()}
         <FloatingAIButton subjectName={title} onPress={() => console.log('Ask AI pressed')} />
      </View>
    </View>
  );
}
