import { addUpload, fetchSubjects, Subject } from '@/services/api';
import { router } from 'expo-router';
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  FileType,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILE_TYPES = [
  { label: 'PDF Document', icon: 'pdf', color: '#EF4444', bg: '#FEE2E2' },
  { label: 'Image / Photo', icon: 'image', color: '#3B82F6', bg: '#DBEAFE' },
  { label: 'Word Document', icon: 'doc', color: '#2563EB', bg: '#EFF6FF' },
];

export default function UploadScreen() {
  const [fileName, setFileName] = useState('');
  const [selectedType, setSelectedType] = useState<'pdf' | 'image' | 'doc' | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchSubjects().then(setSubjects);
  }, []);

  const selectedSubjectName = subjects.find((s) => s.id === selectedSubject)?.title ?? 'Select Subject';

  const handleUpload = async () => {
    if (!fileName.trim()) {
      Alert.alert('Missing file name', 'Please enter a file name.');
      return;
    }
    if (!selectedType) {
      Alert.alert('Missing file type', 'Please select a file type.');
      return;
    }

    setUploading(true);
    await new Promise((r) => setTimeout(r, 1500)); // simulate upload

    addUpload({
      name: fileName.trim(),
      type: selectedType,
      size: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`,
      subjectId: selectedSubject,
      uploadedAt: 'Just now',
    });

    setUploading(false);
    setDone(true);

    setTimeout(() => router.back(), 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
        >
          <X size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="font-black text-lg text-gray-900">Upload Material</Text>
        <View className="w-9" />
      </View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {done ? (
          // ── Success State ──
          <Animated.View entering={FadeIn} className="flex-1 items-center justify-center pt-24">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
              <CheckCircle2 size={40} color="#10B981" />
            </View>
            <Text className="text-gray-900 font-black text-2xl mb-2">Upload Successful!</Text>
            <Text className="text-gray-400 text-sm text-center">
              Your material has been added to your library.
            </Text>
          </Animated.View>
        ) : (
          <>
            {/* ── Drop Zone ── */}
            <Animated.View entering={FadeInUp.delay(50)}>
              <View className="bg-white border-2 border-dashed border-purple-200 rounded-3xl p-8 items-center mb-6">
                <View className="w-16 h-16 rounded-2xl bg-purple-50 items-center justify-center mb-3">
                  <Upload size={28} color="#7C3AED" />
                </View>
                <Text className="text-gray-900 font-bold text-base mb-1">Select or name your file</Text>
                <Text className="text-gray-400 text-xs text-center">
                  PDFs, images, and documents supported
                </Text>
              </View>
            </Animated.View>

            {/* ── File Name Input ── */}
            <Animated.View entering={FadeInUp.delay(100)} className="mb-5">
              <Text className="text-gray-700 font-bold text-sm mb-2">File Name</Text>
              <View className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
                <TextInput
                  className="text-gray-800 text-base"
                  placeholder="e.g. History Notes Chapter 5"
                  placeholderTextColor="#9CA3AF"
                  value={fileName}
                  onChangeText={setFileName}
                  returnKeyType="done"
                />
              </View>
            </Animated.View>

            {/* ── File Type ── */}
            <Animated.View entering={FadeInUp.delay(150)} className="mb-5">
              <Text className="text-gray-700 font-bold text-sm mb-2">File Type</Text>
              <View className="flex-row gap-3">
                {FILE_TYPES.map((ft) => {
                  const active = selectedType === ft.icon;
                  return (
                    <TouchableOpacity
                      key={ft.icon}
                      onPress={() => setSelectedType(ft.icon as any)}
                      className="flex-1 rounded-2xl py-4 items-center border-2"
                      style={{
                        backgroundColor: active ? ft.bg : '#fff',
                        borderColor: active ? ft.color : '#F3F4F6',
                      }}
                      activeOpacity={0.8}
                    >
                      {ft.icon === 'pdf' && <FileText size={22} color={active ? ft.color : '#9CA3AF'} />}
                      {ft.icon === 'image' && <ImageIcon size={22} color={active ? ft.color : '#9CA3AF'} />}
                      {ft.icon === 'doc' && <FileType size={22} color={active ? ft.color : '#9CA3AF'} />}
                      <Text
                        className="text-[10px] font-bold mt-1.5"
                        style={{ color: active ? ft.color : '#9CA3AF' }}
                      >
                        {ft.label.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* ── Subject Tag ── */}
            <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
              <Text className="text-gray-700 font-bold text-sm mb-2">Tag to Subject (optional)</Text>
              <TouchableOpacity
                onPress={() => setShowSubjectPicker(!showSubjectPicker)}
                className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm flex-row items-center justify-between"
              >
                <Text className={`text-base ${selectedSubject ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                  {selectedSubjectName}
                </Text>
                <ChevronDown size={18} color="#9CA3AF" />
              </TouchableOpacity>

              {showSubjectPicker && (
                <Animated.View entering={FadeIn} className="bg-white rounded-2xl mt-2 border border-gray-100 shadow-sm overflow-hidden">
                  {subjects.map((s, i) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => { setSelectedSubject(s.id); setShowSubjectPicker(false); }}
                      className={`px-4 py-3.5 flex-row items-center ${i < subjects.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: s.color }} />
                      <Text className="text-gray-800 font-medium">{s.title}</Text>
                      {selectedSubject === s.id && <CheckCircle2 size={16} color="#10B981" style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </Animated.View>

            {/* ── Upload Button ── */}
            <TouchableOpacity
              onPress={handleUpload}
              disabled={uploading}
              className="bg-purple-700 rounded-2xl py-4 items-center flex-row justify-center shadow-lg"
              style={{ shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 }}
              activeOpacity={0.85}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Upload size={18} color="#fff" />
                  <Text className="text-white font-black text-base ml-2">Upload Material</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}