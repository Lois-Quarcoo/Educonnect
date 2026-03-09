import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Clock, ChevronLeft, ChevronRight, CheckCircle2, Award } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchQuizById, Quiz } from '@/services/api';
import Animated, { FadeIn, FadeInRight, FadeInUp, SlideInRight } from 'react-native-reanimated';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const quizId = (id as string) || 'algebra_fundamentals';
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    setIsLoading(true);
    try {
      const data = await fetchQuizById(quizId);
      if (data) setQuiz(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (!quiz) return;
    const currentQ = quiz.questions[currentQuestionIndex];
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: index }));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true); // End of quiz
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text className="text-gray-500 font-medium mt-4">Preparing your quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 font-medium">Quiz not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-purple-100 px-6 py-2 rounded-full">
           <Text className="text-purple-600 font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate score if finished
  const totalQuestions = quiz.questions.length;
  let correctAnswers = 0;
  
  if (isFinished) {
    correctAnswers = quiz.questions.reduce((acc, q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) return acc + 1;
      return acc;
    }, 0);
  }

  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100) || 0;
  const currentQ = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / totalQuestions) * 100;
  const isSelected = (index: number) => selectedAnswers[currentQ?.id] === index;

  // ── SCORE SCREEN ──
  if (isFinished) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
         <Animated.View entering={FadeInUp.duration(600).springify().damping(12)} className="items-center w-full">
            <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
               <Award size={48} color="#10B981" />
            </View>
            <Text className="text-gray-900 font-black text-3xl mb-2 text-center">Quiz Completed!</Text>
            <Text className="text-gray-500 font-medium text-base mb-8 text-center px-4">
               You've successfully finished {quiz.title}.
            </Text>
            
            <View className="w-full bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-8 items-center">
               <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Your Score</Text>
               <Text className="text-[#6B4EFF] font-black text-6xl">{scorePercentage}%</Text>
               <View className="flex-row items-center mt-4 bg-white px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle2 size={16} color="#10B981" className="mr-2" />
                  <Text className="font-bold text-gray-700">{correctAnswers} of {totalQuestions} correct</Text>
               </View>
            </View>

            <View className="w-full justify-center gap-3">
               <TouchableOpacity 
                 onPress={() => router.back()} 
                 className="w-full bg-[#6B4EFF] py-4 rounded-xl items-center shadow-lg"
                 style={{ shadowColor: '#6B4EFF', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 }}
               >
                 <Text className="text-white font-black text-base uppercase tracking-wide">Continue Learning</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 onPress={() => {
                   setIsFinished(false);
                   setCurrentQuestionIndex(0);
                   setSelectedAnswers({});
                 }} 
                 className="w-full border-2 border-gray-200 py-3.5 rounded-xl items-center"
               >
                 <Text className="text-gray-500 font-bold text-base uppercase tracking-wide">Retake Quiz</Text>
               </TouchableOpacity>
            </View>
         </Animated.View>
      </SafeAreaView>
    );
  }

  // ── QUIZ SCREEN ──
  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 items-center justify-center shrink-0"
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
        
         <Text className="text-gray-900 font-bold text-base text-center flex-1 px-4 leading-tight shrink" numberOfLines={1}>
           {quiz.title}
         </Text>

        <View className="bg-orange-50 px-3 py-2 rounded-full flex-row items-center border border-orange-100 shrink-0">
          <Clock size={14} color="#F59E0B" className="mr-1" />
          <Text className="text-[#F59E0B] font-bold text-xs">{quiz.timeLimitMins ? `${quiz.timeLimitMins}:00` : '∞'}</Text>
        </View>
      </View>

      {/* Progress */}
      <View className="px-6 py-5 bg-white mb-2 shadow-sm z-0">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
          <Text className="text-[#10B981] font-bold text-xs">{Math.round(progressPercentage)}%</Text>
        </View>
        <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <Animated.View 
            className="h-2 bg-[#10B981] rounded-full" 
            style={{ width: `${progressPercentage}%` }} 
          />
        </View>
      </View>

      {/* Question Card */}
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
         <Animated.View 
           key={currentQ?.id} // Forces re-animation when question changes
           entering={SlideInRight.duration(300).springify()} 
           className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6"
         >
            <View className="bg-purple-50 self-start rounded-md px-2 py-1 mb-5">
              <Text className="text-purple-600 text-[10px] font-black uppercase tracking-widest">{currentQ?.type.replace('_', ' ')}</Text>
            </View>
            
            <Text className="text-gray-900 font-black text-2xl mb-8 leading-tight">
              {currentQ?.text}
            </Text>

            {/* Options */}
            <View className="gap-3 mb-4">
              {currentQ?.options.map((optionText, index) => {
                const selected = isSelected(index);
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => handleSelectOption(index)}
                    className={`flex-row items-center px-5 py-4 rounded-2xl border-2 ${
                      selected ? 'border-[#6B4EFF] bg-purple-50' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                        selected ? 'border-[#6B4EFF]' : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      {selected && <View className="w-3 h-3 rounded-full bg-[#6B4EFF]" />}
                    </View>
                    <Text
                      className={`text-base font-medium flex-1 ${
                        selected ? 'text-[#6B4EFF]' : 'text-gray-700'
                      }`}
                    >
                      {optionText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
         </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="p-5 border-t border-gray-100 flex-row items-center justify-between bg-white shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
        <TouchableOpacity 
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`flex-row items-center justify-center py-4 px-6 rounded-2xl flex-1 mr-4 border-2 ${
            currentQuestionIndex === 0 ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-gray-200 bg-white'
          }`}
        >
          <ChevronLeft size={20} color={currentQuestionIndex === 0 ? "#9CA3AF" : "#4B5563"} className="mr-1" />
          <Text className={`font-bold text-sm uppercase tracking-wide ${
            currentQuestionIndex === 0 ? "text-gray-400" : "text-gray-600"
          }`}>
            Back
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleNext}
          disabled={selectedAnswers[currentQ?.id] === undefined} // Require an answer to proceed
          className={`flex-row items-center justify-center py-4 px-6 rounded-2xl flex-1 ${
             selectedAnswers[currentQ?.id] !== undefined ? 'bg-[#6B4EFF] shadow-lg' : 'bg-gray-200'
          }`}
          style={selectedAnswers[currentQ?.id] !== undefined ? { shadowColor: '#6B4EFF', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 } } : {}}
        >
          <Text className={`font-black text-sm uppercase tracking-wide mr-1 ${
             selectedAnswers[currentQ?.id] !== undefined ? 'text-white' : 'text-gray-400'
          }`}>
            {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
          </Text>
          {currentQuestionIndex !== totalQuestions - 1 && (
             <ChevronRight size={20} color={selectedAnswers[currentQ?.id] !== undefined ? "white" : "#9CA3AF"} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
