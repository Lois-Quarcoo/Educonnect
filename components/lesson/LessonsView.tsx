import { useAuth } from '@/hooks/useAuth';
import { LocalPDFStorage, PDFDocument } from '@/services/localPDFStorage';
import { router } from 'expo-router';
import { Bookmark, CheckCircle2, FileText } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface LessonsViewProps {
  subjectId: string;
  subjectTitle: string;
}

export default function LessonsView({ subjectId, subjectTitle }: LessonsViewProps) {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);

  useEffect(() => {
    if (user && subjectTitle) {
      LocalPDFStorage.getPDFsBySubject(user._id, subjectTitle)
        .then(setPdfs)
        .catch(console.error);
    }
  }, [user, subjectTitle]);

  return (
    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Continue Learning */}
      <Text className="text-gray-900 font-bold text-lg mb-4">Continue Learning</Text>

      <TouchableOpacity className="bg-white rounded-2xl p-4 mb-8 shadow-sm border border-gray-100 flex-row items-center border-l-4 border-l-[#6B4EFF]">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Lesson 2</Text>
            <Bookmark size={18} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-bold text-base mb-2">Solving Linear Equations</Text>

          <View className="flex-row items-center">
            <View className="bg-gray-100 rounded-lg px-2 py-1 mr-2">
              <Text className="text-gray-500 text-xs font-medium">20 min</Text>
            </View>
            <View className="bg-blue-50 rounded-lg px-2 py-1">
              <Text className="text-blue-500 text-xs font-medium">EduConnect</Text>
            </View>
          </View>

        </View>

        {/* Progress Ring */}
        <AnimatedCircularProgress
          size={50}
          width={4}
          fill={45}
          tintColor="#F59E0B"
          backgroundColor="#F3F4F6"
          rotation={0}
        >
          {() => (
            <Text className="text-[#F59E0B] font-bold text-xs">45%</Text>
          )}
        </AnimatedCircularProgress>
      </TouchableOpacity>

      {/* All Lessons */}
      <Text className="text-gray-900 font-bold text-lg mb-4">All Lessons</Text>

      {/* Lesson Item 1 */}
      <TouchableOpacity className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center border-l-4 border-l-transparent">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Lesson 1</Text>
            <Bookmark size={18} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-bold text-base mb-2">Introduction to Algebra</Text>

          <View className="flex-row items-center">
            <View className="bg-gray-100 rounded-lg px-2 py-1 mr-2">
              <Text className="text-gray-500 text-xs font-medium">15 min</Text>
            </View>
            <View className="bg-blue-50 rounded-lg px-2 py-1">
              <Text className="text-blue-500 text-xs font-medium">EduConnect</Text>
            </View>
          </View>
        </View>

        <View className="w-12 h-12 rounded-full border border-green-100 items-center justify-center">
          <CheckCircle2 size={24} color="#10B981" />
        </View>
      </TouchableOpacity>

      {/* Uploaded Materials */}
      {pdfs.length > 0 && (
        <>
          <Text className="text-gray-900 font-bold text-lg mt-6 mb-4">Your Materials</Text>
          {pdfs.map(pdf => (
            <TouchableOpacity
              key={pdf.id}
              onPress={() => router.push({
                pathname: "/pdf-viewer",
                params: {
                  uri: pdf.uri,
                  name: pdf.name,
                  subject: pdf.subject ?? "General",
                  size: String(pdf.size),
                  uploadDate: pdf.uploadDate,
                },
              })}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center border-l-4 border-l-transparent"
            >
              <View className="flex-1 mr-4">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex-row items-center">
                    <FileText size={12} color="#9CA3AF" /> Document
                  </Text>
                  <Bookmark size={18} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 font-bold text-base mb-2">{pdf.name}</Text>

                <View className="flex-row items-center">
                  <View className="bg-gray-100 rounded-lg px-2 py-1 mr-2">
                    <Text className="text-gray-500 text-xs font-medium">{LocalPDFStorage.formatFileSize(pdf.size)}</Text>
                  </View>
                  <View className="bg-green-50 rounded-lg px-2 py-1">
                    <Text className="text-[#00D09E] text-xs font-medium">Your Upload</Text>
                  </View>
                </View>
              </View>

              <View className="w-12 h-12 rounded-full border border-gray-200 items-center justify-center">
                <FileText size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Lesson Item 3 */}
      <TouchableOpacity className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center border-l-4 border-l-transparent">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Lesson 3</Text>
            <Bookmark size={18} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-bold text-base mb-2">Graphing Functions</Text>

          <View className="flex-row items-center">
            <View className="bg-gray-100 rounded-lg px-2 py-1 mr-2">
              <Text className="text-gray-500 text-xs font-medium">25 min</Text>
            </View>
            <View className="bg-blue-50 rounded-lg px-2 py-1">
              <Text className="text-blue-500 text-xs font-medium">EduConnect</Text>
            </View>
          </View>
        </View>

        <View className="w-12 h-12 rounded-full items-center justify-center bg-gray-50">
          <Text className="text-gray-400 text-xl font-medium">+</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}
