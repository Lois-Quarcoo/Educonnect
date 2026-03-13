import FloatingAIButton from "@/components/FloatingAIButton";
import LessonsView from "@/components/lesson/LessonsView";
import QuizzesView from "@/components/lesson/QuizzesView";
import SubjectHeader from "@/components/lesson/SubjectHeader";
import SubjectTabs, { TabType } from "@/components/lesson/SubjectTabs";
import VideosView from "@/components/lesson/VideosView";
import { useAuth } from "@/hooks/useAuth";
import {
  Quiz as APIQuiz,
  Subject as APISubject,
  VideoLesson as APIVideo,
  fetchQuizzesBySubject,
  fetchSubjectById,
  fetchVideosBySubject,
} from "@/services/api";
import { LocalPDFStorage } from "@/services/localPDFStorage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function SubjectScreen() {
  const { id } = useLocalSearchParams();
  const subjectId = (id as string) || "math";
  const { user } = useAuth();

  const [subject, setSubject] = useState<APISubject | null>(null);
  const [quizzes, setQuizzes] = useState<APIQuiz[]>([]);
  const [videos, setVideos] = useState<APIVideo[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("Lessons");
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
        fetchVideosBySubject(subjectId),
      ]);

      let finalSubject = subjData || null;

      if (!finalSubject && user) {
        const localPdfs = await LocalPDFStorage.getAllPDFs(user._id);
        const localMatching = localPdfs.find(
          (p) => p.subject?.toLowerCase() === subjectId.toLowerCase(),
        );
        if (localMatching && localMatching.subject) {
          finalSubject = {
            id: subjectId,
            title: localMatching.subject,
            iconName: "Folder",
            color: "#4B5563",
            progress: 0,
            lessonsCount: localPdfs.filter(
              (p) => p.subject === localMatching.subject,
            ).length,
            videosCount: 0,
            quizzesCount: 0,
          };
        }
      }

      setSubject(finalSubject);
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
      case "Lessons":
        return (
          <Animated.View entering={FadeIn.duration(300)} className="flex-1">
            <LessonsView
              subjectId={subject.id}
              subjectTitle={subject.title}
            />
          </Animated.View>
        );

      case "Videos":
        return (
          <Animated.View entering={FadeIn.duration(300)} className="flex-1">
            <VideosView videos={videos} color={subject.color} />
          </Animated.View>
        );

      case "Quizzes":
        return (
          <Animated.View entering={FadeIn.duration(300)} className="flex-1">
            {/* ✅ Pass subjectId + subjectTitle so AI can generate subject-specific quizzes */}
            <QuizzesView
              quizzes={quizzes}
              color={subject.color}
              subjectId={subject.id}
              subjectTitle={subject.title}
            />
          </Animated.View>
        );

      default:
        return (
          <LessonsView subjectId={subject.id} subjectTitle={subject.title} />
        );
    }
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <SubjectHeader
        title={subject?.title || "Loading..."}
        progress={subject?.progress || 0}
        color={subject?.color || "#333"}
      />

      <SubjectTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <View className="flex-1 relative">
        {renderContent()}
        {subject && (
          <FloatingAIButton
            subjectName={subject.title}
            color={subject.color}
            onPress={() => console.log("Ask AI pressed")}
          />
        )}
      </View>
    </View>
  );
}