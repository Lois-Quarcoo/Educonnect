import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  Info,
  Paperclip,
  Camera,
  BookOpen,
} from 'lucide-react-native';
import { ChatMessage, generateTutorResponse } from '@/services/ai';
import Animated, { FadeInUp, SlideInRight, SlideInLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// ── Lesson Card ───────────────────────────────────────────────────────────────
const LessonCard = ({
  subject,
  title,
  meta,
}: {
  subject: string;
  title: string;
  meta: string;
}) => (
  <View className="mt-3 bg-white rounded-xl p-3 flex-row items-center shadow-sm border border-gray-100">
    <View className="w-9 h-9 rounded-lg bg-orange-100 items-center justify-center mr-3">
      <BookOpen size={18} color="#EA580C" />
    </View>
    <View>
      <Text className="text-orange-600 font-bold text-xs tracking-widest uppercase">
        {subject}
      </Text>
      <Text className="text-gray-900 font-semibold text-sm mt-0.5">{title}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{meta}</Text>
    </View>
  </View>
);

// ── Suggestion Pill ───────────────────────────────────────────────────────────
const SuggestionPill = ({
  label,
  onPress,
}: {
  label: string;
  onPress: (text: string) => void;
}) => (
  <TouchableOpacity
    onPress={() => onPress(label)}
    className="self-start bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-2"
    activeOpacity={0.75}
  >
    <Text className="text-orange-700 text-sm font-medium">{label}</Text>
  </TouchableOpacity>
);

// ── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onSuggestionPress }: { msg: ChatMessage, onSuggestionPress: (t: string) => void }) => {
  const isUser = msg.role === 'user';
  return (
    <Animated.View 
       entering={isUser ? SlideInRight.springify() : SlideInLeft.springify().delay(200)}
       className={`mb-4 w-full ${isUser ? 'items-end' : 'items-start'}`}
    >
      {!isUser && (
        <View className="flex-row items-start w-full pr-8">
          <Animated.View entering={FadeInUp.delay(300)} className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 items-center justify-center mr-2 mt-1 shadow-sm">
            <Sparkles size={14} color="#fff" />
          </Animated.View>
          <View className="flex-1">
            <View className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <Text className="text-gray-800 text-sm leading-6">{msg.text}</Text>
              {msg.lessonCard && (
                <LessonCard
                  subject={msg.lessonCard.subject}
                  title={msg.lessonCard.title}
                  meta={msg.lessonCard.meta}
                />
              )}
            </View>
            {msg.suggestions && msg.suggestions.length > 0 && (
              <Animated.View entering={FadeInUp.delay(600)} className="mt-3 ml-1 flex-row flex-wrap">
                {msg.suggestions.map((s: string) => (
                  <SuggestionPill key={s} label={s} onPress={onSuggestionPress} />
                ))}
              </Animated.View>
            )}
          </View>
        </View>
      )}

      {isUser && (
        <View
          style={{ maxWidth: width * 0.75 }}
          className="bg-[#1F2937] rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-md"
        >
          <Text className="text-white text-base leading-6 pr-2">{msg.text}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// ── Initial Messages ──────────────────────────────────────────────────────────
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'ai',
    text: "Hi there! 👋 I'm Spark, your AI Tutor. I can explain complex problems, summarize your uploaded notes, or quiz you on any subject. How can I help you today?",
    suggestions: [
      'Explain photosynthesis',
      'Help me with Algebra',
      'Quiz me on History',
    ],
  }
];

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading) return;

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
    };
    
    setInput('');
    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setIsLoading(true);
    
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // Call Gemini API
    const aiReply = await generateTutorResponse(messages, textToSend);

    setMessages((prev: ChatMessage[]) => [...prev, aiReply]);
    setIsLoading(false);
    
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
          <View className="w-8" />
          <View className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <Text className="text-orange-900 font-black tracking-widest text-xs uppercase mr-1">Spark AI</Text>
            <Sparkles size={14} color="#F59E0B" />
          </View>
          <TouchableOpacity className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 items-center justify-center shadow-sm">
            <Info size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* ── Messages ── */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-6"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg: ChatMessage) => (
            <MessageBubble key={msg.id} msg={msg} onSuggestionPress={handleSend} />
          ))}
          
          {isLoading && (
            <Animated.View entering={FadeInUp} className="flex-row items-start w-full mb-6">
              <View className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-400 items-center justify-center mr-2 shadow-sm">
                <Sparkles size={14} color="#fff" />
              </View>
              <View className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm items-center justify-center flex-row min-w-[80px]">
                 <ActivityIndicator size="small" color="#F59E0B" />
              </View>
            </Animated.View>
          )}
          
          <View className="h-10" />
        </ScrollView>

        {/* ── Input Bar ── */}
        <View className="px-4 pb-6 pt-3 bg-white border-t border-gray-100 shadow-[0_-10px_15px_rgba(0,0,0,0.02)]">
          <View className="flex-row items-end bg-gray-50 rounded-3xl px-4 py-2 shadow-sm border border-gray-200 min-h-[56px]">
            <TouchableOpacity className="mb-2 mr-3" hitSlop={8}>
              <Paperclip size={22} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="mb-2 mr-3" hitSlop={8}>
              <Camera size={22} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TextInput
              className="flex-1 text-gray-800 text-base mb-2 pt-1 max-h-32"
              placeholder="Ask Spark..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
            />
            
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`ml-2 rounded-full w-10 h-10 mb-1 items-center justify-center shadow-sm ${
                 input.trim() && !isLoading ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <Sparkles size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}