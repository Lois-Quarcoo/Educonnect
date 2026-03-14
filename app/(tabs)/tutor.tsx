import React, { useState, useRef, useEffect } from 'react';
import {
  Text, View, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Info, BookOpen } from 'lucide-react-native';
import { ChatMessage, generateTutorResponse } from '@/services/ai';
import Animated, { FadeInUp, SlideInRight, SlideInLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const LessonCard = ({ subject, title, meta }: { subject: string; title: string; meta: string }) => (
  <View className="mt-3 bg-white rounded-xl p-3 flex-row items-center shadow-sm border border-gray-100">
    <View className="w-9 h-9 rounded-lg bg-orange-100 items-center justify-center mr-3">
      <BookOpen size={18} color="#EA580C" />
    </View>
    <View>
      <Text className="text-orange-600 font-bold text-xs tracking-widest uppercase">{subject}</Text>
      <Text className="text-gray-900 font-semibold text-sm mt-0.5">{title}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{meta}</Text>
    </View>
  </View>
);

const SuggestionPill = ({ label, onPress }: { label: string; onPress: (text: string) => void }) => (
  <TouchableOpacity
    onPress={() => onPress(label)}
    className="self-start bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-2 mr-2"
    activeOpacity={0.75}
  >
    <Text className="text-orange-700 text-sm font-medium">{label}</Text>
  </TouchableOpacity>
);

const MessageBubble = ({ msg, onSuggestionPress }: { msg: ChatMessage; onSuggestionPress: (t: string) => void }) => {
  const isUser = msg.role === 'user';
  return (
    <Animated.View
      entering={isUser ? SlideInRight.springify() : SlideInLeft.springify().delay(100)}
      className={`mb-4 w-full ${isUser ? 'items-end' : 'items-start'}`}
    >
      {!isUser && (
        <View className="flex-row items-start w-full pr-8">
          <Animated.View
            entering={FadeInUp.delay(200)}
            className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-2 mt-1 shadow-sm"
          >
            <Sparkles size={14} color="#fff" />
          </Animated.View>
          <View className="flex-1">
            <View className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <Text className="text-gray-800 text-sm leading-6">{msg.text}</Text>
              {msg.lessonCard && (
                <LessonCard subject={msg.lessonCard.subject} title={msg.lessonCard.title} meta={msg.lessonCard.meta} />
              )}
            </View>
            {msg.suggestions && msg.suggestions.length > 0 && (
              <Animated.View entering={FadeInUp.delay(400)} className="mt-3 ml-1 flex-row flex-wrap">
                {msg.suggestions.map((s: string) => (
                  <SuggestionPill key={s} label={s} onPress={onSuggestionPress} />
                ))}
              </Animated.View>
            )}
          </View>
        </View>
      )}
      {isUser && (
        <View style={{ maxWidth: width * 0.75 }} className="bg-[#1F2937] rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-md">
          <Text className="text-white text-base leading-6">{msg.text}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'ai',
    text: "Hi there! 👋 I'm Spark, your AI Tutor. Ask me anything — I can explain concepts, solve problems step-by-step, quiz you, or help with any subject. What do you need help with?",
    suggestions: ['Explain photosynthesis', 'Help me with Algebra', 'Quiz me on History'],
  },
];

export default function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    return () => clearTimeout(t);
  }, [messages, isLoading]);

  // Scroll to bottom when keyboard appears so input stays visible
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    });
    return () => sub.remove();
  }, []);

  const handleSend = async (textOverride?: string) => {
    const textToSend = (textOverride ?? input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
    setInput('');
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const aiReply = await generateTutorResponse(messages, textToSend);
    setMessages((prev) => [...prev, aiReply]);
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
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

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onSuggestionPress={handleSend} />
          ))}
          {isLoading && (
            <Animated.View entering={FadeInUp} className="flex-row items-start w-full mb-6">
              <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-2 shadow-sm">
                <Sparkles size={14} color="#fff" />
              </View>
              <View className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm flex-row items-center min-w-[80px]">
                <ActivityIndicator size="small" color="#F59E0B" />
                <Text className="text-gray-400 text-sm ml-2">Thinking…</Text>
              </View>
            </Animated.View>
          )}
          <View className="h-2" />
        </ScrollView>

        {/* Input bar — outside ScrollView so it lifts with the keyboard */}
        <View className="px-4 pb-4 pt-3 bg-white border-t border-gray-100">
          <View className="flex-row items-end bg-gray-50 rounded-3xl px-4 py-2 border border-gray-200 min-h-[56px]">
            <TextInput
              className="flex-1 text-gray-800 text-base pt-1 max-h-32"
              style={{ paddingBottom: 8 }}
              placeholder="Ask Spark anything…"
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`ml-2 rounded-full w-10 h-10 mb-1 items-center justify-center ${
                input.trim() && !isLoading ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#9CA3AF" />
              ) : (
                <Sparkles size={18} color={input.trim() ? 'white' : '#9CA3AF'} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}