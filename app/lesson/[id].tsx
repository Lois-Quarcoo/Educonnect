import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import SubjectHeader from '@/components/lesson/SubjectHeader';
import SubjectTabs, { TabType } from '@/components/lesson/SubjectTabs';
import LessonsView from '@/components/lesson/LessonsView';
import VideosView from '@/components/lesson/VideosView';
import QuizzesView from '@/components/lesson/QuizzesView';
import FloatingAIButton from '@/components/FloatingAIButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchSubjectById, fetchQuizzesBySubject, fetchVideosBySubject, Subject as APISubject, Quiz as APIQuiz, VideoLesson as APIVideo } from '@/services/api';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams();
  const subjectId = (id as string) || 'math';
  
  const [subject, setSubject] = useState<APISubject | null>(null);
  const [quizzes, setQuizzes] = useState<APIQuiz[]>([]);
  const [videos, setVideos] = useState<APIVideo[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('Lessons');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subjectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subjData, quizData, vidData] = await Promise.all([
        fetchSubjectById(subjectId),
        fetchQuizzesBySubject(subjectId),
        fetchVideosBySubject(subjectId)
      ]);
      setSubject(subjData || null);
      setQuizzes(quizData);
      setVideos(vidData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center p-8">
           <ActivityIndicator size="large" color={subject?.color || "#6B4EFF"} />
        </View>
      );
    }
    
    if (!subject) return null;

    switch (activeTab) {
      case 'Lessons':
        // For lessons we can leave the mock view for now or adapt it. We focus on Quizzes/Videos.
        return <Animated.View entering={FadeIn.duration(300)} className="flex-1"><LessonsView subjectId={subject.id} /></Animated.View>;
      case 'Videos':
        return <Animated.View entering={FadeIn.duration(300)} className="flex-1"><VideosView videos={videos} color={subject.color} /></Animated.View>;
      case 'Quizzes':
        return <Animated.View entering={FadeIn.duration(300)} className="flex-1"><QuizzesView quizzes={quizzes} color={subject.color} /></Animated.View>;
      default:
        return <LessonsView subjectId={subject.id} />;
    }
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <SubjectHeader 
        title={subject?.title || 'Loading...'} 
        progress={subject?.progress || 0} 
        color={subject?.color || '#333'} 
      />
      
      <SubjectTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      
      <View className="flex-1 relative">
         {renderContent()}
         {subject && (
           <FloatingAIButton 
             subjectName={subject.title} 
             color={subject.color}
             onPress={() => console.log('Ask AI pressed')} 
           />
         )}
      </View>
    </View>
  );
}
